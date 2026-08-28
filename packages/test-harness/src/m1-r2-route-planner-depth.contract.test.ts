import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileRegistrySchemas, loadAgentRegistry, loadFixtureInventory, runBehaviorFixtureCase, type FixtureExecutionResult, type NormalizedFixtureCase } from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }
async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> { return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-009-rp-b-001.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J }; }

function rejected(reasonCode: string, entityRef: string): J { return { combinationId: `rejected:${reasonCode.toLowerCase()}`, reasonCode, constraintRefs: [], entityRefs: [entityRef], routeRefs: [], evidenceRefs: [] }; }

function buildCase(id: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = structuredClone(base.canonicalInput); const output = structuredClone(base.canonicalOutput); input.requestId = `req-${id.toLowerCase()}`; output.requestId = input.requestId; const day = objs(output.days)[0]!; const blocks = objs(day.blocks);
  switch (id) {
    case 'RP-B-001': break;
    case 'RP-B-002': day.blocks = []; day.totalTravelSeconds = 0; day.totalActivitySeconds = 0; output.rejectedCombinations = [rejected('CLOSED_HOURS_CONFLICT', 'place:bursa:activity-1')]; output.warnings = ['NO_FEASIBLE_OPEN_WINDOW']; break;
    case 'RP-B-003': {
      const firstPlace = objs(obj(input.candidatePool).places)[0]!; firstPlace.disposition = 'REJECTED'; day.blocks = blocks.filter(block => block.entityRef !== 'place:bursa:activity-1'); day.totalActivitySeconds = 5400; output.rejectedCombinations = [rejected('REJECTED_CANDIDATE_FORBIDDEN', 'place:bursa:activity-1')]; break;
    }
    case 'RP-B-004': day.blocks = [{ blockId: 'block:morning', blockType: 'ACTIVITY', start: '2026-09-10T09:00:00+03:00', end: '2026-09-10T11:30:00+03:00', entityRef: 'place:bursa:activity-1', routeLegRef: null, journeySegmentRef: null, sourceRefs: ['ev-place-1'], constraintRefs: ['constraint:midday-rest'], verificationStatus: 'VERIFIED_INPUT' }, { blockId: 'block:midday-rest', blockType: 'REST', start: '2026-09-10T12:00:00+03:00', end: '2026-09-10T14:00:00+03:00', entityRef: null, routeLegRef: null, journeySegmentRef: null, sourceRefs: [], constraintRefs: ['constraint:midday-rest'], verificationStatus: 'VERIFIED_INPUT' }]; day.constraintRefs = ['constraint:midday-rest']; day.totalActivitySeconds = 9000; break;
    case 'RP-B-005': output.alternatives = [{ alternativeId: 'alternative:low-fatigue', type: 'LOW_FATIGUE_ALTERNATIVE', dayRef: day.dayId, replacesBlockRefs: ['block:activity-2'], replacementBlocks: [{ ...blocks[2], blockId: 'block:free-time', blockType: 'FREE_TIME', entityRef: null, sourceRefs: [] }], reasonCodes: ['SOFT_LOW_FATIGUE_PREFERENCE'], constraintRefs: [] }]; day.alternativeRefs = ['alternative:low-fatigue']; break;
    case 'RP-B-006': day.blocks = [blocks[0]]; day.totalTravelSeconds = 0; day.totalActivitySeconds = 7200; output.rejectedCombinations = [rejected('IMPOSSIBLE_TRANSITION', 'place:bursa:activity-2')]; output.warnings = ['ROUTE_TRANSITION_INFEASIBLE']; break;
    case 'RP-B-007': output.rejectedCombinations = [rejected('HOTEL_CHECK_IN_CONFLICT', 'accommodation:fixture')]; output.warnings = ['CHECK_IN_WINDOW_CONFLICT']; break;
    case 'RP-B-008': output.rejectedCombinations = [rejected('LIVE_UNAVAILABLE_ACCOMMODATION', 'accommodation:unavailable')]; output.warnings = ['UNAVAILABLE_HOTEL_NOT_SCHEDULED']; break;
    case 'RP-B-009': day.blocks = [...blocks, { blockId: 'block:meal', blockType: 'MEAL', start: '2026-09-10T13:00:00+03:00', end: '2026-09-10T14:00:00+03:00', entityRef: 'food:unverified', routeLegRef: null, journeySegmentRef: null, sourceRefs: [], constraintRefs: ['constraint:dietary'], verificationStatus: 'NEEDS_VERIFICATION' }]; output.verificationNeeds = [{ needId: 'need:dietary', claimType: 'DIETARY_FIT', entityRef: 'food:unverified', affectsBlockRefs: ['block:meal'], severity: 'BLOCKING' }]; day.totalActivitySeconds = 16200; break;
    case 'RP-B-010': output.alternatives = [{ alternativeId: 'alternative:weather-indoor', type: 'WEATHER_ALTERNATIVE', dayRef: day.dayId, replacesBlockRefs: ['block:activity-2'], replacementBlocks: [{ ...blocks[2], blockId: 'block:indoor', entityRef: 'place:bursa:indoor', sourceRefs: ['weather:rain', 'ev-indoor'] }], reasonCodes: ['FORECAST_RAIN_INDOOR_OPTION'], constraintRefs: [] }]; day.alternativeRefs = ['alternative:weather-indoor']; break;
    default: throw new Error(`UNSUPPORTED_ROUTE_PLANNER_FIXTURE:${id}`);
  }
  return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output); const day = objs(output.days)[0]!; const blocks = objs(day.blocks); const rejectedItems = objs(output.rejectedCombinations); const alternatives = objs(output.alternatives); const violations: { code: string; message: string }[] = []; const fail = (condition: boolean, code: string) => { if (condition) violations.push({ code, message: fixture.fixtureId }); };
  switch (fixture.fixtureId) {
    case 'RP-B-001': fail(blocks.length !== 3 || rejectedItems.length !== 0, 'RP_EXPECT_FEASIBLE_DAY'); break;
    case 'RP-B-002': fail(blocks.length !== 0 || !rejectedItems.some(item => item.reasonCode === 'CLOSED_HOURS_CONFLICT'), 'RP_EXPECT_CLOSED_REJECT'); break;
    case 'RP-B-003': fail(blocks.some(item => item.entityRef === 'place:bursa:activity-1') || !rejectedItems.some(item => item.reasonCode === 'REJECTED_CANDIDATE_FORBIDDEN'), 'RP_EXPECT_REJECTED_NOT_SCHEDULED'); break;
    case 'RP-B-004': fail(!blocks.some(item => item.blockType === 'REST' && item.start === '2026-09-10T12:00:00+03:00'), 'RP_EXPECT_MIDDAY_REST'); break;
    case 'RP-B-005': fail(!alternatives.some(item => item.type === 'LOW_FATIGUE_ALTERNATIVE'), 'RP_EXPECT_LOW_FATIGUE_ALT'); break;
    case 'RP-B-006': fail(!rejectedItems.some(item => item.reasonCode === 'IMPOSSIBLE_TRANSITION'), 'RP_EXPECT_IMPOSSIBLE_REJECT'); break;
    case 'RP-B-007': fail(!rejectedItems.some(item => item.reasonCode === 'HOTEL_CHECK_IN_CONFLICT'), 'RP_EXPECT_CHECKIN_CONFLICT'); break;
    case 'RP-B-008': fail(!rejectedItems.some(item => item.reasonCode === 'LIVE_UNAVAILABLE_ACCOMMODATION'), 'RP_EXPECT_UNAVAILABLE_HOTEL_REJECT'); break;
    case 'RP-B-009': fail(!blocks.some(item => item.blockId === 'block:meal' && item.verificationStatus === 'NEEDS_VERIFICATION') || !objs(output.verificationNeeds).some(item => item.severity === 'BLOCKING'), 'RP_EXPECT_DIETARY_VERIFY'); break;
    case 'RP-B-010': fail(!alternatives.some(item => item.type === 'WEATHER_ALTERNATIVE'), 'RP_EXPECT_WEATHER_ALT'); break;
  }
  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-009 Route Planner', () => {
  it('executes the first 10 golden Route Planner behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact(); const pack = inventory.packs.find(item => item.componentId === 'TM-AG-009'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-009'); if (!pack || !schemas) throw new Error('TM-AG-009 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior').slice(0, 10); expect(fixtures).toHaveLength(10); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS'])); expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
