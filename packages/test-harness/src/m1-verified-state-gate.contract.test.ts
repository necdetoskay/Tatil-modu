import { describe, expect, it } from 'vitest';
import {
  evaluateVerifiedStateGate,
  type MinimalVerificationResult,
  type StateCommitRequest
} from '../../harness/src/index.js';

const verification: MinimalVerificationResult = {
  verificationRunId: 'verify-run-1',
  verifiedSnapshotRef: 'snapshot:trip-1:v3',
  verifiedSnapshotHash: 'snapshot-hash-v3',
  status: 'PASS',
  blockingFindings: [],
  authoritySummary: {
    agentViolations: [],
    toolViolations: [],
    orchestratorDirectDomainToolViolations: []
  },
  provenanceSummary: {
    missingRefs: [],
    brokenLineageRefs: [],
    snapshotMismatchRefs: [],
    adaptivePreservationFailures: []
  }
};

function request(overrides: Partial<StateCommitRequest> = {}): StateCommitRequest {
  return {
    tripId: 'trip-1',
    sourceRunIds: ['route-run-1', 'budget-run-1', 'verify-run-1'],
    candidateStateRef: 'snapshot:trip-1:v3',
    candidateSnapshotHash: 'snapshot-hash-v3',
    verificationResultRef: 'verification:verify-run-1',
    verificationResult: verification,
    ...overrides
  };
}

describe('M1.8 VerifiedStateGate', () => {
  it('allows durable commit only for exact PASS-bound snapshot lineage', () => {
    const decision = evaluateVerifiedStateGate(request());

    expect(decision.decision).toBe('COMMIT_ALLOWED');
    expect(decision.reasonCodes).toEqual([]);
    expect(decision.verificationRunId).toBe('verify-run-1');
  });

  it.each(['REPAIR', 'FAIL'] as const)('blocks verification status %s', status => {
    const decision = evaluateVerifiedStateGate(request({
      verificationResult: { ...verification, status }
    }));

    expect(decision.decision).toBe('COMMIT_BLOCKED');
    expect(decision.reasonCodes).toContain(`VERIFICATION_${status}`);
  });

  it('blocks missing verification instead of treating absence as implicit pass', () => {
    const decision = evaluateVerifiedStateGate(request({
      verificationResultRef: null,
      verificationResult: null
    }));

    expect(decision.decision).toBe('COMMIT_BLOCKED');
    expect(decision.reasonCodes).toEqual(['VERIFICATION_MISSING']);
  });

  it('blocks stale or substituted snapshot refs/hashes even when status says PASS', () => {
    const decision = evaluateVerifiedStateGate(request({
      candidateStateRef: 'snapshot:trip-1:v4',
      candidateSnapshotHash: 'snapshot-hash-v4'
    }));

    expect(decision.decision).toBe('COMMIT_BLOCKED');
    expect(decision.reasonCodes).toContain('VERIFIED_SNAPSHOT_REF_MISMATCH');
    expect(decision.reasonCodes).toContain('VERIFIED_SNAPSHOT_HASH_MISMATCH');
  });

  it('fails closed if a contradictory PASS still contains blocking, authority or provenance violations', () => {
    const decision = evaluateVerifiedStateGate(request({
      verificationResult: {
        ...verification,
        blockingFindings: [{ code: 'HARD_CONSTRAINT_FAIL' }],
        authoritySummary: {
          agentViolations: ['TM-AG-009'],
          toolViolations: [],
          orchestratorDirectDomainToolViolations: []
        },
        provenanceSummary: {
          missingRefs: ['evidence:missing-1'],
          brokenLineageRefs: [],
          snapshotMismatchRefs: [],
          adaptivePreservationFailures: []
        }
      }
    }));

    expect(decision.decision).toBe('COMMIT_BLOCKED');
    expect(decision.reasonCodes).toEqual([
      'AUTHORITY_VIOLATIONS_PRESENT',
      'BLOCKING_FINDINGS_PRESENT',
      'PROVENANCE_VIOLATIONS_PRESENT'
    ]);
  });

  it('requires verification run to belong to source lineage', () => {
    const decision = evaluateVerifiedStateGate(request({
      sourceRunIds: ['route-run-1', 'budget-run-1']
    }));

    expect(decision.decision).toBe('COMMIT_BLOCKED');
    expect(decision.reasonCodes).toEqual(['VERIFICATION_RUN_NOT_IN_SOURCE_LINEAGE']);
  });
});
