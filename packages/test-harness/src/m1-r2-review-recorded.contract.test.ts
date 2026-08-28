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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-012-rv-b-001.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluateParkingPrevalenceExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const input = asRecord(execution.canonicalInput);
  const output = asRecord(execution.output);
  const allRecords = records(input.records);
  const window = asRecord(input.analysisWindow);
  const start = Date.parse(String(window.start));
  const end = Date.parse(String(window.end));
  const valid = allRecords.filter(item => {
    const reviewedAt = typeof item.reviewedAt === 'string' ? Date.parse(item.reviewedAt) : NaN;
    const quality = asRecord(item.providerQualitySignals);
    return item.entityRef === input.entityRef &&
      Number.isFinite(reviewedAt) && reviewedAt >= start && reviewedAt <= end &&
      typeof item.body === 'string' && item.body.trim().length > 0 &&
      quality.spamSuspected !== true;
  });
  const parkingMentions = valid.filter(item => String(item.body).toLocaleLowerCase('tr-TR').includes('otopark'));
  const expectedPrevalence = valid.length === 0 ? 0 : parkingMentions.length / valid.length;
  const signal = records(output.signals).find(item => item.theme === 'parking_experience');
  const sample = asRecord(output.sample);
  const violations: { code: string; message: string }[] = [];

  if (!signal) {
    violations.push({ code: 'RV_EXPECT_PARKING_SIGNAL', message: 'recurring parking signal must be emitted' });
    return { violations };
  }
  if (sample.validCount !== valid.length) {
    violations.push({ code: 'RV_EXPECT_VALID_SAMPLE', message: `validCount must equal ${valid.length}` });
  }
  if (signal.mentionCount !== parkingMentions.length) {
    violations.push({ code: 'RV_EXPECT_MENTION_COUNT', message: `mentionCount must equal ${parkingMentions.length}` });
  }
  if (signal.validSampleSize !== valid.length) {
    violations.push({ code: 'RV_EXPECT_SIGNAL_SAMPLE', message: `validSampleSize must equal ${valid.length}` });
  }
  if (typeof signal.prevalence !== 'number' || Math.abs(signal.prevalence - expectedPrevalence) > 1e-9) {
    violations.push({ code: 'RV_EXPECT_PREVALENCE', message: `prevalence must equal ${expectedPrevalence}` });
  }
  if (output.snapshotMode !== 'COMPUTED' || output.inputSnapshotRef !== null) {
    violations.push({ code: 'RV_EXPECT_COMPUTED_SNAPSHOT', message: 'new-record analysis must be COMPUTED with no input snapshot' });
  }

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
  if (!fixture || !schemas) throw new Error('TM-AG-012 RV-B-001 fixture/schema missing');
  return { recording, fixture, schemas };
}

describe('M1.4 R2 recorded artifact replay — TM-AG-012 Review Intelligence', () => {
  it('runs RV-B-001 through canonical R0 → R1 → independent sample/prevalence recomputation', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateParkingPrevalenceExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 when schema-valid prevalence no longer equals mentionCount / validSampleSize', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const signal = asRecord(records(recording.canonicalOutput.signals)[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      signals: [{ ...signal, prevalence: 0.8 }]
    };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateParkingPrevalenceExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('REVIEW_PREVALENCE_MISMATCH');
    expect(result.status).toBe('FAIL');
  });

  it('fails fixture expectation when sample validCount is inflated despite schema validity', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const sample = asRecord(recording.canonicalOutput.sample);
    const mutatedOutput = { ...recording.canonicalOutput, sample: { ...sample, validCount: 11 } };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateParkingPrevalenceExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.expectationViolations.map(item => item.code)).toContain('RV_EXPECT_VALID_SAMPLE');
    expect(result.status).toBe('FAIL');
  });
});
