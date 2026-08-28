export * from './agent-registry.js';
export * from './contract-loader.js';
export * from './schema-compiler.js';
export * from './deterministic-runner.js';
export * from './deterministic-oracles.js';
export * from './deterministic-oracles-extended.js';
export * from './fixture-runner.js';
export * from './tool-gateway.js';
export * from './context-builder.js';

export const HARNESS_PACKAGE = '@tatil-modu/harness' as const;

export type HarnessExecutionMode = 'fixture' | 'hybrid' | 'live';
export type HarnessCheckpointStatus =
  | 'PASS'
  | 'FAIL'
  | 'PARTIAL'
  | 'NOT_IMPLEMENTED'
  | 'TOOL_FAILURE'
  | 'NO_DATA'
  | 'LOW_CONFIDENCE'
  | 'NOT_APPLICABLE';

export type HarnessFailureClass =
  | 'WORKFLOW_SELECTION_ERROR'
  | 'HARNESS_PROFILE_VIOLATION'
  | 'CONTEXT_SCOPE_VIOLATION'
  | 'UNQUALIFIED_CAPABILITY'
  | 'CAPABILITY_POLICY_VIOLATION'
  | 'PROVENANCE_INCOMPLETE'
  | 'VERIFIER_NOT_INDEPENDENT';

export type MemoryClass = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5';

export type HarnessProfileId =
  | 'intake-minimal'
  | 'constraint-policy'
  | 'destination-research'
  | 'family-suitability'
  | 'route-logistics'
  | 'activity-research'
  | 'accommodation-research'
  | 'verification-strict';

export type CapabilityQualificationStatus =
  | 'DISCOVERED'
  | 'REVIEWED'
  | 'QUALIFIED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'REVOKED';

export interface HarnessProfile {
  id: HarnessProfileId;
  allowedMemoryClasses: readonly MemoryClass[];
  allowedCapabilities: readonly string[];
  forbiddenCapabilities?: readonly string[];
  modelAlias?: string;
  verifierPolicy?: 'none' | 'deterministic' | 'independent_strict';
  maxContextTokens?: number;
}

export interface WorkflowStepDefinition {
  stepId: string;
  harnessProfile: HarnessProfileId;
  dependsOn: readonly string[];
  inputContract: string;
  outputContract: string;
  allowedCapabilities: readonly string[];
  retryPolicy: {
    maxAttempts: number;
    retryableFailureClasses: readonly string[];
  };
  resumable: boolean;
  verificationGate?: string;
}

export interface WorkflowDefinition {
  workflowId: string;
  version: string;
  steps: readonly WorkflowStepDefinition[];
}

export interface CapabilityQualificationRecord {
  capability: string;
  providerId: string;
  versionOrCommit: string;
  status: CapabilityQualificationStatus;
  qualifiedAgainst?: readonly string[];
  rollbackOrDisablePath?: string;
}

export interface ProvenanceRef {
  refId: string;
  kind: 'input' | 'context' | 'policy' | 'capability' | 'model' | 'evidence' | 'output' | 'downstream_effect';
}

export interface HarnessCheckpoint {
  runId: string;
  traceId: string;
  workflowId: string;
  workflowVersion: string;
  stepId: string;
  harnessProfile: HarnessProfileId;
  status: HarnessCheckpointStatus;
  failureClass?: HarnessFailureClass;
  inputRefs: readonly string[];
  contextRefs: readonly string[];
  capabilityCalls: readonly string[];
  evidenceRefs: readonly string[];
  provenance: readonly ProvenanceRef[];
  modelAlias?: string;
  durationMs?: number;
  estimatedCost?: number;
}

export interface HarnessRunContext {
  runId: string;
  requestId: string;
  traceId: string;
  tripId?: string;
  executionMode: HarnessExecutionMode;
  workflowId: string;
  workflowVersion: string;
}

/**
 * PRE-FREEZE LEGACY WORKFLOW.
 *
 * Kept for compatibility with the existing first-phase tests while the canonical
 * TM-AG-001..016 + TM-ORCH-001 registry-driven workflow is introduced. New M1
 * contract tests must use the AgentRegistry rather than extending this object.
 */
export const FAMILY_TRIP_PLANNING_V1: WorkflowDefinition = {
  workflowId: 'family_trip_planning',
  version: 'v1',
  steps: [
    {
      stepId: 'request_intake',
      harnessProfile: 'intake-minimal',
      dependsOn: [],
      inputContract: 'user_request.v1',
      outputContract: 'travel_request_contract.v1',
      allowedCapabilities: [],
      retryPolicy: { maxAttempts: 1, retryableFailureClasses: [] },
      resumable: true
    },
    {
      stepId: 'constraint_policy',
      harnessProfile: 'constraint-policy',
      dependsOn: ['request_intake'],
      inputContract: 'travel_request_contract.v1',
      outputContract: 'constraint_policy_contract.v1',
      allowedCapabilities: [],
      retryPolicy: { maxAttempts: 1, retryableFailureClasses: [] },
      resumable: true
    },
    {
      stepId: 'destination_discovery',
      harnessProfile: 'destination-research',
      dependsOn: ['constraint_policy'],
      inputContract: 'destination_discovery.request.v1',
      outputContract: 'destination_candidate_contract.v1',
      allowedCapabilities: ['place_discovery', 'evidence_lookup'],
      retryPolicy: { maxAttempts: 2, retryableFailureClasses: ['TOOL_FAILURE'] },
      resumable: true
    },
    {
      stepId: 'family_suitability',
      harnessProfile: 'family-suitability',
      dependsOn: ['destination_discovery'],
      inputContract: 'family_suitability.request.v1',
      outputContract: 'family_suitability_contract.v1',
      allowedCapabilities: [],
      retryPolicy: { maxAttempts: 1, retryableFailureClasses: [] },
      resumable: true
    },
    {
      stepId: 'route_logistics',
      harnessProfile: 'route-logistics',
      dependsOn: ['family_suitability'],
      inputContract: 'route_logistics.request.v1',
      outputContract: 'route_logistics_contract.0.1.0',
      allowedCapabilities: ['route_lookup', 'parking_lookup', 'evidence_lookup'],
      retryPolicy: { maxAttempts: 2, retryableFailureClasses: ['TOOL_FAILURE'] },
      resumable: true,
      verificationGate: 'route_evidence_gate.v1'
    }
  ]
};

export function isProductionSelectableCapability(record: CapabilityQualificationRecord): boolean {
  return record.status === 'ACTIVE';
}

export function validateStepProfile(step: WorkflowStepDefinition, profile: HarnessProfile): string[] {
  const violations: string[] = [];
  if (step.harnessProfile !== profile.id) violations.push('HARNESS_PROFILE_VIOLATION');

  const allowed = new Set(profile.allowedCapabilities);
  for (const capability of step.allowedCapabilities) {
    if (!allowed.has(capability)) violations.push(`CAPABILITY_POLICY_VIOLATION:${capability}`);
  }

  const forbidden = new Set(profile.forbiddenCapabilities ?? []);
  for (const capability of step.allowedCapabilities) {
    if (forbidden.has(capability)) violations.push(`CAPABILITY_POLICY_VIOLATION:${capability}`);
  }

  return [...new Set(violations)].sort();
}
