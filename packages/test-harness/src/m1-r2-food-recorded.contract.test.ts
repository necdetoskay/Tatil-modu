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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-006-food-b004.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluateAllergyViolationExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const output = asRecord(execution.output);
  const all = [...records(output.foodCandidates), ...records(output.rejectedCandidates)];
  const violations: { code: string; message: string }[] = [];
  const target = all.find(item => item.foodId === 'food:fixture:allergy-violation');

  if (!target) {
    violations.push({ code: 'FOOD_ALLERGY_TARGET_MISSING', message: 'allergy fixture candidate missing' });
    return { violations };
  }

  const eligibility = asRecord(target.eligibility);
  const checks = records(eligibility.hardConstraintChecks);
  const allergyCheck = checks.find(item => item.constraintId === 'constraint:peanut-allergy');
  if (!allergyCheck || allergyCheck.status !== 'VIOLATED') {
    violations.push({ code: 'FOOD_ALLERGY_VIOLATION_LOST', message: 'official menu allergy conflict must remain VIOLATED' });
  }
  if (eligibility.disposition !== 'REJECTED') {
    violations.push({ code: 'FOOD_ALLERGY_NOT_REJECTED', message: 'hard allergy violation must reject candidate' });
  }
  if (records(output.foodCandidates).some(item => item.foodId === target.foodId)) {
    violations.push({ code: 'FOOD_ALLERGY_IN_ACCEPTED_POOL', message: 'hard allergy violation cannot remain in foodCandidates[]' });
  }

  return { violations };
}

describe('M1.4 R2 recorded artifact replay — TM-AG-006 Food & Local Taste', () => {
  it('runs FOOD-B004 through canonical R0 → R1 → independent fixture expectation', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-006 FOOD-B004 fixture/schema missing');

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateAllergyViolationExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 if a hard allergy violation is marked ACCEPTED while the violated check remains visible', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-006 FOOD-B004 fixture/schema missing');

    const candidate = asRecord(records(recording.canonicalOutput.rejectedCandidates)[0]);
    const eligibility = asRecord(candidate.eligibility);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      rejectedCandidates: [{ ...candidate, eligibility: { ...eligibility, disposition: 'ACCEPTED' } }]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateAllergyViolationExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('FOOD_HARD_VIOLATION_NOT_REJECTED');
    expect(result.status).toBe('FAIL');
  });

  it('fails fixture expectation if official allergy evidence is silently reinterpreted as satisfied acceptance', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-006 FOOD-B004 fixture/schema missing');

    const candidate = asRecord(records(recording.canonicalOutput.rejectedCandidates)[0]);
    const eligibility = asRecord(candidate.eligibility);
    const checks = records(eligibility.hardConstraintChecks).map(item => ({
      ...item,
      status: item.constraintId === 'constraint:peanut-allergy' ? 'SATISFIED' : item.status
    }));
    const accepted = {
      ...candidate,
      eligibility: { ...eligibility, disposition: 'ACCEPTED', dispositionReasons: [], hardConstraintChecks: checks }
    };
    const mutatedOutput = {
      ...recording.canonicalOutput,
      foodCandidates: [accepted],
      rejectedCandidates: []
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateAllergyViolationExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations.map(item => item.code)).toEqual(expect.arrayContaining([
      'FOOD_ALLERGY_VIOLATION_LOST',
      'FOOD_ALLERGY_NOT_REJECTED',
      'FOOD_ALLERGY_IN_ACCEPTED_POOL'
    ]));
    expect(result.status).toBe('FAIL');
  });
});
