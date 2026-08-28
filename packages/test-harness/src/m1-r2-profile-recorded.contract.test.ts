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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-001-profile-fx-001.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluateProfileExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const output = asRecord(execution.output);
  const party = asRecord(output.party);
  const tripContext = asRecord(output.tripContext);
  const transport = asRecord(output.transport);
  const children = records(party.children).map(child => child.ageYears);
  const violations: { code: string; message: string }[] = [];

  if (party.adults !== 2) violations.push({ code: 'PROFILE_EXPECT_ADULTS', message: 'adults must equal 2' });
  if (JSON.stringify(children) !== JSON.stringify([2, 6])) violations.push({ code: 'PROFILE_EXPECT_CHILD_AGES', message: 'child ages must remain [2,6]' });
  if (party.totalTravelers !== 4) violations.push({ code: 'PROFILE_EXPECT_TOTAL', message: 'totalTravelers must equal 4' });
  if (asRecord(tripContext.origin).value !== 'Kocaeli') violations.push({ code: 'PROFILE_EXPECT_ORIGIN', message: 'origin must be Kocaeli' });
  if (asRecord(tripContext.destination).value !== 'Bursa') violations.push({ code: 'PROFILE_EXPECT_DESTINATION', message: 'destination must be Bursa' });
  if (transport.mode !== 'own_car') violations.push({ code: 'PROFILE_EXPECT_TRANSPORT', message: 'transport mode must be own_car' });
  if (Array.isArray(output.conflicts) && output.conflicts.length !== 0) violations.push({ code: 'PROFILE_EXPECT_NO_CONFLICT', message: 'happy path must contain zero conflicts' });

  return { violations };
}

async function loadFixtureAndSchemas() {
  const registry = await loadAgentRegistry();
  const inventory = await loadFixtureInventory(registry);
  const compilation = await compileRegistrySchemas(registry);
  const recording = await loadRecording();
  const fixture = inventory.packs
    .find(pack => pack.componentId === recording.componentId)
    ?.cases.find(item => item.fixtureId === recording.fixtureId);
  const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
  if (!fixture || !schemas) throw new Error('TM-AG-001 PROFILE-FX-001 fixture/schema missing');
  return { recording, fixture, schemas };
}

describe('M1.4 R2 recorded canonical execution — TM-AG-001 Profile', () => {
  it('runs PROFILE-FX-001 through canonical R0 → R1 → independent profile expectation', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateProfileExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 when schema-valid totalTravelers no longer matches adults plus children', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const mutatedOutput = {
      ...recording.canonicalOutput,
      party: { ...asRecord(recording.canonicalOutput.party), totalTravelers: 5 }
    };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateProfileExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.status).toBe('FAIL');
  });
});
