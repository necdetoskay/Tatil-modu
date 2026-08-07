import { z } from 'zod';

export const commonErrorEnvelopeSchema = z.object({
  error_id: z.string().min(1),
  error_type: z.enum([
    'missing_required_field',
    'invalid_field_semantics',
    'hard_constraint_violation',
    'soft_preference_conflict',
    'evidence_missing',
    'evidence_conflict',
    'low_confidence_inference',
    'stale_information_risk',
    'privacy_requirement_unverified',
    'budget_uncertainty',
    'route_logistics_uncertainty',
    'accommodation_availability_uncertainty',
    'activity_operational_uncertainty',
    'weather_uncertainty',
    'contract_version_mismatch',
    'forbidden_field_present',
    'agent_scope_violation',
    'final_response_safety_violation',
    'clarification_required'
  ]),
  severity: z.enum(['info', 'warning', 'blocker', 'hard_blocker']),
  source_contract: z.string().min(1),
  source_agent: z.string().min(1),
  affected_field: z.string().min(1).nullable().optional(),
  affected_claim_id: z.string().min(1).nullable().optional(),
  user_visible: z.boolean(),
  user_message_required: z.boolean(),
  internal_note_allowed: z.boolean().optional(),
  recovery_action: z.enum([
    'proceed_with_warning',
    'request_clarification',
    'require_verification',
    'remove_candidate',
    'downgrade_to_soft_preference',
    'mark_as_assumption',
    'block_final_response_claim',
    'escalate_to_orchestrator'
  ]),
  clarification_question: z.string().min(1).nullable().optional(),
  downstream_blocking: z.boolean(),
  final_response_blocking: z.boolean(),
  confidence_impact: z.enum([
    'none',
    'lowers_local_confidence',
    'lowers_plan_confidence',
    'blocks_claim_confidence',
    'blocks_candidate_confidence',
    'blocks_final_response_confidence'
  ]),
  related_evidence_gap_ids: z.array(z.string().min(1)).default([]),
  validation_status: z.enum(['valid', 'warning', 'failed', 'blocked'])
}).strict().superRefine((value, ctx) => {
  if (value.severity === 'hard_blocker' && !value.user_visible) {
    ctx.addIssue({ code: 'custom', path: ['user_visible'], message: 'Hard blockers must be user-visible.' });
  }
  if (value.error_type === 'clarification_required' && !value.clarification_question && !value.affected_field) {
    ctx.addIssue({ code: 'custom', path: ['clarification_question'], message: 'Clarification errors require a question or affected field.' });
  }
  if (value.error_type === 'evidence_missing' && !value.affected_claim_id && !value.affected_field) {
    ctx.addIssue({ code: 'custom', path: ['affected_claim_id'], message: 'Evidence-missing errors must identify the affected claim or field.' });
  }
});

export type CommonErrorEnvelope = z.infer<typeof commonErrorEnvelopeSchema>;
