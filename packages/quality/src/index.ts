import { parseFinalResponse, type FinalResponseContract } from '../../contracts/src/index.js';
import {
  hashRuntimePlanSnapshot,
  type VerifiedRuntimePlan
} from '../../verification/src/index.js';

export const QUALITY_PACKAGE = '@tatil-modu/quality' as const;

export class FinalCompositionBlockedError extends Error {
  constructor(public readonly blockers: readonly string[]) {
    super(`Final composition blocked: ${blockers.join(', ')}`);
    this.name = 'FinalCompositionBlockedError';
  }
}

function dayCard(dayNumber: number, destinationName: string, verificationNeeded: string[]) {
  const block = (title: string) => ({
    title,
    candidate_refs: [destinationName],
    verification_needed: verificationNeeded,
    notes: ['Deterministic fixture-mode plan block.']
  });

  return {
    day_number: dayNumber,
    day_theme: `${destinationName} - day ${dayNumber}`,
    primary_plan: {
      morning_block: block('Low-fatigue morning activity'),
      lunch_rest_block: block('Lunch and explicit rest window'),
      afternoon_block: block('Family-suitable afternoon activity'),
      evening_block: block('Flexible evening close')
    },
    alternatives: [{ title: 'Short indoor alternative' }, { title: 'Rest-focused alternative' }],
    family_fit_notes: ['Child ages and rest requirement were evaluated upstream.'],
    verification_needed: verificationNeeded,
    warnings: []
  };
}

export function composeVerifiedFinalPlan(verified: VerifiedRuntimePlan): FinalResponseContract {
  if (hashRuntimePlanSnapshot(verified.snapshot) !== verified.snapshotHash) {
    throw new FinalCompositionBlockedError(['verified_snapshot_hash_mismatch']);
  }
  if (verified.report.validation_status === 'blocked' || verified.report.hard_blockers.length > 0) {
    throw new FinalCompositionBlockedError(verified.report.hard_blockers);
  }
  const candidate = verified.snapshot.selectedCandidate;
  if (!candidate) throw new FinalCompositionBlockedError(['no_verified_candidate']);

  const verificationNeeded = verified.report.soft_warnings;
  const disclosures = verified.report.evidence_items.map((item) => ({
    disclosure_id: `disclosure:${item.evidence_item_id}`,
    claim_category: item.claim_category,
    status: item.verification_status === 'verified' ? 'verified' as const : 'unverified' as const,
    message: item.verification_status === 'verified'
      ? `${item.claim_text} Evidence is attached.`
      : `${item.claim_text} This remains unverified.`,
    source_evidence_item_ids: item.verification_status === 'verified' ? [item.evidence_item_id] : [],
    must_verify_before_trip: item.verification_status !== 'verified'
  }));

  return parseFinalResponse({
    contract_id: 'final_response_contract',
    contract_version: '0.1.0',
    producer_agent: 'final_response_composer_agent',
    trace_id: verified.snapshot.traceId,
    validation_status: verified.report.validation_status === 'valid' ? 'pass' : 'pass_with_warnings',
    upstream_verification_report_id: verified.report.report_id,
    upstream_hard_blockers: verified.report.hard_blockers,
    upstream_final_response_rules: verified.report.final_response_rules,
    final_response: {
      response_title: `${candidate.name} family trip plan`,
      executive_summary: `${verified.snapshot.durationDays}-day verified plan for ${candidate.name}.`,
      plan_overview: {
        duration_days: verified.snapshot.durationDays,
        travel_style: 'family_low_fatigue',
        contains_sea_activity: candidate.containsSeaActivity,
        privacy_constraint_active: verified.snapshot.privacyConstraintActive
      },
      daily_plan_cards: Array.from(
        { length: verified.snapshot.durationDays },
        (_, index) => dayCard(index + 1, candidate.name, verificationNeeded)
      ),
      verification_disclosures: disclosures,
      hard_blockers: [],
      unresolved_questions: [],
      confidence_summary: {
        overall_confidence: verified.report.confidence.value,
        confidence_reasons: verified.report.confidence.reasons,
        low_confidence_sections: [],
        user_should_verify_before_trip: verificationNeeded
      },
      user_action_checklist: verificationNeeded
    }
  });
}
