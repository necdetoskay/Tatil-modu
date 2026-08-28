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
    resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-orch-001-or-b-014.execution.json'),
    'utf8'
  );
  return JSON.parse(raw) as RecordedExecution;
}

function evaluateCommittedWorkflowExpectation(
  _fixture: Readonly<NormalizedFixtureCase>,
  execution: Readonly<FixtureExecutionResult>
) {
  const input = asRecord(execution.canonicalInput);
  const output = asRecord(execution.output);
  const violations: { code: string; message: string }[] = [];

  for (const key of ['workflowId', 'tripRequestRef', 'registrySnapshotId', 'orchestrationPolicySnapshotId', 'harnessPolicySnapshotId'] as const) {
    if (output[key] !== input[key]) violations.push({ code: 'OR_EXPECT_INPUT_BINDING', message: `${key} must be preserved` });
  }

  const nodeRuns = records(output.nodeRuns);
  const runById = new Map(nodeRuns.map(run => [String(run.nodeRunId), run]));
  const selectionByNode = new Map(records(output.nodeSelections).map(selection => [String(selection.nodeId), selection]));
  for (const handoff of records(output.handoffs)) {
    const producer = runById.get(String(handoff.producerNodeRunRef));
    const consumerSelection = selectionByNode.get(String(handoff.consumerNodeRef));
    if (!producer || producer.agentId !== handoff.producerAgentId) {
      violations.push({ code: 'OR_EXPECT_PRODUCER_LINEAGE', message: `handoff ${String(handoff.handoffId)} producer lineage invalid` });
    }
    if (!consumerSelection || consumerSelection.agentId !== handoff.consumerAgentId) {
      violations.push({ code: 'OR_EXPECT_CONSUMER_LINEAGE', message: `handoff ${String(handoff.handoffId)} consumer lineage invalid` });
    }
    if (handoff.accepted !== true || handoff.schemaValidationStatus !== 'PASS' || handoff.authorityValidationStatus !== 'PASS' || !['PASS', 'NOT_APPLICABLE'].includes(String(handoff.snapshotCompatibilityStatus))) {
      violations.push({ code: 'OR_EXPECT_VALID_HANDOFF', message: `accepted handoff ${String(handoff.handoffId)} must pass every gate` });
    }
  }

  const verification = nodeRuns.find(run => run.agentId === 'TM-AG-014');
  const explanation = nodeRuns.find(run => run.agentId === 'TM-AG-015');
  const final = nodeRuns.find(run => run.agentId === 'TM-AG-016');
  if (!verification || !explanation || !final ||
      Date.parse(String(verification.completedAt)) > Date.parse(String(explanation.startedAt)) ||
      Date.parse(String(explanation.completedAt)) > Date.parse(String(final.startedAt))) {
    violations.push({ code: 'OR_EXPECT_TERMINAL_ORDER', message: 'Verification must finish before Explanation, which must finish before Final Composer' });
  }

  const commits = records(output.stateCommitAttempts).filter(item => item.decision === 'COMMITTED');
  if (commits.length !== 1) violations.push({ code: 'OR_EXPECT_SINGLE_COMMIT', message: 'fixture expects exactly one committed state attempt' });
  for (const commit of commits) {
    if (commit.verificationStatus !== 'PASS' || commit.verificationRef !== output.finalVerificationRef) {
      violations.push({ code: 'OR_EXPECT_PASS_COMMIT', message: 'committed state must bind final Verification PASS' });
    }
    if (!Array.isArray(input.initialWorkingStateRefs) || !input.initialWorkingStateRefs.includes(commit.candidateStateRef)) {
      violations.push({ code: 'OR_EXPECT_CANDIDATE_LINEAGE', message: 'commit candidate state must originate from workflow working-state lineage' });
    }
  }

  if (output.finalStatus !== 'COMPLETED' || typeof output.finalVerificationRef !== 'string' || typeof output.finalPlanRef !== 'string') {
    violations.push({ code: 'OR_EXPECT_COMPLETED_TERMINAL_REFS', message: 'completed workflow requires final Verification and plan refs' });
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
  if (!fixture || !schemas) throw new Error('TM-ORCH-001 OR-B-014 fixture/schema missing');
  return { recording, fixture, schemas };
}

describe('M1.4 R2 recorded artifact replay — TM-ORCH-001 Travel Orchestrator', () => {
  it('runs OR-B-014 through canonical R0 → R1 → independent handoff/order/commit expectation', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: recording.canonicalOutput }),
      evaluateExpectation: evaluateCommittedWorkflowExpectation
    });

    expect(result.status).toBe('PASS');
    expect(result.inputSchemaErrors).toEqual([]);
    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('PASS');
    expect(result.expectationViolations).toEqual([]);
  });

  it('fails R1 when an accepted handoff has schema validation FAIL', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const handoffs = records(recording.canonicalOutput.handoffs);
    const first = asRecord(handoffs[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      handoffs: [{ ...first, schemaValidationStatus: 'FAIL' }, ...handoffs.slice(1)]
    };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateCommittedWorkflowExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('ORCHESTRATOR_INVALID_HANDOFF_ACCEPTED');
    expect(result.status).toBe('FAIL');
  });

  it('fails R1 when state is committed with Verification REPAIR', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const commit = asRecord(records(recording.canonicalOutput.stateCommitAttempts)[0]);
    const mutatedOutput = {
      ...recording.canonicalOutput,
      stateCommitAttempts: [{ ...commit, verificationStatus: 'REPAIR', decision: 'COMMITTED', reasonCodes: ['SYNTHETIC_BAD_COMMIT'] }]
    };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateCommittedWorkflowExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('ORCHESTRATOR_COMMIT_WITHOUT_PASS');
    expect(result.status).toBe('FAIL');
  });

  it('fails R1 when COMPLETED loses its final plan ref while schema remains valid', async () => {
    const { recording, fixture, schemas } = await loadFixtureAndSchemas();
    const mutatedOutput = { ...recording.canonicalOutput, finalPlanRef: null };
    const result = await runBehaviorFixtureCase({
      fixture,
      schemas,
      execute: () => ({ canonicalInput: recording.canonicalInput, output: mutatedOutput }),
      evaluateExpectation: evaluateCommittedWorkflowExpectation
    });

    expect(result.outputSchemaErrors).toEqual([]);
    expect(result.deterministic.status).toBe('FAIL');
    expect(result.deterministic.results.flatMap(item => item.violations).map(item => item.code))
      .toContain('ORCHESTRATOR_COMPLETED_WITHOUT_TERMINAL_REFS');
    expect(result.status).toBe('FAIL');
  });
});
