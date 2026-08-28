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

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function travelerProfile(requestId: string, childrenAges: number[] = [2, 6]): JsonRecord {
  const sourceRef = `request:${requestId}`;
  const children = childrenAges.map((age, index) => ({ ageYears: age, evidenceRefs: [`profile-child-${index}`] }));
  const evidence: JsonRecord[] = [
    { evidenceId: 'profile-adults', type: 'USER_EXPLICIT', fieldPath: 'party.adults', sourceRef },
    ...childrenAges.map((_, index) => ({
      evidenceId: `profile-child-${index}`,
      type: 'USER_EXPLICIT',
      fieldPath: `party.children[${index}].ageYears`,
      sourceRef
    })),
    { evidenceId: 'profile-origin', type: 'USER_EXPLICIT', fieldPath: 'tripContext.origin', sourceRef },
    { evidenceId: 'profile-destination', type: 'USER_EXPLICIT', fieldPath: 'tripContext.destination', sourceRef },
    { evidenceId: 'profile-transport', type: 'USER_EXPLICIT', fieldPath: 'transport.mode', sourceRef },
    { evidenceId: 'profile-total', type: 'NORMALIZATION', fieldPath: 'party.totalTravelers', sourceRef: `normalization:${requestId}` }
  ];
  return {
    schemaVersion: '1.0',
    requestId,
    party: { adults: 2, children, totalTravelers: 2 + children.length },
    tripContext: {
      origin: { value: 'Kocaeli', evidenceRefs: ['profile-origin'] },
      destination: { value: 'Bursa', evidenceRefs: ['profile-destination'] }
    },
    transport: { mode: 'own_car', evidenceRefs: ['profile-transport'] },
    unknownFields: [],
    conflicts: [],
    evidence,
    overallConfidence: 1
  };
}

function canonicalInputForFixture(fixture: Readonly<NormalizedFixtureCase>): JsonRecord {
  const payload = fixture.payload;
  const statements = strings(payload.inputStatements);
  const profileFacts = payload.profileFacts && typeof payload.profileFacts === 'object' && !Array.isArray(payload.profileFacts)
    ? asRecord(payload.profileFacts)
    : null;
  const profileAges = Array.isArray(profileFacts?.childrenAges)
    ? profileFacts.childrenAges.filter((age): age is number => typeof age === 'number')
    : [2, 6];
  const requestId = `req-${fixture.fixtureId.toLowerCase()}`;
  const normalizedStatements = statements.map((text, index) => ({
    statementId: `stmt-${fixture.fixtureId.toLowerCase()}-${index + 1}`,
    text,
    sourceType: 'USER_EXPLICIT',
    sourceRef: `request:${requestId}`
  }));

  return {
    schemaVersion: '1.0',
    requestId,
    tripRequest: {
      userMessage: statements.length > 0 ? statements.join(' ') : 'No explicit preference statement; classify only explicit policy input.',
      preferenceStatements: normalizedStatements
    },
    travelerProfile: travelerProfile(requestId, profileAges),
    policyVersion: 'tm-preference-policy-v1',
    contextManifestId: `ctx-${fixture.fixtureId.toLowerCase()}`
  };
}

function pref(
  fixtureId: string,
  key: string,
  value: unknown,
  sourceRefs: string[],
  condition?: JsonRecord | null
): JsonRecord {
  const result: JsonRecord = {
    preferenceId: `preference:${fixtureId.toLowerCase()}:${key}`,
    key,
    value,
    strength: 'SOFT',
    sourceRefs,
    confidence: 1
  };
  if (condition !== undefined) result.condition = condition;
  return result;
}

function constraint(args: {
  fixtureId: string;
  key: string;
  kind?: 'HARD' | 'CONDITIONAL_HARD';
  subject: string;
  operator: 'equals' | 'not_equals' | 'lte' | 'gte' | 'contains' | 'excludes';
  value: unknown;
  sourceRefs: string[];
  condition?: JsonRecord | null;
  evidenceRequired?: boolean;
}): JsonRecord {
  return {
    constraintId: `constraint:${args.fixtureId.toLowerCase()}:${args.key}`,
    key: args.key,
    kind: args.kind ?? 'HARD',
    subject: args.subject,
    operator: args.operator,
    value: args.value,
    condition: args.condition ?? null,
    sourceRefs: args.sourceRefs,
    confidence: 1,
    evidenceRequired: args.evidenceRequired ?? false
  };
}

function baseOutput(requestId: string, values: Partial<JsonRecord> = {}): JsonRecord {
  return {
    schemaVersion: '1.0',
    requestId,
    preferences: [],
    constraints: [],
    exceptions: [],
    conflicts: [],
    clarificationRequired: [],
    overallConfidence: 1,
    ...values
  };
}

function preferencePolicyReferenceOutput(fixture: Readonly<NormalizedFixtureCase>, input: JsonRecord): JsonRecord {
  const requestId = String(input.requestId);
  const statements = records(asRecord(input.tripRequest).preferenceStatements);
  const refs = statements.map(statement => String(statement.statementId));
  const s1 = refs[0] ?? `stmt-${fixture.fixtureId.toLowerCase()}-1`;
  const s2 = refs[1] ?? `stmt-${fixture.fixtureId.toLowerCase()}-2`;

  switch (fixture.fixtureId) {
    case 'PP-001':
      return baseOutput(requestId, {
        preferences: [
          pref('PP-001', 'child_friendly', true, [s1]),
          pref('PP-001', 'easy_parking', true, [s1])
        ]
      });
    case 'PP-002':
      return baseOutput(requestId, {
        constraints: [constraint({ fixtureId: 'PP-002', key: 'max_daily_drive', subject: 'transport.daily_drive_hours', operator: 'lte', value: 2, sourceRefs: [s1] })]
      });
    case 'PP-003':
      return baseOutput(requestId, {
        constraints: [constraint({
          fixtureId: 'PP-003',
          key: 'women_only_beach_when_beach',
          kind: 'CONDITIONAL_HARD',
          subject: 'activity.beach.access',
          operator: 'equals',
          value: 'women_only',
          condition: { field: 'activity.type', operator: 'equals', value: 'beach' },
          sourceRefs: [s1],
          evidenceRequired: true
        })]
      });
    case 'PP-004':
      return baseOutput(requestId, {
        constraints: [constraint({ fixtureId: 'PP-004', key: 'late_evening_excluded', subject: 'itinerary.time_bucket', operator: 'excludes', value: 'late_evening', sourceRefs: [s1] })]
      });
    case 'PP-005':
      return baseOutput(requestId, { preferences: [pref('PP-005', 'short_walking', true, [s1])] });
    case 'PP-006':
      return baseOutput(requestId, {
        constraints: [constraint({ fixtureId: 'PP-006', key: 'max_distance_boundary', subject: 'route.distance_km', operator: 'lte', value: 150, sourceRefs: [s1] })]
      });
    case 'PP-007':
      return baseOutput(requestId, {
        preferences: [pref('PP-007', 'preferred_distance_150km', 150, [s1])],
        exceptions: [{
          exceptionId: 'exception:pp-007:distance',
          targetKey: 'preferred_distance_150km',
          mode: 'ALLOW_IF_EXCEPTIONAL_VALUE',
          trigger: 'candidate_experience_value == EXCEPTIONAL',
          requiresUserApproval: false,
          sourceRefs: [s1]
        }]
      });
    case 'PP-008':
      return baseOutput(requestId, {
        constraints: [constraint({ fixtureId: 'PP-008', key: 'budget_max', subject: 'budget.total', operator: 'lte', value: 30000, sourceRefs: [s1] })]
      });
    case 'PP-009':
      return baseOutput(requestId, {
        constraints: [constraint({ fixtureId: 'PP-009', key: 'max_distance_boundary', subject: 'route.distance_km', operator: 'lte', value: 150, sourceRefs: [s1] })],
        preferences: [pref('PP-009', 'distance_around_200km', 200, [s2])],
        conflicts: [{
          conflictId: 'conflict:pp-009:distance',
          code: 'EXPLICIT_DISTANCE_CONFLICT',
          statementRefs: [s1, s2],
          resolution: 'CLARIFICATION_REQUIRED',
          notes: '150 km hard boundary conflicts with later 200 km soft allowance.'
        }],
        clarificationRequired: [{
          clarificationId: 'clarification:pp-009:distance',
          reasonCode: 'CONFLICTING_DISTANCE_SCOPE',
          statementRefs: [s1, s2],
          questionHint: '150 km kesin sınır mı, yoksa yaklaşık tercih mi?'
        }],
        overallConfidence: 0.7
      });
    case 'PP-010':
      return baseOutput(requestId, {
        constraints: [constraint({
          fixtureId: 'PP-010',
          key: 'women_only_beach_when_beach',
          kind: 'CONDITIONAL_HARD',
          subject: 'activity.beach.access',
          operator: 'equals',
          value: 'women_only',
          condition: { field: 'activity.type', operator: 'equals', value: 'beach' },
          sourceRefs: [s1],
          evidenceRequired: true
        })]
      });
    case 'PP-011':
      return baseOutput(requestId, {
        preferences: [pref('PP-011', 'shorter_distance_preferred', true, [s1])],
        clarificationRequired: [{
          clarificationId: 'clarification:pp-011:distance',
          reasonCode: 'AMBIGUOUS_DISTANCE_STRENGTH',
          statementRefs: [s1],
          questionHint: 'Yaklaşık nasıl bir mesafe aralığı tercih ediyorsunuz?'
        }],
        overallConfidence: 0.65
      });
    case 'PP-012':
      return baseOutput(requestId);
    case 'PP-013':
      return baseOutput(requestId, {
        preferences: [pref(
          'PP-013',
          'midday_rest_preferred',
          true,
          [s1],
          { field: 'activity.type', operator: 'equals', value: 'beach' }
        )]
      });
    case 'PP-014':
      return baseOutput(requestId, {
        constraints: [constraint({ fixtureId: 'PP-014', key: 'parking_required', subject: 'place.parking', operator: 'equals', value: true, sourceRefs: [s2], evidenceRequired: true })],
        conflicts: [{
          conflictId: 'conflict:pp-014:parking',
          code: 'EXPLICIT_PARKING_OVERRIDE',
          statementRefs: [s1, s2],
          resolution: 'LATEST_EXPLICIT_WINS',
          notes: 'Latest explicit parking requirement supersedes earlier indifference.'
        }]
      });
    default:
      throw new Error(`UNSUPPORTED_PP_FIXTURE:${fixture.fixtureId}`);
  }
}

function findConstraint(output: JsonRecord, key: string): JsonRecord | undefined {
  return records(output.constraints).find(item => item.key === key);
}

function findPreference(output: JsonRecord, key: string): JsonRecord | undefined {
  return records(output.preferences).find(item => item.key === key);
}

function evaluatePreferencePolicyFixture(
  fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const expected = asRecord(fixture.payload.expected);
  const output = asRecord(execution.output);
  const violations: { code: string; message: string }[] = [];

  for (const key of strings(expected.preferencesContain)) {
    if (!findPreference(output, key)) violations.push({ code: 'PP_EXPECT_PREFERENCE', message: `missing preference ${key}` });
  }

  if (Array.isArray(expected.hardConstraintKeys)) {
    const actualHard = records(output.constraints)
      .filter(item => item.kind === 'HARD' || item.kind === 'CONDITIONAL_HARD')
      .map(item => item.key)
      .sort();
    const expectedHard = strings(expected.hardConstraintKeys).sort();
    if (JSON.stringify(actualHard) !== JSON.stringify(expectedHard)) {
      violations.push({ code: 'PP_EXPECT_HARD_KEYS', message: 'hard constraint keys mismatch' });
    }
  }

  if (expected.constraint && typeof expected.constraint === 'object' && !Array.isArray(expected.constraint)) {
    const expectedConstraint = asRecord(expected.constraint);
    const actual = findConstraint(output, String(expectedConstraint.key));
    if (!actual) violations.push({ code: 'PP_EXPECT_CONSTRAINT', message: `missing constraint ${String(expectedConstraint.key)}` });
    else {
      for (const field of ['key', 'kind', 'operator', 'value', 'evidenceRequired'] as const) {
        if (Object.prototype.hasOwnProperty.call(expectedConstraint, field) && actual[field] !== expectedConstraint[field]) {
          violations.push({ code: `PP_EXPECT_CONSTRAINT_${field.toUpperCase()}`, message: `${field} mismatch` });
        }
      }
      if (expectedConstraint.condition && typeof expectedConstraint.condition === 'object' && !Array.isArray(expectedConstraint.condition)) {
        const expectedCondition = asRecord(expectedConstraint.condition);
        const actualCondition = actual.condition && typeof actual.condition === 'object' && !Array.isArray(actual.condition)
          ? asRecord(actual.condition)
          : null;
        if (!actualCondition) violations.push({ code: 'PP_EXPECT_CONDITION', message: 'condition missing' });
        else for (const field of ['field', 'operator', 'value'] as const) {
          if (actualCondition[field] !== expectedCondition[field]) violations.push({ code: `PP_EXPECT_CONDITION_${field.toUpperCase()}`, message: `condition.${field} mismatch` });
        }
      }
    }
  }

  if (expected.preference && typeof expected.preference === 'object' && !Array.isArray(expected.preference)) {
    const expectedPreference = asRecord(expected.preference);
    const actual = findPreference(output, String(expectedPreference.key));
    if (!actual) violations.push({ code: 'PP_EXPECT_SOFT_PREFERENCE', message: `missing preference ${String(expectedPreference.key)}` });
    else if (Object.prototype.hasOwnProperty.call(expectedPreference, 'strength') && actual.strength !== expectedPreference.strength) {
      violations.push({ code: 'PP_EXPECT_PREFERENCE_STRENGTH', message: 'preference strength mismatch' });
    }
  }

  if (typeof expected.constraintKey === 'string' && !findConstraint(output, expected.constraintKey)) {
    violations.push({ code: 'PP_EXPECT_CONSTRAINT_KEY', message: `missing constraint ${expected.constraintKey}` });
  }

  for (const key of strings(expected.mustNotCreateHard)) {
    if (findConstraint(output, key)) violations.push({ code: 'PP_FORBIDDEN_HARD_CREATED', message: `forbidden hard constraint ${key}` });
  }
  for (const key of strings(expected.mustNotCreate)) {
    if (findConstraint(output, key)) violations.push({ code: 'PP_FORBIDDEN_CONSTRAINT_CREATED', message: `forbidden constraint ${key}` });
  }
  if (expected.exceptionPolicyPresent === true && records(output.exceptions).length === 0) {
    violations.push({ code: 'PP_EXPECT_EXCEPTION_POLICY', message: 'exception policy missing' });
  }
  if (expected.conflictRequired === true && records(output.conflicts).length === 0) {
    violations.push({ code: 'PP_EXPECT_CONFLICT', message: 'conflict must remain visible' });
  }
  if (expected.clarificationRequired === true && records(output.clarificationRequired).length === 0) {
    violations.push({ code: 'PP_EXPECT_CLARIFICATION', message: 'clarification must be requested' });
  }
  if (expected.mustNotSilentlyResolve === true && records(output.conflicts).length === 0) {
    violations.push({ code: 'PP_EXPECT_NO_SILENT_RESOLUTION', message: 'conflict cannot be silently resolved' });
  }
  if (expected.clarificationAllowed === true && records(output.clarificationRequired).length === 0) {
    violations.push({ code: 'PP_EXPECT_AMBIGUITY_CLARIFICATION', message: 'ambiguous strength should remain clarification-visible' });
  }
  if (expected.conditionMustBePreserved === true) {
    const conditionalItems = [...records(output.preferences), ...records(output.constraints)]
      .filter(item => item.condition && typeof item.condition === 'object');
    if (conditionalItems.length === 0) violations.push({ code: 'PP_EXPECT_CONDITIONAL_SCOPE', message: 'conditional scope was lost' });
  }
  for (const key of strings(expected.mustNotGlobalize)) {
    if (findConstraint(output, key) || findPreference(output, key)) violations.push({ code: 'PP_FORBIDDEN_GLOBALIZATION', message: `conditional preference globalized as ${key}` });
  }
  if (expected.latestExplicitWinsAllowed === true && !records(output.conflicts).some(item => item.resolution === 'LATEST_EXPLICIT_WINS')) {
    violations.push({ code: 'PP_EXPECT_LATEST_EXPLICIT_WIN', message: 'latest explicit override lineage missing' });
  }
  for (const key of strings(expected.mustNotInventPreferences)) {
    if (findPreference(output, key) || findConstraint(output, key)) violations.push({ code: 'PP_INVENTED_PROFILE_PREFERENCE', message: `invented preference ${key}` });
  }

  const forbiddenInferences = strings(expected.forbiddenInferences).map(value => value.toLocaleLowerCase('en-US'));
  if (forbiddenInferences.length > 0) {
    const serialized = JSON.stringify(output).toLocaleLowerCase('en-US');
    for (const inference of forbiddenInferences) {
      if (serialized.includes(inference)) violations.push({ code: 'PP_PRIVACY_OVERINFERENCE', message: `forbidden identity inference ${inference}` });
    }
  }

  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-002 Preference & Policy', () => {
  it('executes all 14 golden Preference/Policy behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const pack = inventory.packs.find(item => item.componentId === 'TM-AG-002');
    const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-002');
    if (!pack || !schemas) throw new Error('TM-AG-002 fixture pack/schema missing');

    const behaviorFixtures = pack.cases.filter(item => item.groupKind === 'behavior');
    expect(behaviorFixtures).toHaveLength(14);

    const results = [];
    for (const fixture of behaviorFixtures) {
      const canonicalInput = canonicalInputForFixture(fixture);
      results.push(await runBehaviorFixtureCase({
        fixture,
        schemas,
        execute: () => ({ canonicalInput, output: preferencePolicyReferenceOutput(fixture, canonicalInput) }),
        evaluateExpectation: evaluatePreferencePolicyFixture
      }));
    }

    expect(results.map(result => [result.fixtureId, result.status])).toEqual(
      behaviorFixtures.map(fixture => [fixture.fixtureId, 'PASS'])
    );
    expect(results.flatMap(result => result.inputSchemaErrors)).toEqual([]);
    expect(results.flatMap(result => result.outputSchemaErrors)).toEqual([]);
    expect(results.flatMap(result => result.expectationViolations)).toEqual([]);
  });
});
