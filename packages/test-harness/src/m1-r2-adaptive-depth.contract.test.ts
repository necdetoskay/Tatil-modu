import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileRegistrySchemas, loadAgentRegistry, loadFixtureInventory, runBehaviorFixtureCase, type FixtureExecutionResult, type NormalizedFixtureCase } from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }
async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> { return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-013-ar-b-001.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J }; }

function buildCase(id: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = structuredClone(base.canonicalInput); const output = structuredClone(base.canonicalOutput); input.requestId = `req-${id.toLowerCase()}`; output.requestId = input.requestId; output.repairId = `repair:${id.toLowerCase()}`; const change = objs(input.changeSignals)[0]!; const resolution = objs(output.triggerResolutions)[0]!; const patch = objs(output.patches)[0]!;
  const mutate = (triggerType: string, operation: string, reason: string, target = 'day3:block1', after = 'place:replacement-001') => { change.triggerType = triggerType; change.changeSignalId = `change:${id.toLowerCase()}`; change.subjectRef = target; change.affectedRefHints = [target]; change.evidenceRefs = [`evidence:${id.toLowerCase()}`]; output.triggerRefs = [change.changeSignalId]; resolution.triggerRef = change.changeSignalId; resolution.reasonCode = reason; resolution.affectedRefs = [target]; resolution.evidenceRefs = change.evidenceRefs; patch.operation = operation; patch.targetRef = target; patch.afterRef = after; patch.reasonCodes = [reason]; patch.triggerRefs = [change.changeSignalId]; patch.evidenceRefs = change.evidenceRefs; output.invalidatedRefs = [target]; };
  const noChange = (reason: string) => { output.repairStatus = 'NO_CHANGE_REQUIRED'; output.patches = []; output.invalidatedRefs = []; output.downstreamRecheckRequests = []; resolution.disposition = 'NO_EFFECT'; resolution.reasonCode = reason; resolution.affectedRefs = []; obj(output.impactScope).directlyAffectedBlockRefs = []; obj(output.impactScope).affectedDayRefs = []; obj(output.repairedFragments).dayFragments = []; };
  switch (id) {
    case 'AR-B-001': break;
    case 'AR-B-002': mutate('WEATHER_RISK_CHANGED', 'REPLACE_BLOCK', 'SEVERE_WEATHER_REQUIRES_INDOOR', 'day3:block1', 'place:indoor-001'); break;
    case 'AR-B-003': change.triggerType = 'WEATHER_RISK_CHANGED'; noChange('CLIMATE_NORMAL_NOT_EXACT_DAY_TRIGGER'); output.warnings = ['CLIMATE_NORMAL_ONLY_NO_REPAIR']; break;
    case 'AR-B-004': mutate('OPENING_HOURS_CHANGED', 'UPDATE_BLOCK_TIME', 'OPENING_HOURS_SHIFTED', 'day3:block1', 'day3:block1:time-v2'); break;
    case 'AR-B-005': mutate('ROUTE_DISRUPTION', 'REPLACE_ROUTE_LEG', 'ROUTE_DISRUPTION_DELAY', 'route-leg:old', 'route-leg:replacement'); obj(output.impactScope).dependentBlockRefs = ['day3:block1']; break;
    case 'AR-B-006': mutate('ACCOMMODATION_UNAVAILABLE', 'REPLACE_ACCOMMODATION', 'ACCOMMODATION_UNAVAILABLE', 'accommodation:old', 'accommodation:replacement'); break;
    case 'AR-B-007': mutate('BUDGET_OVERFLOW', 'REMOVE_BLOCK', 'HARD_BUDGET_OVERFLOW', 'day3:block1', null as unknown as string); output.downstreamRecheckRequests = [...objs(output.downstreamRecheckRequests), { recheckId: 'recheck:budget', type: 'BUDGET_RECHECK', scopeRefs: ['day:3'], required: true }]; break;
    case 'AR-B-008': mutate('VERIFICATION_REPAIR_TARGET', 'REPLACE_BLOCK', 'VERIFICATION_REPAIR_TARGET', 'day3:block1', 'place:verified-replacement'); input.verificationRepairTargets = [{ repairTargetId: 'verification-target:1', reasonCode: 'UNVERIFIED_PLACE', affectedRefs: ['day3:block1'], severity: 'BLOCKING', evidenceRefs: [] }]; break;
    case 'AR-B-009': resolution.disposition = 'DEFERRED'; resolution.reasonCode = 'NO_SAFE_REPLACEMENT'; output.repairStatus = 'BLOCKED'; output.patches = []; output.invalidatedRefs = ['day3:block1']; output.downstreamRecheckRequests = []; output.warnings = ['NO_SAFE_REPLACEMENT']; obj(output.repairedFragments).dayFragments = []; break;
    case 'AR-B-010': noChange('TRIGGER_DOES_NOT_AFFECT_FEASIBILITY'); break;
    default: throw new Error(`UNSUPPORTED_ADAPTIVE_FIXTURE:${id}`);
  }
  return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output); const patches = objs(output.patches); const resolution = objs(output.triggerResolutions)[0]!; const violations: { code: string; message: string }[] = []; const fail = (condition: boolean, code: string) => { if (condition) violations.push({ code, message: fixture.fixtureId }); };
  const operation = patches[0]?.operation;
  switch (fixture.fixtureId) {
    case 'AR-B-001': fail(operation !== 'REPLACE_BLOCK' || output.repairStatus !== 'REPAIRED', 'AR_EXPECT_CLOSURE_REPAIR'); break;
    case 'AR-B-002': fail(operation !== 'REPLACE_BLOCK' || patches[0]?.afterRef !== 'place:indoor-001', 'AR_EXPECT_WEATHER_REPAIR'); break;
    case 'AR-B-003': fail(output.repairStatus !== 'NO_CHANGE_REQUIRED' || patches.length !== 0, 'AR_EXPECT_CLIMATE_NO_CHANGE'); break;
    case 'AR-B-004': fail(operation !== 'UPDATE_BLOCK_TIME', 'AR_EXPECT_HOURS_SHIFT'); break;
    case 'AR-B-005': fail(operation !== 'REPLACE_ROUTE_LEG' || !(obj(output.impactScope).dependentBlockRefs as unknown[]).includes('day3:block1'), 'AR_EXPECT_ROUTE_REPAIR'); break;
    case 'AR-B-006': fail(operation !== 'REPLACE_ACCOMMODATION', 'AR_EXPECT_HOTEL_REPAIR'); break;
    case 'AR-B-007': fail(operation !== 'REMOVE_BLOCK' || !objs(output.downstreamRecheckRequests).some(item => item.type === 'BUDGET_RECHECK'), 'AR_EXPECT_BUDGET_REPAIR'); break;
    case 'AR-B-008': fail(!patches.some(item => (item.reasonCodes as unknown[]).includes('VERIFICATION_REPAIR_TARGET')), 'AR_EXPECT_VERIFICATION_TARGET'); break;
    case 'AR-B-009': fail(output.repairStatus !== 'BLOCKED' || patches.length !== 0, 'AR_EXPECT_NO_SAFE_REPLACEMENT'); break;
    case 'AR-B-010': fail(resolution.disposition !== 'NO_EFFECT' || output.repairStatus !== 'NO_CHANGE_REQUIRED', 'AR_EXPECT_NO_EFFECT'); break;
  }
  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-013 Adaptive Itinerary', () => {
  it('executes the first 10 golden Adaptive behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact(); const pack = inventory.packs.find(item => item.componentId === 'TM-AG-013'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-013'); if (!pack || !schemas) throw new Error('TM-AG-013 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior').slice(0, 10); expect(fixtures).toHaveLength(10); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS'])); expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
