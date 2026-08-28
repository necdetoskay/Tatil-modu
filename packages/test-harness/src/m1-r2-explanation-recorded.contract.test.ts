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

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

async function loadRecording(): Promise<RecordedExecution> {
  const raw = await readFile(
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-015-ex-b-001.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluateGroundingExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const input = asRecord(execution.canonicalInput);
  const output = asRecord(execution.output);
  const explainable = records(input.explainableRecords);
  const allowedSubjects = new Set(explainable.map(item => String(item.subjectRef)));
  const allowedClaims = new Set(explainable.flatMap(item => strings(item.allowedClaimRefs)));
  const allowedSupport = new Set(explainable.flatMap(item => strings(item.supportRefs)));
  const violations: { code: string; message: string }[] = [];

  if (output.verifiedSnapshotRef !== input.verifiedSnapshotRef || output.verifiedSnapshotHash !== input.verifiedSnapshotHash) {
    violations.push({ code: 'EX_EXPECT_SNAPSHOT_BINDING', message: 'explanation must stay bound to verified snapshot' });
  }
  for (const block of records(output.blocks)) {
    for (const subject of strings(block.subjectRefs)) {
      if (!allowedSubjects.has(subject)) violations.push({ code: 'EX_EXPECT_SUBJECT_SUBSET', message: `unsupported subject ${subject}` });
    }
    for (const claim of strings(block.assertedClaimRefs)) {
      if (!allowedClaims.has(claim)) violations.push({ code: 'EX_EXPECT_CLAIM_SUBSET', message: `unsupported claim ${claim}` });
    }
    for (const support of strings(block.supportRefs)) {
      if (!allowedSupport.has(support)) violations.push({ code: 'EX_EXPECT_SUPPORT_SUBSET', message: `unsupported support ${support}` });
    }
  }

  const coverage = asRecord(output.coverage);
  const claimCount = records(output.blocks).reduce((sum, block) => sum + strings(block.assertedClaimRefs).length, 0);
  if (coverage.assertedClaimCount !== claimCount || coverage.supportedAssertedClaimCount !== claimCount || coverage.unsupportedAssertedClaimCount !== 0) {
    violations.push({ code: 'EX_EXPECT_COVERAGE_EXACT', message: 'coverage must exactly reflect grounded asserted claims' });
  }
  if (!Array.isArray(output.generationRefs) || output.generationRefs.length === 0) {
    violations.push({ code: 'EX_EXPECT_GENERATION_LINEAGE', message: 'generationRefs must be present' });
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
  if (!fixture || !schemas) throw new Error('TM-AG-015 EX-B-001 fixture/schema missing');
  return { recording, fixture, schemas };
}

describe('M1.4 R2 recorded canonical execution — TM-AG-015 Explanation', () => {
  it('runs EX-B-001 through canonical R0 → R1 → independent verified-subset expectation', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateGroundingExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 when a schema-valid explanation introduces an unverified claim ref', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const block = asRecord(records(recording.canonicalOutput.blocks)[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      blocks: [{ ...block, assertedClaimRefs: [...strings(block.assertedClaimRefs), 'claim:place-001:invented-nearby-museum'] }],
      coverage: {
        ...asRecord(recording.canonicalOutput.coverage),
        assertedClaimCount: 3,
        supportedAssertedClaimCount: 3,
        unsupportedAssertedClaimCount: 0
      }
    };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateGroundingExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('EXPLANATION_UNVERIFIED_CLAIM');
    expect(result.status).toBe('FAIL');
  });

  it('fails R1 when explanation is rebound to a different snapshot hash', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const mutatedOutput = { ...recording.canonicalOutput, verifiedSnapshotHash: 'hash-other' };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateGroundingExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('EXPLANATION_SNAPSHOT_MISMATCH');
    expect(result.status).toBe('FAIL');
  });
});
