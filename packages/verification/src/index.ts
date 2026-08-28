import { createHash } from 'node:crypto';
import {
  parseVerificationEvidence,
  type VerificationEvidenceReport
} from '../../contracts/src/index.js';

export const VERIFICATION_PACKAGE = '@tatil-modu/verification' as const;

export interface RuntimePlanCandidate {
  candidateId: string;
  name: string;
  containsSeaActivity: boolean;
  familySuitability: 'suitable' | 'suitable_with_cautions' | 'unsuitable' | 'needs_more_info';
  familyRejectionReasons: readonly string[];
  routeBurden: 'low' | 'moderate' | 'high' | 'blocked';
  routeVerificationNeeds: readonly string[];
}

export interface RuntimePlanSnapshot {
  traceId: string;
  durationDays: number;
  privacyConstraintActive: boolean;
  policyClarifications: readonly string[];
  policyConflicts: readonly string[];
  destinationOpenQuestions: readonly string[];
  selectedCandidate: RuntimePlanCandidate | null;
}

export interface RuntimeEvidenceInput {
  womenOnlyBeach?: {
    evidenceId: string;
    sourceType: 'public_authority' | 'official_facility';
  };
}

export interface VerifiedRuntimePlan {
  snapshot: RuntimePlanSnapshot;
  snapshotHash: string;
  report: VerificationEvidenceReport;
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, stable(child)])
    );
  }
  return value;
}

export function hashRuntimePlanSnapshot(snapshot: RuntimePlanSnapshot): string {
  return createHash('sha256').update(JSON.stringify(stable(snapshot))).digest('hex');
}

export function verifyRuntimePlan(
  snapshot: RuntimePlanSnapshot,
  evidence: RuntimeEvidenceInput = {}
): VerifiedRuntimePlan {
  const hardBlockers = new Set<string>();
  const softWarnings = new Set<string>();
  const finalResponseRules = new Set<string>();

  for (const clarification of snapshot.policyClarifications) {
    hardBlockers.add(`policy_clarification:${clarification}`);
  }
  for (const conflict of snapshot.policyConflicts) {
    hardBlockers.add(`policy_conflict:${conflict}`);
  }
  for (const question of snapshot.destinationOpenQuestions) {
    hardBlockers.add(`destination_question:${question}`);
  }

  if (!snapshot.selectedCandidate) {
    hardBlockers.add('no_eligible_destination_candidate');
  } else {
    if (snapshot.selectedCandidate.familySuitability === 'unsuitable') {
      hardBlockers.add(`family_unsuitable:${snapshot.selectedCandidate.candidateId}`);
    }
    if (snapshot.selectedCandidate.familySuitability === 'needs_more_info') {
      hardBlockers.add(`family_information_missing:${snapshot.selectedCandidate.candidateId}`);
    }
    if (snapshot.selectedCandidate.routeBurden === 'blocked') {
      hardBlockers.add(`route_blocked:${snapshot.selectedCandidate.candidateId}`);
    }
    for (const need of snapshot.selectedCandidate.routeVerificationNeeds) {
      softWarnings.add(`route_verification_needed:${need}`);
    }
  }

  const privacyEvidenceRequired = Boolean(
    snapshot.privacyConstraintActive && snapshot.selectedCandidate?.containsSeaActivity
  );
  const privacyEvidence = evidence.womenOnlyBeach;
  const privacyVerified = privacyEvidenceRequired && Boolean(privacyEvidence?.evidenceId);
  const evidenceItems = privacyEvidenceRequired
    ? [{
        evidence_item_id: 'women-only-beach-status',
        claim_id: 'women_only_beach_status',
        claim_text: 'Selected sea activity satisfies the women-only beach requirement.',
        claim_category: 'women_only_beach_status' as const,
        verification_status: privacyVerified ? 'verified' as const : 'unverified' as const,
        required_source_type: 'public_authority_or_official_facility_source',
        acceptable_source_types: ['public_authority', 'official_facility'],
        freshness_requirement: 'verify_before_final_plan',
        user_visible_status: privacyVerified ? 'may_show_as_verified' as const : 'must_show_as_unverified' as const,
        confidence_impact: 'high' as const,
        blocking_level: privacyVerified ? 'none' as const : 'hard_blocker' as const,
        notes: privacyEvidence
          ? [`evidence:${privacyEvidence.evidenceId}`, `source_type:${privacyEvidence.sourceType}`]
          : []
      }]
    : [];

  if (privacyEvidenceRequired && !privacyVerified) {
    hardBlockers.add('women_only_beach_status_unverified');
    finalResponseRules.add('do_not_present_women_only_beach_claim_as_verified');
  }

  const unresolvedEvidenceGaps = evidenceItems
    .filter((item) => item.verification_status !== 'verified')
    .map((item) => item.evidence_item_id);
  const blocked = hardBlockers.size > 0;
  const needsVerification = unresolvedEvidenceGaps.length > 0 || softWarnings.size > 0;

  const report = parseVerificationEvidence({
    report_id: `${snapshot.traceId}:verification`,
    contract_version: '1.0',
    generated_from_contracts: [
      'constraint_policy_contract',
      'destination_candidate_contract',
      'family_suitability_contract',
      'route_logistics_contract'
    ],
    evidence_items: evidenceItems,
    unresolved_evidence_gaps: unresolvedEvidenceGaps,
    hard_blockers: [...hardBlockers].sort(),
    soft_warnings: [...softWarnings].sort(),
    final_response_rules: [...finalResponseRules].sort(),
    confidence: {
      value: blocked ? 'low' : needsVerification ? 'medium' : 'high',
      reasons: blocked
        ? ['hard_blocker_present']
        : needsVerification
          ? ['non_blocking_verification_work_remains']
          : ['required_runtime_checks_passed']
    },
    validation_status: blocked ? 'blocked' : needsVerification ? 'needs_verification' : 'valid'
  });

  return {
    snapshot,
    snapshotHash: hashRuntimePlanSnapshot(snapshot),
    report
  };
}
