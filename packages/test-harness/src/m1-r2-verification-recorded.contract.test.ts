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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-014-vf-b-001.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluatePassExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const input = asRecord(execution.canonicalInput);
  const output = asRecord(execution.output);
  const violations: { code: string; message: string }[] = [];

  if (output.status !== 'PASS') {
    violations.push({ code: 'VF_EXPECT_PASS', message: 'fully valid snapshot must PASS' });
  }
  if (output.verifiedSnapshotRef !== input.snapshotRef || output.verifiedSnapshotHash !== input.snapshotHash) {
    violations.push({ code: 'VF_SNAPSHOT_BINDING_MISMATCH', message: 'verification must bind exact input snapshot ref/hash' });
  }
  if (records(output.blockingFindings).length !== 0) {
    violations.push({ code: 'VF_EXPECT_ZERO_BLOCKING', message: 'PASS must contain zero blocking findings' });
  }
  const blockingGates = records(output.gates).filter(gate => gate.severity === 'BLOCKING');
  if (blockingGates.some(gate => gate.status !== 'PASS')) {
    violations.push({ code: 'VF_EXPECT_BLOCKING_GATES_PASS', message: 'every blocking gate must PASS for VF-B-001' });
  }
  const coverage = asRecord(output.evidenceCoverage);
  if (coverage.criticalClaimsUnknown !== 0 || coverage.criticalClaimsConflicting !== 0) {
    violations.push({ code: 'VF_EXPECT_NO_CRITICAL_UNCERTAINTY', message: 'PASS cannot retain critical unknown/conflicting claims' });
  }
  const authority = asRecord(output.authoritySummary);
  if ([authority.agentViolations, authority.toolViolations, authority.orchestratorDirectDomainToolViolations]
    .some(value => Array.isArray(value) && value.length > 0)) {
    violations.push({ code: 'VF_EXPECT_ZERO_AUTHORITY', message: 'PASS must contain zero authority violations' });
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
  if (!fixture || !schemas) throw new Error('TM-AG-014 VF-B-001 fixture/schema missing');
  return { recording, fixture, schemas };
}

describe('M1.4 R2 recorded canonical execution — TM-AG-014 Verification', () => {
  it('runs VF-B-001 through canonical R0 → R1 → independent PASS/snapshot-binding expectation', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluatePassExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 if top-level PASS coexists with a schema-valid blocking FAIL gate', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const gates = records(recording.canonicalOutput.gates);
    const firstGate = asRecord(gates[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      gates: [{ ...firstGate, status: 'FAIL', findingCodes: ['SYNTHETIC_BLOCKING_FAIL'] }, ...gates.slice(1)]
    };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluatePassExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('VERIFICATION_PASS_WITH_FAILED_GATE');
    expect(result.status).toBe('FAIL');
  });

  it('fails independent fixture expectation if verified snapshot hash no longer matches input', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const mutatedOutput = { ...recording.canonicalOutput, verifiedSnapshotHash: 'hash-wrong-snapshot' };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluatePassExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.expectationViolations.map(item => item.code)).toContain('VF_SNAPSHOT_BINDING_MISMATCH');
    expect(result.status).toBe('FAIL');
  });
});
