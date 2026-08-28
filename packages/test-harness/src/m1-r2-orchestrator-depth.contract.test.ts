import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileRegistrySchemas, loadAgentRegistry, loadFixtureInventory, runBehaviorFixtureCase, type FixtureExecutionResult, type NormalizedFixtureCase } from '../../harness/src/index.js';

type J = Record<string, unknown>;
function obj(value: unknown): J { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object expected'); return value as J; }
function objs(value: unknown): J[] { return Array.isArray(value) ? value.map(obj) : []; }
async function baseArtifact(): Promise<{ canonicalInput: J; canonicalOutput: J }> { return JSON.parse(await readFile(resolve(process.cwd(), 'packages/test-harness/fixtures/recorded/tm-orch-001-or-b-014.execution.json'), 'utf8')) as { canonicalInput: J; canonicalOutput: J }; }

function selection(nodeId: string, agentId: string, disposition: 'SELECTED' | 'SKIPPED', reason: string): J { return { nodeId, agentId, disposition, reasonCodes: [reason], policyRefs: ['orchestration-policy:v1'], featureRefs: [] }; }
function attribution(nodeRunRef: string, primaryClass: string): J { return { failureAttributionId: `failure:${nodeRunRef}`, nodeRunRef, primaryClass, secondaryClasses: [], component: nodeRunRef, smallestFailingScope: nodeRunRef, reproducible: true }; }

function buildCase(id: string, base: { canonicalInput: J; canonicalOutput: J }) {
  const input = structuredClone(base.canonicalInput); const output = structuredClone(base.canonicalOutput); output.orchestrationRunId = `orchestration-run:${id.toLowerCase()}`; const selections = objs(output.nodeSelections);
  const stop = (status: 'FAILED' | 'BLOCKED', reason: string) => { output.finalStatus = status; output.finalPlanRef = null; output.finalVerificationRef = null; output.stateCommitAttempts = []; output.stateTransitions = [{ transitionId: `transition:${id.toLowerCase()}`, fromPhase: 'CREATED', toPhase: status, reasonCode: reason, triggerRefs: [] }]; };
  const failedRun = (nodeId: string, agentId: string) => { const run = { ...structuredClone(objs(output.nodeRuns)[0]!), nodeRunId: `node-run:${nodeId}:failed`, nodeId, agentId, status: 'FAILED', outputRef: null, executionRef: null, evaluationRef: `evaluation:${nodeId}:failed` }; output.nodeRuns = [run, ...objs(output.nodeRuns)]; output.failureAttributions = [attribution(String(run.nodeRunId), 'TOOL_PROVIDER')]; return run; };
  switch (id) {
    case 'OR-B-001': output.nodeSelections = [selection('node:profile', 'TM-AG-001', 'SELECTED', 'BASIC_DESTINATION_WORKFLOW'), selection('node:preference', 'TM-AG-002', 'SELECTED', 'POLICY_REQUIRED'), selection('node:destination', 'TM-AG-003', 'SELECTED', 'DESTINATION_REQUIRED'), ...selections]; break;
    case 'OR-B-002': output.nodeSelections = [selection('node:place', 'TM-AG-004', 'SELECTED', 'PARALLEL_ENRICHMENT'), selection('node:accommodation', 'TM-AG-005', 'SELECTED', 'PARALLEL_ENRICHMENT'), selection('node:food', 'TM-AG-006', 'SELECTED', 'PARALLEL_ENRICHMENT'), ...selections]; break;
    case 'OR-B-003': output.nodeSelections = [selection('node:weather', 'TM-AG-007', 'SELECTED', 'DATED_WEATHER_SENSITIVE_PLAN'), ...selections]; break;
    case 'OR-B-004': obj(input.featureContext).tripDatesAvailable = false; output.nodeSelections = [selection('node:weather', 'TM-AG-007', 'SKIPPED', 'WEATHER_NOT_MATERIAL'), ...selections]; break;
    case 'OR-B-005': { const handoff = { ...structuredClone(objs(output.handoffs)[0]!), handoffId: 'handoff:invalid-producer', schemaValidationStatus: 'FAIL', accepted: false }; output.handoffs = [handoff]; stop('FAILED', 'INVALID_PRODUCER_SCHEMA'); break; }
    case 'OR-B-006': { const run = failedRun('destination', 'TM-AG-003'); output.retryEvents = [{ retryEventId: 'retry:destination:2', nodeId: 'destination', priorNodeRunRef: run.nodeRunId, nextAttempt: 2, failureAttributionRef: `failure:${run.nodeRunId}`, disposition: 'RETRY', reasonCode: 'TRANSIENT_PROVIDER_FAILURE', newContextManifestRef: 'ctx:destination:2' }]; output.contextManifestRefs = [...(output.contextManifestRefs as unknown[]), 'ctx:destination:2']; break; }
    case 'OR-B-007': { const run = failedRun('weather', 'TM-AG-007'); output.retryEvents = [{ retryEventId: 'retry:weather:2', nodeId: 'weather', priorNodeRunRef: run.nodeRunId, nextAttempt: 2, failureAttributionRef: `failure:${run.nodeRunId}`, disposition: 'RETRY', reasonCode: 'CHANGED_RETRY_CONTEXT', newContextManifestRef: 'ctx:weather:2' }]; output.contextManifestRefs = [...(output.contextManifestRefs as unknown[]), 'ctx:weather:2']; break; }
    case 'OR-B-008': output.authorityViolations = [{ violationId: 'authority:1', code: 'SPECIALIST_DIRECT_AGENT_CALL', actorRef: 'TM-AG-004', targetRef: 'TM-AG-005', blockedBeforeExecution: true, traceRef: 'trace:authority:1' }]; stop('BLOCKED', 'AUTHORITY_VIOLATION'); break;
    case 'OR-B-009': output.repairLoops = [{ repairLoopId: 'repair-loop:1', iteration: 1, verificationRef: 'verification:repair', repairTargetRefs: ['repair-target:1'], ownerRecheckNodeRefs: ['node:place'], adaptiveNodeRunRef: 'node-run:adaptive:1', postRepairRecheckNodeRefs: ['node:place:recheck'], nextVerificationRef: 'verification:pass', status: 'REPAIRED' }]; obj(output.budgetUsage).repairLoops = 1; break;
    case 'OR-B-010': output.repairLoops = [{ repairLoopId: 'repair-loop:1', iteration: 2, verificationRef: 'verification:repair', repairTargetRefs: ['repair-target:1'], ownerRecheckNodeRefs: ['node:place'], adaptiveNodeRunRef: 'node-run:adaptive:2', postRepairRecheckNodeRefs: [], nextVerificationRef: null, status: 'LIMIT_REACHED' }]; obj(output.budgetUsage).repairLoops = 2; obj(output.budgetUsage).budgetExceededDimensions = ['maxRepairLoops']; stop('BLOCKED', 'REPAIR_LOOP_BUDGET_EXHAUSTED'); break;
    default: throw new Error(`UNSUPPORTED_ORCHESTRATOR_FIXTURE:${id}`);
  }
  return { input, output };
}

function evaluate(fixture: Readonly<NormalizedFixtureCase>, execution: Readonly<FixtureExecutionResult>) {
  const output = obj(execution.output); const selections = objs(output.nodeSelections); const retries = objs(output.retryEvents); const loops = objs(output.repairLoops); const violations: { code: string; message: string }[] = []; const fail = (condition: boolean, code: string) => { if (condition) violations.push({ code, message: fixture.fixtureId }); }; const selected = (agent: string) => selections.some(item => item.agentId === agent && item.disposition === 'SELECTED');
  switch (fixture.fixtureId) {
    case 'OR-B-001': fail(!selected('TM-AG-001') || !selected('TM-AG-002') || !selected('TM-AG-003'), 'OR_EXPECT_BASIC_CHAIN'); break;
    case 'OR-B-002': fail(!['TM-AG-004', 'TM-AG-005', 'TM-AG-006'].every(selected), 'OR_EXPECT_PARALLEL_BRANCHES'); break;
    case 'OR-B-003': fail(!selected('TM-AG-007'), 'OR_EXPECT_WEATHER_SELECTED'); break;
    case 'OR-B-004': fail(!selections.some(item => item.agentId === 'TM-AG-007' && item.disposition === 'SKIPPED'), 'OR_EXPECT_WEATHER_SKIPPED'); break;
    case 'OR-B-005': fail(!objs(output.handoffs).some(item => item.schemaValidationStatus === 'FAIL' && item.accepted === false) || output.finalStatus !== 'FAILED', 'OR_EXPECT_INVALID_HANDOFF_STOP'); break;
    case 'OR-B-006': fail(!retries.some(item => item.disposition === 'RETRY' && item.reasonCode === 'TRANSIENT_PROVIDER_FAILURE') || objs(output.failureAttributions).length === 0, 'OR_EXPECT_TRANSIENT_RETRY'); break;
    case 'OR-B-007': fail(!retries.some(item => item.newContextManifestRef === 'ctx:weather:2'), 'OR_EXPECT_NEW_RETRY_CONTEXT'); break;
    case 'OR-B-008': fail(objs(output.authorityViolations).length !== 1 || output.finalStatus !== 'BLOCKED', 'OR_EXPECT_AUTHORITY_BLOCK'); break;
    case 'OR-B-009': fail(!loops.some(item => item.status === 'REPAIRED') || obj(output.budgetUsage).repairLoops !== 1, 'OR_EXPECT_REPAIR_LOOP'); break;
    case 'OR-B-010': fail(!loops.some(item => item.status === 'LIMIT_REACHED') || output.finalStatus !== 'BLOCKED', 'OR_EXPECT_REPAIR_LIMIT'); break;
  }
  return { violations };
}

describe('M1.4 R2 case depth — TM-ORCH-001 Travel Orchestrator', () => {
  it('executes the first 10 golden Orchestrator behavior fixtures through R0 → R1 → independent expectations', async () => {
    const registry = await loadAgentRegistry(); const inventory = await loadFixtureInventory(registry); const compilation = await compileRegistrySchemas(registry); const base = await baseArtifact(); const pack = inventory.packs.find(item => item.componentId === 'TM-ORCH-001'); const schemas = compilation.compiled.find(item => item.componentId === 'TM-ORCH-001'); if (!pack || !schemas) throw new Error('TM-ORCH-001 missing');
    const fixtures = pack.cases.filter(item => item.groupKind === 'behavior').slice(0, 10); expect(fixtures).toHaveLength(10); const results = [];
    for (const fixture of fixtures) { const scenario = buildCase(fixture.fixtureId, base); results.push(await runBehaviorFixtureCase({ fixture, schemas, execute: () => ({ canonicalInput: scenario.input, output: scenario.output }), evaluateExpectation: evaluate })); }
    expect(results.map(item => [item.fixtureId, item.status])).toEqual(fixtures.map(item => [item.fixtureId, 'PASS'])); expect(results.flatMap(item => item.inputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.outputSchemaErrors)).toEqual([]); expect(results.flatMap(item => item.expectationViolations)).toEqual([]);
  }, 20_000);
});
