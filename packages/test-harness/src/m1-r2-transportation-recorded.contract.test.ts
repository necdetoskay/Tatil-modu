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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-008-tr-b001.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluatePointToPointExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const output = asRecord(execution.output);
  const legs = records(output.routeLegs);
  const violations: { code: string; message: string }[] = [];
  const leg = legs.find(item => item.fromRef === 'origin:kocaeli' && item.toRef === 'destination:bursa');

  if (!leg) {
    violations.push({ code: 'TR_POINT_TO_POINT_LEG_MISSING', message: 'recorded point-to-point route leg missing' });
    return { violations };
  }

  if (typeof leg.distanceMeters !== 'number') {
    violations.push({ code: 'TR_ROUTE_DISTANCE_MISSING', message: 'provider-backed route distance must be present' });
  }
  if (typeof leg.durationSeconds !== 'number') {
    violations.push({ code: 'TR_ROUTE_DURATION_MISSING', message: 'provider-backed route duration must be present' });
  }

  const evidence = records(leg.evidence);
  if (!evidence.some(item => item.claimType === 'ROUTE_DISTANCE')) {
    violations.push({ code: 'TR_ROUTE_DISTANCE_EVIDENCE_MISSING', message: 'route distance must retain ROUTE_DISTANCE evidence' });
  }
  if (!evidence.some(item => item.claimType === 'ROUTE_DURATION')) {
    violations.push({ code: 'TR_ROUTE_DURATION_EVIDENCE_MISSING', message: 'route duration must retain ROUTE_DURATION evidence' });
  }

  return { violations };
}

describe('M1.4 R2 recorded canonical execution — TM-AG-008 Transportation', () => {
  it('runs TR-B001 through canonical R0 → R1 → independent fixture expectation', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-008 TR-B001 fixture/schema missing');

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluatePointToPointExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 if route distance/duration remain but their claim evidence is removed', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-008 TR-B001 fixture/schema missing');

    const leg = asRecord(records(recording.canonicalOutput.routeLegs)[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      routeLegs: [{ ...leg, evidence: [] }]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluatePointToPointExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toEqual(expect.arrayContaining([
        'ROUTE_DISTANCE_EVIDENCE_MISSING',
        'ROUTE_DURATION_EVIDENCE_MISSING'
      ]));
    expect(result.status).toBe('FAIL');
  });

  it('fails fixture expectation if provider-backed route facts are silently discarded', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-008 TR-B001 fixture/schema missing');

    const leg = asRecord(records(recording.canonicalOutput.routeLegs)[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      routeLegs: [{ ...leg, distanceMeters: null, durationSeconds: null, evidence: [] }]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluatePointToPointExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations.map(item => item.code)).toEqual(expect.arrayContaining([
      'TR_ROUTE_DISTANCE_MISSING',
      'TR_ROUTE_DURATION_MISSING',
      'TR_ROUTE_DISTANCE_EVIDENCE_MISSING',
      'TR_ROUTE_DURATION_EVIDENCE_MISSING'
    ]));
    expect(result.status).toBe('FAIL');
  });
});
