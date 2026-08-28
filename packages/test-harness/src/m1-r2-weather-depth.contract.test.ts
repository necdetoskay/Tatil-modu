import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileRegistrySchemas, loadAgentRegistry, loadFixtureInventory, runBehaviorFixtureCase, type FixtureExecutionResult, type NormalizedFixtureCase } from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }

async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> {
  return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-007-wx-b003.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J };
}

function buildCase(id: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = structuredClone(base.canonicalInput); const output = structuredClone(base.canonicalOutput); input.requestId = `req-${id.toLowerCase()}`; output.requestId = input.requestId;
  const signal = objs(output.signals)[0]!; const conditions = obj(signal.conditions);
  const forecast = () => { signal.dataType = 'FORECAST'; signal.issuedAt = '2026-08-28T04:00:00Z'; signal.forecastHorizonHours = 72; signal.freshnessStatus = 'CURRENT'; signal.evidence = [{ evidenceId: `ev-${id}`, sourceRef: 'weather-provider:fixture', sourceType: 'WEATHER_PROVIDER', retrievedAt: '2026-08-28T04:40:00Z', freshnessStatus: 'CURRENT' }]; output.warnings = []; };
  switch (id) {
    case 'WX-B001': forecast(); conditions.temperatureC = 27; conditions.precipitationProbability = 0.2; signal.riskLevel = 'LOW'; signal.planBias = 'PREFER_OUTDOOR'; break;
    case 'WX-B002': forecast(); input.exposureType = 'INDOOR'; signal.riskLevel = 'LOW'; signal.planBias = 'NO_SIGNAL'; break;
    case 'WX-B003': break;
    case 'WX-B004': signal.riskLevel = 'UNKNOWN'; signal.planBias = 'NO_SIGNAL'; output.warnings = ['SEASONAL_UNCERTAINTY_ONLY']; break;
    case 'WX-B005': forecast(); conditions.precipitationProbability = 0.95; signal.hazards = [{ type: 'THUNDERSTORM', severity: 'SEVERE', evidenceRefs: [`ev-${id}`] }]; signal.riskLevel = 'SEVERE'; signal.planBias = 'PREFER_INDOOR'; break;
    case 'WX-B006': forecast(); signal.freshnessStatus = 'STALE'; signal.riskLevel = 'UNKNOWN'; signal.planBias = 'CAUTION'; signal.evidence = [{ evidenceId: `ev-${id}`, sourceRef: 'weather-provider:fixture', sourceType: 'WEATHER_PROVIDER', retrievedAt: '2026-08-20T04:40:00Z', freshnessStatus: 'STALE' }]; output.warnings = ['STALE_FORECAST']; break;
    case 'WX-B007': forecast(); conditions.precipitationProbability = null; output.warnings = ['PRECIPITATION_PROBABILITY_UNAVAILABLE']; break;
    case 'WX-B008': forecast(); input.journeySegmentRef = 'journey:segment:1'; signal.journeySegmentRef = 'journey:segment:1'; signal.activityRef = null; signal.riskLevel = 'MEDIUM'; signal.planBias = 'CAUTION'; break;
    case 'WX-B009': output.signals = []; output.warnings = ['FORECAST_UNAVAILABLE_NO_CLIMATE_SUBSTITUTION']; output.overallConfidence = 0; break;
    case 'WX-B010': forecast(); signal.riskLevel = 'UNKNOWN'; signal.planBias = 'CAUTION'; signal.confidence = 0.35; output.warnings = ['WEATHER_SOURCE_CONFLICT']; break;
    default: throw new Error(`UNSUPPORTED_WEATHER_FIXTURE:${id}`);
  }
  return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output); const signal = objs(output.signals)[0]; const violations: { code: string; message: string }[] = [];
  const fail = (condition: boolean, code: string) => { if (condition) violations.push({ code, message: fixture.fixtureId }); };
  switch (fixture.fixtureId) {
    case 'WX-B001': fail(!signal || signal.dataType !== 'FORECAST' || signal.riskLevel !== 'LOW', 'WX_EXPECT_FRESH_FORECAST'); break;
    case 'WX-B002': fail(!signal || signal.planBias !== 'NO_SIGNAL', 'WX_EXPECT_INDOOR_LOWER_RELEVANCE'); break;
    case 'WX-B003': fail(!signal || signal.dataType !== 'CLIMATE_NORMAL' || signal.issuedAt !== null, 'WX_EXPECT_CLIMATE_ONLY'); break;
    case 'WX-B004': fail(!signal || signal.dataType !== 'CLIMATE_NORMAL' || signal.riskLevel !== 'UNKNOWN', 'WX_EXPECT_SEASONAL_UNCERTAINTY'); break;
    case 'WX-B005': fail(!signal || !['HIGH', 'SEVERE'].includes(String(signal.riskLevel)) || !['PREFER_INDOOR', 'CAUTION'].includes(String(signal.planBias)), 'WX_EXPECT_SEVERE_BIAS'); break;
    case 'WX-B006': fail(!signal || signal.freshnessStatus !== 'STALE' || signal.riskLevel !== 'UNKNOWN', 'WX_EXPECT_STALE_CAUTION'); break;
    case 'WX-B007': fail(!signal || obj(signal.conditions).precipitationProbability !== null, 'WX_EXPECT_NULL_PROBABILITY'); break;
    case 'WX-B008': fail(!signal || signal.journeySegmentRef !== 'journey:segment:1' || signal.planBias !== 'CAUTION', 'WX_EXPECT_JOURNEY_CAUTION'); break;
    case 'WX-B009': fail(objs(output.signals).length !== 0 || !(output.warnings as unknown[]).includes('FORECAST_UNAVAILABLE_NO_CLIMATE_SUBSTITUTION'), 'WX_EXPECT_NO_SUBSTITUTION'); break;
    case 'WX-B010': fail(!signal || signal.riskLevel !== 'UNKNOWN' || !(output.warnings as unknown[]).includes('WEATHER_SOURCE_CONFLICT'), 'WX_EXPECT_CONFLICT_VISIBLE'); break;
  }
  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-007 Weather', () => {
  it('executes the first 10 golden Weather behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact();
    const pack = inventory.packs.find(item => item.componentId === 'TM-AG-007'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-007'); if (!pack || !schemas) throw new Error('TM-AG-007 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior').slice(0, 10); expect(fixtures).toHaveLength(10); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS'])); expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
