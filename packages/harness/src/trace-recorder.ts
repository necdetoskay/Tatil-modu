import { createHash } from 'node:crypto';
import type { ContextManifest } from './context-manifest.js';

export interface AttemptToolCallRef {
  toolCallId: string;
  toolId: string;
  status: 'completed' | 'failed' | 'blocked';
  evidenceRefs?: readonly string[];
}

export interface AttemptTraceBuildInput {
  runId: string;
  attempt: number;
  componentId: string;
  contractHash: string;
  harnessPolicySnapshotId: string;
  contextManifest: ContextManifest;
  runtimeId: string;
  modelId?: string | null;
  promptVersion?: string | null;
  inputRef?: string | null;
  outputRef?: string | null;
  toolCalls?: readonly AttemptToolCallRef[];
  evidenceRefs?: readonly string[];
  upstreamRunRefs?: readonly string[];
  recordedAt: string;
}

export interface AttemptTrace {
  traceId: string;
  runId: string;
  attempt: number;
  componentId: string;
  contractHash: string;
  harnessPolicySnapshotId: string;
  contextManifestId: string;
  contextHash: string;
  contextManifestHash: string;
  modelVisibleRefs: readonly string[];
  runtimeId: string;
  modelId: string | null;
  promptVersion: string | null;
  inputRef: string | null;
  outputRef: string | null;
  toolCallRefs: readonly string[];
  evidenceRefs: readonly string[];
  upstreamRunRefs: readonly string[];
  recordedAt: string;
  traceHash: string;
}

export interface AttemptTraceValidationResult {
  status: 'PASS' | 'FAIL';
  violations: readonly string[];
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableJson(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function sha256(value: unknown): string {
  return createHash('sha256').update(stableJson(value)).digest('hex');
}

function uniqueSorted(values: readonly string[] | undefined): string[] {
  return [...new Set(values ?? [])].sort();
}

function traceHashPayload(trace: Omit<AttemptTrace, 'traceHash'>): unknown {
  return {
    traceId: trace.traceId,
    runId: trace.runId,
    attempt: trace.attempt,
    componentId: trace.componentId,
    contractHash: trace.contractHash,
    harnessPolicySnapshotId: trace.harnessPolicySnapshotId,
    contextManifestId: trace.contextManifestId,
    contextHash: trace.contextHash,
    contextManifestHash: trace.contextManifestHash,
    modelVisibleRefs: trace.modelVisibleRefs,
    runtimeId: trace.runtimeId,
    modelId: trace.modelId,
    promptVersion: trace.promptVersion,
    inputRef: trace.inputRef,
    outputRef: trace.outputRef,
    toolCallRefs: trace.toolCallRefs,
    evidenceRefs: trace.evidenceRefs,
    upstreamRunRefs: trace.upstreamRunRefs,
    recordedAt: trace.recordedAt
  };
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

export function createAttemptTrace(input: AttemptTraceBuildInput): AttemptTrace {
  const manifest = input.contextManifest;
  if (manifest.runId !== input.runId) throw new Error('TRACE_CONTEXT_RUN_MISMATCH');
  if (manifest.attempt !== input.attempt) throw new Error('TRACE_CONTEXT_ATTEMPT_MISMATCH');
  if (manifest.componentId !== input.componentId) throw new Error('TRACE_CONTEXT_COMPONENT_MISMATCH');
  if (manifest.contractHash !== input.contractHash) throw new Error('TRACE_CONTRACT_HASH_MISMATCH');
  if (manifest.harnessPolicySnapshotId !== input.harnessPolicySnapshotId) {
    throw new Error('TRACE_HARNESS_POLICY_SNAPSHOT_MISMATCH');
  }

  const toolCallRefs = uniqueSorted(input.toolCalls?.map(call => call.toolCallId));
  const toolEvidenceRefs = input.toolCalls?.flatMap(call => [...(call.evidenceRefs ?? [])]) ?? [];
  const evidenceRefs = uniqueSorted([...(input.evidenceRefs ?? []), ...toolEvidenceRefs]);
  const identityHash = sha256({
    runId: input.runId,
    attempt: input.attempt,
    componentId: input.componentId,
    contractHash: input.contractHash,
    contextManifestHash: manifest.manifestHash,
    harnessPolicySnapshotId: input.harnessPolicySnapshotId
  });

  const withoutHash: Omit<AttemptTrace, 'traceHash'> = {
    traceId: `trace:${input.runId}:${input.attempt}:${identityHash.slice(0, 16)}`,
    runId: input.runId,
    attempt: input.attempt,
    componentId: input.componentId,
    contractHash: input.contractHash,
    harnessPolicySnapshotId: input.harnessPolicySnapshotId,
    contextManifestId: manifest.contextManifestId,
    contextHash: manifest.contextHash,
    contextManifestHash: manifest.manifestHash,
    modelVisibleRefs: [...manifest.modelVisibleRefs],
    runtimeId: input.runtimeId,
    modelId: input.modelId ?? null,
    promptVersion: input.promptVersion ?? manifest.promptVersion,
    inputRef: input.inputRef ?? null,
    outputRef: input.outputRef ?? null,
    toolCallRefs,
    evidenceRefs,
    upstreamRunRefs: uniqueSorted(input.upstreamRunRefs),
    recordedAt: input.recordedAt
  };

  return deepFreeze({ ...withoutHash, traceHash: sha256(traceHashPayload(withoutHash)) });
}

export function validateAttemptTrace(
  trace: AttemptTrace,
  manifest: ContextManifest
): AttemptTraceValidationResult {
  const violations: string[] = [];
  if (!Object.isFrozen(trace)) violations.push('TRACE_NOT_FROZEN');
  if (trace.runId !== manifest.runId) violations.push('TRACE_CONTEXT_RUN_MISMATCH');
  if (trace.attempt !== manifest.attempt) violations.push('TRACE_CONTEXT_ATTEMPT_MISMATCH');
  if (trace.componentId !== manifest.componentId) violations.push('TRACE_CONTEXT_COMPONENT_MISMATCH');
  if (trace.contractHash !== manifest.contractHash) violations.push('TRACE_CONTRACT_HASH_MISMATCH');
  if (trace.harnessPolicySnapshotId !== manifest.harnessPolicySnapshotId) {
    violations.push('TRACE_HARNESS_POLICY_SNAPSHOT_MISMATCH');
  }
  if (trace.contextManifestId !== manifest.contextManifestId) violations.push('TRACE_CONTEXT_MANIFEST_ID_MISMATCH');
  if (trace.contextHash !== manifest.contextHash) violations.push('TRACE_CONTEXT_HASH_MISMATCH');
  if (trace.contextManifestHash !== manifest.manifestHash) violations.push('TRACE_CONTEXT_MANIFEST_HASH_MISMATCH');
  if (stableJson(trace.modelVisibleRefs) !== stableJson(manifest.modelVisibleRefs)) {
    violations.push('TRACE_MODEL_VISIBLE_REFS_MISMATCH');
  }

  const expectedTraceHash = sha256(traceHashPayload({
    ...trace,
    traceHash: undefined
  } as unknown as Omit<AttemptTrace, 'traceHash'>));
  if (expectedTraceHash !== trace.traceHash) violations.push('TRACE_MUTATED');

  return {
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    violations: [...new Set(violations)].sort()
  };
}
