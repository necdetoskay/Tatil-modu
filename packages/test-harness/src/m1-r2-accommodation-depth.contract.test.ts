import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  compileRegistrySchemas,
  loadAgentRegistry,
  loadFixtureInventory,
  runBehaviorFixtureCase,
  type FixtureExecutionResult,
  type NormalizedFixtureCase
} from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }
function clone<T>(value: T): T { return structuredClone(value); }

async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> {
  return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-005-ac-b-011.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J };
}

function currentEvidence(id: string, claimType: string): J {
  return { evidenceId: id, claimType, sourceTier: 2, sourceRef: `provider:${id}`, retrievedAt: '2026-08-28T08:00:00+03:00', freshnessStatus: 'CURRENT' };
}

function buildCase(fixtureId: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = clone(base.canonicalInput);
  const output = clone(base.canonicalOutput);
  input.requestId = `req-${fixtureId.toLowerCase()}`;
  output.requestId = input.requestId;
  const candidate = objs(output.candidates)[0]!;
  const availability = obj(candidate.availability);
  const quote = obj(candidate.priceQuote);
  const occupancy = obj(candidate.occupancyFit);
  const eligibility = obj(candidate.eligibility);

  const acceptLive = () => {
    availability.status = 'LIVE_AVAILABLE'; availability.retrievedAt = '2026-08-28T08:00:00+03:00'; availability.freshnessStatus = 'CURRENT'; availability.querySignatureMatch = true; availability.evidenceRefs = ['ev-availability'];
    quote.status = 'LIVE'; quote.totalAmount = 6000; quote.taxesFeesKnown = true; quote.retrievedAt = '2026-08-28T08:00:00+03:00'; quote.freshnessStatus = 'CURRENT'; quote.querySignatureMatch = true; quote.evidenceRefs = ['ev-price'];
    occupancy.status = 'SATISFIED'; occupancy.childrenPolicyStatus = 'SATISFIED'; occupancy.evidenceRefs = ['ev-occupancy'];
    eligibility.disposition = 'ACCEPTED'; eligibility.dispositionReasons = []; eligibility.hardConstraintChecks = [];
    candidate.evidence = [currentEvidence('ev-availability', 'AVAILABILITY'), currentEvidence('ev-price', 'PRICE'), currentEvidence('ev-occupancy', 'OCCUPANCY')];
    candidate.unresolvedClaims = [];
  };
  const reject = (code: string) => {
    eligibility.disposition = 'REJECTED'; eligibility.dispositionReasons = [{ code, constraintId: null, evidenceRefs: [] }];
    output.candidates = []; output.rejectedCandidates = [candidate];
  };

  switch (fixtureId) {
    case 'AC-B-001': acceptLive(); break;
    case 'AC-B-002': availability.status = 'LIVE_UNAVAILABLE'; availability.freshnessStatus = 'CURRENT'; availability.querySignatureMatch = true; reject('LIVE_UNAVAILABLE'); break;
    case 'AC-B-003': quote.status = 'UNKNOWN'; quote.totalAmount = null; quote.querySignatureMatch = false; output.warnings = ['PRICE_QUERY_SIGNATURE_MISMATCH']; break;
    case 'AC-B-004': quote.status = 'ESTIMATED'; quote.totalAmount = 6000; quote.freshnessStatus = 'STALE'; quote.querySignatureMatch = true; output.warnings = ['STALE_PRICE_QUOTE']; break;
    case 'AC-B-005': occupancy.status = 'VIOLATED'; occupancy.childrenPolicyStatus = 'VIOLATED'; reject('OCCUPANCY_VIOLATED'); break;
    case 'AC-B-006': occupancy.status = 'UNVERIFIED'; occupancy.childrenPolicyStatus = 'UNVERIFIED'; eligibility.disposition = 'NEEDS_VERIFICATION'; break;
    case 'AC-B-007': acceptLive(); candidate.facilities = [{ key: 'parking', status: 'PRESENT', evidenceRefs: ['ev-parking'] }]; eligibility.hardConstraintChecks = [{ constraintId: 'parking-required', status: 'SATISFIED', evidenceRefs: ['ev-parking'] }]; candidate.evidence = [...objs(candidate.evidence), currentEvidence('ev-parking', 'FACILITY')]; break;
    case 'AC-B-008': candidate.facilities = [{ key: 'parking', status: 'ABSENT', evidenceRefs: ['ev-parking'] }]; eligibility.hardConstraintChecks = [{ constraintId: 'parking-required', status: 'VIOLATED', evidenceRefs: ['ev-parking'] }]; reject('PARKING_REQUIRED_ABSENT'); break;
    case 'AC-B-009': candidate.facilities = [{ key: 'parking', status: 'UNKNOWN', evidenceRefs: [] }]; eligibility.hardConstraintChecks = [{ constraintId: 'parking-required', status: 'UNVERIFIED', evidenceRefs: [] }]; eligibility.disposition = 'NEEDS_VERIFICATION'; break;
    case 'AC-B-010': quote.status = 'ESTIMATED'; quote.totalAmount = 6000; quote.taxesFeesKnown = false; quote.freshnessStatus = 'CURRENT'; output.warnings = ['TAXES_FEES_UNKNOWN']; break;
    case 'AC-B-011': break;
    case 'AC-B-012': candidate.facilities = [{ key: 'pool', status: 'UNKNOWN', evidenceRefs: [] }]; break;
    case 'AC-B-013': obj(candidate.policies).mealPlan = { status: 'SUPPORTED', value: 'CURRENT_PRODUCT_POLICY', evidenceRefs: ['ev-product-policy'] }; output.warnings = ['GENERIC_PROPERTY_POLICY_CONFLICT_PRESERVED']; break;
    case 'AC-B-014': obj(input.stayRequest).stayRole = 'OVERNIGHT_ONLY'; input.journeySegmentRef = 'journey-segment:1'; obj(output.stayQuerySignature).stayRole = 'OVERNIGHT_ONLY'; obj(output.stayQuerySignature).journeySegmentRef = 'journey-segment:1'; break;
    case 'AC-B-015': obj(input.stayRequest).stayRole = 'OVERNIGHT_AND_DAY'; input.journeySegmentRef = 'journey-segment:2'; obj(output.stayQuerySignature).stayRole = 'OVERNIGHT_AND_DAY'; obj(output.stayQuerySignature).journeySegmentRef = 'journey-segment:2'; obj(candidate.policies).checkInOut = { status: 'SUPPORTED', value: { checkIn: '14:00', checkOut: '11:00' }, evidenceRefs: ['ev-checkin'] }; break;
    case 'AC-B-016': quote.status = 'OFFICIAL'; quote.totalAmount = 12000; quote.taxesFeesKnown = true; quote.freshnessStatus = 'CURRENT'; quote.querySignatureMatch = true; quote.evidenceRefs = ['ev-price']; eligibility.hardConstraintChecks = [{ constraintId: 'budget-hard', status: 'VIOLATED', evidenceRefs: ['ev-price'] }]; reject('HARD_BUDGET_EXCEEDED'); break;
    default: throw new Error(`UNSUPPORTED_ACCOMMODATION_FIXTURE:${fixtureId}`);
  }
  return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output);
  const candidate = [...objs(output.candidates), ...objs(output.rejectedCandidates)][0]!;
  const availability = obj(candidate.availability); const quote = obj(candidate.priceQuote); const occupancy = obj(candidate.occupancyFit); const eligibility = obj(candidate.eligibility);
  const facilities = objs(candidate.facilities); const checks = objs(eligibility.hardConstraintChecks); const violations: { code: string; message: string }[] = [];
  const fail = (condition: boolean, code: string) => { if (condition) violations.push({ code, message: fixture.fixtureId }); };
  switch (fixture.fixtureId) {
    case 'AC-B-001': fail(availability.status !== 'LIVE_AVAILABLE' || quote.status !== 'LIVE' || occupancy.status !== 'SATISFIED' || eligibility.disposition !== 'ACCEPTED', 'AC_EXPECT_LIVE_ACCEPTED'); break;
    case 'AC-B-002': fail(availability.status !== 'LIVE_UNAVAILABLE' || eligibility.disposition !== 'REJECTED', 'AC_EXPECT_UNAVAILABLE_REJECTED'); break;
    case 'AC-B-003': fail(quote.status === 'LIVE' || quote.querySignatureMatch !== false, 'AC_EXPECT_PRICE_SIGNATURE_GUARD'); break;
    case 'AC-B-004': fail(quote.status === 'LIVE' || quote.freshnessStatus !== 'STALE', 'AC_EXPECT_STALE_NOT_LIVE'); break;
    case 'AC-B-005': fail(occupancy.status !== 'VIOLATED' || eligibility.disposition !== 'REJECTED', 'AC_EXPECT_OCCUPANCY_REJECTED'); break;
    case 'AC-B-006': fail(occupancy.childrenPolicyStatus !== 'UNVERIFIED' || eligibility.disposition === 'ACCEPTED', 'AC_EXPECT_CHILD_POLICY_UNVERIFIED'); break;
    case 'AC-B-007': fail(!facilities.some(item => item.key === 'parking' && item.status === 'PRESENT') || !checks.some(item => item.status === 'SATISFIED'), 'AC_EXPECT_PARKING_PRESENT'); break;
    case 'AC-B-008': fail(!checks.some(item => item.status === 'VIOLATED') || eligibility.disposition !== 'REJECTED', 'AC_EXPECT_PARKING_REJECTED'); break;
    case 'AC-B-009': fail(!checks.some(item => item.status === 'UNVERIFIED') || eligibility.disposition !== 'NEEDS_VERIFICATION', 'AC_EXPECT_PARKING_UNVERIFIED'); break;
    case 'AC-B-010': fail(quote.taxesFeesKnown !== false || !(output.warnings as unknown[]).includes('TAXES_FEES_UNKNOWN'), 'AC_EXPECT_TAX_UNKNOWN'); break;
    case 'AC-B-011': fail(availability.status !== 'UNKNOWN' || quote.status !== 'UNKNOWN', 'AC_EXPECT_PROVIDER_UNKNOWN'); break;
    case 'AC-B-012': fail(!facilities.some(item => item.key === 'pool' && item.status === 'UNKNOWN'), 'AC_EXPECT_MISSING_FACILITY_UNKNOWN'); break;
    case 'AC-B-013': fail(obj(obj(candidate.policies).mealPlan).value !== 'CURRENT_PRODUCT_POLICY', 'AC_EXPECT_PRODUCT_POLICY'); break;
    case 'AC-B-014': fail(obj(output.stayQuerySignature).stayRole !== 'OVERNIGHT_ONLY' || obj(output.stayQuerySignature).journeySegmentRef !== 'journey-segment:1', 'AC_EXPECT_OVERNIGHT_REF'); break;
    case 'AC-B-015': fail(obj(output.stayQuerySignature).stayRole !== 'OVERNIGHT_AND_DAY' || obj(obj(candidate.policies).checkInOut).status !== 'SUPPORTED', 'AC_EXPECT_STOPOVER_CHECKIN'); break;
    case 'AC-B-016': fail(!checks.some(item => item.status === 'VIOLATED') || eligibility.disposition !== 'REJECTED', 'AC_EXPECT_BUDGET_REJECTED'); break;
  }
  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-005 Accommodation', () => {
  it('executes all 16 golden Accommodation behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact();
    const pack = inventory.packs.find(item => item.componentId === 'TM-AG-005'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-005'); if (!pack || !schemas) throw new Error('TM-AG-005 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior'); expect(fixtures).toHaveLength(16); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS']));
    expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
