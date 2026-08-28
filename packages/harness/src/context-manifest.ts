import { createHash } from 'node:crypto';
import type { BuiltHarnessContext, HarnessContextRecord } from './context-builder.js';

export interface ContextManifestBuildInput {
  runId: string;
  attempt: number;
  componentId: string;
  agentContractVersion: string;
  contractHash: string;
  harnessPolicySnapshotId: string;
  promptVersion?: string | null;
  sourceRefs?: readonly string[];
  normalizedFactRefs?: readonly string[];
  upstreamObjectRefs?: readonly string[];
  policyVersions?: readonly string[];
  redactionSummary?: readonly string[];
  frozenAt: string;
}

export interface ContextManifest {
  contextManifestId: string;
  runId: string;
  attempt: number;
  componentId: string;
  agentContractVersion: string;
  contractHash: string;
  harnessPolicySnapshotId: string;
  promptVersion: string | null;
  sourceRefs: readonly string[];
  normalizedFactRefs: readonly string[];
  upstreamObjectRefs: readonly string[];
  policyVersions: readonly string[];
  selectedContextRefs: readonly string[];
  modelVisibleRefs: readonly string[];
  excludedContextSummary: readonly string[];
  redactionSummary: readonly string[];
  contextHash: string;
  manifestHash: string;
  frozenAt: string;
  lifecycleState: 'FROZEN';
}

export interface ContextManifestValidationResult {
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

function canonicalContextRecord(record: HarnessContextRecord): Record<string, unknown> {
  return {
    refId: record.refId,
    scopeId: record.scopeId,
    memoryClass: record.memoryClass,
    authority: record.authority,
    estimatedTokens: record.estimatedTokens,
    stale: record.stale ?? false,
    sensitive: record.sensitive ?? false,
    persistenceApproved: record.persistenceApproved ?? false,
    evidenceRefs: uniqueSorted(record.evidenceRefs)
  };
}

function computeContextHash(built: BuiltHarnessContext): string {
  return sha256({
    profileId: built.profileId,
    scopeId: built.scopeId,
    included: built.included.map(canonicalContextRecord),
    excluded: built.excluded
      .map(item => ({ refId: item.refId, reason: item.reason }))
      .sort((a, b) => a.refId.localeCompare(b.refId)),
    estimatedTokens: built.estimatedTokens
  });
}

function manifestHashPayload(manifest: Omit<ContextManifest, 'manifestHash'>): unknown {
  return {
    contextManifestId: manifest.contextManifestId,
    runId: manifest.runId,
    attempt: manifest.attempt,
    componentId: manifest.componentId,
    agentContractVersion: manifest.agentContractVersion,
    contractHash: manifest.contractHash,
    harnessPolicySnapshotId: manifest.harnessPolicySnapshotId,
    promptVersion: manifest.promptVersion,
    sourceRefs: manifest.sourceRefs,
    normalizedFactRefs: manifest.normalizedFactRefs,
    upstreamObjectRefs: manifest.upstreamObjectRefs,
    policyVersions: manifest.policyVersions,
    selectedContextRefs: manifest.selectedContextRefs,
    modelVisibleRefs: manifest.modelVisibleRefs,
    excludedContextSummary: manifest.excludedContextSummary,
    redactionSummary: manifest.redactionSummary,
    contextHash: manifest.contextHash,
    frozenAt: manifest.frozenAt,
    lifecycleState: manifest.lifecycleState
  };
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

export function createFrozenContextManifest(
  built: BuiltHarnessContext,
  input: ContextManifestBuildInput
): ContextManifest {
  if (!Number.isInteger(input.attempt) || input.attempt < 1) throw new Error('CONTEXT_ATTEMPT_INVALID');
  if (!/^[a-f0-9]{64}$/.test(input.contractHash)) throw new Error('CONTEXT_CONTRACT_HASH_INVALID');
  if (input.harnessPolicySnapshotId.length === 0) throw new Error('CONTEXT_HARNESS_POLICY_SNAPSHOT_MISSING');

  const contextHash = computeContextHash(built);
  const selectedContextRefs = built.included.map(record => record.refId);
  const modelVisibleRefs = uniqueSorted([
    ...selectedContextRefs,
    ...(input.normalizedFactRefs ?? []),
    ...(input.upstreamObjectRefs ?? [])
  ]);
  const excludedContextSummary = built.excluded
    .map(item => `${item.refId}:${item.reason}`)
    .sort();
  const identityHash = sha256({
    runId: input.runId,
    attempt: input.attempt,
    componentId: input.componentId,
    contractHash: input.contractHash,
    harnessPolicySnapshotId: input.harnessPolicySnapshotId,
    contextHash
  });

  const withoutManifestHash: Omit<ContextManifest, 'manifestHash'> = {
    contextManifestId: `ctx:${input.runId}:${input.attempt}:${identityHash.slice(0, 16)}`,
    runId: input.runId,
    attempt: input.attempt,
    componentId: input.componentId,
    agentContractVersion: input.agentContractVersion,
    contractHash: input.contractHash,
    harnessPolicySnapshotId: input.harnessPolicySnapshotId,
    promptVersion: input.promptVersion ?? null,
    sourceRefs: uniqueSorted(input.sourceRefs),
    normalizedFactRefs: uniqueSorted(input.normalizedFactRefs),
    upstreamObjectRefs: uniqueSorted(input.upstreamObjectRefs),
    policyVersions: uniqueSorted(input.policyVersions),
    selectedContextRefs,
    modelVisibleRefs,
    excludedContextSummary,
    redactionSummary: [...(input.redactionSummary ?? [])].sort(),
    contextHash,
    frozenAt: input.frozenAt,
    lifecycleState: 'FROZEN'
  };

  const manifest: ContextManifest = {
    ...withoutManifestHash,
    manifestHash: sha256(manifestHashPayload(withoutManifestHash))
  };
  return deepFreeze(manifest);
}

export function validateFrozenContextManifest(manifest: ContextManifest): ContextManifestValidationResult {
  const violations: string[] = [];
  if (!Object.isFrozen(manifest)) violations.push('CONTEXT_MANIFEST_NOT_FROZEN');
  if (manifest.lifecycleState !== 'FROZEN') violations.push('CONTEXT_MANIFEST_STATE_INVALID');
  if (!Number.isInteger(manifest.attempt) || manifest.attempt < 1) violations.push('CONTEXT_ATTEMPT_INVALID');
  if (!/^[a-f0-9]{64}$/.test(manifest.contractHash)) violations.push('CONTEXT_CONTRACT_HASH_INVALID');
  if (!/^[a-f0-9]{64}$/.test(manifest.contextHash)) violations.push('CONTEXT_HASH_INVALID');
  if (!/^[a-f0-9]{64}$/.test(manifest.manifestHash)) violations.push('CONTEXT_MANIFEST_HASH_INVALID');

  const expectedManifestHash = sha256(manifestHashPayload({
    ...manifest,
    manifestHash: undefined
  } as unknown as Omit<ContextManifest, 'manifestHash'>));
  if (expectedManifestHash !== manifest.manifestHash) violations.push('FROZEN_CONTEXT_MUTATED');

  const expectedVisible = uniqueSorted([
    ...manifest.selectedContextRefs,
    ...manifest.normalizedFactRefs,
    ...manifest.upstreamObjectRefs
  ]);
  if (stableJson(expectedVisible) !== stableJson(manifest.modelVisibleRefs)) {
    violations.push('MODEL_VISIBLE_REFS_DRIFT');
  }

  return {
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    violations: [...new Set(violations)].sort()
  };
}

export function assertRetryManifestLineage(
  previous: ContextManifest,
  next: ContextManifest
): readonly string[] {
  const violations: string[] = [];
  if (previous.runId !== next.runId) violations.push('RETRY_RUN_ID_CHANGED');
  if (previous.componentId !== next.componentId) violations.push('RETRY_COMPONENT_CHANGED');
  if (next.attempt !== previous.attempt + 1) violations.push('RETRY_ATTEMPT_NOT_SEQUENTIAL');
  if (previous.contextManifestId === next.contextManifestId) violations.push('RETRY_REUSED_CONTEXT_MANIFEST_ID');
  if (previous.manifestHash === next.manifestHash) violations.push('RETRY_REUSED_MANIFEST_HASH');
  return violations.sort();
}
