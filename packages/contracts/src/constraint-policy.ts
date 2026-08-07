import { z } from 'zod';
import { commonEvidenceEnvelopeSchema } from './common-evidence.js';

const confidenceSchema = z.enum(['low', 'medium', 'high']);

export const hardConstraintSchema = z.object({
  constraint_id: z.string().min(1),
  label: z.string().min(1),
  source: z.string().min(1),
  source_text: z.string().min(1).optional(),
  category: z.enum(['privacy', 'safety', 'family_fit', 'budget', 'logistics', 'time', 'accessibility', 'legal_or_public_rule']),
  applies_to: z.array(z.string().min(1)).min(1),
  enforcement: z.enum(['eliminate_candidate', 'block_until_clarified', 'require_user_confirmation', 'require_evidence_before_use']),
  confidence: confidenceSchema,
  evidence_requirement: z.string().min(1),
  user_visible: z.boolean(),
  can_be_overridden_by_user: z.boolean()
}).strict().superRefine((value, ctx) => {
  if (value.confidence === 'low') {
    ctx.addIssue({ code: 'custom', path: ['confidence'], message: 'Low-confidence hard constraints are forbidden.' });
  }
  if (value.source === 'user_statement' && !value.source_text) {
    ctx.addIssue({ code: 'custom', path: ['source_text'], message: 'User-derived hard constraints require source text.' });
  }
});

export const constraintPolicyEnvelopeSchema = z.object({
  contract_id: z.literal('constraint_policy_contract'),
  contract_version: z.literal('v1'),
  producer_agent: z.literal('constraint_policy_agent'),
  trace_id: z.string().min(1),
  created_at: z.string().min(1),
  input_contract_refs: z.array(z.string().min(1)).min(1),
  validation_status: z.enum(['valid', 'valid_with_warnings', 'needs_clarification', 'invalid']),
  confidence: confidenceSchema,
  evidence_summary: z.array(commonEvidenceEnvelopeSchema),
  payload: z.object({
    policy_summary: z.string().min(1),
    hard_constraints: z.array(hardConstraintSchema),
    soft_preferences: z.array(z.object({
      preference_id: z.string().min(1),
      label: z.string().min(1),
      source: z.string().min(1),
      source_text: z.string().min(1).optional(),
      category: z.string().min(1),
      applies_to: z.array(z.string().min(1)).min(1),
      ranking_effect: z.enum(['boost', 'penalize', 'diversify', 'explain_only']),
      confidence: confidenceSchema,
      user_visible: z.boolean()
    }).strict()),
    policy_warnings: z.array(z.object({
      warning_id: z.string().min(1),
      label: z.string().min(1),
      severity: z.enum(['info', 'caution', 'warning', 'blocking']),
      reason: z.string().min(1),
      affected_fields: z.array(z.string().min(1)).min(1),
      must_surface_to_user: z.boolean(),
      blocks_final_plan: z.boolean()
    }).strict()),
    clarification_requirements: z.array(z.object({
      clarification_id: z.string().min(1),
      question: z.string().min(1),
      reason: z.string().min(1),
      importance: z.enum(['low', 'medium', 'high', 'blocking']),
      blocks_downstream: z.boolean(),
      affected_contracts: z.array(z.string().min(1)).min(1)
    }).strict()),
    downstream_application_rules: z.object({
      candidate_generation: z.object({ must_apply_hard_constraints_before_ranking: z.literal(true) }).strict(),
      ranking: z.object({
        soft_preferences_can_adjust_score: z.boolean(),
        soft_preferences_cannot_override_hard_constraints: z.literal(true)
      }).strict(),
      final_response: z.object({
        must_surface_policy_warnings: z.literal(true),
        must_surface_user_visible_assumptions: z.literal(true)
      }).strict(),
      verification: z.object({ hard_constraint_evidence_gap_must_be_reported: z.literal(true) }).strict()
    }).strict(),
    rejected_constraint_candidates: z.array(z.object({
      candidate_id: z.string().min(1),
      original_label: z.string().min(1),
      rejection_reason: z.string().min(1),
      converted_to: z.enum(['none', 'soft_preference', 'policy_warning']),
      confidence: confidenceSchema
    }).strict()).optional(),
    assumptions_to_surface: z.array(z.object({
      assumption_id: z.string().min(1),
      statement: z.string().min(1),
      source: z.string().min(1),
      risk_level: z.enum(['low', 'medium', 'high']),
      must_be_shown_to_user: z.literal(true)
    }).strict()),
    validation_notes: z.array(z.string().min(1))
  }).strict()
}).strict();

export type ConstraintPolicyEnvelope = z.infer<typeof constraintPolicyEnvelopeSchema>;
