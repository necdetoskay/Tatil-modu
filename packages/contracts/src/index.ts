import { z } from 'zod';

export * from './common-evidence.js';
export * from './common-error.js';
export * from './constraint-policy.js';
export * from './family-suitability.js';
export * from './destination-candidate.js';
export * from './route-logistics.js';
export * from './accommodation-fit.js';
export * from './activity-fit.js';
export * from './day-plan.js';
export * from './verification-evidence.js';
export * from './final-response.js';

export const CONTRACTS_PACKAGE = '@tatil-modu/contracts' as const;

export const confidenceSchema = z.enum(['low', 'medium', 'high']);
export const validationStatusSchema = z.enum([
  'valid',
  'valid_with_missing_non_blocking_info',
  'needs_clarification',
  'invalid'
]);

const sourceStampedValue = <T extends z.ZodType>(value: T) =>
  z.object({
    value,
    source: z.enum(['user_explicit', 'conversation_context', 'memory_disclosure', 'inferred', 'missing']),
    confidence: confidenceSchema
  }).strict();

export const hardConstraintCandidateSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  source_text: z.string().min(1),
  confidence: confidenceSchema,
  requires_policy_agent_confirmation: z.literal(true)
}).strict();

export const missingInformationSchema = z.object({
  field: z.string().min(1),
  importance: z.enum(['low', 'medium', 'high', 'blocking']),
  reason: z.string().min(1),
  suggested_clarification_question: z.string().min(1).optional()
}).strict();

export const assumptionSchema = z.object({
  id: z.string().min(1),
  statement: z.string().min(1),
  risk_level: z.enum(['low', 'medium', 'high']),
  must_be_shown_to_user: z.boolean()
}).strict();

export const travelRequestPayloadSchema = z.object({
  original_user_request: z.string().min(1),
  normalized_request: z.string().min(1),
  travel_party: z.object({
    adults: z.object({ count: z.number().int().nonnegative().nullable() }).strict(),
    children: z.object({
      count: z.number().int().nonnegative().nullable(),
      ages: z.array(z.number().int().min(0).max(17))
    }).strict()
  }).strict(),
  origin: z.object({
    label: z.string().nullable(),
    type: z.enum(['city', 'district', 'exact_location', 'unknown']),
    confidence: confidenceSchema
  }).strict(),
  target_area: z.object({
    label: z.string().nullable(),
    type: z.enum(['city', 'region', 'open_choice', 'unknown']),
    radius_km: z.number().nonnegative().optional(),
    allow_nearby_regions: z.boolean().optional(),
    confidence: confidenceSchema
  }).strict(),
  duration: z.object({
    days: z.number().int().positive().nullable(),
    nights: z.number().int().nonnegative().optional(),
    confidence: confidenceSchema
  }).strict(),
  date_window: z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    flexibility: z.enum(['fixed', 'flexible', 'user_delegated', 'missing']).optional(),
    confidence: confidenceSchema
  }).strict().optional(),
  transport_mode: z.object({
    mode: z.enum(['own_car', 'public_transport', 'flight', 'mixed', 'unknown']),
    confidence: confidenceSchema
  }).strict().optional(),
  budget: z.object({
    amount: z.number().nonnegative().optional(),
    currency: z.string().min(3).max(3).optional(),
    scope: z.enum(['total_trip', 'per_day', 'accommodation_only', 'unknown']),
    flexibility: z.enum(['strict', 'flexible', 'unknown']),
    confidence: confidenceSchema
  }).strict().optional(),
  privacy_preferences: z.object({
    women_only_beach_required_when_sea_recommended: z.object({
      value: z.boolean().optional(),
      sensitivity: z.literal('sensitive_preference'),
      persistence_allowed_without_user_approval: z.literal(false)
    }).strict().optional(),
    conservative_family_environment_preferred: z.object({
      value: z.boolean().optional(),
      sensitivity: z.literal('sensitive_preference'),
      persistence_allowed_without_user_approval: z.literal(false)
    }).strict().optional()
  }).strict().optional(),
  family_constraints: z.object({
    toddler_friendly_required: z.boolean().optional(),
    low_fatigue_required: z.boolean().optional(),
    midday_rest_required: z.boolean().optional(),
    stroller_friendly_preferred: z.boolean().optional(),
    short_walk_preferred: z.boolean().optional(),
    toilet_access_important: z.boolean().optional()
  }).strict().optional(),
  logistics_preferences: z.object({
    parking_considered: z.boolean().optional(),
    traffic_considered: z.boolean().optional(),
    max_radius_km: z.number().nonnegative().optional(),
    far_option_requires_strong_justification: z.boolean().optional()
  }).strict().optional(),
  hard_constraint_candidates: z.array(hardConstraintCandidateSchema).optional(),
  soft_preference_candidates: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    source_text: z.string().min(1),
    confidence: confidenceSchema
  }).strict()).optional(),
  missing_information: z.array(missingInformationSchema),
  ambiguity_notes: z.array(z.object({
    note: z.string().min(1),
    affected_fields: z.array(z.string().min(1)),
    confidence: confidenceSchema
  }).strict()),
  assumptions: z.array(assumptionSchema),
  out_of_scope_notes: z.array(z.string().min(1)).optional()
}).strict();

export const travelRequestEnvelopeSchema = z.object({
  contract_id: z.literal('travel_request_contract'),
  contract_version: z.literal('v1'),
  producer_agent: z.literal('trip_intake_agent'),
  trace_id: z.string().min(1),
  created_at: z.string().min(1),
  source_language: z.string().min(2),
  validation_status: validationStatusSchema,
  confidence: confidenceSchema,
  evidence_summary: z.array(z.object({
    type: z.enum(['user_statement', 'conversation_context', 'memory_disclosure', 'inference_note']),
    reference: z.string().min(1)
  }).strict()).optional(),
  payload: travelRequestPayloadSchema
}).strict();

export type TravelRequestEnvelope = z.infer<typeof travelRequestEnvelopeSchema>;

export function parseTravelRequest(input: unknown): TravelRequestEnvelope {
  return travelRequestEnvelopeSchema.parse(input);
}

export function safeParseTravelRequest(input: unknown) {
  return travelRequestEnvelopeSchema.safeParse(input);
}

export const sourceStampedBooleanSchema = sourceStampedValue(z.boolean());
