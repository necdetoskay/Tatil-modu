import { z } from 'zod';

const evidenceRefSchema = z.string().min(1);
const claimStatusSchema = z.enum(['unknown', 'needs_verification', 'verified', 'rejected']);
const fitBandSchema = z.enum(['high', 'medium', 'low', 'conditional', 'blocked', 'unknown']);
const confidenceSchema = z.enum(['high', 'medium', 'low']);

const verifiableClaimSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean()]).nullable(),
  verification_status: claimStatusSchema,
  evidence_refs: z.array(evidenceRefSchema).default([])
}).strict().superRefine((value, ctx) => {
  if (value.verification_status === 'verified' && value.evidence_refs.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'verified claim requires evidence' });
  }
});

const activityProfileSchema = z.object({
  activity_id: z.string().min(1),
  activity_name: z.string().min(1).optional(),
  activity_type: z.enum(['beach','women_only_beach','zoo','museum','science_center','nature_walk','playground','thermal_pool','spa_family_facility','boat_trip','city_walk','shopping_mall_backup','indoor_bad_weather_option','unknown']),
  destination_id: z.string().min(1).optional(),
  family_fit_band: fitBandSchema,
  toddler_fit: fitBandSchema,
  older_child_fit: fitBandSchema,
  fatigue_risk: z.enum(['low','medium','high','unknown']),
  weather_sensitivity: z.enum(['low','medium','high','unknown']),
  privacy_requirement_status: z.enum(['not_applicable','satisfied','verification_required','blocked','unknown']),
  accessibility_risk: z.enum(['low','medium','high','needs_verification','unknown']).optional(),
  parking_access_risk: z.enum(['low','medium','high','needs_verification','unknown']).optional(),
  time_window_fit: z.enum(['morning_preferred','afternoon_preferred','evening_preferred','flexible','unknown']).optional(),
  cost_sensitivity: z.enum(['low','medium','high','needs_verification','unknown']).optional(),
  activity_blockers: z.array(z.string().min(1)),
  activity_warnings: z.array(z.string().min(1)),
  verification_needs: z.array(z.object({ type: z.string().min(1), priority: z.enum(['low','medium','high']), reason: z.string().min(1) }).strict()),
  recommended_usage: z.array(z.string().min(1)),
  explanation_notes: z.array(z.string().min(1)),
  confidence: confidenceSchema,
  validation_status: z.enum(['valid','valid_with_warnings','needs_verification','blocked','invalid']),
  opening_hours_claim: verifiableClaimSchema.optional(),
  ticket_price_claim: verifiableClaimSchema.optional(),
  parking_claim: verifiableClaimSchema.optional(),
  stroller_accessibility_claim: verifiableClaimSchema.optional(),
  toilet_access_claim: verifiableClaimSchema.optional(),
  women_only_beach_claim: verifiableClaimSchema.optional(),
  hard_constraint_violation: z.boolean().default(false)
}).strict().superRefine((value, ctx) => {
  const isSea = value.activity_type === 'beach' || value.activity_type === 'women_only_beach';
  if (isSea && value.privacy_requirement_status === 'satisfied') {
    if (!value.women_only_beach_claim || value.women_only_beach_claim.verification_status !== 'verified') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'sea privacy satisfaction requires verified women-only beach evidence' });
    }
  }
  if (value.hard_constraint_violation && value.validation_status !== 'blocked') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'hard constraint violation must block activity' });
  }
  if (value.validation_status === 'blocked' && value.activity_blockers.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'blocked activity requires blocker reason' });
  }
  if (value.confidence === 'low' && value.validation_status === 'blocked' && !value.hard_constraint_violation) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'low confidence alone cannot create hard blocker' });
  }
});

export const activityFitEnvelopeSchema = z.object({
  contract_id: z.literal('activity_fit_contract'),
  contract_version: z.literal('v1'),
  producer_agent: z.literal('activity_fit_agent'),
  trace_id: z.string().min(1),
  validation_status: z.enum(['valid','valid_with_warnings','needs_verification','invalid']),
  confidence: confidenceSchema,
  activity_summary: z.object({
    total_candidates: z.number().int().nonnegative(),
    suitable_count: z.number().int().nonnegative(),
    conditional_count: z.number().int().nonnegative(),
    rejected_count: z.number().int().nonnegative(),
    verification_required_count: z.number().int().nonnegative()
  }).strict(),
  activity_profiles: z.array(activityProfileSchema),
  rejected_activity_candidates: z.array(z.object({ activity_id: z.string().min(1), reason: z.string().min(1) }).strict()),
  clarification_requirements: z.array(z.object({ field: z.string().min(1), reason: z.string().min(1), blocks_final_plan: z.boolean() }).strict())
}).strict();

export type ActivityFitEnvelope = z.infer<typeof activityFitEnvelopeSchema>;
export const safeParseActivityFit = (input: unknown) => activityFitEnvelopeSchema.safeParse(input);
