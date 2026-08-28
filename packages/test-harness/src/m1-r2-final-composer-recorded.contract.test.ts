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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-016-fc-b-001.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluateRenderBindingExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const input = asRecord(execution.canonicalInput);
  const output = asRecord(execution.output);
  const violations: { code: string; message: string }[] = [];

  if (output.verifiedSnapshotRef !== input.verifiedSnapshotRef || output.verifiedSnapshotHash !== input.verifiedSnapshotHash) {
    violations.push({ code: 'FC_EXPECT_SNAPSHOT_BINDING', message: 'final render must remain bound to verified snapshot' });
  }
  if (output.verificationResultRef !== input.verificationResultRef) {
    violations.push({ code: 'FC_EXPECT_VERIFICATION_BINDING', message: 'final render must preserve verification result ref' });
  }
  const mandatory = new Set(strings(input.mandatoryWarningRefs));
  const rendered = new Set(strings(output.mandatoryWarningRefsRendered));
  for (const ref of mandatory) {
    if (!rendered.has(ref)) violations.push({ code: 'FC_EXPECT_MANDATORY_WARNING', message: `mandatory warning ${ref} not rendered` });
  }
  const sectionWarnings = new Set(records(output.sections).flatMap(section => strings(section.warningRefs)));
  for (const ref of mandatory) {
    if (!sectionWarnings.has(ref)) violations.push({ code: 'FC_EXPECT_WARNING_SECTION_BINDING', message: `mandatory warning ${ref} lacks section binding` });
  }
  const validation = asRecord(output.renderValidation);
  if (validation.snapshotMatch !== true ||
      validation.unsupportedEntityRefCount !== 0 ||
      validation.unsupportedClaimRefCount !== 0 ||
      validation.changedVerifiedValueCount !== 0 ||
      validation.missingMandatoryWarningCount !== 0) {
    violations.push({ code: 'FC_EXPECT_RENDER_VALIDATION', message: 'renderValidation must remain clean' });
  }
  if (!Array.isArray(output.renderGenerationRefs) || output.renderGenerationRefs.length === 0) {
    violations.push({ code: 'FC_EXPECT_GENERATION_LINEAGE', message: 'render generation lineage is required' });
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
  if (!fixture || !schemas) throw new Error('TM-AG-016 FC-B-001 fixture/schema missing');
  return { recording, fixture, schemas };
}

describe('M1.4 R2 recorded canonical execution — TM-AG-016 Final Composer', () => {
  it('runs FC-B-001 through canonical R0 → R1 → independent snapshot/warning binding expectation', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateRenderBindingExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 when a mandatory warning is silently dropped while schema remains valid', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const mutatedOutput = { ...recording.canonicalOutput, mandatoryWarningRefsRendered: [] };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateRenderBindingExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('FINAL_COMPOSER_MANDATORY_WARNING_MISSING');
    expect(result.status).toBe('FAIL');
  });

  it('fails R1 when final render is rebound to a different verified snapshot hash', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const mutatedOutput = { ...recording.canonicalOutput, verifiedSnapshotHash: 'hash-other' };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateRenderBindingExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('FINAL_COMPOSER_SNAPSHOT_MISMATCH');
    expect(result.status).toBe('FAIL');
  });
});
