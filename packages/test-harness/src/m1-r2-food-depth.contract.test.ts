import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileRegistrySchemas, loadAgentRegistry, loadFixtureInventory, runBehaviorFixtureCase, type FixtureExecutionResult, type NormalizedFixtureCase } from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }

async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> {
  return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-006-food-b004.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J };
}

function buildCase(id: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = structuredClone(base.canonicalInput); const output = structuredClone(base.canonicalOutput); input.requestId = `req-${id.toLowerCase()}`; output.requestId = input.requestId;
  const candidate = objs(output.rejectedCandidates)[0]!; const eligibility = obj(candidate.eligibility); const fit = obj(candidate.familyFit); const menu = obj(candidate.menuEvidence); const hours = obj(candidate.openingHours); const price = obj(candidate.priceFact);
  const accept = () => { obj(input.policyContext).hardConstraints = []; eligibility.disposition = 'ACCEPTED'; eligibility.dispositionReasons = []; eligibility.hardConstraintChecks = []; output.foodCandidates = [candidate]; output.rejectedCandidates = []; };
  const needsVerification = (code: string) => { eligibility.disposition = 'NEEDS_VERIFICATION'; eligibility.dispositionReasons = [{ code, constraintId: 'constraint:peanut-allergy', evidenceRefs: [] }]; eligibility.hardConstraintChecks = [{ constraintId: 'constraint:peanut-allergy', status: 'UNVERIFIED', evidenceRefs: [] }]; output.foodCandidates = [candidate]; output.rejectedCandidates = []; };
  const tasteBrief = { localTasteId: 'taste:iskender', name: 'İskender', category: 'dish', regionRefs: ['destination:bursa:primary'], description: 'Regional dish knowledge', knowledgeStatus: 'VERIFIED', volatilityClass: 'V0', evidence: [{ evidenceId: 'ev-taste', claimType: 'REGIONAL_TASTE', sourceTier: 1, sourceRef: 'culture-source:bursa', retrievedAt: '2026-08-28T04:40:00Z', freshnessStatus: 'CURRENT' }] };
  switch (id) {
    case 'FOOD-B001': output.localTasteBriefs = [tasteBrief]; output.foodCandidates = []; output.rejectedCandidates = []; break;
    case 'FOOD-B002': accept(); output.localTasteBriefs = [tasteBrief]; menu.status = 'UNKNOWN'; menu.items = []; menu.dietarySignals = []; menu.evidenceRefs = []; candidate.localTasteRefs = []; candidate.unresolvedClaims = ['venue_menu_item']; break;
    case 'FOOD-B003': accept(); output.localTasteBriefs = [tasteBrief]; menu.status = 'SUPPORTED_CURRENT'; menu.items = ['İskender']; menu.dietarySignals = []; menu.evidenceRefs = ['ev-menu']; candidate.localTasteRefs = ['taste:iskender']; break;
    case 'FOOD-B004': break;
    case 'FOOD-B005': needsVerification('HARD_DIETARY_REQUIREMENT_UNVERIFIED'); menu.status = 'UNKNOWN'; menu.items = []; menu.dietarySignals = []; menu.evidenceRefs = []; break;
    case 'FOOD-B006': accept(); fit.band = 'CONDITIONAL'; fit.reasonCodes = ['SOFT_CUISINE_PREFERENCE_MISSING']; break;
    case 'FOOD-B007': obj(candidate.businessStatus).value = 'CLOSED_PERMANENTLY'; eligibility.disposition = 'REJECTED'; eligibility.dispositionReasons = [{ code: 'PERMANENTLY_CLOSED', constraintId: null, evidenceRefs: ['ev-business'] }]; eligibility.hardConstraintChecks = []; break;
    case 'FOOD-B008': accept(); hours.status = 'SUPPORTED'; hours.dataType = 'CURRENT'; hours.value = { open: '11:00', close: '15:00' }; hours.evidenceRefs = ['ev-hours']; fit.mealWindowFit = 'GOOD'; break;
    case 'FOOD-B009': obj(input.policyContext).hardConstraints = []; eligibility.disposition = 'NEEDS_VERIFICATION'; eligibility.dispositionReasons = [{ code: 'FIXED_MEAL_WINDOW_HOURS_UNVERIFIED', constraintId: null, evidenceRefs: [] }]; eligibility.hardConstraintChecks = []; output.foodCandidates = [candidate]; output.rejectedCandidates = []; hours.status = 'STALE'; hours.dataType = 'REGULAR'; hours.value = { open: '11:00', close: '15:00' }; hours.evidenceRefs = []; break;
    case 'FOOD-B010': accept(); price.status = 'ESTIMATED'; price.amount = 800; price.currency = 'TRY'; price.priceLevel = 2; price.evidenceRefs = ['ev-old-menu']; break;
    default: throw new Error(`UNSUPPORTED_FOOD_FIXTURE:${id}`);
  }
  return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output); const candidate = [...objs(output.foodCandidates), ...objs(output.rejectedCandidates)][0]; const violations: { code: string; message: string }[] = [];
  const fail = (condition: boolean, code: string) => { if (condition) violations.push({ code, message: fixture.fixtureId }); };
  const eligibility = candidate ? obj(candidate.eligibility) : {}; const checks = objs(eligibility.hardConstraintChecks); const menu = candidate ? obj(candidate.menuEvidence) : {}; const fit = candidate ? obj(candidate.familyFit) : {};
  switch (fixture.fixtureId) {
    case 'FOOD-B001': fail(objs(output.localTasteBriefs)[0]?.knowledgeStatus !== 'VERIFIED' || objs(output.foodCandidates).length !== 0, 'FOOD_EXPECT_TASTE_NOT_MENU'); break;
    case 'FOOD-B002': fail(menu.status !== 'UNKNOWN' || !(candidate?.unresolvedClaims as unknown[]).includes('venue_menu_item'), 'FOOD_EXPECT_MENU_UNKNOWN'); break;
    case 'FOOD-B003': fail(menu.status !== 'SUPPORTED_CURRENT' || !(candidate?.localTasteRefs as unknown[]).includes('taste:iskender'), 'FOOD_EXPECT_MENU_SUPPORTED'); break;
    case 'FOOD-B004': fail(!checks.some(item => item.status === 'VIOLATED') || eligibility.disposition !== 'REJECTED', 'FOOD_EXPECT_ALLERGY_REJECT'); break;
    case 'FOOD-B005': fail(!checks.some(item => item.status === 'UNVERIFIED') || eligibility.disposition !== 'NEEDS_VERIFICATION', 'FOOD_EXPECT_DIETARY_UNVERIFIED'); break;
    case 'FOOD-B006': fail(eligibility.disposition === 'REJECTED' || fit.band !== 'CONDITIONAL', 'FOOD_EXPECT_SOFT_NOT_REJECTED'); break;
    case 'FOOD-B007': fail(obj(candidate?.businessStatus).value !== 'CLOSED_PERMANENTLY' || eligibility.disposition !== 'REJECTED', 'FOOD_EXPECT_CLOSED_REJECT'); break;
    case 'FOOD-B008': fail(obj(candidate?.openingHours).status !== 'SUPPORTED' || fit.mealWindowFit !== 'GOOD' || (obj(candidate?.openingHours).evidenceRefs as unknown[]).length === 0, 'FOOD_EXPECT_WINDOW_FIT'); break;
    case 'FOOD-B009': fail(obj(candidate?.openingHours).status !== 'STALE' || eligibility.disposition !== 'NEEDS_VERIFICATION', 'FOOD_EXPECT_STALE_HOURS_VERIFY'); break;
    case 'FOOD-B010': fail(obj(candidate?.priceFact).status === 'LIVE', 'FOOD_EXPECT_OLD_PRICE_NOT_LIVE'); break;
  }
  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-006 Food & Local Taste', () => {
  it('executes the first 10 golden Food behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact();
    const pack = inventory.packs.find(item => item.componentId === 'TM-AG-006'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-006'); if (!pack || !schemas) throw new Error('TM-AG-006 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior').slice(0, 10); expect(fixtures).toHaveLength(10); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS'])); expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
