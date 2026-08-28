import type { ValidateFunction } from 'ajv';
import type { AgentRegistry } from './agent-registry.js';
import { loadResolvedContractBundle } from './contract-loader.js';
import { ALL_R1_ORACLES } from './deterministic-oracles-extended.js';
import { createDeterministicOracleContext, runDeterministicOracles, type DeterministicRunResult } from './deterministic-runner.js';
import type { CompiledComponentSchemas } from './schema-compiler.js';
import { validateWithCompiledSchema } from './schema-compiler.js';

export type FixtureGroupKind =
  | 'behavior'
  | 'authority'
  | 'tool_policy'
  | 'context'
  | 'provenance'
  | 'regression'
  | 'other';

export interface NormalizedFixtureCase {
  componentId: string;
  fixtureId: string;
  groupName: string;
  groupKind: FixtureGroupKind;
  category: string | null;
  payload: Record<string, unknown>;
}

export interface NormalizedFixturePack {
  componentId: string;
  schemaVersion: string;
  packId: string | null;
  cases: readonly NormalizedFixtureCase[];
}

export interface FixtureExecutionResult {
  canonicalInput: unknown;
  output: unknown;
  trace?: unknown;
  state?: unknown;
}

export interface FixtureExpectationViolation {
  code: string;
  message: string;
  subjectRefs?: readonly string[];
}

export interface FixtureExpectationResult {
  violations: readonly FixtureExpectationViolation[];
}

export type FixtureExecutionAdapter = (
  fixture: Readonly<NormalizedFixtureCase>
) => Promise<FixtureExecutionResult> | FixtureExecutionResult;

export type FixtureExpectationEvaluator = (
  fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) => Promise<FixtureExpectationResult> | FixtureExpectationResult;

export interface FixtureCaseRunResult {
  componentId: string;
  fixtureId: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  inputSchemaErrors: readonly string[];
  outputSchemaErrors: readonly string[];
  deterministic: DeterministicRunResult;
  expectationViolations: readonly FixtureExpectationViolation[];
}

export interface FixtureInventoryRow {
  componentId: string;
  packId: string | null;
  behaviorCount: number;
  authorityCount: number;
  toolPolicyCount: number;
  contextCount: number;
  provenanceCount: number;
  regressionCount: number;
  otherCount: number;
  totalCount: number;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function ownerId(pack: Record<string, unknown>): string | null {
  const owner = pack.agentId ?? pack.orchestratorId ?? pack.componentId;
  return typeof owner === 'string' ? owner : null;
}

function classifyFixtureGroup(name: string): FixtureGroupKind {
  const normalized = name.toLowerCase();
  if (normalized === 'fixtures' || normalized === 'cases' || normalized.includes('behavior')) return 'behavior';
  if (normalized.includes('authority')) return 'authority';
  if (normalized.includes('toolpolicy') || normalized.includes('tool_policy') || normalized.includes('tool-policy')) return 'tool_policy';
  if (normalized.includes('context')) return 'context';
  if (normalized.includes('provenance')) return 'provenance';
  if (normalized.includes('regression')) return 'regression';
  return 'other';
}

export function normalizeFixturePack(
  pack: Record<string, unknown>,
  expectedComponentId?: string
): NormalizedFixturePack {
  const componentId = ownerId(pack);
  if (!componentId) throw new Error('FIXTURE_OWNER_MISSING');
  if (expectedComponentId && componentId !== expectedComponentId) {
    throw new Error(`FIXTURE_OWNER_MISMATCH:${componentId}:${expectedComponentId}`);
  }
  if (pack.schemaVersion !== '1.0') throw new Error(`FIXTURE_SCHEMA_VERSION_INVALID:${componentId}`);

  const cases: NormalizedFixtureCase[] = [];
  for (const [groupName, value] of Object.entries(pack)) {
    if (!Array.isArray(value)) continue;
    const groupKind = classifyFixtureGroup(groupName);
    for (const raw of value) {
      const payload = asRecord(raw);
      if (!payload) throw new Error(`FIXTURE_CASE_NOT_OBJECT:${componentId}:${groupName}`);
      const id = payload.id;
      if (typeof id !== 'string' || id.length === 0) {
        throw new Error(`FIXTURE_ID_MISSING:${componentId}:${groupName}`);
      }
      cases.push({
        componentId,
        fixtureId: id,
        groupName,
        groupKind,
        category: typeof payload.category === 'string' ? payload.category : null,
        payload
      });
    }
  }

  const ids = cases.map(item => item.fixtureId);
  if (new Set(ids).size !== ids.length) throw new Error(`FIXTURE_ID_DUPLICATE:${componentId}`);

  return {
    componentId,
    schemaVersion: '1.0',
    packId: typeof pack.packId === 'string' ? pack.packId : null,
    cases: cases.sort((a, b) => a.fixtureId.localeCompare(b.fixtureId))
  };
}

export async function loadFixtureInventory(
  registry: AgentRegistry,
  repoRoot = process.cwd()
): Promise<{ packs: readonly NormalizedFixturePack[]; rows: readonly FixtureInventoryRow[] }> {
  const bundles = await Promise.all(
    registry.entries.map(entry => loadResolvedContractBundle(entry, repoRoot))
  );
  const packs = bundles
    .map(bundle => normalizeFixturePack(bundle.fixturePack, bundle.entry.componentId))
    .sort((a, b) => a.componentId.localeCompare(b.componentId));

  const rows = packs.map(pack => {
    const count = (kind: FixtureGroupKind): number => pack.cases.filter(item => item.groupKind === kind).length;
    return {
      componentId: pack.componentId,
      packId: pack.packId,
      behaviorCount: count('behavior'),
      authorityCount: count('authority'),
      toolPolicyCount: count('tool_policy'),
      contextCount: count('context'),
      provenanceCount: count('provenance'),
      regressionCount: count('regression'),
      otherCount: count('other'),
      totalCount: pack.cases.length
    };
  });

  return { packs, rows };
}

function validate(validator: ValidateFunction, data: unknown, componentId: string, kind: 'input' | 'output'): string[] {
  return validateWithCompiledSchema(validator, data, componentId, kind);
}

export async function runBehaviorFixtureCase(args: {
  fixture: Readonly<NormalizedFixtureCase>;
  schemas: CompiledComponentSchemas;
  execute: FixtureExecutionAdapter;
  evaluateExpectation: FixtureExpectationEvaluator;
}): Promise<FixtureCaseRunResult> {
  const { fixture, schemas, execute, evaluateExpectation } = args;
  if (fixture.groupKind !== 'behavior') {
    return {
      componentId: fixture.componentId,
      fixtureId: fixture.fixtureId,
      status: 'SKIP',
      inputSchemaErrors: [],
      outputSchemaErrors: [],
      deterministic: runDeterministicOracles(
        ALL_R1_ORACLES,
        createDeterministicOracleContext(fixture.componentId)
      ),
      expectationViolations: []
    };
  }
  if (schemas.componentId !== fixture.componentId) {
    throw new Error(`FIXTURE_SCHEMA_COMPONENT_MISMATCH:${fixture.componentId}:${schemas.componentId}`);
  }

  const execution = await execute(fixture);
  const inputSchemaErrors = validate(schemas.inputValidator, execution.canonicalInput, fixture.componentId, 'input');
  const outputSchemaErrors = validate(schemas.outputValidator, execution.output, fixture.componentId, 'output');
  const deterministic = runDeterministicOracles(
    ALL_R1_ORACLES,
    createDeterministicOracleContext(fixture.componentId, {
      input: execution.canonicalInput,
      output: execution.output,
      trace: execution.trace ?? null,
      state: execution.state ?? null
    })
  );
  const expectation = await evaluateExpectation(fixture, execution);

  const failed = inputSchemaErrors.length > 0 ||
    outputSchemaErrors.length > 0 ||
    deterministic.status === 'FAIL' ||
    expectation.violations.length > 0;

  return {
    componentId: fixture.componentId,
    fixtureId: fixture.fixtureId,
    status: failed ? 'FAIL' : 'PASS',
    inputSchemaErrors,
    outputSchemaErrors,
    deterministic,
    expectationViolations: [...expectation.violations]
  };
}
