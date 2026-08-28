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
type EvidenceType = 'USER_EXPLICIT' | 'CONVERSATION_FACT' | 'MEMORY_DISCLOSURE' | 'NORMALIZATION';

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

function ev(id: string, type: EvidenceType, fieldPath: string, sourceRef: string): JsonRecord {
  return { evidenceId: id, type, fieldPath, sourceRef };
}

function child(ageYears: number | null, evidenceRef?: string): JsonRecord {
  return { ageYears, evidenceRefs: evidenceRef ? [evidenceRef] : [] };
}

function sourced(value: string | null, evidenceRef?: string): JsonRecord {
  return { value, evidenceRefs: evidenceRef ? [evidenceRef] : [] };
}

function baseProfile(args: {
  requestId: string;
  adults: number | null;
  children: JsonRecord[];
  totalTravelers: number | null;
  origin?: [string, string] | null;
  destination?: [string, string] | null;
  transport?: ['own_car' | 'public_transport' | 'flight' | 'unknown', string?];
  unknownFields?: string[];
  conflicts?: JsonRecord[];
  evidence: JsonRecord[];
  confidence?: number;
}): JsonRecord {
  return {
    schemaVersion: '1.0',
    requestId: args.requestId,
    party: {
      adults: args.adults,
      children: args.children,
      totalTravelers: args.totalTravelers
    },
    tripContext: {
      origin: args.origin ? sourced(args.origin[0], args.origin[1]) : sourced(null),
      destination: args.destination ? sourced(args.destination[0], args.destination[1]) : sourced(null)
    },
    transport: {
      mode: args.transport?.[0] ?? 'unknown',
      evidenceRefs: args.transport?.[1] ? [args.transport[1]] : []
    },
    unknownFields: args.unknownFields ?? [],
    conflicts: args.conflicts ?? [],
    evidence: args.evidence,
    overallConfidence: args.confidence ?? 1
  };
}

function profileReferenceOutput(fixtureId: string, input: JsonRecord): JsonRecord {
  const requestId = String(input.requestId);
  const src = `request:${requestId}`;

  switch (fixtureId) {
    case 'PROFILE-FX-001': {
      const evidence = [
        ev('e-adults', 'USER_EXPLICIT', 'party.adults', src),
        ev('e-c1', 'USER_EXPLICIT', 'party.children[0].ageYears', src),
        ev('e-c2', 'USER_EXPLICIT', 'party.children[1].ageYears', src),
        ev('e-origin', 'USER_EXPLICIT', 'tripContext.origin', src),
        ev('e-dest', 'USER_EXPLICIT', 'tripContext.destination', src),
        ev('e-transport', 'USER_EXPLICIT', 'transport.mode', src),
        ev('e-total', 'NORMALIZATION', 'party.totalTravelers', `normalization:${requestId}`)
      ];
      return baseProfile({ requestId, adults: 2, children: [child(2, 'e-c1'), child(6, 'e-c2')], totalTravelers: 4, origin: ['Kocaeli', 'e-origin'], destination: ['Bursa', 'e-dest'], transport: ['own_car', 'e-transport'], evidence });
    }
    case 'PROFILE-FX-002': {
      const evidence = [ev('e-dest', 'USER_EXPLICIT', 'tripContext.destination', src)];
      return baseProfile({ requestId, adults: null, children: [], totalTravelers: null, destination: ['Bursa', 'e-dest'], transport: ['unknown'], unknownFields: ['party.adults', 'party.children', 'transport.mode'], evidence, confidence: 0.65 });
    }
    case 'PROFILE-FX-003': {
      const evidence = [
        ev('e-adults-current', 'USER_EXPLICIT', 'party.adults', src),
        ev('e-child-current', 'USER_EXPLICIT', 'party.children[0].ageYears', src),
        ev('e-adults-memory', 'MEMORY_DISCLOSURE', 'party.adults', 'mem-disclosure-1'),
        ev('e-children-memory', 'MEMORY_DISCLOSURE', 'party.children', 'mem-disclosure-1'),
        ev('e-total', 'NORMALIZATION', 'party.totalTravelers', `normalization:${requestId}`)
      ];
      return baseProfile({
        requestId,
        adults: 1,
        children: [child(6, 'e-child-current')],
        totalTravelers: 2,
        transport: ['unknown'],
        unknownFields: ['tripContext.origin', 'tripContext.destination', 'transport.mode'],
        conflicts: [{ code: 'CURRENT_EXPLICIT_OVERRIDES_MEMORY', fieldPaths: ['party.adults', 'party.children'], evidenceRefs: ['e-adults-current', 'e-child-current', 'e-adults-memory', 'e-children-memory'] }],
        evidence,
        confidence: 0.95
      });
    }
    case 'PROFILE-FX-004': {
      const evidence = [
        ev('e-adults', 'USER_EXPLICIT', 'party.adults', src),
        ev('e-child-count', 'USER_EXPLICIT', 'party.children', src),
        ev('e-explicit-total', 'USER_EXPLICIT', 'party.totalTravelers', src),
        ev('e-total', 'NORMALIZATION', 'party.totalTravelers', `normalization:${requestId}`)
      ];
      return baseProfile({
        requestId,
        adults: 2,
        children: [child(null), child(null)],
        totalTravelers: 4,
        transport: ['unknown'],
        unknownFields: ['party.children[0].ageYears', 'party.children[1].ageYears', 'tripContext.origin', 'tripContext.destination', 'transport.mode'],
        conflicts: [{ code: 'EXPLICIT_PARTY_COUNT_CONFLICT', fieldPaths: ['party.totalTravelers', 'party.adults', 'party.children'], evidenceRefs: ['e-explicit-total', 'e-adults', 'e-child-count'] }],
        evidence,
        confidence: 0.8
      });
    }
    case 'PROFILE-FX-005': {
      const evidence = [
        ev('e-adults', 'USER_EXPLICIT', 'party.adults', src),
        ev('e-child-count', 'USER_EXPLICIT', 'party.children', src),
        ev('e-dest', 'USER_EXPLICIT', 'tripContext.destination', src),
        ev('e-total', 'NORMALIZATION', 'party.totalTravelers', `normalization:${requestId}`)
      ];
      return baseProfile({ requestId, adults: 2, children: [child(null)], totalTravelers: 3, destination: ['Eskişehir', 'e-dest'], transport: ['unknown'], unknownFields: ['party.children[0].ageYears', 'tripContext.origin', 'transport.mode'], evidence, confidence: 0.82 });
    }
    case 'PROFILE-FX-006': {
      const evidence = [
        ev('e-car', 'USER_EXPLICIT', 'transport.mode', src),
        ev('e-bus', 'USER_EXPLICIT', 'transport.mode', src)
      ];
      return baseProfile({
        requestId,
        adults: null,
        children: [],
        totalTravelers: null,
        transport: ['unknown'],
        unknownFields: ['party.adults', 'party.children', 'tripContext.origin', 'tripContext.destination', 'transport.mode'],
        conflicts: [{ code: 'CONFLICTING_TRANSPORT_MODES', fieldPaths: ['transport.mode'], evidenceRefs: ['e-car', 'e-bus'] }],
        evidence,
        confidence: 0.6
      });
    }
    case 'PROFILE-FX-007': {
      const evidence = [
        ev('e-c1', 'USER_EXPLICIT', 'party.children[0].ageYears', src),
        ev('e-c2', 'USER_EXPLICIT', 'party.children[1].ageYears', src),
        ev('e-origin', 'USER_EXPLICIT', 'tripContext.origin', src),
        ev('e-dest', 'USER_EXPLICIT', 'tripContext.destination', src),
        ev('e-transport', 'USER_EXPLICIT', 'transport.mode', src)
      ];
      return baseProfile({ requestId, adults: null, children: [child(2, 'e-c1'), child(6, 'e-c2')], totalTravelers: null, origin: ['Kocaeli', 'e-origin'], destination: ['Yalova', 'e-dest'], transport: ['own_car', 'e-transport'], unknownFields: ['party.adults'], evidence, confidence: 0.9 });
    }
    case 'PROFILE-FX-008': {
      const evidence = [
        ev('e-adults', 'USER_EXPLICIT', 'party.adults', src),
        ev('e-dest', 'USER_EXPLICIT', 'tripContext.destination', src),
        ev('e-total', 'NORMALIZATION', 'party.totalTravelers', `normalization:${requestId}`)
      ];
      return baseProfile({ requestId, adults: 2, children: [], totalTravelers: 2, destination: ['Bursa', 'e-dest'], transport: ['unknown'], unknownFields: ['tripContext.origin', 'transport.mode'], evidence, confidence: 0.9 });
    }
    case 'PROFILE-FX-009': {
      const evidence = [
        ev('e-adults-memory', 'MEMORY_DISCLOSURE', 'party.adults', 'mem-disclosure-9'),
        ev('e-c1-memory', 'MEMORY_DISCLOSURE', 'party.children[0].ageYears', 'mem-disclosure-9'),
        ev('e-c2-memory', 'MEMORY_DISCLOSURE', 'party.children[1].ageYears', 'mem-disclosure-9'),
        ev('e-dest', 'USER_EXPLICIT', 'tripContext.destination', src),
        ev('e-transport', 'USER_EXPLICIT', 'transport.mode', src),
        ev('e-total', 'NORMALIZATION', 'party.totalTravelers', `normalization:${requestId}`)
      ];
      return baseProfile({ requestId, adults: 2, children: [child(2, 'e-c1-memory'), child(6, 'e-c2-memory')], totalTravelers: 4, destination: ['Bursa', 'e-dest'], transport: ['own_car', 'e-transport'], unknownFields: ['tripContext.origin'], evidence, confidence: 0.92 });
    }
    case 'PROFILE-FX-010': {
      const evidence = [
        ev('e-adults', 'USER_EXPLICIT', 'party.adults', src),
        ev('e-child', 'USER_EXPLICIT', 'party.children[0].ageYears', src),
        ev('e-dest', 'USER_EXPLICIT', 'tripContext.destination', src),
        ev('e-transport', 'USER_EXPLICIT', 'transport.mode', src),
        ev('e-total', 'NORMALIZATION', 'party.totalTravelers', `normalization:${requestId}`)
      ];
      return baseProfile({ requestId, adults: 2, children: [child(6, 'e-child')], totalTravelers: 3, destination: ['Ankara', 'e-dest'], transport: ['own_car', 'e-transport'], unknownFields: ['tripContext.origin'], evidence, confidence: 0.98 });
    }
    default:
      throw new Error(`UNSUPPORTED_PROFILE_FIXTURE:${fixtureId}`);
  }
}

function evaluateProfileFixture(
  fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const expected = asRecord(fixture.payload.expect);
  const output = asRecord(execution.output);
  const party = asRecord(output.party);
  const tripContext = asRecord(output.tripContext);
  const transport = asRecord(output.transport);
  const evidence = records(output.evidence);
  const violations: { code: string; message: string }[] = [];

  const equals = (key: string, actual: unknown) => {
    if (Object.prototype.hasOwnProperty.call(expected, key) && expected[key] !== actual) {
      violations.push({ code: `PROFILE_EXPECT_${key}`, message: `${key} mismatch` });
    }
  };

  equals('party.adults', party.adults);
  equals('party.totalTravelers', party.totalTravelers);
  equals('tripContext.origin.value', asRecord(tripContext.origin).value);
  equals('tripContext.destination.value', asRecord(tripContext.destination).value);
  equals('transport.mode', transport.mode);
  equals('conflicts.length', Array.isArray(output.conflicts) ? output.conflicts.length : 0);

  if (Array.isArray(expected['party.children[].ageYears'])) {
    const ages = records(party.children).map(item => item.ageYears);
    if (JSON.stringify(ages) !== JSON.stringify(expected['party.children[].ageYears'])) {
      violations.push({ code: 'PROFILE_EXPECT_CHILD_AGES', message: 'child ages mismatch' });
    }
  }
  if (Array.isArray(expected.unknownFieldsContains)) {
    for (const field of strings(expected.unknownFieldsContains)) {
      if (!strings(output.unknownFields).includes(field)) violations.push({ code: 'PROFILE_EXPECT_UNKNOWN_FIELD', message: `missing unknown field ${field}` });
    }
  }
  if (typeof expected.conflictsMin === 'number' && records(output.conflicts).length < expected.conflictsMin) {
    violations.push({ code: 'PROFILE_EXPECT_CONFLICT_MIN', message: 'conflict count below expected minimum' });
  }
  if (expected.currentExplicitWins === true) {
    if (party.adults !== 1 || JSON.stringify(records(party.children).map(item => item.ageYears)) !== JSON.stringify([6])) {
      violations.push({ code: 'PROFILE_EXPECT_CURRENT_EXPLICIT_WIN', message: 'current explicit party facts must win over memory' });
    }
  }
  if (expected.mustNotSilentlyResolve === true && records(output.conflicts).length === 0) {
    violations.push({ code: 'PROFILE_EXPECT_VISIBLE_CONFLICT', message: 'conflict must remain visible' });
  }
  if (Array.isArray(expected.mustNotEmit)) {
    for (const key of strings(expected.mustNotEmit)) {
      if (Object.prototype.hasOwnProperty.call(output, key)) violations.push({ code: 'PROFILE_POLICY_LEAKAGE', message: `forbidden field ${key} emitted` });
    }
  }
  if (expected.mustNotEmitRecommendations === true) {
    for (const key of ['recommendations', 'places', 'hotels', 'activities']) {
      if (Object.prototype.hasOwnProperty.call(output, key)) violations.push({ code: 'PROFILE_RECOMMENDATION_LEAKAGE', message: `recommendation field ${key} emitted` });
    }
  }
  if (Array.isArray(expected.evidenceTypesContain)) {
    const types = new Set(evidence.map(item => item.type));
    for (const type of strings(expected.evidenceTypesContain)) {
      if (!types.has(type)) violations.push({ code: 'PROFILE_EXPECT_EVIDENCE_TYPE', message: `missing evidence type ${type}` });
    }
  }
  if (typeof expected.mustNotContainSensitiveLiteral === 'string' && JSON.stringify(output).includes(expected.mustNotContainSensitiveLiteral)) {
    violations.push({ code: 'PROFILE_SENSITIVE_LITERAL_LEAK', message: 'sensitive literal leaked to output' });
  }

  return { violations };
}

describe('M1.4 R2 case depth — TM-AG-001 Profile', () => {
  it('executes all 10 golden Profile behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const pack = inventory.packs.find(item => item.componentId === 'TM-AG-001');
    const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-001');
    if (!pack || !schemas) throw new Error('TM-AG-001 fixture pack/schema missing');

    const behaviorFixtures = pack.cases.filter(item => item.groupKind === 'behavior');
    expect(behaviorFixtures).toHaveLength(10);

    const results = [];
    for (const fixture of behaviorFixtures) {
      const canonicalInput = asRecord(fixture.payload.input);
      results.push(await runBehaviorFixtureCase({
        fixture,
        schemas,
        execute: () => ({ canonicalInput, output: profileReferenceOutput(fixture.fixtureId, canonicalInput) }),
        evaluateExpectation: evaluateProfileFixture
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
