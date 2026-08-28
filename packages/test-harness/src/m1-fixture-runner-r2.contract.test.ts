import { describe, expect, it } from 'vitest';
import {
  compileRegistrySchemas,
  loadAgentRegistry,
  loadFixtureInventory,
  runBehaviorFixtureCase,
  type FixtureExecutionResult,
  type NormalizedFixtureCase
} from '../../harness/src/index.js';

function profileOutput(totalTravelers = 4) {
  return {
    schemaVersion: '1.0',
    requestId: 'req-001',
    party: {
      adults: 2,
      children: [
        { ageYears: 2, evidenceRefs: ['ev-child-1'] },
        { ageYears: 6, evidenceRefs: ['ev-child-2'] }
      ],
      totalTravelers
    },
    tripContext: {
      origin: { value: 'Kocaeli', evidenceRefs: ['ev-origin'] },
      destination: { value: 'Bursa', evidenceRefs: ['ev-destination'] }
    },
    transport: { mode: 'own_car', evidenceRefs: ['ev-transport'] },
    unknownFields: [],
    conflicts: [],
    evidence: [
      { evidenceId: 'ev-adults', type: 'USER_EXPLICIT', fieldPath: 'party.adults', sourceRef: 'request:req-001' },
      { evidenceId: 'ev-child-1', type: 'USER_EXPLICIT', fieldPath: 'party.children[0].ageYears', sourceRef: 'request:req-001' },
      { evidenceId: 'ev-child-2', type: 'USER_EXPLICIT', fieldPath: 'party.children[1].ageYears', sourceRef: 'request:req-001' },
      { evidenceId: 'ev-origin', type: 'USER_EXPLICIT', fieldPath: 'tripContext.origin', sourceRef: 'request:req-001' },
      { evidenceId: 'ev-destination', type: 'USER_EXPLICIT', fieldPath: 'tripContext.destination', sourceRef: 'request:req-001' },
      { evidenceId: 'ev-transport', type: 'USER_EXPLICIT', fieldPath: 'transport.mode', sourceRef: 'request:req-001' },
      { evidenceId: 'ev-total', type: 'NORMALIZATION', fieldPath: 'party.totalTravelers', sourceRef: 'normalization:req-001' }
    ],
    overallConfidence: 1
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('expected object');
  return value as Record<string, unknown>;
}

describe('M1.4 normalized R2 fixture runner', () => {
  it('loads all 17 golden fixture packs and finds primary behavior fixtures in every package', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);

    expect(inventory.packs).toHaveLength(17);
    expect(inventory.rows).toHaveLength(17);
    expect(inventory.rows.filter(row => row.behaviorCount === 0)).toEqual([]);
    expect(inventory.rows.filter(row => row.totalCount === 0)).toEqual([]);
  });

  it('runs a real Profile golden behavior fixture through R0 → R1 → expectation', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    expect(compilation.errors).toEqual([]);

    const profilePack = inventory.packs.find(pack => pack.componentId === 'TM-AG-001');
    const fixture = profilePack?.cases.find(item => item.fixtureId === 'PROFILE-FX-001');
    const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-001');
    if (!fixture || !schemas) throw new Error('Profile fixture/schema missing');

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: (item: Readonly<NormalizedFixtureCase>): FixtureExecutionResult => ({
        canonicalInput: asRecord(item.payload.input),
        output: profileOutput()
      }),
      evaluateExpectation: (item, execution) => {
        const expected = asRecord(item.payload.expect);
        const expectedTotal = expected['party.totalTravelers'];
        const actualParty = asRecord(asRecord(execution.output).party);
        return {
          violations: actualParty.totalTravelers === expectedTotal
            ? []
            : [{ code: 'FIXTURE_EXPECTATION_TOTAL_MISMATCH', message: 'party.totalTravelers mismatch' }]
        };
      }
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R2 when output is schema-valid but violates a deterministic R1 invariant', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const fixture = inventory.packs
      .find(pack => pack.componentId === 'TM-AG-001')
      ?.cases.find(item => item.fixtureId === 'PROFILE-FX-001');
    const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-001');
    if (!fixture || !schemas) throw new Error('Profile fixture/schema missing');

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: item => ({ canonicalInput: asRecord(item.payload.input), output: profileOutput(5) }),
      evaluateExpectation: () => ({ violations: [] })
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.status).toBe('FAIL');
  });

  it('fails R2 when the fixture-specific expectation adapter reports mismatch', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const fixture = inventory.packs
      .find(pack => pack.componentId === 'TM-AG-001')
      ?.cases.find(item => item.fixtureId === 'PROFILE-FX-001');
    const schemas = compilation.compiled.find(item => item.componentId === 'TM-AG-001');
    if (!fixture || !schemas) throw new Error('Profile fixture/schema missing');

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: item => ({ canonicalInput: asRecord(item.payload.input), output: profileOutput() }),
      evaluateExpectation: () => ({
        violations: [{ code: 'EXPECTED_BEHAVIOR_MISMATCH', message: 'synthetic expectation failure' }]
      })
    });

    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toHaveLength(1);
    expect(result.status).toBe('FAIL');
  });
});
