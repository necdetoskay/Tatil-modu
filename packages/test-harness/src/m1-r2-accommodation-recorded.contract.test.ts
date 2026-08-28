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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-005-ac-b-011.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluateNoProviderExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const output = asRecord(execution.output);
  const candidates = records(output.candidates);
  const violations: { code: string; message: string }[] = [];

  if (candidates.length === 0) {
    violations.push({ code: 'AC_NO_PROVIDER_CANDIDATE_MISSING', message: 'recorded static candidate missing' });
  }

  for (const candidate of candidates) {
    const availability = asRecord(candidate.availability);
    const priceQuote = asRecord(candidate.priceQuote);
    if (availability.status !== 'UNKNOWN') {
      violations.push({ code: 'AC_NO_PROVIDER_AVAILABILITY_NOT_UNKNOWN', message: 'no provider access must leave availability UNKNOWN' });
    }
    if (priceQuote.status !== 'UNKNOWN') {
      violations.push({ code: 'AC_NO_PROVIDER_PRICE_NOT_UNKNOWN', message: 'no provider access must leave price UNKNOWN' });
    }
    if (priceQuote.totalAmount !== null) {
      violations.push({ code: 'AC_NO_PROVIDER_FABRICATED_PRICE', message: 'UNKNOWN price must not carry a fabricated total' });
    }
  }

  return { violations };
}

describe('M1.4 R2 recorded artifact replay — TM-AG-005 Accommodation', () => {
  it('runs AC-B-011 through canonical R0 → R1 → independent fixture expectation', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-005 AC-B-011 fixture/schema missing');

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateNoProviderExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 if UNKNOWN availability is falsely promoted to LIVE_AVAILABLE without current matching evidence', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-005 AC-B-011 fixture/schema missing');

    const candidate = asRecord(records(recording.canonicalOutput.candidates)[0]);
    const availability = asRecord(candidate.availability);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      candidates: [{
        ...candidate,
        availability: { ...availability, status: 'LIVE_AVAILABLE' }
      }]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateNoProviderExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('ACCOMMODATION_FALSE_LIVE_AVAILABILITY');
    expect(result.status).toBe('FAIL');
  });

  it('fails R1 and fixture expectation if a live price is fabricated without provider access', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-005 AC-B-011 fixture/schema missing');

    const candidate = asRecord(records(recording.canonicalOutput.candidates)[0]);
    const priceQuote = asRecord(candidate.priceQuote);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      candidates: [{
        ...candidate,
        priceQuote: {
          ...priceQuote,
          status: 'LIVE',
          totalAmount: 9999,
          retrievedAt: '2026-08-28T04:35:00Z'
        }
      }]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateNoProviderExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('ACCOMMODATION_FALSE_LIVE_PRICE');
    expect(result.expectationViolations.map(item => item.code)).toEqual(expect.arrayContaining([
      'AC_NO_PROVIDER_PRICE_NOT_UNKNOWN',
      'AC_NO_PROVIDER_FABRICATED_PRICE'
    ]));
    expect(result.status).toBe('FAIL');
  });
});
