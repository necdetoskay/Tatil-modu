import { z } from 'zod';

const confidenceSchema = z.enum(['low', 'medium', 'high']);
const fitBandSchema = z.enum(['good', 'moderate', 'weak', 'blocked']);
const unknownBooleanSchema = z.union([z.boolean(), z.literal('unknown')]);

const childFitSchema = z.object({
  age: z.number().int().min(0).max(17),
  fit_band: fitBandSchema,
  concerns: z.array(z.string().min(1))
}).strict();

const toddlerFitSchema = z.object({
  fit_band: fitBandSchema,
  nap_compatible: unknownBooleanSchema,
  stroller_friendly: unknownBooleanSchema,
  long_wait_risk: z.enum(['low', 'medium', 'high', 'unknown']),
  toilet_break_need: z.enum(['low', 'medium', 'high', 'unknown'])
}).strict();

const olderChildFitSchema = z.object({
  fit_band: fitBandSchema,
  engagement_level: z.enum(['low', 'medium', 'high', 'unknown']),
  boredom_risk: z.enum(['low', 'medium', 'high', 'unknown']),
  learning_or_play_value: z.enum(['low', 'medium', 'high', 'unknown'])
}).strict();

const fatigueRiskSchema = z.object({
  level: z.enum(['low', 'medium', 'high', 'blocked']),
  drivers: z.array(z.string().min(1)),
  mitigation: z.array(z.string().min(1))
}).strict();

const restFitSchema = z.object({
  midday_rest_possible: unknownBooleanSchema,
  hotel_return_possible: unknownBooleanSchema,
  low_pace_alternative_needed: z.boolean(),
  rest_conflict_reason: z.string().min(1).nullable()
}).strict();

const parentBurdenSchema = z.object({
  level: z.enum(['low', 'medium', 'high']),
  drivers: z.array(z.string().min(1))
}).strict();

const evidenceMarkerSchema = z.object({
  claim: z.enum([
    'stroller_friendly',
    'toilet_available',
    'parking_available',
    'children_playground',
    'pool_or_facility',
    'official_age_or_safety_rule'
  ]),
  status: z.enum(['verified', 'needs_verification', 'unknown']),
  evidence_ref: z.string().min(1).optional()
}).strict().superRefine((value, ctx) => {
  if (value.status === 'verified' && !value.evidence_ref) {
    ctx.addIssue({ code: 'custom', message: 'verified facility claim requires evidence_ref' });
  }
});

export const familySuitabilityContractSchema = z.object({
  contract_id: z.literal('family_suitability_contract'),
  contract_version: z.literal('v1'),
  producer_agent: z.literal('family_suitability_agent'),
  trace_id: z.string().min(1),
  created_at: z.string().min(1),
  candidate_ref: z.object({
    type: z.enum(['destination', 'route', 'accommodation', 'activity', 'day_block']),
    id: z.string().min(1)
  }).strict(),
  family_suitability_summary: z.object({
    overall_fit_band: fitBandSchema,
    reason_codes: z.array(z.string().min(1)),
    main_risk: z.string().min(1).nullable()
  }).strict(),
  child_age_fit: z.object({
    children: z.array(childFitSchema).min(1)
  }).strict(),
  toddler_fit: toddlerFitSchema.optional(),
  older_child_fit: olderChildFitSchema.optional(),
  fatigue_risk: fatigueRiskSchema,
  rest_fit: restFitSchema,
  parent_burden: parentBurdenSchema,
  suitability_blockers: z.array(z.string().min(1)),
  suitability_warnings: z.array(z.string().min(1)),
  recommended_adjustments: z.array(z.string().min(1)).optional(),
  evidence_markers: z.array(evidenceMarkerSchema).default([]),
  confidence: z.object({
    level: confidenceSchema,
    reason: z.string().min(1)
  }).strict(),
  validation_status: z.enum(['valid', 'valid_with_warnings', 'needs_clarification', 'invalid'])
}).strict().superRefine((value, ctx) => {
  const childAges = value.child_age_fit.children.map((child) => child.age);

  if (childAges.some((age) => age <= 3) && !value.toddler_fit) {
    ctx.addIssue({ code: 'custom', message: 'toddler_fit required when child age <= 3' });
  }

  if (childAges.some((age) => age >= 4) && !value.older_child_fit) {
    ctx.addIssue({ code: 'custom', message: 'older_child_fit required when child age >= 4' });
  }

  const blocked = value.family_suitability_summary.overall_fit_band === 'blocked'
    || value.fatigue_risk.level === 'blocked'
    || value.child_age_fit.children.some((child) => child.fit_band === 'blocked');

  if (blocked && value.suitability_blockers.length === 0) {
    ctx.addIssue({ code: 'custom', message: 'blocked suitability requires blocker reason' });
  }

  if (value.confidence.level === 'low' && value.suitability_blockers.length > 0) {
    ctx.addIssue({ code: 'custom', message: 'low-confidence suitability cannot create hard blocker' });
  }
});

export type FamilySuitabilityContract = z.infer<typeof familySuitabilityContractSchema>;

export function safeParseFamilySuitability(input: unknown) {
  return familySuitabilityContractSchema.safeParse(input);
}
