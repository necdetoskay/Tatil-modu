import { z } from 'zod';

const confidenceSchema = z.enum(['low', 'medium', 'high']);
const fitBandSchema = z.enum(['high', 'medium', 'low', 'blocked', 'unknown']);
const verificationSchema = z.enum(['verified', 'needs_verification', 'unverified', 'unknown']);

const claimSchema = z.object({
  value: z.union([z.string(), z.boolean(), z.number()]).nullable(),
  verification_status: verificationSchema,
  evidence_refs: z.array(z.string().min(1)).default([])
}).strict().superRefine((claim, ctx) => {
  if (claim.verification_status === 'verified' && claim.evidence_refs.length === 0) {
    ctx.addIssue({ code: 'custom', message: 'verified accommodation claim requires evidence' });
  }
});

export const accommodationProfileSchema = z.object({
  accommodation_candidate_id: z.string().min(1),
  destination_candidate_id: z.string().min(1),
  accommodation_label: z.string().min(1),
  accommodation_type: z.enum(['hotel','thermal_hotel','family_resort','apartment_hotel','pension','unknown']),
  family_fit_band: fitBandSchema,
  budget_fit_band: fitBandSchema,
  rest_fit_band: fitBandSchema,
  location_fit_band: fitBandSchema,
  verification_status: verificationSchema,
  confidence: confidenceSchema,
  facility_claims: z.object({
    pool_presence_claim: claimSchema.optional(),
    thermal_spa_claim: claimSchema.optional(),
    family_room_claim: claimSchema.optional(),
    breakfast_claim: claimSchema.optional(),
    parking_claim: claimSchema.optional(),
    stroller_accessibility_claim: claimSchema.optional()
  }).strict().optional(),
  exact_price: z.object({ amount: z.number().nonnegative(), currency: z.string().length(3), evidence_refs: z.array(z.string().min(1)).min(1) }).strict().optional(),
  exact_availability: z.object({ available: z.boolean(), evidence_refs: z.array(z.string().min(1)).min(1) }).strict().optional(),
  hard_budget_limit_exceeded: z.boolean().default(false),
  user_approved_budget_override: z.boolean().default(false),
  family_hard_constraint_violation: z.boolean().default(false),
  blocked_reasons: z.array(z.string().min(1)).default([]),
  risks: z.array(z.string().min(1)).default([])
}).strict().superRefine((profile, ctx) => {
  if (profile.hard_budget_limit_exceeded && !profile.user_approved_budget_override && profile.budget_fit_band !== 'blocked') {
    ctx.addIssue({ code: 'custom', message: 'hard budget exceedance must block without user approval' });
  }
  if (profile.family_hard_constraint_violation && profile.family_fit_band !== 'blocked') {
    ctx.addIssue({ code: 'custom', message: 'family hard constraint violation must block candidate' });
  }
  if ((profile.budget_fit_band === 'blocked' || profile.family_fit_band === 'blocked') && profile.blocked_reasons.length === 0) {
    ctx.addIssue({ code: 'custom', message: 'blocked accommodation requires reason' });
  }
});

export const accommodationFitEnvelopeSchema = z.object({
  contract_id: z.literal('accommodation_fit_contract'),
  contract_version: z.literal('v0.1'),
  producer_agent: z.literal('accommodation_fit_agent'),
  trace_id: z.string().min(1),
  validation_status: z.enum(['valid','valid_with_warnings','needs_clarification','invalid','pending']),
  confidence: confidenceSchema,
  accommodation_summary: z.object({
    candidate_count: z.number().int().nonnegative(),
    recommended_candidate_count: z.number().int().nonnegative(),
    blocked_candidate_count: z.number().int().nonnegative()
  }).strict(),
  accommodation_profiles: z.array(accommodationProfileSchema),
  excluded_accommodation_candidates: z.array(z.string().min(1)).default([]),
  facility_verification_needs: z.array(z.string().min(1)).default([]),
  price_verification_needs: z.array(z.string().min(1)).default([]),
  parking_verification_needs: z.array(z.string().min(1)).default([]),
  location_verification_needs: z.array(z.string().min(1)).default([]),
  clarification_requirements: z.array(z.string().min(1)).default([])
}).strict();

export type AccommodationFitEnvelope = z.infer<typeof accommodationFitEnvelopeSchema>;
export const parseAccommodationFit = (input: unknown): AccommodationFitEnvelope => accommodationFitEnvelopeSchema.parse(input);
export const safeParseAccommodationFit = (input: unknown) => accommodationFitEnvelopeSchema.safeParse(input);
