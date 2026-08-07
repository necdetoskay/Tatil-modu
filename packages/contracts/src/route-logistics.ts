import { z } from 'zod';

const confidenceSchema = z.enum(['low', 'medium', 'high']);
const routeRiskSchema = z.enum(['low', 'medium', 'high', 'unknown', 'needs_verification', 'weekend_sensitive']);

const verificationItemSchema = z.enum(['verified', 'needs_verification', 'unknown', 'not_required']);

const evidenceRefSchema = z.object({
  claim: z.enum(['exact_distance', 'exact_drive_time', 'parking_availability', 'live_traffic', 'toll_or_fee', 'road_closure', 'ferry_schedule', 'public_transport']),
  evidence_id: z.string().min(1),
}).strict();

const routeProfileSchema = z.object({
  destination_id: z.string().min(1),
  destination_name: z.string().min(1),
  origin: z.string().min(1),
  route_distance_band: z.enum(['short', 'medium', 'long', 'very_long', 'unknown']),
  drive_time_band: z.enum(['short', 'medium', 'long', 'very_long', 'unknown']),
  route_burden_level: z.enum(['low', 'moderate', 'high', 'blocked']),
  child_fatigue_risk: z.enum(['low', 'medium', 'high', 'blocked']),
  parking_risk: routeRiskSchema,
  traffic_risk: routeRiskSchema,
  rest_stop_need: z.enum(['none', 'optional', 'recommended', 'required']),
  midday_rest_compatibility: z.enum(['compatible', 'compatible_if_afternoon_light', 'conflict', 'unknown']),
  verification_status: z.object({
    distance: verificationItemSchema,
    drive_time: verificationItemSchema,
    parking: verificationItemSchema,
    traffic: verificationItemSchema.optional(),
  }).strict(),
  confidence: z.object({
    value: confidenceSchema,
    reasons: z.array(z.string().min(1)),
  }).strict(),
  exact_distance_km: z.number().positive().optional(),
  exact_drive_time_minutes: z.number().int().positive().optional(),
  parking_available: z.boolean().optional(),
  evidence_refs: z.array(evidenceRefSchema).default([]),
  blocker_reasons: z.array(z.string().min(1)).default([]),
  route_notes: z.array(z.string().min(1)).optional(),
}).strict().superRefine((value, ctx) => {
  const hasEvidence = (claim: z.infer<typeof evidenceRefSchema>['claim']) =>
    value.evidence_refs.some((ref) => ref.claim === claim);

  if (value.exact_drive_time_minutes !== undefined && !hasEvidence('exact_drive_time')) {
    ctx.addIssue({ code: 'custom', path: ['exact_drive_time_minutes'], message: 'Exact drive time requires evidence.' });
  }
  if (value.exact_distance_km !== undefined && !hasEvidence('exact_distance')) {
    ctx.addIssue({ code: 'custom', path: ['exact_distance_km'], message: 'Exact distance requires evidence.' });
  }
  if (value.parking_available !== undefined && !hasEvidence('parking_availability')) {
    ctx.addIssue({ code: 'custom', path: ['parking_available'], message: 'Parking availability requires evidence.' });
  }
  if ((value.route_burden_level === 'blocked' || value.child_fatigue_risk === 'blocked') && value.blocker_reasons.length === 0) {
    ctx.addIssue({ code: 'custom', path: ['blocker_reasons'], message: 'Blocked route/fatigue assessment requires a reason.' });
  }
  if (value.confidence.value === 'low' && (value.route_burden_level === 'blocked' || value.child_fatigue_risk === 'blocked')) {
    ctx.addIssue({ code: 'custom', path: ['confidence'], message: 'Low-confidence assessment cannot create a hard blocker.' });
  }
  if (value.midday_rest_compatibility === 'conflict' && value.route_burden_level === 'low') {
    ctx.addIssue({ code: 'custom', path: ['route_burden_level'], message: 'Midday-rest conflict cannot be represented as low route burden.' });
  }
});

export const routeLogisticsEnvelopeSchema = z.object({
  contract_id: z.literal('route_logistics_contract'),
  contract_version: z.literal('0.1.0'),
  producer_agent: z.literal('route_logistics_agent'),
  trace_id: z.string().min(1),
  validation_status: z.enum(['valid', 'valid_with_warnings', 'needs_clarification', 'invalid']),
  logistics_scope_summary: z.object({
    origin: z.string().min(1),
    transport_mode: z.enum(['private_car', 'public_transport', 'mixed']),
  }).strict(),
  destination_route_profiles: z.array(routeProfileSchema).min(1),
  logistics_blockers: z.array(z.string().min(1)),
  logistics_warnings: z.array(z.string().min(1)),
  verification_needs: z.array(z.string().min(1)),
  clarification_requirements: z.array(z.string().min(1)),
}).strict();

export type RouteLogisticsEnvelope = z.infer<typeof routeLogisticsEnvelopeSchema>;

export function parseRouteLogistics(input: unknown): RouteLogisticsEnvelope {
  return routeLogisticsEnvelopeSchema.parse(input);
}

export function safeParseRouteLogistics(input: unknown) {
  return routeLogisticsEnvelopeSchema.safeParse(input);
}
