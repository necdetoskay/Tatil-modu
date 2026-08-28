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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-009-rp-b-001.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluateFeasibleDayExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const input = asRecord(execution.canonicalInput);
  const output = asRecord(execution.output);
  const transportation = asRecord(input.transportation);
  const routeLegs = records(transportation.routeLegs);
  const routeById = new Map(routeLegs.map(leg => [String(leg.routeLegId), leg]));
  const violations: { code: string; message: string }[] = [];

  const summary = asRecord(output.constraintSummary);
  if (records(summary.violatedRefs).length > 0 || (Array.isArray(summary.violatedRefs) && summary.violatedRefs.length > 0)) {
    violations.push({ code: 'RP_HARD_VIOLATION_PRESENT', message: 'feasible day must have zero violated hard constraints' });
  }

  for (const day of records(output.days)) {
    const blocks = records(day.blocks);
    for (const block of blocks.filter(item => item.blockType === 'TRAVEL')) {
      const routeLegRef = block.routeLegRef;
      if (typeof routeLegRef !== 'string' || !routeById.has(routeLegRef)) {
        violations.push({ code: 'RP_TRAVEL_ROUTE_REF_MISSING', message: 'travel block must reference an upstream route leg' });
        continue;
      }
      const route = routeById.get(routeLegRef)!;
      const actualSeconds = (Date.parse(String(block.end)) - Date.parse(String(block.start))) / 1000;
      const expectedSeconds = typeof route.trafficAwareDurationSeconds === 'number'
        ? route.trafficAwareDurationSeconds
        : route.durationSeconds;
      if (typeof expectedSeconds === 'number' && actualSeconds < expectedSeconds) {
        violations.push({
          code: 'RP_ROUTE_TIME_COMPRESSED',
          message: `travel block ${String(block.blockId)} is shorter than route evidence`
        });
      }
    }
  }

  return { violations };
}

describe('M1.4 R2 recorded artifact replay — TM-AG-009 Route Planner', () => {
  it('runs RP-B-001 through canonical R0 → R1 → independent fixture expectation', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-009 RP-B-001 fixture/schema missing');

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateFeasibleDayExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 if day blocks overlap while schema remains valid', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-009 RP-B-001 fixture/schema missing');

    const day = asRecord(records(recording.canonicalOutput.days)[0]);
    const blocks = records(day.blocks);
    const secondActivity = asRecord(blocks[2]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      days: [{
        ...day,
        blocks: [blocks[0], blocks[1], { ...secondActivity, start: '2026-09-10T11:20:00+03:00' }]
      }]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateFeasibleDayExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('ROUTE_PLAN_BLOCK_OVERLAP');
    expect(result.status).toBe('FAIL');
  });

  it('fails fixture expectation if planner compresses provider route time to fit the schedule', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-009 RP-B-001 fixture/schema missing');

    const day = asRecord(records(recording.canonicalOutput.days)[0]);
    const blocks = records(day.blocks);
    const travel = asRecord(blocks[1]);
    const activity2 = asRecord(blocks[2]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      days: [{
        ...day,
        blocks: [
          blocks[0],
          { ...travel, end: '2026-09-10T11:10:00+03:00' },
          { ...activity2, start: '2026-09-10T11:10:00+03:00' }
        ],
        totalTravelSeconds: 600
      }]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateFeasibleDayExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations.map(item => item.code)).toContain('RP_ROUTE_TIME_COMPRESSED');
    expect(result.status).toBe('FAIL');
  });
});
