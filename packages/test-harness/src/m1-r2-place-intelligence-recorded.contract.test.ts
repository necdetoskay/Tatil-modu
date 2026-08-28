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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-004-pi-b-002.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluatePermanentClosureExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const output = asRecord(execution.output);
  const candidates = records(output.candidates);
  const rejected = records(output.rejectedCandidates);
  const violations: { code: string; message: string }[] = [];

  const closedAccepted = candidates.filter(item => asRecord(item.businessStatus).value === 'CLOSED_PERMANENTLY');
  if (closedAccepted.length > 0) {
    violations.push({
      code: 'PI_PERMANENT_CLOSURE_IN_ACCEPTED_POOL',
      message: 'permanently closed place must not appear in candidates[]'
    });
  }

  const closedRejected = rejected.filter(item => asRecord(item.businessStatus).value === 'CLOSED_PERMANENTLY');
  if (closedRejected.length === 0) {
    violations.push({
      code: 'PI_PERMANENT_CLOSURE_REJECTION_MISSING',
      message: 'fixture requires permanently closed candidate in rejectedCandidates[]'
    });
  }
  for (const item of closedRejected) {
    if (asRecord(item.eligibility).disposition !== 'REJECTED') {
      violations.push({
        code: 'PI_PERMANENT_CLOSURE_DISPOSITION_MISMATCH',
        message: 'permanently closed candidate disposition must be REJECTED'
      });
    }
  }

  return { violations };
}

describe('M1.4 R2 recorded artifact replay — TM-AG-004 Place Intelligence', () => {
  it('runs PI-B-002 through canonical R0 → R1 → independent fixture expectation', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-004 PI-B-002 fixture/schema missing');

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluatePermanentClosureExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 when a permanently closed place is marked ACCEPTED while schema remains valid', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-004 PI-B-002 fixture/schema missing');

    const rejected = asRecord(records(recording.canonicalOutput.rejectedCandidates)[0]);
    const eligibility = asRecord(rejected.eligibility);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      rejectedCandidates: [{
        ...rejected,
        eligibility: { ...eligibility, disposition: 'ACCEPTED' }
      }]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluatePermanentClosureExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toEqual(expect.arrayContaining([
        'PLACE_PERMANENTLY_CLOSED_NOT_REJECTED',
        'PLACE_NON_REJECTED_IN_REJECTED_POOL'
      ]));
    expect(result.status).toBe('FAIL');
  });

  it('fails fixture expectation if permanent closure is silently rewritten as operational acceptance', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-004 PI-B-002 fixture/schema missing');

    const rejected = asRecord(records(recording.canonicalOutput.rejectedCandidates)[0]);
    const businessStatus = asRecord(rejected.businessStatus);
    const eligibility = asRecord(rejected.eligibility);
    const operational = {
      ...rejected,
      businessStatus: { ...businessStatus, value: 'OPERATIONAL' },
      eligibility: { ...eligibility, disposition: 'ACCEPTED', dispositionReasons: [] }
    };
    const mutatedOutput = {
      ...recording.canonicalOutput,
      candidates: [operational],
      rejectedCandidates: []
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluatePermanentClosureExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations.map(item => item.code)).toContain('PI_PERMANENT_CLOSURE_REJECTION_MISSING');
    expect(result.status).toBe('FAIL');
  });
});
