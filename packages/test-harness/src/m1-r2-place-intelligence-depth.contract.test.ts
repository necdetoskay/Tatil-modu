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
function obj(v: unknown): J { if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('object expected'); return v as J; }
function objs(v: unknown): J[] { return Array.isArray(v) ? v.map(obj) : []; }
function strs(v: unknown): string[] { return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []; }

function inputFor(f: Readonly<NormalizedFixtureCase>): J {
  const activeConstraints: J[] = [];
  if (['PI-B-006','PI-B-007','PI-B-008'].includes(f.fixtureId)) activeConstraints.push({ constraintId: 'c-women-beach', key: 'women_only_beach_when_beach', kind: 'CONDITIONAL_HARD', subject: 'place.womenOnlyStatus', operator: 'equals', value: true, condition: { field: 'activity.type', operator: 'equals', value: 'beach' } });
  if (['PI-B-009','PI-B-010','PI-B-015'].includes(f.fixtureId)) activeConstraints.push({ constraintId: 'c-age', key: 'age_eligibility', kind: 'HARD', subject: 'place.ageEligibility', operator: 'contains', value: [2,6], condition: null });
  return {
    schemaVersion: '1.0', requestId: `req-${f.fixtureId.toLowerCase()}`, travelerProfileRef: `profile:${f.fixtureId}`,
    preferencePolicyRef: `policy:${f.fixtureId}`, destinationBriefs: [{ destinationId: 'destination:bursa', name: 'Bursa', relationToTarget: 'primary' }],
    visitWindow: { startDate: '2026-09-10', endDate: '2026-09-10' }, categoryScope: ['family_attraction'], activeConstraints,
    contextManifestId: `ctx-${f.fixtureId.toLowerCase()}`
  };
}

function ev(id: string, claimType: string, tier = 1, freshness: 'CURRENT'|'STALE'|'UNKNOWN' = 'CURRENT', valueRef: string|null = null): J {
  return { evidenceId: id, claimType, sourceTier: tier, sourceRef: `source:${id}`, retrievedAt: '2026-08-28T08:00:00+03:00', freshnessStatus: freshness, valueRef };
}

function candidate(id: string, overrides: J = {}): J {
  const base: J = {
    placeId: `place:${id}`,
    providerPlaceIds: [{ provider: 'fixture-provider', id: `provider:${id}` }],
    name: `Fixture Place ${id}`,
    officialUrl: null,
    location: { latitude: 40.19, longitude: 29.06, formattedAddress: 'Bursa, Türkiye', evidenceRefs: ['ev-location'] },
    categories: ['family_attraction'],
    businessStatus: { value: 'OPERATIONAL', evidenceRefs: ['ev-status'] },
    operationalFacts: {
      openingHours: { status: 'SUPPORTED', dataType: 'CURRENT', value: { open: '09:00', close: '17:00' }, evidenceRefs: ['ev-hours'] },
      price: { status: 'OFFICIAL', amount: 100, currency: 'TRY', evidenceRefs: ['ev-price'] },
      parking: { status: 'SUPPORTED', options: ['onsite'], guaranteedAvailability: false, evidenceRefs: ['ev-parking'] },
      accessibility: { status: 'SUPPORTED', features: ['step_free_entry'], evidenceRefs: ['ev-access'] }
    },
    eligibility: { disposition: 'ACCEPTED', dispositionReasons: [], hardConstraintChecks: [] },
    familyFit: { band: 'GOOD', childAgeSignals: [{ ageYears: 2, fit: 'GOOD', basis: 'STRUCTURED_PROVIDER_SIGNAL' }, { ageYears: 6, fit: 'GOOD', basis: 'STRUCTURED_PROVIDER_SIGNAL' }], fatigueRisk: 'LOW', indoorOutdoor: 'MIXED', estimatedVisitDurationMinutes: 120, reasonCodes: ['FAMILY_FIT_SIGNAL'] },
    aggregateSignals: { rating: 4.5, userRatingCount: 100, reviewDataAvailable: true, reviewAnalysisRef: null },
    constraintRefs: [],
    evidence: [ev('ev-location','LOCATION'), ev('ev-status','BUSINESS_STATUS'), ev('ev-hours','OPENING_HOURS'), ev('ev-price','PRICE'), ev('ev-parking','PARKING'), ev('ev-access','ACCESSIBILITY')],
    unresolvedClaims: [], confidence: 0.95
  };
  return { ...base, ...overrides };
}

function outputFor(f: Readonly<NormalizedFixtureCase>, input: J): J {
  let c = candidate(f.fixtureId.toLowerCase());
  let rejected = false;
  let warnings: string[] = [];
  const op = () => obj(c.operationalFacts);
  const elig = () => obj(c.eligibility);

  switch (f.fixtureId) {
    case 'PI-B-001': break;
    case 'PI-B-002':
      c = candidate('closed', { businessStatus: { value: 'CLOSED_PERMANENTLY', evidenceRefs: ['ev-closure'] }, eligibility: { disposition: 'REJECTED', dispositionReasons: [{ code: 'PLACE_CLOSED_PERMANENTLY', evidenceRefs: ['ev-closure'], constraintId: null }], hardConstraintChecks: [] }, evidence: [ev('ev-closure','BUSINESS_STATUS',1,'CURRENT','CLOSED_PERMANENTLY')] }); rejected = true; break;
    case 'PI-B-003':
      c.businessStatus = { value: 'CLOSED_TEMPORARILY', evidenceRefs: ['ev-temp-close'] }; c.eligibility = { disposition: 'NEEDS_VERIFICATION', dispositionReasons: [{ code: 'TEMPORARY_CLOSURE_REOPENING_UNVERIFIED', evidenceRefs: ['ev-temp-close'], constraintId: null }], hardConstraintChecks: [] }; c.unresolvedClaims = ['closure_reopening_verification_required']; c.evidence = [...objs(c.evidence), ev('ev-temp-close','BUSINESS_STATUS')]; break;
    case 'PI-B-004':
      op().openingHours = { status: 'UNKNOWN', dataType: 'NONE', value: null, evidenceRefs: [] }; c.eligibility = { disposition: 'NEEDS_VERIFICATION', dispositionReasons: [{ code: 'OPENING_HOURS_UNKNOWN', evidenceRefs: [], constraintId: null }], hardConstraintChecks: [] }; c.unresolvedClaims = ['schedule_critical_opening_hours']; break;
    case 'PI-B-005':
      op().openingHours = { status: 'SUPPORTED', dataType: 'CURRENT', value: { closed: true }, evidenceRefs: ['ev-special-closed'] }; c.eligibility = { disposition: 'NEEDS_VERIFICATION', dispositionReasons: [{ code: 'SPECIAL_DATE_CLOSED', evidenceRefs: ['ev-special-closed'], constraintId: null }], hardConstraintChecks: [] }; c.unresolvedClaims = ['schedule_ready_false']; c.evidence = [...objs(c.evidence), ev('ev-special-closed','SPECIAL_HOURS')]; break;
    case 'PI-B-006':
      c.categories = ['beach']; c.constraintRefs = ['c-women-beach']; elig().hardConstraintChecks = [{ constraintId: 'c-women-beach', status: 'SATISFIED', evidenceRefs: ['ev-women-only'], reasonCode: 'CURRENT_OFFICIAL_CONFIRMATION' }]; c.evidence = [...objs(c.evidence), ev('ev-women-only','WOMEN_ONLY_STATUS')]; break;
    case 'PI-B-007':
      c.categories = ['beach']; c.constraintRefs = ['c-women-beach']; c.eligibility = { disposition: 'NEEDS_VERIFICATION', dispositionReasons: [{ code: 'WOMEN_ONLY_STATUS_UNVERIFIED', evidenceRefs: [], constraintId: 'c-women-beach' }], hardConstraintChecks: [{ constraintId: 'c-women-beach', status: 'UNVERIFIED', evidenceRefs: [], reasonCode: 'MISSING_CURRENT_HIGH_TRUST_EVIDENCE' }] }; break;
    case 'PI-B-008':
      c.categories = ['museum']; c.constraintRefs = ['c-women-beach']; elig().hardConstraintChecks = [{ constraintId: 'c-women-beach', status: 'NOT_APPLICABLE', evidenceRefs: [], reasonCode: 'NOT_BEACH' }]; break;
    case 'PI-B-009':
      c.constraintRefs = ['c-age']; c.eligibility = { disposition: 'NEEDS_VERIFICATION', dispositionReasons: [{ code: 'AGE_ELIGIBILITY_UNVERIFIED', evidenceRefs: [], constraintId: 'c-age' }], hardConstraintChecks: [{ constraintId: 'c-age', status: 'UNVERIFIED', evidenceRefs: [], reasonCode: 'GENERAL_CHILD_FRIENDLY_NOT_AGE_PROOF' }] }; break;
    case 'PI-B-010':
      c.constraintRefs = ['c-age']; c.eligibility = { disposition: 'REJECTED', dispositionReasons: [{ code: 'AGE_RESTRICTION_VIOLATED', evidenceRefs: ['ev-age-rule'], constraintId: 'c-age' }], hardConstraintChecks: [{ constraintId: 'c-age', status: 'VIOLATED', evidenceRefs: ['ev-age-rule'], reasonCode: 'OFFICIAL_MIN_AGE_EXCLUDES_TRAVELER' }] }; c.evidence = [...objs(c.evidence), ev('ev-age-rule','AGE_ELIGIBILITY')]; rejected = true; break;
    case 'PI-B-011':
      op().parking = { status: 'SUPPORTED', options: ['free_lot','paid_lot'], guaranteedAvailability: false, evidenceRefs: ['ev-parking'] }; break;
    case 'PI-B-012':
      op().openingHours = { status: 'CONFLICTING', dataType: 'CURRENT', value: null, evidenceRefs: ['ev-hours-tier1','ev-hours-tier2'] }; c.eligibility = { disposition: 'NEEDS_VERIFICATION', dispositionReasons: [{ code: 'OPENING_HOURS_CONFLICT', evidenceRefs: ['ev-hours-tier1','ev-hours-tier2'], constraintId: null }], hardConstraintChecks: [] }; c.evidence = [...objs(c.evidence), ev('ev-hours-tier1','OPENING_HOURS',1), ev('ev-hours-tier2','OPENING_HOURS',2)]; c.unresolvedClaims = ['opening_hours_conflict']; break;
    case 'PI-B-013':
      c.providerPlaceIds = [{ provider: 'provider-a', id: 'same-001' }, { provider: 'provider-b', id: 'same-xyz' }]; c.evidence = [...objs(c.evidence), ev('ev-merge-a','IDENTITY',2), ev('ev-merge-b','IDENTITY',2)]; break;
    case 'PI-B-014':
      op().price = { status: 'UNKNOWN', amount: null, currency: null, evidenceRefs: ['ev-price-level'] }; c.evidence = [...objs(c.evidence), ev('ev-price-level','PRICE_LEVEL',2)]; break;
    case 'PI-B-015':
      c.constraintRefs = ['c-age']; c.eligibility = { disposition: 'NEEDS_VERIFICATION', dispositionReasons: [{ code: 'TIER4_ELIGIBILITY_INSUFFICIENT', evidenceRefs: ['ev-blog-age'], constraintId: 'c-age' }], hardConstraintChecks: [{ constraintId: 'c-age', status: 'UNVERIFIED', evidenceRefs: ['ev-blog-age'], reasonCode: 'TIER4_ONLY' }] }; c.evidence = [...objs(c.evidence), ev('ev-blog-age','AGE_ELIGIBILITY',4)]; break;
    case 'PI-B-016':
      c.location = { latitude: null, longitude: null, formattedAddress: null, evidenceRefs: [] }; c.eligibility = { disposition: 'NEEDS_VERIFICATION', dispositionReasons: [{ code: 'PLACE_IDENTITY_AMBIGUOUS', evidenceRefs: [], constraintId: null }], hardConstraintChecks: [] }; c.unresolvedClaims = ['PLACE_IDENTITY_AMBIGUOUS']; c.confidence = 0.4; break;
    default: throw new Error(`UNSUPPORTED_PI_FIXTURE:${f.fixtureId}`);
  }
  if (rejected) return { schemaVersion: '1.0', requestId: input.requestId, candidates: [], rejectedCandidates: [c], researchWarnings: warnings, overallConfidence: c.confidence };
  return { schemaVersion: '1.0', requestId: input.requestId, candidates: [c], rejectedCandidates: [], researchWarnings: warnings, overallConfidence: c.confidence };
}

function evaluate(f: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const out = obj(execution.output); const all = [...objs(out.candidates), ...objs(out.rejectedCandidates)]; const c = all[0]; const v: {code:string;message:string}[] = [];
  if (!c) return { violations: [{ code: 'PI_EXPECT_CANDIDATE', message: 'candidate missing' }] };
  const e = obj(c.eligibility); const checks = objs(e.hardConstraintChecks); const op = obj(c.operationalFacts);
  switch (f.fixtureId) {
    case 'PI-B-001': if (e.disposition !== 'ACCEPTED' || strs(obj(c.businessStatus).evidenceRefs).length===0 || strs(obj(op.openingHours).evidenceRefs).length===0) v.push({code:'PI_EXPECT_ACCEPTED_EVIDENCED',message:'operational candidate must be accepted/evidenced'}); break;
    case 'PI-B-002': if (objs(out.candidates).length!==0 || objs(out.rejectedCandidates).length!==1 || e.disposition!=='REJECTED') v.push({code:'PI_EXPECT_REJECTED_CLOSED',message:'permanent closure must reject'}); break;
    case 'PI-B-003': if (e.disposition==='ACCEPTED' || !strs(c.unresolvedClaims).some(x=>x.includes('reopening'))) v.push({code:'PI_EXPECT_TEMP_CLOSURE_UNRESOLVED',message:'temporary closure must stay unresolved'}); break;
    case 'PI-B-004': if (!['UNKNOWN','PARTIAL'].includes(String(obj(op.openingHours).status)) || strs(c.unresolvedClaims).length===0) v.push({code:'PI_EXPECT_UNKNOWN_HOURS',message:'missing hours unresolved'}); break;
    case 'PI-B-005': if (e.disposition==='ACCEPTED' || obj(op.openingHours).dataType!=='CURRENT') v.push({code:'PI_EXPECT_SPECIAL_OVERRIDE',message:'special/current closure must win'}); break;
    case 'PI-B-006': if (!checks.some(x=>x.status==='SATISFIED') || e.disposition!=='ACCEPTED') v.push({code:'PI_EXPECT_WOMEN_BEACH_SATISFIED',message:'verified conditional hard should satisfy'}); break;
    case 'PI-B-007': if (!checks.some(x=>x.status==='UNVERIFIED') || e.disposition!=='NEEDS_VERIFICATION') v.push({code:'PI_EXPECT_WOMEN_BEACH_UNVERIFIED',message:'unverified conditional hard cannot accept'}); break;
    case 'PI-B-008': if (!checks.some(x=>x.status==='NOT_APPLICABLE')) v.push({code:'PI_EXPECT_BEACH_NA_MUSEUM',message:'beach rule must be N/A for museum'}); break;
    case 'PI-B-009': if (obj(c.familyFit).band==='UNKNOWN' || !checks.some(x=>x.status==='UNVERIFIED')) v.push({code:'PI_EXPECT_CHILD_SIGNAL_NOT_PROOF',message:'family fit signal cannot prove age eligibility'}); break;
    case 'PI-B-010': if (!checks.some(x=>x.status==='VIOLATED') || e.disposition!=='REJECTED') v.push({code:'PI_EXPECT_AGE_REJECT',message:'hard age violation must reject'}); break;
    case 'PI-B-011': if (strs(obj(op.parking).options).length===0 || obj(op.parking).guaranteedAvailability!==false) v.push({code:'PI_EXPECT_PARKING_NOT_GUARANTEED',message:'parking options are not guarantee'}); break;
    case 'PI-B-012': if (obj(op.openingHours).status!=='CONFLICTING' || strs(obj(op.openingHours).evidenceRefs).length<2 || e.disposition==='ACCEPTED') v.push({code:'PI_EXPECT_HOURS_CONFLICT',message:'conflicting hours must preserve both refs/not accept'}); break;
    case 'PI-B-013': if (all.length!==1 || objs(c.providerPlaceIds).length<2) v.push({code:'PI_EXPECT_DUPLICATE_MERGE',message:'duplicate discoveries must merge'}); break;
    case 'PI-B-014': if (obj(op.price).amount!==null || !['UNKNOWN','ESTIMATED'].includes(String(obj(op.price).status))) v.push({code:'PI_EXPECT_NO_FAKE_FEE',message:'exact fee cannot be fabricated'}); break;
    case 'PI-B-015': if (checks.some(x=>x.status==='SATISFIED') || e.disposition!=='NEEDS_VERIFICATION') v.push({code:'PI_EXPECT_TIER4_NOT_SATISFIED',message:'Tier4-only hard claim cannot satisfy'}); break;
    case 'PI-B-016': if (e.disposition==='ACCEPTED' || !strs(c.unresolvedClaims).includes('PLACE_IDENTITY_AMBIGUOUS')) v.push({code:'PI_EXPECT_AMBIGUOUS_ID',message:'ambiguous identity cannot accept'}); break;
  }
  return { violations: v };
}

describe('M1.4 R2 case depth — TM-AG-004 Place Intelligence', () => {
  it('executes all 16 golden Place Intelligence behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry=await loadAgentRegistry(); const inventory=await loadFixtureInventory(registry); const compilation=await compileRegistrySchemas(registry);
    const pack=inventory.packs.find(x=>x.componentId==='TM-AG-004'); const schemas=compilation.compiled.find(x=>x.componentId==='TM-AG-004'); if(!pack||!schemas) throw new Error('TM-AG-004 missing');
    const fixtures=pack.cases.filter(x=>x.groupKind==='behavior'); expect(fixtures).toHaveLength(16); const results=[];
    for(const f of fixtures){const input=inputFor(f);results.push(await runBehaviorFixtureCase({fixture:f,schemas,execute:()=>({canonicalInput:input,output:outputFor(f,input)}),evaluateExpectation:evaluate}));}
    expect(results.map(r=>[r.fixtureId,r.status])).toEqual(fixtures.map(f=>[f.fixtureId,'PASS']));
    expect(results.flatMap(r=>r.inputSchemaErrors)).toEqual([]); expect(results.flatMap(r=>r.outputSchemaErrors)).toEqual([]); expect(results.flatMap(r=>r.expectationViolations)).toEqual([]);
  });
});
