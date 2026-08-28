import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileRegistrySchemas, loadAgentRegistry, loadFixtureInventory, runBehaviorFixtureCase, type FixtureExecutionResult, type NormalizedFixtureCase } from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }
async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> { return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-010-bg-b-001.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J }; }

function recompute(output: J) {
  const seen = new Set<string>(); const items = objs(output.items).filter(item => { const key = String(item.dedupeKey); if (seen.has(key)) return false; seen.add(key); return true; });
  const known = items.filter(item => ['LIVE', 'OFFICIAL'].includes(String(item.priceStatus)) && !(item.priceStatus === 'LIVE' && (item.freshnessStatus === 'STALE' || item.contextValidity === 'MISMATCHED'))).reduce((sum, item) => sum + Number(item.normalizedAmount ?? 0), 0);
  const estimated = items.filter(item => item.priceStatus === 'ESTIMATED').reduce((sum, item) => sum + Number(item.normalizedAmount ?? 0), 0); const unknown = items.filter(item => item.priceStatus === 'UNKNOWN').length;
  output.knownTotal = known; output.projectedTotal = known + estimated; output.unknownItemCount = unknown; output.currencySubtotals = [{ currency: 'TRY', knownAmount: known, estimatedAmount: estimated, unknownItemCount: unknown }];
  const limit = objs(output.budgetLimits)[0]!; limit.evaluatedAmount = known + estimated; limit.itemRefs = items.map(item => item.itemId);
  const assessment = obj(output.assessment); const criticalUnknown = items.some(item => item.priceStatus === 'UNKNOWN' && item.budgetCriticality === 'CRITICAL'); assessment.unknownExposure = criticalUnknown ? 'CRITICAL' : unknown > 0 ? 'NON_CRITICAL' : 'NONE'; assessment.confidence = criticalUnknown ? 0.4 : unknown > 0 ? 0.7 : 1;
}

function derivedItem(base: J, id: string, category: string, criticality: string, status: string, amount: number | null): J {
  return { ...structuredClone(base), itemId: `item-${id}`, sourceCostFactRef: `cost-${id}`, dedupeKey: `dedupe-${id}`, category, budgetCriticality: criticality, itineraryRefs: [`ref:${id}`], entityRef: `entity:${id}`, journeySegmentRef: null, quantity: 1, unitAmount: amount, sourceAmount: amount, normalizedAmount: amount, priceStatus: status, sourceRefs: [] };
}

function buildCase(id: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = structuredClone(base.canonicalInput); const output = structuredClone(base.canonicalOutput); input.requestId = `req-${id.toLowerCase()}`; output.requestId = input.requestId; output.ledgerId = `ledger:${id.toLowerCase()}`; const items = objs(output.items); const assessment = obj(output.assessment); const limit = objs(output.budgetLimits)[0]!;
  switch (id) {
    case 'BG-B-001': break;
    case 'BG-B-002': output.items = [...items, derivedItem(items[2]!, 'fuel', 'FUEL', 'CRITICAL', 'ESTIMATED', 1000)]; recompute(output); assessment.status = 'PROVISIONALLY_WITHIN'; assessment.headroomAmount = 5200; break;
    case 'BG-B-003': output.items = [...items, derivedItem(items[2]!, 'parking', 'PARKING', 'NON_CRITICAL', 'UNKNOWN', null)]; recompute(output); assessment.status = 'PROVISIONALLY_WITHIN'; assessment.headroomAmount = 6200; output.warnings = ['PARKING_COST_UNKNOWN']; break;
    case 'BG-B-004': output.items = [...items, derivedItem(items[0]!, 'hotel-tax', 'ACCOMMODATION', 'CRITICAL', 'UNKNOWN', null)]; recompute(output); assessment.status = 'UNKNOWN'; assessment.headroomAmount = null; output.warnings = ['CRITICAL_ACCOMMODATION_TAX_UNKNOWN']; break;
    case 'BG-B-005': output.items = [...items, derivedItem(items[1]!, 'shopping', 'SHOPPING', 'NON_CRITICAL', 'UNKNOWN', null)]; recompute(output); assessment.status = 'PROVISIONALLY_WITHIN'; assessment.headroomAmount = 6200; break;
    case 'BG-B-006': limit.limitAmount = 8000; limit.status = 'FAIL'; limit.evaluatedAmount = 8800; assessment.status = 'OVER_BUDGET'; assessment.headroomAmount = 0; assessment.overageAmount = 800; break;
    case 'BG-B-007': limit.kind = 'SOFT'; limit.limitAmount = 8000; limit.status = 'FAIL'; limit.evaluatedAmount = 8800; assessment.status = 'OVER_BUDGET'; assessment.headroomAmount = 0; assessment.overageAmount = 800; break;
    case 'BG-B-008': limit.scope = 'ACCOMMODATION'; limit.limitAmount = 7000; limit.evaluatedAmount = 8000; limit.status = 'FAIL'; limit.itemRefs = ['item-hotel-001']; assessment.status = 'OVER_BUDGET'; assessment.headroomAmount = 0; assessment.overageAmount = 1000; break;
    case 'BG-B-009': items[1]!.quantity = 3; items[1]!.unitAmount = 400; items[1]!.sourceAmount = 1200; items[1]!.normalizedAmount = 1200; items[1]!.calculationMethod = 'QUANTITY_X_UNIT'; recompute(output); assessment.status = 'WITHIN_BUDGET'; assessment.headroomAmount = 5500; break;
    case 'BG-B-010': output.items = [...items, { ...structuredClone(items[1]!), itemId: 'item-museum-duplicate' }]; recompute(output); assessment.status = 'WITHIN_BUDGET'; assessment.headroomAmount = 6200; break;
    default: throw new Error(`UNSUPPORTED_BUDGET_FIXTURE:${id}`);
  }
  return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output); const items = objs(output.items); const assessment = obj(output.assessment); const limit = objs(output.budgetLimits)[0]!; const violations: { code: string; message: string }[] = []; const fail = (condition: boolean, code: string) => { if (condition) violations.push({ code, message: fixture.fixtureId }); };
  switch (fixture.fixtureId) {
    case 'BG-B-001': fail(output.knownTotal !== 8800 || assessment.status !== 'WITHIN_BUDGET', 'BG_EXPECT_OFFICIAL_WITHIN'); break;
    case 'BG-B-002': fail(output.knownTotal !== 8800 || output.projectedTotal !== 9800, 'BG_EXPECT_ESTIMATE_PROJECTED_ONLY'); break;
    case 'BG-B-003': fail(output.unknownItemCount !== 1 || assessment.unknownExposure !== 'NON_CRITICAL', 'BG_EXPECT_PARKING_UNKNOWN'); break;
    case 'BG-B-004': fail(assessment.status !== 'UNKNOWN' || assessment.unknownExposure !== 'CRITICAL', 'BG_EXPECT_CRITICAL_UNKNOWN'); break;
    case 'BG-B-005': fail(assessment.status !== 'PROVISIONALLY_WITHIN' || assessment.unknownExposure !== 'NON_CRITICAL', 'BG_EXPECT_NONCRITICAL_UNKNOWN'); break;
    case 'BG-B-006': fail(limit.kind !== 'HARD' || limit.status !== 'FAIL' || assessment.status !== 'OVER_BUDGET', 'BG_EXPECT_HARD_OVER'); break;
    case 'BG-B-007': fail(limit.kind !== 'SOFT' || limit.status !== 'FAIL', 'BG_EXPECT_SOFT_OVER'); break;
    case 'BG-B-008': fail(limit.scope !== 'ACCOMMODATION' || limit.status !== 'FAIL' || limit.evaluatedAmount !== 8000, 'BG_EXPECT_CATEGORY_OVER'); break;
    case 'BG-B-009': fail(!items.some(item => item.calculationMethod === 'QUANTITY_X_UNIT' && item.sourceAmount === 1200), 'BG_EXPECT_QUANTITY_UNIT'); break;
    case 'BG-B-010': fail(items.filter(item => item.dedupeKey === 'museum-001|family-entry|2026-09-10').length !== 2 || output.knownTotal !== 8800, 'BG_EXPECT_DEDUPE'); break;
  }
  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-010 Budget', () => {
  it('executes the first 10 golden Budget behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact(); const pack = inventory.packs.find(item => item.componentId === 'TM-AG-010'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-010'); if (!pack || !schemas) throw new Error('TM-AG-010 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior').slice(0, 10); expect(fixtures).toHaveLength(10); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS'])); expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
