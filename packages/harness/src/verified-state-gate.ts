export interface MinimalVerificationResult {
  verificationRunId: string;
  verifiedSnapshotRef: string;
  verifiedSnapshotHash: string;
  status: 'PASS' | 'REPAIR' | 'FAIL';
  blockingFindings: readonly unknown[];
  authoritySummary?: {
    agentViolations?: readonly string[];
    toolViolations?: readonly string[];
    orchestratorDirectDomainToolViolations?: readonly string[];
  };
  provenanceSummary?: {
    missingRefs?: readonly string[];
    brokenLineageRefs?: readonly string[];
    snapshotMismatchRefs?: readonly string[];
    adaptivePreservationFailures?: readonly string[];
  };
}

export interface StateCommitRequest {
  tripId: string;
  sourceRunIds: readonly string[];
  candidateStateRef: string;
  candidateSnapshotHash: string;
  verificationResultRef: string | null;
  verificationResult: MinimalVerificationResult | null;
}

export interface VerifiedStateGateDecision {
  decision: 'COMMIT_ALLOWED' | 'COMMIT_BLOCKED';
  tripId: string;
  candidateStateRef: string;
  candidateSnapshotHash: string;
  verificationResultRef: string | null;
  verificationRunId: string | null;
  reasonCodes: readonly string[];
}

function nonEmpty(values: readonly string[] | undefined): boolean {
  return (values?.length ?? 0) > 0;
}

export function evaluateVerifiedStateGate(request: StateCommitRequest): VerifiedStateGateDecision {
  const reasons: string[] = [];
  const verification = request.verificationResult;

  if (!request.tripId) reasons.push('TRIP_ID_MISSING');
  if (!request.candidateStateRef) reasons.push('CANDIDATE_STATE_REF_MISSING');
  if (!request.candidateSnapshotHash) reasons.push('CANDIDATE_SNAPSHOT_HASH_MISSING');
  if (!request.verificationResultRef || !verification) {
    reasons.push('VERIFICATION_MISSING');
  } else {
    if (verification.status !== 'PASS') reasons.push(`VERIFICATION_${verification.status}`);
    if (verification.verifiedSnapshotRef !== request.candidateStateRef) reasons.push('VERIFIED_SNAPSHOT_REF_MISMATCH');
    if (verification.verifiedSnapshotHash !== request.candidateSnapshotHash) reasons.push('VERIFIED_SNAPSHOT_HASH_MISMATCH');
    if (verification.blockingFindings.length > 0) reasons.push('BLOCKING_FINDINGS_PRESENT');

    const authority = verification.authoritySummary;
    if (
      nonEmpty(authority?.agentViolations) ||
      nonEmpty(authority?.toolViolations) ||
      nonEmpty(authority?.orchestratorDirectDomainToolViolations)
    ) reasons.push('AUTHORITY_VIOLATIONS_PRESENT');

    const provenance = verification.provenanceSummary;
    if (
      nonEmpty(provenance?.missingRefs) ||
      nonEmpty(provenance?.brokenLineageRefs) ||
      nonEmpty(provenance?.snapshotMismatchRefs) ||
      nonEmpty(provenance?.adaptivePreservationFailures)
    ) reasons.push('PROVENANCE_VIOLATIONS_PRESENT');

    if (!request.sourceRunIds.includes(verification.verificationRunId)) {
      reasons.push('VERIFICATION_RUN_NOT_IN_SOURCE_LINEAGE');
    }
  }

  const reasonCodes = [...new Set(reasons)].sort();
  return Object.freeze({
    decision: reasonCodes.length === 0 ? 'COMMIT_ALLOWED' : 'COMMIT_BLOCKED',
    tripId: request.tripId,
    candidateStateRef: request.candidateStateRef,
    candidateSnapshotHash: request.candidateSnapshotHash,
    verificationResultRef: request.verificationResultRef,
    verificationRunId: verification?.verificationRunId ?? null,
    reasonCodes: Object.freeze(reasonCodes)
  });
}
