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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-ag-007-wx-b003.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluateClimateHorizonExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const output = asRecord(execution.output);
  const signals = records(output.signals);
  const violations: { code: string; message: string }[] = [];

  if (signals.length === 0) {
    violations.push({ code: 'WX_CLIMATE_SIGNAL_MISSING', message: 'outside-horizon fixture requires climate context signal' });
    return { violations };
  }

  for (const signal of signals) {
    if (signal.dataType !== 'CLIMATE_NORMAL') {
      violations.push({ code: 'WX_OUTSIDE_HORIZON_NOT_CLIMATE', message: 'outside-horizon signal must be CLIMATE_NORMAL' });
    }
    if (signal.issuedAt !== null || signal.forecastHorizonHours !== null) {
      violations.push({ code: 'WX_CLIMATE_CARRIES_FORECAST_SEMANTICS', message: 'climate normal must not present forecast issuance/horizon' });
    }
    const conditions = asRecord(signal.conditions);
    if (
      conditions.precipitationProbability !== null ||
      conditions.precipitationMm !== null ||
      typeof conditions.conditionCode === 'string'
    ) {
      violations.push({ code: 'WX_DAY_SPECIFIC_ASSERTION_LEAKAGE', message: 'climate-only fixture must not assert specific-day conditions' });
    }
  }

  return { violations };
}

describe('M1.4 R2 recorded canonical execution — TM-AG-007 Weather', () => {
  it('runs WX-B003 through canonical R0 → R1 → independent fixture expectation', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-007 WX-B003 fixture/schema missing');

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateClimateHorizonExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 when CLIMATE_NORMAL is given forecast issuance/horizon semantics', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-007 WX-B003 fixture/schema missing');

    const signal = asRecord(records(recording.canonicalOutput.signals)[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      signals: [{
        ...signal,
        issuedAt: '2026-08-28T04:40:00Z',
        forecastHorizonHours: 72
      }]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateClimateHorizonExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('CLIMATE_AS_FORECAST');
    expect(result.status).toBe('FAIL');
  });

  it('fails fixture expectation if outside-horizon climate context is relabeled as a forecast', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const compilation = await compileRegistrySchemas(registry);
    const recording = await loadRecording();
    const fixture = inventory.packs
      .find(pack => pack.componentId === recording.componentId)
      ?.cases.find(item => item.fixtureId === recording.fixtureId);
    const schemas = compilation.compiled.find(item => item.componentId === recording.componentId);
    if (!fixture || !schemas) throw new Error('TM-AG-007 WX-B003 fixture/schema missing');

    const signal = asRecord(records(recording.canonicalOutput.signals)[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      signals: [{ ...signal, dataType: 'FORECAST' }]
    };

    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateClimateHorizonExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.expectationViolations.map(item => item.code)).toContain('WX_OUTSIDE_HORIZON_NOT_CLIMATE');
    expect(result.status).toBe('FAIL');
  });
});
