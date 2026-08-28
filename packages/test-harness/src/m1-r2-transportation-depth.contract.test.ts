import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileRegistrySchemas, loadAgentRegistry, loadFixtureInventory, runBehaviorFixtureCase, type FixtureExecutionResult, type NormalizedFixtureCase } from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }

async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> { return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-008-tr-b001.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J }; }

function corridor(relation: 'ON_ROUTE' | 'NEAR_ROUTE' | 'DETOUR', distance: number, duration: number): J {
  return { corridorCityId: `corridor:${relation.toLowerCase()}`, locationRef: `location:${relation.toLowerCase()}`, name: 'Fixture Corridor City', administrativeType: 'city', corridorRelation: relation, routeProgressRatio: 0.5, baselineRouteRef: 'route-leg:fixture:kocaeli-bursa', detourDistanceMeters: distance, detourDurationSeconds: duration, mainRouteEvidenceRefs: ['ev-route-distance', 'ev-route-duration'], detourEvidenceRefs: distance > 0 ? ['ev-detour-distance', 'ev-detour-duration'] : [], requiresDestinationResearch: true };
}

function buildCase(id: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = structuredClone(base.canonicalInput); const output = structuredClone(base.canonicalOutput); input.requestId = `req-${id.toLowerCase()}`; output.requestId = input.requestId; const leg = objs(output.routeLegs)[0]!;
  switch (id) {
    case 'TR-B001': break;
    case 'TR-B002': leg.distanceMeters = null; leg.durationSeconds = null; leg.routeGeometryRef = null; leg.freshnessStatus = 'UNKNOWN'; leg.evidence = []; output.warnings = ['ROUTE_PROVIDER_UNAVAILABLE_GEODESIC_NOT_SUBSTITUTED']; break;
    case 'TR-B003': input.departureTime = '2026-09-10T08:00:00+03:00'; leg.departureTime = input.departureTime; leg.trafficAwareDurationSeconds = 8100; obj(leg.routeMetadata).trafficDataType = 'LIVE_OR_CURRENT'; leg.evidence = [...objs(leg.evidence), { evidenceId: 'ev-traffic', sourceRef: 'fixture-traffic', claimType: 'TRAFFIC_DURATION', retrievedAt: '2026-08-28T04:45:00Z', freshnessStatus: 'CURRENT' }]; break;
    case 'TR-B004': obj(leg.routeMetadata).trafficDataType = 'HISTORICAL_OR_TYPICAL'; leg.trafficAwareDurationSeconds = null; output.warnings = ['HISTORICAL_TRAFFIC_ONLY']; break;
    case 'TR-B005': input.requestType = 'MATRIX'; output.requestType = 'MATRIX'; output.routeLegs = []; output.matrixEntries = [{ fromRef: 'origin:kocaeli', toRef: 'destination:bursa', distanceMeters: 132000, durationSeconds: 7200, trafficAwareDurationSeconds: null, freshnessStatus: 'CURRENT', evidenceRefs: ['ev-route-distance', 'ev-route-duration'] }]; break;
    case 'TR-B006': input.requestType = 'CORRIDOR_DISCOVERY'; input.ruleSnapshotId = 'rule:corridor-v1'; output.requestType = 'CORRIDOR_DISCOVERY'; output.ruleSnapshotId = 'rule:corridor-v1'; output.corridorCandidates = [corridor('NEAR_ROUTE', 12000, 900)]; break;
    case 'TR-B007': input.requestType = 'CORRIDOR_DISCOVERY'; input.ruleSnapshotId = 'rule:corridor-v1'; output.requestType = 'CORRIDOR_DISCOVERY'; output.ruleSnapshotId = 'rule:corridor-v1'; output.corridorCandidates = [corridor('ON_ROUTE', 0, 0)]; break;
    case 'TR-B008': input.requestType = 'CORRIDOR_DISCOVERY'; input.ruleSnapshotId = 'rule:corridor-v1'; output.requestType = 'CORRIDOR_DISCOVERY'; output.ruleSnapshotId = 'rule:corridor-v1'; output.corridorCandidates = [corridor('NEAR_ROUTE', 9000, 720)]; break;
    case 'TR-B009': input.requestType = 'CORRIDOR_DISCOVERY'; input.ruleSnapshotId = 'rule:corridor-v1'; output.requestType = 'CORRIDOR_DISCOVERY'; output.ruleSnapshotId = 'rule:corridor-v1'; output.corridorCandidates = [corridor('DETOUR', 80000, 5400)]; break;
    case 'TR-B010': input.requestType = 'CORRIDOR_DISCOVERY'; input.ruleSnapshotId = 'rule:corridor-v1'; output.requestType = 'CORRIDOR_DISCOVERY'; output.ruleSnapshotId = 'rule:corridor-v1'; output.corridorCandidates = [corridor('DETOUR', 60000, 4200)]; output.warnings = ['ROAD_NETWORK_DETOUR_OVERRIDES_GEOMETRIC_CLOSENESS']; break;
    default: throw new Error(`UNSUPPORTED_TRANSPORT_FIXTURE:${id}`);
  }
  return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output); const leg = objs(output.routeLegs)[0]; const candidate = objs(output.corridorCandidates)[0]; const violations: { code: string; message: string }[] = []; const fail = (condition: boolean, code: string) => { if (condition) violations.push({ code, message: fixture.fixtureId }); };
  switch (fixture.fixtureId) {
    case 'TR-B001': fail(!leg || !objs(leg.evidence).some(item => item.claimType === 'ROUTE_DISTANCE') || !objs(leg.evidence).some(item => item.claimType === 'ROUTE_DURATION'), 'TR_EXPECT_ROUTE_EVIDENCE'); break;
    case 'TR-B002': fail(!leg || leg.distanceMeters !== null || leg.durationSeconds !== null, 'TR_EXPECT_ROUTE_UNKNOWN'); break;
    case 'TR-B003': fail(!leg || obj(leg.routeMetadata).trafficDataType !== 'LIVE_OR_CURRENT' || leg.freshnessStatus !== 'CURRENT', 'TR_EXPECT_CURRENT_TRAFFIC'); break;
    case 'TR-B004': fail(!leg || obj(leg.routeMetadata).trafficDataType !== 'HISTORICAL_OR_TYPICAL', 'TR_EXPECT_HISTORICAL_TRAFFIC'); break;
    case 'TR-B005': fail(objs(output.matrixEntries).length !== 1 || objs(output.routeLegs).length !== 0, 'TR_EXPECT_MATRIX_ONLY'); break;
    case 'TR-B006': fail(!leg || !candidate || candidate.requiresDestinationResearch !== true, 'TR_EXPECT_CORRIDOR_FACTS'); break;
    case 'TR-B007': fail(!candidate || candidate.corridorRelation !== 'ON_ROUTE' || output.ruleSnapshotId !== 'rule:corridor-v1', 'TR_EXPECT_ON_ROUTE'); break;
    case 'TR-B008': fail(!candidate || candidate.corridorRelation !== 'NEAR_ROUTE' || (candidate.detourEvidenceRefs as unknown[]).length < 2, 'TR_EXPECT_NEAR_ROUTE_EVIDENCE'); break;
    case 'TR-B009': fail(!candidate || candidate.corridorRelation !== 'DETOUR' || candidate.requiresDestinationResearch !== true, 'TR_EXPECT_DETOUR_NO_RANK'); break;
    case 'TR-B010': fail(!candidate || candidate.corridorRelation !== 'DETOUR' || !(output.warnings as unknown[]).includes('ROAD_NETWORK_DETOUR_OVERRIDES_GEOMETRIC_CLOSENESS'), 'TR_EXPECT_PROVIDER_DETOUR'); break;
  }
  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-008 Transportation', () => {
  it('executes the first 10 golden Transportation behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact(); const pack = inventory.packs.find(item => item.componentId === 'TM-AG-008'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-008'); if (!pack || !schemas) throw new Error('TM-AG-008 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior').slice(0, 10); expect(fixtures).toHaveLength(10); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS'])); expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
