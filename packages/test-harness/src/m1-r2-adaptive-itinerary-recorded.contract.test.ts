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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-013-ar-b-001.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluateTargetedRepairExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const input = asRecord(execution.canonicalInput);
  const output = asRecord(execution.output);
  const impactScope = asRecord(output.impactScope);
  const violations: { code: string; message: string }[] = [];
  const affected = new Set([
    ...strings(impactScope.directlyAffectedBlockRefs),
    ...strings(impactScope.dependentBlockRefs)
  ]);

  if (output.repairStatus !== 'REPAIRED') {
    violations.push({ code: 'AR_EXPECT_REPAIRED', message: 'verified closure with safe replacement must be repaired' });
  }
  for (const patch of records(output.patches)) {
    if (typeof patch.targetRef !== 'string' || !affected.has(patch.targetRef)) {
      violations.push({ code: 'AR_PATCH_OUTSIDE_SCOPE', message: `patch target ${String(patch.targetRef)} is outside impact closure` });
    }
  }

  const protectedRefs = new Set(strings(impactScope.protectedUnchangedDayRefs));
  const proofByRef = new Map(records(output.preservationProofs).map(item => [String(item.scopeRef), item]));
  for (const ref of protectedRefs) {
    const proof = proofByRef.get(ref);
    if (!proof || proof.beforeHash !== proof.afterHash || proof.unchanged !== true) {
      violations.push({ code: 'AR_PRESERVATION_PROOF_INVALID', message: `protected ${ref} must keep identical before/after hash` });
    }
  }

  const hasVerificationRecheck = records(output.downstreamRecheckRequests)
    .some(item => item.type === 'VERIFICATION_RECHECK' && item.required === true);
  if (!hasVerificationRecheck) {
    violations.push({ code: 'AR_EXPECT_VERIFICATION_RECHECK', message: 'repaired itinerary must return to Verification' });
  }

  const changeSignals = records(input.changeSignals);
  for (const triggerRef of strings(output.triggerRefs)) {
    if (!changeSignals.some(item => item.changeSignalId === triggerRef)) {
      violations.push({ code: 'AR_TRIGGER_LINEAGE_MISSING', message: `trigger ${triggerRef} must exist in input changeSignals` });
    }
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
  if (!fixture || !schemas) throw new Error('TM-AG-013 AR-B-001 fixture/schema missing');
  return { recording, fixture, schemas };
}

describe('M1.4 R2 recorded artifact replay — TM-AG-013 Adaptive Itinerary', () => {
  it('runs AR-B-001 through canonical R0 → R1 → independent targeted-repair expectation', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateTargetedRepairExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails when a schema-valid repair drops the mandatory Verification recheck', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const mutatedOutput = { ...recording.canonicalOutput, downstreamRecheckRequests: [] };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateTargetedRepairExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.status).toBe('FAIL');
    expect(result.expectationViolations.map(item => item.code)).toContain('AR_EXPECT_VERIFICATION_RECHECK');
  });

  it('fails when a schema-valid patch rewrites a protected unrelated day', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const patch = asRecord(records(recording.canonicalOutput.patches)[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      patches: [{ ...patch, targetRef: 'day1:block1' }]
    };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateTargetedRepairExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.status).toBe('FAIL');
    expect(result.expectationViolations.map(item => item.code)).toContain('AR_PATCH_OUTSIDE_SCOPE');
  });
});
