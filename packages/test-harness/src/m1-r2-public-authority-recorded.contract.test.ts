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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-011-pa-b-001.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluateVerifiedOfficialFactExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const input = asRecord(execution.canonicalInput);
  const output = asRecord(execution.output);
  const policy = asRecord(input.verificationPolicy);
  const evidence = records(output.evidence);
  const lookup = records(output.sourceLookupTrace);
  const violations: { code: string; message: string }[] = [];

  if (output.status !== 'VERIFIED') {
    violations.push({ code: 'PA_EXPECT_VERIFIED', message: 'PA-B-001 must resolve to VERIFIED' });
  }
  if (output.freshnessStatus !== 'CURRENT') {
    violations.push({ code: 'PA_EXPECT_CURRENT', message: 'verified opening-hours claim must be CURRENT' });
  }
  if (strings(output.primarySourceRefs).length === 0) {
    violations.push({ code: 'PA_EXPECT_PRIMARY_SOURCE', message: 'verified claim must expose a primary source ref' });
  }

  const threshold = typeof policy.minimumAuthorityScore === 'number' ? policy.minimumAuthorityScore : 1;
  const authoritative = evidence.find(item =>
    item.sourceRole === 'AUTHORITATIVE' &&
    item.supports === 'SUPPORTS' &&
    item.freshnessStatus === 'CURRENT' &&
    typeof item.authorityScore === 'number' &&
    item.authorityScore >= threshold
  );
  if (!authoritative) {
    violations.push({ code: 'PA_EXPECT_AUTHORITY_THRESHOLD', message: 'current authoritative evidence must meet policy threshold' });
  }

  const registryIndex = lookup.findIndex(item => item.stepType === 'REGISTRY_LOOKUP' && item.outcome === 'HIT');
  const fetchIndex = lookup.findIndex(item => item.stepType === 'OFFICIAL_FETCH' && item.outcome === 'SUCCESS');
  if (registryIndex < 0 || fetchIndex <= registryIndex) {
    violations.push({ code: 'PA_EXPECT_LOOKUP_ORDER', message: 'registry hit must precede successful official fetch' });
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
  if (!fixture || !schemas) throw new Error('TM-AG-011 PA-B-001 fixture/schema missing');
  return { recording, fixture, schemas };
}

describe('M1.4 R2 recorded artifact replay — TM-AG-011 Public Authority Intelligence', () => {
  it('runs PA-B-001 through canonical R0 → R1 → independent authority/freshness expectation', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateVerifiedOfficialFactExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 when VERIFIED loses its primary-source lineage while schema remains valid', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const mutatedOutput = { ...recording.canonicalOutput, primarySourceRefs: [] };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateVerifiedOfficialFactExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('OFFICIAL_FACT_UNSUPPORTED_VERIFIED');
    expect(result.status).toBe('FAIL');
  });

  it('fails R1 when authoritative evidence is stale but status is still VERIFIED', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const evidence = asRecord(records(recording.canonicalOutput.evidence)[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      evidence: [{ ...evidence, freshnessStatus: 'STALE' }],
      freshnessStatus: 'STALE'
    };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateVerifiedOfficialFactExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('OFFICIAL_FACT_UNSUPPORTED_VERIFIED');
    expect(result.status).toBe('FAIL');
  });
});
