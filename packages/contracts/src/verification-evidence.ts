import { z } from 'zod';

const verificationStatusSchema = z.enum(['verified', 'unverified', 'partially_verified', 'stale', 'failed', 'unknown']);
const blockingLevelSchema = z.enum(['none', 'soft_warning', 'hard_blocker']);
const userVisibleStatusSchema = z.enum(['may_hide', 'must_show_as_unverified', 'may_show_as_verified']);
const confidenceSchema = z.object({
  value: z.enum(['low', 'medium', 'high']),
  reasons: z.array(z.string().min(1))
}).strict();

const evidenceItemSchema = z.object({
  evidence_item_id: z.string().min(1),
  claim_id: z.string().min(1),
  claim_text: z.string().min(1),
  claim_category: z.enum([
    'opening_hours',
    'ticket_price',
    'hotel_price',
    'live_availability',
    'parking_availability',
    'drive_time',
    'traffic_condition',
    'weather_condition',
    'women_only_beach_status',
    'pool_or_spa_facility',
    'child_age_restriction',
    'official_rule',
    'ferry_schedule',
    'toll_cost',
    'distance_or_radius'
  ]),
  verification_status: verificationStatusSchema,
  required_source_type: z.string().min(1),
  acceptable_source_types: z.array(z.string().min(1)).default([]),
  freshness_requirement: z.string().min(1),
  user_visible_status: userVisibleStatusSchema,
  confidence_impact: z.enum(['low', 'medium', 'high']),
  blocking_level: blockingLevelSchema,
  notes: z.array(z.string().min(1)).default([])
}).strict().superRefine((value, ctx) => {
  if (value.verification_status !== 'verified' && value.user_visible_status !== 'must_show_as_unverified') {
    ctx.addIssue({ code: 'custom', path: ['user_visible_status'], message: 'Unverified claims must be user-visible as unverified.' });
  }
  if (value.verification_status === 'verified' && value.user_visible_status === 'must_show_as_unverified') {
    ctx.addIssue({ code: 'custom', path: ['user_visible_status'], message: 'Verified claims cannot be forced to unverified display.' });
  }
  if (value.blocking_level === 'hard_blocker' && value.verification_status === 'verified') {
    ctx.addIssue({ code: 'custom', path: ['blocking_level'], message: 'Verified claim cannot remain a hard evidence blocker.' });
  }
});

export const verificationEvidenceReportSchema = z.object({
  report_id: z.string().min(1),
  contract_version: z.literal('1.0'),
  generated_from_contracts: z.array(z.string().min(1)).min(1),
  evidence_items: z.array(evidenceItemSchema),
  unresolved_evidence_gaps: z.array(z.string().min(1)),
  hard_blockers: z.array(z.string().min(1)),
  soft_warnings: z.array(z.string().min(1)).default([]),
  final_response_rules: z.array(z.string().min(1)),
  confidence: confidenceSchema,
  validation_status: z.enum(['valid', 'needs_verification', 'blocked', 'invalid'])
}).strict().superRefine((value, ctx) => {
  const ids = new Set(value.evidence_items.map((item) => item.evidence_item_id));
  for (const gap of value.unresolved_evidence_gaps) {
    if (!ids.has(gap)) {
      ctx.addIssue({ code: 'custom', path: ['unresolved_evidence_gaps'], message: `Unknown evidence gap: ${gap}` });
    }
  }

  const hardGapItems = value.evidence_items.filter((item) => item.blocking_level === 'hard_blocker' && item.verification_status !== 'verified');
  if (hardGapItems.length > 0) {
    if (value.hard_blockers.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['hard_blockers'], message: 'Unresolved hard evidence gaps require a hard blocker.' });
    }
    if (value.validation_status !== 'blocked') {
      ctx.addIssue({ code: 'custom', path: ['validation_status'], message: 'Unresolved hard evidence gaps require blocked status.' });
    }
    if (value.confidence.value !== 'low') {
      ctx.addIssue({ code: 'custom', path: ['confidence', 'value'], message: 'Hard evidence gaps require low confidence.' });
    }
    if (value.final_response_rules.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['final_response_rules'], message: 'Hard evidence gaps require final-response restrictions.' });
    }
  }

  const womenOnlyGap = value.evidence_items.some((item) => item.claim_category === 'women_only_beach_status' && item.verification_status !== 'verified');
  if (womenOnlyGap && !value.final_response_rules.some((rule) => rule.includes('women_only_beach'))) {
    ctx.addIssue({ code: 'custom', path: ['final_response_rules'], message: 'Women-only beach uncertainty requires an explicit final-response rule.' });
  }
});

export type VerificationEvidenceReport = z.infer<typeof verificationEvidenceReportSchema>;

export function parseVerificationEvidence(input: unknown): VerificationEvidenceReport {
  return verificationEvidenceReportSchema.parse(input);
}

export function safeParseVerificationEvidence(input: unknown) {
  return verificationEvidenceReportSchema.safeParse(input);
}
