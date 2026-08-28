import { describe, expect, it } from 'vitest';
import {
  compileRegistrySchemas,
  loadAgentRegistry,
  loadFixtureInventory,
  runBehaviorFixtureCase,
  type FixtureExecutionResult,
  type NormalizedFixtureCase
} from '../../harness/src/index.js';

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('expected object');
  return value as JsonRecord;
}
function records(value: unknown): JsonRecord[] { return Array.isArray(value) ? value.map(asRecord) : []; }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []; }

function profile(requestId: string): JsonRecord {
  return {
    schemaVersion: '1.0', requestId,
    party: { adults: 2, children: [{ ageYears: 2, evidenceRefs: ['p-c1'] }, { ageYears: 6, evidenceRefs: ['p-c2'] }], totalTravelers: 4 },
    tripContext: { origin: { value: 'Kocaeli', evidenceRefs: ['p-origin'] }, destination: { value: 'Bursa', evidenceRefs: ['p-dest'] } },
    transport: { mode: 'own_car', evidenceRefs: ['p-transport'] },
    unknownFields: [], conflicts: [],
    evidence: [
      { evidenceId: 'p-adults', type: 'USER_EXPLICIT', fieldPath: 'party.adults', sourceRef: `request:${requestId}` },
      { evidenceId: 'p-c1', type: 'USER_EXPLICIT', fieldPath: 'party.children[0].ageYears', sourceRef: `request:${requestId}` },
      { evidenceId: 'p-c2', type: 'USER_EXPLICIT', fieldPath: 'party.children[1].ageYears', sourceRef: `request:${requestId}` },
      { evidenceId: 'p-origin', type: 'USER_EXPLICIT', fieldPath: 'tripContext.origin', sourceRef: `request:${requestId}` },
      { evidenceId: 'p-dest', type: 'USER_EXPLICIT', fieldPath: 'tripContext.destination', sourceRef: `request:${requestId}` },
      { evidenceId: 'p-transport', type: 'USER_EXPLICIT', fieldPath: 'transport.mode', sourceRef: `request:${requestId}` },
      { evidenceId: 'p-total', type: 'NORMALIZATION', fieldPath: 'party.totalTravelers', sourceRef: `normalization:${requestId}` }
    ], overallConfidence: 1
  };
}

function policy(requestId: string, fixtureId: string): JsonRecord {
  const base: JsonRecord = { schemaVersion: '1.0', requestId, preferences: [], constraints: [], exceptions: [], conflicts: [], clarificationRequired: [], overallConfidence: 1 };
  if (fixtureId === 'DR-003') base.constraints = [{ constraintId: 'c-distance', key: 'max_distance_boundary', kind: 'HARD', subject: 'route.distance_km', operator: 'lte', value: 150, condition: null, sourceRefs: ['stmt-distance'], confidence: 1, evidenceRequired: true }];
  if (fixtureId === 'DR-004') base.exceptions = [{ exceptionId: 'ex_distance_001', targetKey: 'preferred_distance_150km', mode: 'ALLOW_IF_EXCEPTIONAL_VALUE', trigger: 'candidate_experience_value == EXCEPTIONAL', requiresUserApproval: false, sourceRefs: ['stmt-distance'] }];
  if (fixtureId === 'DR-010') base.constraints = [{ constraintId: 'c-women-beach', key: 'women_only_beach_when_beach', kind: 'CONDITIONAL_HARD', subject: 'activity.beach.access', operator: 'equals', value: 'women_only', condition: { field: 'activity.type', operator: 'equals', value: 'beach' }, sourceRefs: ['stmt-beach'], confidence: 1, evidenceRequired: true }];
  if (fixtureId === 'DR-011') base.constraints = [{ constraintId: 'c-access', key: 'accessibility_requirement', kind: 'HARD', subject: 'place.accessibility', operator: 'equals', value: true, condition: null, sourceRefs: ['stmt-access'], confidence: 1, evidenceRequired: true }];
  return base;
}

function canonicalInput(fixture: Readonly<NormalizedFixtureCase>): JsonRecord {
  const requestId = `req-${fixture.fixtureId.toLowerCase()}`;
  const raw = fixture.payload.input && typeof fixture.payload.input === 'object' && !Array.isArray(fixture.payload.input) ? asRecord(fixture.payload.input) : {};
  const mode = raw.mode === 'OPEN_DESTINATION' ? 'OPEN_DESTINATION' : 'FIXED_TARGET';
  const targetName = mode === 'FIXED_TARGET' ? (typeof raw.targetName === 'string' ? raw.targetName : 'Bursa') : null;
  const originName = typeof raw.originName === 'string' ? raw.originName : 'Kocaeli';
  return {
    schemaVersion: '1.0', requestId, travelerProfile: profile(requestId), policyPackage: policy(requestId, fixture.fixtureId),
    destinationScope: { mode, originName, targetName, country: 'Türkiye', dateRange: { startDate: '2026-09-10', endDate: '2026-09-14' } },
    contextManifestId: `ctx-${fixture.fixtureId.toLowerCase()}`
  };
}

function evidence(id: string, tier: number, freshness: 'CURRENT' | 'STALE' | 'UNKNOWN' = 'CURRENT', claimType = 'region_context'): JsonRecord {
  return { evidenceId: id, claimType, sourceTier: tier, sourceRef: `source:${id}`, retrievedAt: '2026-08-28T08:00:00+03:00', freshnessStatus: freshness };
}

function brief(args: {
  id: string; name?: string; relation?: 'primary'|'nearby'|'exceptional'; exceptionRefs?: string[]; themes?: string[];
  seasonType?: 'CLIMATE_NORMAL'|'OFFICIAL_SEASONAL_GUIDANCE'|'NONE'; seasonSummary?: string|null; seasonEvidence?: string[];
  relevance?: JsonRecord[]; routeValidation?: boolean; status?: 'VERIFIED_REGION_CONTEXT'|'PARTIAL'|'DISCOVERY_ONLY';
  unresolved?: string[]; evidence?: JsonRecord[]; confidence?: number;
}): JsonRecord {
  return {
    destinationId: args.id, name: args.name ?? 'Bursa', administrativeType: 'city', relationToTarget: args.relation ?? 'primary',
    exceptionPolicyRefs: args.exceptionRefs ?? [], geoIdentity: { latitude: 40.195, longitude: 29.06, evidenceRefs: ['geo:1'] },
    experienceThemes: args.themes ?? ['culture_history'],
    seasonality: { dataType: args.seasonType ?? 'NONE', summary: args.seasonSummary ?? null, evidenceRefs: args.seasonEvidence ?? [] },
    constraintRelevance: args.relevance ?? [], routeValidationRequired: args.routeValidation ?? false,
    researchStatus: args.status ?? 'VERIFIED_REGION_CONTEXT', unresolvedClaims: args.unresolved ?? [],
    evidence: args.evidence ?? [evidence(`${args.id}:official`, 1)], confidence: args.confidence ?? 0.95
  };
}

function referenceOutput(fixture: Readonly<NormalizedFixtureCase>, input: JsonRecord): JsonRecord {
  const requestId = String(input.requestId);
  let destinations: JsonRecord[];
  let researchWarnings: string[] = [];
  switch (fixture.fixtureId) {
    case 'DR-001': destinations = [brief({ id: 'dr1', name: 'Bursa', relation: 'primary' })]; break;
    case 'DR-002': destinations = [brief({ id: 'dr2', name: 'Bursa', relation: 'primary', themes: ['culture_history','gastronomy'], evidence: [evidence('dr2:official',1), evidence('dr2:geo',2)] })]; break;
    case 'DR-003': destinations = [brief({ id: 'dr3', relation: 'nearby', routeValidation: true, status: 'PARTIAL', relevance: [{ constraintKey: 'max_distance_boundary', status: 'RELEVANT', requiredNextCheck: 'transport_route_distance_verification' }] })]; break;
    case 'DR-004': destinations = [brief({ id: 'dr4', name: 'Exceptional Region', relation: 'exceptional', exceptionRefs: ['ex_distance_001'], routeValidation: true })]; break;
    case 'DR-005': destinations = [brief({ id: 'dr5', relation: 'primary' })]; break;
    case 'DR-006': destinations = [brief({ id: 'dr6', seasonType: 'CLIMATE_NORMAL', seasonSummary: 'Typical September climate is mild.', seasonEvidence: ['ev-climate'], evidence: [evidence('ev-climate',2,'CURRENT','climate_normal')] })]; break;
    case 'DR-007': destinations = [brief({ id: 'dr7', seasonType: 'OFFICIAL_SEASONAL_GUIDANCE', seasonSummary: 'Official seasonal guidance for autumn visits.', seasonEvidence: ['ev-season'], evidence: [evidence('ev-season',1,'CURRENT','official_seasonal_guidance')] })]; break;
    case 'DR-008': destinations = [brief({ id: 'dr8', status: 'DISCOVERY_ONLY', evidence: [evidence('ev-tier4',4)], confidence: 0.55 })]; break;
    case 'DR-009': destinations = [brief({ id: 'dr9', status: 'PARTIAL', evidence: [evidence('ev-stale',1,'STALE')], unresolved: ['current_region_context_requires_refresh'], confidence: 0.55 })]; researchWarnings = ['stale_official_source_requires_refresh']; break;
    case 'DR-010': destinations = [brief({ id: 'dr10', status: 'PARTIAL', relevance: [{ constraintKey: 'women_only_beach_when_beach', status: 'RELEVANT', requiredNextCheck: 'place_level_privacy_verification' }] })]; break;
    case 'DR-011': destinations = [brief({ id: 'dr11', status: 'PARTIAL', relevance: [{ constraintKey: 'accessibility_requirement', status: 'RELEVANT', requiredNextCheck: 'place_and_accommodation_accessibility_verification' }] })]; break;
    case 'DR-012': destinations = [brief({ id: 'dr12', evidence: [evidence('ev-tier1-a',1), evidence('ev-tier2-b',2)], confidence: 0.9 })]; researchWarnings = ['source_conflict_tier1_preferred_over_tier2']; break;
    case 'DR-013': destinations = [brief({ id: 'dr13', status: 'PARTIAL', evidence: [evidence('ev-tier1-a',1), evidence('ev-tier1-b',1)], unresolved: ['equal_authority_source_conflict:A_vs_B'], confidence: 0.5 })]; researchWarnings = ['equal_trust_conflict_unresolved']; break;
    case 'DR-014': destinations = [brief({ id: 'dr14', themes: ['culture_history','thermal_wellness','gastronomy'] })]; break;
    default: throw new Error(`UNSUPPORTED_DR_FIXTURE:${fixture.fixtureId}`);
  }
  return { schemaVersion: '1.0', requestId, destinations, researchWarnings, overallConfidence: Math.min(...destinations.map(d => Number(d.confidence))) };
}

function evaluateFixture(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const expected = asRecord(fixture.payload.expected);
  const output = asRecord(execution.output);
  const destinations = records(output.destinations);
  const first = destinations[0] ?? {};
  const violations: { code: string; message: string }[] = [];

  if (typeof expected.primaryTarget === 'string' && first.name !== expected.primaryTarget) violations.push({ code: 'DR_EXPECT_PRIMARY_TARGET', message: 'primary target mismatch' });
  if (expected.candidateRationaleRequired === true && (strings(first.experienceThemes).length === 0 || records(first.evidence).length === 0)) violations.push({ code: 'DR_EXPECT_RATIONALE', message: 'candidate rationale requires themes + evidence' });
  if (expected.evidenceRequired === true && records(first.evidence).length === 0) violations.push({ code: 'DR_EXPECT_EVIDENCE', message: 'evidence missing' });
  if (expected.routeValidationRequired === true && first.routeValidationRequired !== true) violations.push({ code: 'DR_EXPECT_ROUTE_VALIDATION', message: 'nearby distance needs route validation' });
  if (typeof expected.relationToTarget === 'string' && first.relationToTarget !== expected.relationToTarget) violations.push({ code: 'DR_EXPECT_RELATION', message: 'relationToTarget mismatch' });
  if (typeof expected.exceptionPolicyRefsContains === 'string' && !strings(first.exceptionPolicyRefs).includes(expected.exceptionPolicyRefsContains)) violations.push({ code: 'DR_EXPECT_EXCEPTION_REF', message: 'exception policy ref missing' });
  if (expected.mustNotEmitExceptional === true && destinations.some(item => item.relationToTarget === 'exceptional')) violations.push({ code: 'DR_FORBIDDEN_EXCEPTIONAL', message: 'exceptional emitted without policy' });
  if (typeof expected.seasonalityDataType === 'string' && asRecord(first.seasonality).dataType !== expected.seasonalityDataType) violations.push({ code: 'DR_EXPECT_SEASON_TYPE', message: 'seasonality data type mismatch' });
  if (expected.mustNotContainForecastClaim === true && JSON.stringify(output).toLowerCase().includes('forecast')) violations.push({ code: 'DR_FORECAST_CLIMATE_CONFUSION', message: 'climate normal promoted to forecast' });
  if (typeof expected.researchStatusNot === 'string' && first.researchStatus === expected.researchStatusNot) violations.push({ code: 'DR_FORBIDDEN_RESEARCH_STATUS', message: 'research status too strong' });
  if (expected.warningRequired === true && strings(output.researchWarnings).length === 0) violations.push({ code: 'DR_EXPECT_WARNING', message: 'research warning missing' });
  if (typeof expected.constraintStatus === 'string' || typeof expected.requiredNextCheck === 'string') {
    const rel = records(first.constraintRelevance)[0];
    if (!rel) violations.push({ code: 'DR_EXPECT_CONSTRAINT_RELEVANCE', message: 'constraint relevance missing' });
    else {
      if (typeof expected.constraintStatus === 'string' && rel.status !== expected.constraintStatus) violations.push({ code: 'DR_EXPECT_CONSTRAINT_STATUS', message: 'constraint status mismatch' });
      if (typeof expected.requiredNextCheck === 'string' && rel.requiredNextCheck !== expected.requiredNextCheck) violations.push({ code: 'DR_EXPECT_NEXT_CHECK', message: 'required next check mismatch' });
    }
  }
  if (expected.higherTierPreferred === true) {
    const tiers = records(first.evidence).map(item => Number(item.sourceTier));
    if (!tiers.includes(1) || first.researchStatus !== 'VERIFIED_REGION_CONTEXT') violations.push({ code: 'DR_EXPECT_HIGHER_TIER_PREFERENCE', message: 'higher-tier source must drive verified result' });
  }
  if (expected.conflictTraceRequired === true && !strings(output.researchWarnings).some(w => w.includes('conflict'))) violations.push({ code: 'DR_EXPECT_CONFLICT_TRACE', message: 'source conflict trace missing' });
  if (expected.unresolvedClaimRequired === true && strings(first.unresolvedClaims).length === 0) violations.push({ code: 'DR_EXPECT_UNRESOLVED', message: 'unresolved equal-trust conflict missing' });
  if (expected.confidencePenalty === true && !(typeof first.confidence === 'number' && first.confidence < 1)) violations.push({ code: 'DR_EXPECT_CONFIDENCE_PENALTY', message: 'confidence penalty missing' });
  if (expected.experienceThemeAllowed === true && strings(first.experienceThemes).length === 0) violations.push({ code: 'DR_EXPECT_THEME', message: 'region theme missing' });
  if (expected.poiCollectionForbidden === true && destinations.some(item => ['pois','places','attractions'].some(key => Object.prototype.hasOwnProperty.call(item,key)))) violations.push({ code: 'DR_POI_LEAKAGE', message: 'POI collection leaked into region brief' });

  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-003 Destination Research', () => {
  it('executes all 14 golden Destination Research behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const pack = inventory.packs.find(item => item.componentId === 'TM-AG-003');
    const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-003');
    if (!pack || !schemas) throw new Error('TM-AG-003 fixture pack/schema missing');
    const behaviorFixtures = pack.cases.filter(item => item.groupKind === 'behavior');
    expect(behaviorFixtures).toHaveLength(14);
    const results = [];
    for (const fixture of behaviorFixtures) {
      const input = canonicalInput(fixture);
      results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: input, output: referenceOutput(fixture,input) }), evaluateExpectation: evaluateFixture }));
    }
    expect(results.map(r => [r.fixtureId,r.status])).toEqual(behaviorFixtures.map(f => [f.fixtureId,'PASS']));
    expect(results.flatMap(r => r.inputSchemaErrors)).toEqual([]);
    expect(results.flatMap(r => r.outputSchemaErrors)).toEqual([]);
    expect(results.flatMap(r => r.expectationViolations)).toEqual([]);
  });
});
