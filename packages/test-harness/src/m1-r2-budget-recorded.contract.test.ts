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

function numbers(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

async function loadRecording(): Promise<RecordedExecution> {
  const raw = await readFile(
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-010-bg-b-001.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function dedupeFacts(facts: JsonRecord[]): JsonRecord[] {
  const seen = new Set<string>();
  return facts.filter((fact, index) => {
    const key = typeof fact.dedupeKey === 'string' ? fact.dedupeKey : `missing:${index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function evaluateWithinBudgetExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const input = asRecord(execution.canonicalInput);
  const output = asRecord(execution.output);
  const facts = dedupeFacts(records(input.costFacts));
  const violations: { code: string; message: string }[] = [];

  const known = facts.reduce((sum, fact) => {
    const amount = numbers(fact.totalAmount);
    if (amount === null) return sum;
    if (fact.priceStatus !== 'OFFICIAL' && fact.priceStatus !== 'LIVE') return sum;
    if (fact.freshnessStatus === 'STALE' || fact.contextValidity === 'MISMATCHED') return sum;
    return sum + amount;
  }, 0);
  const estimated = facts.reduce((sum, fact) => {
    const amount = numbers(fact.totalAmount);
    return fact.priceStatus === 'ESTIMATED' && amount !== null ? sum + amount : sum;
  }, 0);
  const unknownCount = facts.filter(fact => fact.priceStatus === 'UNKNOWN').length;

  if (output.knownTotal !== known) {
    violations.push({ code: 'BG_EXPECT_KNOWN_TOTAL', message: `knownTotal must independently recompute to ${known}` });
  }
  if (output.projectedTotal !== known + estimated) {
    violations.push({ code: 'BG_EXPECT_PROJECTED_TOTAL', message: `projectedTotal must independently recompute to ${known + estimated}` });
  }
  if (output.unknownItemCount !== unknownCount) {
    violations.push({ code: 'BG_EXPECT_UNKNOWN_COUNT', message: `unknownItemCount must equal ${unknownCount}` });
  }

  const hardOverall = records(input.budgetConstraints)
    .find(item => item.kind === 'HARD' && item.scope === 'OVERALL' && item.currency === input.targetCurrency);
  const hardLimit = numbers(hardOverall?.maxAmount);
  if (hardLimit !== null && unknownCount === 0) {
    const expectedStatus = known + estimated <= hardLimit ? 'WITHIN_BUDGET' : 'OVER_BUDGET';
    const assessment = asRecord(output.assessment);
    if (assessment.status !== expectedStatus) {
      violations.push({ code: 'BG_EXPECT_ASSESSMENT', message: `assessment.status must be ${expectedStatus}` });
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
  if (!fixture || !schemas) throw new Error('TM-AG-010 BG-B-001 fixture/schema missing');
  return { recording, fixture, schemas };
}

describe('M1.4 R2 recorded artifact replay — TM-AG-010 Budget', () => {
  it('runs BG-B-001 through canonical R0 → R1 → independent budget recomputation', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateWithinBudgetExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 when schema-valid knownTotal no longer matches deduped official/current items', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const mutatedOutput = { ...recording.canonicalOutput, knownTotal: 9000 };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateWithinBudgetExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('BUDGET_KNOWN_TOTAL_MISMATCH');
    expect(result.status).toBe('FAIL');
  });

  it('fails R1 when a hard budget limit fails but assessment still claims WITHIN_BUDGET', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const inputConstraint = asRecord(records(recording.canonicalInput.budgetConstraints)[0]);
    const limit = asRecord(records(recording.canonicalOutput.budgetLimits)[0]);
    const mutatedInput = {
      ...recording.canonicalInput,
      budgetConstraints: [{ ...inputConstraint, maxAmount: 8000 }]
    };
    const mutatedOutput = {
      ...recording.canonicalOutput,
      budgetLimits: [{ ...limit, limitAmount: 8000, status: 'FAIL' }],
      assessment: { ...asRecord(recording.canonicalOutput.assessment), status: 'WITHIN_BUDGET', headroomAmount: 0, overageAmount: 800 }
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: mutatedInput, output: mutatedOutput }),
      evaluateExpectation: evaluateWithinBudgetExpectation
    });

    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('BUDGET_HARD_FAIL_FALSE_STATUS');
    expect(result.status).toBe('FAIL');
  });
});
