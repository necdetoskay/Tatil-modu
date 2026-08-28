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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-002-pp-003.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluatePreferenceExpectation(
  fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const expected = asRecord(fixture.payload.expected);
  const expectedConstraint = asRecord(expected.constraint);
  const output = asRecord(execution.output);
  const constraints = records(output.constraints);
  const violations: { code: string; message: string }[] = [];

  const matching = constraints.find(item => item.key === expectedConstraint.key);
  if (!matching) {
    violations.push({ code: 'PP_EXPECTED_CONSTRAINT_MISSING', message: `constraint ${String(expectedConstraint.key)} missing` });
  } else {
    for (const field of ['key', 'kind', 'evidenceRequired'] as const) {
      if (matching[field] !== expectedConstraint[field]) {
        violations.push({ code: `PP_CONSTRAINT_${field.toUpperCase()}_MISMATCH`, message: `${field} mismatch` });
      }
    }

    const expectedCondition = asRecord(expectedConstraint.condition);
    const actualCondition = matching.condition === null ? null : asRecord(matching.condition);
    if (!actualCondition) {
      violations.push({ code: 'PP_CONDITION_MISSING', message: 'conditional hard constraint lost its condition' });
    } else {
      for (const field of ['field', 'operator', 'value'] as const) {
        if (actualCondition[field] !== expectedCondition[field]) {
          violations.push({ code: `PP_CONDITION_${field.toUpperCase()}_MISMATCH`, message: `condition.${field} mismatch` });
        }
      }
    }
  }

  const mustNotCreate = Array.isArray(expected.mustNotCreate)
    ? expected.mustNotCreate.filter((value): value is string => typeof value === 'string')
    : [];
  for (const forbiddenKey of mustNotCreate) {
    if (constraints.some(item => item.key === forbiddenKey)) {
      violations.push({ code: 'PP_FORBIDDEN_CONSTRAINT_CREATED', message: `forbidden constraint ${forbiddenKey} created` });
    }
  }

  return { violations };
}

describe('M1.4 R2 recorded canonical execution — TM-AG-002 Preference & Policy', () => {
  it('runs PP-003 through canonical R0 → R1 → independent fixture expectation', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();

    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-002 PP-003 fixture/schema missing');

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({
        canonicalInput: recording.canonicalInput,
        output: recording.canonicalOutput
      }),
      evaluateExpectation: evaluatePreferenceExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 when the recorded conditional-hard output loses its condition while remaining schema-valid', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-002 PP-003 fixture/schema missing');

    const constraint = asRecord(records(recording.canonicalOutput.constraints)[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      constraints: [{ ...constraint, condition: null }]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluatePreferenceExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('CONDITIONAL_HARD_CONDITION_MISSING');
    expect(result.status).toBe('FAIL');
  });

  it('fails fixture expectation if beach is silently promoted from conditional rule to global requirement', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-002 PP-003 fixture/schema missing');

    const forbiddenConstraint = {
      constraintId: 'constraint:pp-003:beach-required',
      key: 'beach_required',
      kind: 'HARD',
      subject: 'activity.type',
      operator: 'equals',
      value: 'beach',
      condition: null,
      sourceRefs: ['stmt-pp-003'],
      confidence: 1,
      evidenceRequired: false
    };
    const mutatedOutput = {
      ...recording.canonicalOutput,
      constraints: [...records(recording.canonicalOutput.constraints), forbiddenConstraint]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluatePreferenceExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.expectationViolations.map(item => item.code)).toContain('PP_FORBIDDEN_CONSTRAINT_CREATED');
    expect(result.status).toBe('FAIL');
  });
});
