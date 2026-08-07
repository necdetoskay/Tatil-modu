import { z } from 'zod';

const confidenceSchema = z.enum(['low', 'medium', 'high']);

const familyRelevanceSchema = z.object({
  child_friendly_signal: z.enum(['strong', 'moderate', 'weak', 'unknown']),
  toddler_relevance: z.enum(['strong', 'moderate', 'weak', 'unknown']),
  older_child_relevance: z.enum(['strong', 'moderate', 'weak', 'unknown'])
}).strict();

const tripRoleSchema = z.object({
  can_be_base: z.boolean(),
  can_be_day_trip: z.boolean(),
  can_be_half_day: z.boolean()
}).strict();

const privacyRelevanceSchema = z.object({
  sea_or_beach_related: z.boolean(),
  women_only_beach_verification_required: z.boolean(),
  privacy_risk: z.enum(['none', 'low', 'medium', 'high', 'unknown'])
}).strict().superRefine((value, ctx) => {
  if (value.sea_or_beach_related && !value.women_only_beach_verification_required) {
    ctx.addIssue({
      code: 'custom',
      path: ['women_only_beach_verification_required'],
      message: 'Sea/beach candidates must carry the women-only beach verification marker when the hard rule is in scope.'
    });
  }
});

const logisticsRelevanceSchema = z.object({
  route_verification_required: z.literal(true),
  parking_verification_required: z.literal(true),
  traffic_verification_required: z.literal(true)
}).strict();

const candidateEvidenceStatusSchema = z.object({
  location_evidence_required: z.literal(true),
  source_evidence_required: z.literal(true),
  currently_verified: z.boolean(),
  verification_needs: z.array(z.string().min(1)).default([])
}).strict();

const destinationCandidateSchema = z.object({
  candidate_id: z.string().min(1),
  candidate_name: z.string().min(1),
  candidate_type: z.enum([
    'province',
    'district',
    'region',
    'attraction_cluster',
    'coastal_area',
    'thermal_area',
    'nature_area',
    'mixed'
  ]),
  province: z.string().min(1),
  district_or_area: z.string().min(1).optional(),
  radius_class: z.enum(['primary_target_area', 'near_radius_area', 'exceptional_out_of_radius_area']),
  estimated_distance_band_from_origin: z.enum([
    'unknown',
    'under_50_km',
    '50_100_km',
    '100_150_km',
    '150_200_km',
    'over_200_km'
  ]),
  distance_confidence: z.enum(['high', 'medium', 'low', 'not_verified']),
  inclusion_reason: z.string().min(1),
  exceptional_reason: z.string().min(1).optional(),
  family_relevance: familyRelevanceSchema,
  trip_role: tripRoleSchema,
  privacy_relevance: privacyRelevanceSchema,
  logistics_relevance: logisticsRelevanceSchema,
  evidence_status: candidateEvidenceStatusSchema,
  confidence: confidenceSchema
}).strict().superRefine((value, ctx) => {
  if (value.radius_class === 'exceptional_out_of_radius_area' && !value.exceptional_reason) {
    ctx.addIssue({
      code: 'custom',
      path: ['exceptional_reason'],
      message: 'Out-of-radius candidates require an explicit exceptional reason.'
    });
  }
  if (value.confidence === 'low' && value.evidence_status.verification_needs.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['evidence_status', 'verification_needs'],
      message: 'Low-confidence candidates must declare at least one verification need.'
    });
  }
});

export const destinationCandidateEnvelopeSchema = z.object({
  contract_id: z.literal('destination_candidate_contract'),
  contract_version: z.literal('0.1.0'),
  producer_agent: z.literal('destination_candidate_agent'),
  trace_id: z.string().min(1),
  source_request_id: z.string().min(1),
  validation_status: z.enum(['valid', 'valid_with_warnings', 'needs_clarification', 'invalid']),
  confidence: confidenceSchema,
  destination_scope_summary: z.object({
    origin: z.object({
      province: z.string().min(1),
      district: z.string().min(1).optional(),
      confidence: confidenceSchema
    }).strict(),
    primary_target_area: z.object({
      province: z.string().min(1),
      district_or_region: z.string().min(1).optional(),
      confidence: confidenceSchema
    }).strict(),
    default_radius_km: z.number().nonnegative(),
    radius_rule_source: z.enum(['user_explicit', 'project_default', 'inferred']),
    radius_rule_confidence: confidenceSchema,
    out_of_radius_allowed_when_exceptional: z.boolean()
  }).strict(),
  candidate_destinations: z.array(destinationCandidateSchema),
  excluded_destination_candidates: z.array(z.object({
    candidate_name: z.string().min(1),
    exclusion_reason: z.enum([
      'outside_radius_without_exception',
      'violates_hard_constraint',
      'too_uncertain',
      'poor_family_fit',
      'duplicate',
      'insufficient_trip_value'
    ]),
    user_visible_explanation_required: z.boolean(),
    confidence: confidenceSchema
  }).strict()).optional(),
  radius_policy: z.object({
    default_radius_km: z.number().nonnegative(),
    within_radius_candidate_preferred: z.literal(true),
    out_of_radius_candidate_allowed: z.boolean(),
    out_of_radius_requires_exception_reason: z.literal(true),
    out_of_radius_requires_user_visible_warning: z.literal(true),
    out_of_radius_requires_route_burden_review: z.literal(true)
  }).strict(),
  privacy_verification_needs: z.object({
    women_only_beach_required_when_sea_recommended: z.boolean(),
    sea_candidates_exist: z.boolean(),
    candidates_requiring_privacy_verification: z.array(z.object({
      candidate_id: z.string().min(1),
      verification_need: z.enum(['women_only_beach', 'family_section', 'privacy_facility', 'public_rule']),
      verification_priority: z.enum(['high', 'medium', 'low'])
    }).strict())
  }).strict().optional(),
  source_assumptions: z.array(z.string().min(1)).optional(),
  clarification_requirements: z.array(z.string().min(1)).optional()
}).strict().superRefine((value, ctx) => {
  const seaCandidates = value.candidate_destinations.filter((candidate) => candidate.privacy_relevance.sea_or_beach_related);
  if (seaCandidates.length > 0) {
    if (!value.privacy_verification_needs?.sea_candidates_exist) {
      ctx.addIssue({
        code: 'custom',
        path: ['privacy_verification_needs'],
        message: 'Sea candidates require a privacy verification summary.'
      });
    }
    const declared = new Set(
      value.privacy_verification_needs?.candidates_requiring_privacy_verification.map((item) => item.candidate_id) ?? []
    );
    for (const candidate of seaCandidates) {
      if (!declared.has(candidate.candidate_id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['privacy_verification_needs', 'candidates_requiring_privacy_verification'],
          message: `Sea candidate ${candidate.candidate_id} must be listed for privacy verification.`
        });
      }
    }
  }
});

export type DestinationCandidateEnvelope = z.infer<typeof destinationCandidateEnvelopeSchema>;

export function safeParseDestinationCandidate(input: unknown) {
  return destinationCandidateEnvelopeSchema.safeParse(input);
}
