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

type JsonRecord = Record<string, unknown>;

interface RecordedExecution {
  componentId: string;
  fixtureId: string;
  canonicalInput: JsonRecord;
  canonicalOutput: JsonRecord;
}

function asRecord(value: unknown): JsonRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('expected object');
  return value as JsonRecord;
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

async function loadRecording(): Promise<RecordedExecution> {
  const raw = await readFile(
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-003-dr-001.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluateDestinationExpectation(
  fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const expected = asRecord(fixture.payload.expected);
  const output = asRecord(execution.output);
  const destinations = records(output.destinations);
  const violations: { code: string; message: string }[] = [];
  const primaryTarget = expected.primaryTarget;

  const primary = destinations.find(item => item.relationToTarget === 'primary');
  if (!primary || primary.name !== primaryTarget) {
    violations.push({
      code: 'DR_FIXED_PRIMARY_TARGET_MISMATCH',
      message: `fixed target ${String(primaryTarget)} must remain the primary destination`
    });
  }

  if (expected.mustNotRunOpenDestinationSelection === true) {
    if (destinations.length !== 1 || destinations.some(item => item.relationToTarget !== 'primary')) {
      violations.push({
        code: 'DR_OPEN_DESTINATION_SELECTION_LEAKAGE',
        message: 'FIXED_TARGET fixture must not add open-destination candidates'
      });
    }
  }

  return { violations };
}

describe('M1.4 R2 recorded artifact replay — TM-AG-003 Destination Research', () => {
  it('runs DR-001 through canonical R0 → R1 → independent fixture expectation', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();

    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-003 DR-001 fixture/schema missing');

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateDestinationExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 if evidence-free region context is promoted to VERIFIED while remaining schema-valid', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-003 DR-001 fixture/schema missing');

    const destination = asRecord(records(recording.canonicalOutput.destinations)[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      destinations: [{ ...destination, researchStatus: 'VERIFIED_REGION_CONTEXT' }]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateDestinationExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('DESTINATION_VERIFIED_WITHOUT_EVIDENCE');
    expect(result.status).toBe('FAIL');
  });

  it('fails fixture expectation if fixed Bursa target is replaced by an open-destination candidate set', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-003 DR-001 fixture/schema missing');

    const destination = asRecord(records(recording.canonicalOutput.destinations)[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      destinations: [
        { ...destination, destinationId: 'destination:bolu:primary', name: 'Bolu' },
        { ...destination, destinationId: 'destination:sakarya:nearby', name: 'Sakarya', relationToTarget: 'nearby' }
      ]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateDestinationExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.expectationViolations.map(item => item.code)).toEqual(expect.arrayContaining([
      'DR_FIXED_PRIMARY_TARGET_MISMATCH',
      'DR_OPEN_DESTINATION_SELECTION_LEAKAGE'
    ]));
    expect(result.status).toBe('FAIL');
  });
});
