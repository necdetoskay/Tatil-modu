import { z } from 'zod';

const verificationDisclosureSchema = z.object({
  disclosure_id: z.string().min(1),
  claim_category: z.string().min(1),
  status: z.enum(['verified', 'unverified', 'stale', 'blocked']),
  message: z.string().min(1),
  source_evidence_item_ids: z.array(z.string().min(1)),
  must_verify_before_trip: z.boolean()
}).strict().superRefine((value, ctx) => {
  if (value.status === 'verified' && value.source_evidence_item_ids.length === 0) {
    ctx.addIssue({ code: 'custom', path: ['source_evidence_item_ids'], message: 'Verified disclosure requires evidence references.' });
  }
});

const responseBlockSchema = z.object({
  title: z.string().min(1),
  candidate_refs: z.array(z.string().min(1)).default([]),
  verification_needed: z.array(z.string().min(1)).default([]),
  notes: z.array(z.string().min(1)).default([])
}).strict();

const dayCardSchema = z.object({
  day_number: z.number().int().positive(),
  day_theme: z.string().min(1),
  primary_plan: z.object({
    morning_block: responseBlockSchema,
    lunch_rest_block: responseBlockSchema,
    afternoon_block: responseBlockSchema,
    evening_block: responseBlockSchema
  }).strict(),
  alternatives: z.array(z.object({ title: z.string().min(1) }).strict()).min(2).max(3),
  family_fit_notes: z.array(z.string().min(1)),
  verification_needed: z.array(z.string().min(1)),
  warnings: z.array(z.string().min(1))
}).strict();

export const finalResponseContractSchema = z.object({
  contract_id: z.literal('final_response_contract'),
  contract_version: z.literal('0.1.0'),
  producer_agent: z.literal('final_response_composer_agent'),
  trace_id: z.string().min(1),
  validation_status: z.enum(['pass', 'pass_with_warnings', 'blocked']),
  upstream_verification_report_id: z.string().min(1),
  upstream_hard_blockers: z.array(z.string().min(1)),
  upstream_final_response_rules: z.array(z.string().min(1)),
  final_response: z.object({
    response_title: z.string().min(1),
    executive_summary: z.string().min(1),
    plan_overview: z.object({
      duration_days: z.number().int().positive(),
      travel_style: z.string().min(1),
      contains_sea_activity: z.boolean(),
      privacy_constraint_active: z.boolean()
    }).strict(),
    daily_plan_cards: z.array(dayCardSchema).min(1),
    verification_disclosures: z.array(verificationDisclosureSchema),
    hard_blockers: z.array(z.string().min(1)),
    unresolved_questions: z.array(z.string().min(1)),
    confidence_summary: z.object({
      overall_confidence: z.enum(['low', 'medium', 'high']),
      confidence_reasons: z.array(z.string().min(1)),
      low_confidence_sections: z.array(z.string().min(1)),
      user_should_verify_before_trip: z.array(z.string().min(1))
    }).strict(),
    assumption_notice: z.object({ assumptions: z.array(z.string().min(1)) }).strict().optional(),
    user_action_checklist: z.array(z.string().min(1)).optional()
  }).strict()
}).strict().superRefine((value, ctx) => {
  const response = value.final_response;
  if (response.daily_plan_cards.length !== response.plan_overview.duration_days) {
    ctx.addIssue({ code: 'custom', path: ['final_response', 'daily_plan_cards'], message: 'Day-card count must equal duration_days.' });
  }
  const missingBlocker = value.upstream_hard_blockers.some((b) => !response.hard_blockers.includes(b));
  if (missingBlocker) {
    ctx.addIssue({ code: 'custom', path: ['final_response', 'hard_blockers'], message: 'Final response cannot hide upstream hard blockers.' });
  }
  if (value.upstream_hard_blockers.length > 0 && value.validation_status !== 'blocked') {
    ctx.addIssue({ code: 'custom', path: ['validation_status'], message: 'Upstream hard blockers require blocked final-response status.' });
  }
  if (value.upstream_hard_blockers.length > 0 && response.confidence_summary.overall_confidence !== 'low') {
    ctx.addIssue({ code: 'custom', path: ['final_response', 'confidence_summary', 'overall_confidence'], message: 'Hard blockers require low confidence.' });
  }
  if (response.confidence_summary.overall_confidence === 'low' && response.confidence_summary.user_should_verify_before_trip.length === 0) {
    ctx.addIssue({ code: 'custom', path: ['final_response', 'confidence_summary', 'user_should_verify_before_trip'], message: 'Low confidence must include visible verification guidance.' });
  }
  if (response.plan_overview.contains_sea_activity && response.plan_overview.privacy_constraint_active) {
    const privacyDisclosure = response.verification_disclosures.some((d) => d.claim_category === 'women_only_beach_status');
    if (!privacyDisclosure) {
      ctx.addIssue({ code: 'custom', path: ['final_response', 'verification_disclosures'], message: 'Sea plan with privacy constraint requires women-only beach disclosure.' });
    }
  }
  const requiredRules = value.upstream_final_response_rules;
  if (requiredRules.includes('do_not_present_women_only_beach_claim_as_verified')) {
    const invalid = response.verification_disclosures.some((d) => d.claim_category === 'women_only_beach_status' && d.status === 'verified' && d.source_evidence_item_ids.length === 0);
    if (invalid) ctx.addIssue({ code: 'custom', path: ['final_response', 'verification_disclosures'], message: 'Women-only beach cannot be upgraded to verified without evidence.' });
  }
});

export type FinalResponseContract = z.infer<typeof finalResponseContractSchema>;
export const parseFinalResponse = (input: unknown): FinalResponseContract => finalResponseContractSchema.parse(input);
export const safeParseFinalResponse = (input: unknown) => finalResponseContractSchema.safeParse(input);
