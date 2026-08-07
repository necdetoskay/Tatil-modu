import { z } from 'zod';

export const evidenceConfidenceSchema = z.object({
  value: z.enum(['low', 'medium', 'high']),
  reasons: z.array(z.string().min(1))
}).strict();

export const sourceSummaryItemSchema = z.object({
  source_id: z.string().min(1),
  source_type: z.enum([
    'user_input',
    'official_source',
    'provider_source',
    'map_source',
    'weather_source',
    'accommodation_source',
    'activity_source',
    'internal_candidate_data',
    'inferred_without_external_source'
  ]),
  source_label: z.string().min(1),
  source_owner: z.string().min(1).optional(),
  trust_band: z.enum(['high', 'medium', 'low', 'unknown']),
  freshness_band: z.string().min(1).optional(),
  supports_claim: z.boolean(),
  notes: z.array(z.string().min(1)).default([])
}).strict();

export const evidenceStatusSchema = z.enum([
  'verified',
  'partially_verified',
  'user_provided',
  'inferred',
  'needs_verification',
  'unavailable',
  'stale'
]);

export const verificationStatusSchema = z.enum([
  'not_required',
  'required_not_started',
  'in_progress_design_only',
  'verified',
  'failed',
  'blocked',
  'stale'
]);

const timeSensitiveClaimTypes = new Set([
  'price_claim',
  'opening_hours_claim',
  'weather_claim',
  'parking_claim',
  'women_only_beach_claim'
]);

export const commonEvidenceEnvelopeSchema = z.object({
  envelope_version: z.literal('0.1'),
  claim_id: z.string().min(1),
  claim_text: z.string().min(1).optional(),
  claim_type: z.enum([
    'user_declared_preference',
    'inferred_preference',
    'hard_constraint',
    'soft_preference',
    'destination_claim',
    'route_claim',
    'parking_claim',
    'price_claim',
    'opening_hours_claim',
    'weather_claim',
    'accommodation_facility_claim',
    'activity_availability_claim',
    'women_only_beach_claim',
    'safety_claim',
    'budget_claim',
    'policy_claim'
  ]),
  claim_subject: z.string().min(1).optional(),
  claim_value: z.unknown().optional(),
  source_summary: z.array(sourceSummaryItemSchema).default([]),
  evidence_status: evidenceStatusSchema,
  verification_status: verificationStatusSchema,
  confidence: evidenceConfidenceSchema,
  freshness: z.object({
    required: z.boolean(),
    checked_at: z.string().nullable(),
    expires_at: z.string().nullable(),
    staleness_risk: z.enum(['low', 'medium', 'high', 'unknown'])
  }).strict(),
  user_visibility: z.object({
    may_show_to_user: z.boolean(),
    must_disclose_uncertainty: z.boolean(),
    must_not_present_as_fact: z.boolean()
  }).strict(),
  blockers: z.array(z.string().min(1)),
  warnings: z.array(z.string().min(1))
}).strict().superRefine((value, ctx) => {
  const unverified = !['verified', 'user_provided'].includes(value.evidence_status);
  if (unverified && !value.user_visibility.must_disclose_uncertainty) {
    ctx.addIssue({ code: 'custom', path: ['user_visibility', 'must_disclose_uncertainty'], message: 'Unverified evidence must disclose uncertainty.' });
  }
  if (unverified && !value.user_visibility.must_not_present_as_fact) {
    ctx.addIssue({ code: 'custom', path: ['user_visibility', 'must_not_present_as_fact'], message: 'Unverified evidence cannot be presented as fact.' });
  }
  if (value.evidence_status === 'verified' && value.source_summary.length === 0) {
    ctx.addIssue({ code: 'custom', path: ['source_summary'], message: 'Verified claims require at least one source.' });
  }
  if (timeSensitiveClaimTypes.has(value.claim_type) && !value.freshness.required) {
    ctx.addIssue({ code: 'custom', path: ['freshness', 'required'], message: 'Time-sensitive claims require freshness checks.' });
  }
});

export type CommonEvidenceEnvelope = z.infer<typeof commonEvidenceEnvelopeSchema>;
