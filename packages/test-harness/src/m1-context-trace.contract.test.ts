import { describe, expect, it } from 'vitest';
import {
  assertRetryManifestLineage,
  buildHarnessContext,
  createAttemptTrace,
  createFrozenContextManifest,
  validateAttemptTrace,
  validateFrozenContextManifest,
  type AttemptTrace,
  type ContextManifest,
  type HarnessProfile
} from '../../harness/src/index.js';

const profile: HarnessProfile = {
  id: 'route-logistics',
  allowedMemoryClasses: ['M0', 'M1', 'M2', 'M3'],
  allowedCapabilities: ['route_lookup'],
  maxContextTokens: 1000
};

const contractHash = 'a'.repeat(64);

function builtContext(extraRef = 'route-fact') {
  return buildHarnessContext(profile, 'trip-1', [
    {
      refId: extraRef,
      scopeId: 'trip-1',
      memoryClass: 'M3',
      authority: 'domain_truth',
      estimatedTokens: 100,
      evidenceRefs: ['ev-route-1']
    },
    {
      refId: 'stale-retrieval',
      scopeId: 'trip-1',
      memoryClass: 'M2',
      authority: 'retrieval_representation',
      estimatedTokens: 100,
      stale: true
    }
  ]);
}

function manifest(attempt: number, extraRef = 'route-fact') {
  return createFrozenContextManifest(builtContext(extraRef), {
    runId: 'run-1',
    attempt,
    componentId: 'TM-AG-008',
    agentContractVersion: '1.0',
    contractHash,
    harnessPolicySnapshotId: 'har-policy-v1',
    promptVersion: 'prompt-v1',
    sourceRefs: ['source-b', 'source-a'],
    normalizedFactRefs: ['fact-2', 'fact-1'],
    upstreamObjectRefs: ['obj-1'],
    policyVersions: ['policy-2', 'policy-1'],
    redactionSummary: ['redacted:sensitive-note'],
    frozenAt: `2026-08-28T04:00:0${attempt}Z`
  });
}

describe('M1.6 ContextManifest + Trace provenance', () => {
  it('freezes an attempt-scoped context manifest and exposes only selected/model-visible refs', () => {
    const value = manifest(1);

    expect(value.lifecycleState).toBe('FROZEN');
    expect(Object.isFrozen(value)).toBe(true);
    expect(Object.isFrozen(value.modelVisibleRefs)).toBe(true);
    expect(value.selectedContextRefs).toEqual(['route-fact']);
    expect(value.excludedContextSummary).toEqual([
      'stale-retrieval:STALE_DERIVED_OR_RETRIEVAL_CONTEXT'
    ]);
    expect(value.sourceRefs).toEqual(['source-a', 'source-b']);
    expect(value.normalizedFactRefs).toEqual(['fact-1', 'fact-2']);
    expect(value.modelVisibleRefs).toEqual(['fact-1', 'fact-2', 'obj-1', 'route-fact']);
    expect(validateFrozenContextManifest(value)).toEqual({ status: 'PASS', violations: [] });
  });

  it('prevents in-attempt mutation and detects tampered copies', () => {
    const value = manifest(1);

    expect(() => {
      (value as unknown as { contextHash: string }).contextHash = 'b'.repeat(64);
    }).toThrow();

    const tampered = {
      ...value,
      contextHash: 'b'.repeat(64)
    } as ContextManifest;
    const validation = validateFrozenContextManifest(tampered);

    expect(validation.status).toBe('FAIL');
    expect(validation.violations).toContain('CONTEXT_MANIFEST_NOT_FROZEN');
    expect(validation.violations).toContain('FROZEN_CONTEXT_MUTATED');
  });

  it('requires a new manifest identity on retry and permits changed context only in the new attempt', () => {
    const first = manifest(1, 'route-fact');
    const retry = manifest(2, 'route-fact-refreshed');

    expect(assertRetryManifestLineage(first, retry)).toEqual([]);
    expect(retry.contextManifestId).not.toBe(first.contextManifestId);
    expect(retry.manifestHash).not.toBe(first.manifestHash);
    expect(retry.contextHash).not.toBe(first.contextHash);

    const illegalReuse = {
      ...first,
      attempt: 2
    } as ContextManifest;
    expect(assertRetryManifestLineage(first, illegalReuse)).toContain('RETRY_REUSED_CONTEXT_MANIFEST_ID');
  });

  it('binds trace to exact contract, policy snapshot, context manifest and model-visible refs', () => {
    const context = manifest(1);
    const trace = createAttemptTrace({
      runId: 'run-1',
      attempt: 1,
      componentId: 'TM-AG-008',
      contractHash,
      harnessPolicySnapshotId: 'har-policy-v1',
      contextManifest: context,
      runtimeId: 'fixture-runtime-v1',
      modelId: null,
      inputRef: 'input-1',
      outputRef: 'output-1',
      toolCalls: [
        {
          toolCallId: 'tool-call-1',
          toolId: 'TL-005',
          status: 'completed',
          evidenceRefs: ['ev-route-2', 'ev-route-1']
        }
      ],
      evidenceRefs: ['ev-output-1'],
      upstreamRunRefs: ['upstream-run-1'],
      recordedAt: '2026-08-28T04:01:00Z'
    });

    expect(Object.isFrozen(trace)).toBe(true);
    expect(trace.contextManifestId).toBe(context.contextManifestId);
    expect(trace.contextHash).toBe(context.contextHash);
    expect(trace.contextManifestHash).toBe(context.manifestHash);
    expect(trace.modelVisibleRefs).toEqual(context.modelVisibleRefs);
    expect(trace.toolCallRefs).toEqual(['tool-call-1']);
    expect(trace.evidenceRefs).toEqual(['ev-output-1', 'ev-route-1', 'ev-route-2']);
    expect(validateAttemptTrace(trace, context)).toEqual({ status: 'PASS', violations: [] });
  });

  it('rejects trace creation when context belongs to another attempt or policy snapshot', () => {
    const context = manifest(1);

    expect(() => createAttemptTrace({
      runId: 'run-1',
      attempt: 2,
      componentId: 'TM-AG-008',
      contractHash,
      harnessPolicySnapshotId: 'har-policy-v1',
      contextManifest: context,
      runtimeId: 'fixture-runtime-v1',
      recordedAt: '2026-08-28T04:02:00Z'
    })).toThrow('TRACE_CONTEXT_ATTEMPT_MISMATCH');

    expect(() => createAttemptTrace({
      runId: 'run-1',
      attempt: 1,
      componentId: 'TM-AG-008',
      contractHash,
      harnessPolicySnapshotId: 'har-policy-v2',
      contextManifest: context,
      runtimeId: 'fixture-runtime-v1',
      recordedAt: '2026-08-28T04:02:00Z'
    })).toThrow('TRACE_HARNESS_POLICY_SNAPSHOT_MISMATCH');
  });

  it('detects a trace copy whose context binding was altered', () => {
    const context = manifest(1);
    const trace = createAttemptTrace({
      runId: 'run-1',
      attempt: 1,
      componentId: 'TM-AG-008',
      contractHash,
      harnessPolicySnapshotId: 'har-policy-v1',
      contextManifest: context,
      runtimeId: 'fixture-runtime-v1',
      recordedAt: '2026-08-28T04:03:00Z'
    });

    const tampered = {
      ...trace,
      contextHash: 'c'.repeat(64)
    } as AttemptTrace;
    const validation = validateAttemptTrace(tampered, context);

    expect(validation.status).toBe('FAIL');
    expect(validation.violations).toContain('TRACE_NOT_FROZEN');
    expect(validation.violations).toContain('TRACE_CONTEXT_HASH_MISMATCH');
    expect(validation.violations).toContain('TRACE_MUTATED');
  });
});
