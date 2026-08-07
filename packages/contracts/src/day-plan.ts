import { z } from 'zod';

const confidenceSchema = z.enum(['low', 'medium', 'high']);
const blockTypeSchema = z.enum(['travel','activity','light_activity','rest','meal','low_fatigue_evening','indoor_backup','free_time']);
const verificationNeedSchema = z.object({
  verification_id: z.string().min(1),
  claim_type: z.string().min(1),
  affected_day: z.number().int().positive(),
  affected_block: z.enum(['morning_block','lunch_rest_block','afternoon_block','evening_block']),
  reason: z.string().min(1),
  severity: z.enum(['low','medium','high','blocking']),
  must_verify_before_final: z.boolean()
}).strict();

const planBlockSchema = z.object({
  block_type: blockTypeSchema,
  candidate_refs: z.array(z.string().min(1)).default([]),
  notes: z.array(z.string().min(1)).default([]),
  empty_reason: z.string().min(1).optional(),
  exact_price: z.object({ amount: z.number().nonnegative(), currency: z.string().length(3), evidence_refs: z.array(z.string().min(1)).min(1) }).strict().optional(),
  exact_opening_hours: z.object({ value: z.string().min(1), evidence_refs: z.array(z.string().min(1)).min(1) }).strict().optional(),
  parking_confirmed: z.object({ value: z.boolean(), evidence_refs: z.array(z.string().min(1)).min(1) }).strict().optional(),
  women_only_beach_confirmed: z.object({ value: z.boolean(), evidence_refs: z.array(z.string().min(1)).min(1) }).strict().optional(),
  weather_safe: z.object({ value: z.boolean(), evidence_refs: z.array(z.string().min(1)).min(1) }).strict().optional()
}).strict();

const primaryPlanSchema = z.object({
  morning_block: planBlockSchema.nullable(),
  lunch_rest_block: planBlockSchema.nullable(),
  afternoon_block: planBlockSchema.nullable(),
  evening_block: planBlockSchema.nullable()
}).strict();

const alternativeSchema = z.object({
  alternative_id: z.string().min(1),
  alternative_type: z.enum(['bad_weather','low_fatigue','budget_sensitive','privacy_sensitive','child_friendly']),
  replacement_blocks: z.array(z.enum(['morning_block','lunch_rest_block','afternoon_block','evening_block'])).min(1)
}).strict();

const dailyPlanSchema = z.object({
  day_number: z.number().int().positive(),
  day_theme: z.string().min(1).optional(),
  primary_plan: primaryPlanSchema,
  alternatives: z.array(alternativeSchema).min(2).max(3),
  day_constraints_applied: z.array(z.string().min(1)),
  day_warnings: z.array(z.string().min(1)).default([]),
  verification_needs: z.array(verificationNeedSchema),
  confidence: z.object({ value: confidenceSchema, reasons: z.array(z.string().min(1)) }).strict(),
  long_drive_day: z.boolean().default(false),
  weather_sensitive_day: z.boolean().default(false),
  contains_sea_activity: z.boolean().default(false),
  privacy_requirement_applies: z.boolean().default(false),
  hard_constraint_violation: z.boolean().default(false)
}).strict().superRefine((day, ctx) => {
  if (day.hard_constraint_violation) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'hard constraint violation forbidden' });
  if (day.long_drive_day && !day.alternatives.some((a) => a.alternative_type === 'low_fatigue')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'long drive day requires low-fatigue alternative' });
  }
  if (day.weather_sensitive_day && !day.alternatives.some((a) => a.alternative_type === 'bad_weather' || a.alternative_type === 'low_fatigue')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'weather-sensitive day requires backup alternative' });
  }
  if (day.contains_sea_activity && day.privacy_requirement_applies && !day.verification_needs.some((v) => v.claim_type === 'women_only_beach_status' && v.must_verify_before_final)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'sea privacy requirement requires women-only beach verification' });
  }
});

export const dayPlanContractSchema = z.object({
  contract_name: z.literal('day_plan_contract'),
  contract_version: z.literal('0.1.0'),
  producer_agent: z.literal('day_plan_composer_agent'),
  trace_id: z.string().min(1),
  request_id: z.string().min(1),
  traveler_group: z.object({
    adults: z.number().int().nonnegative(),
    children: z.array(z.object({ age: z.number().int().min(0).max(17) }).strict())
  }).strict(),
  plan_summary: z.object({
    total_days: z.number().int().positive(),
    plan_style: z.string().min(1),
    contains_sea_activity: z.boolean(),
    contains_privacy_sensitive_activity: z.boolean(),
    verification_required_before_final: z.boolean()
  }).strict(),
  daily_plans: z.array(dailyPlanSchema).min(1),
  global_plan_warnings: z.array(z.string().min(1)).default([]),
  unresolved_questions: z.array(z.string().min(1)).default([]),
  internal_notes_not_for_user: z.array(z.string().min(1)).default([]),
  confidence: z.object({ value: confidenceSchema, reasons: z.array(z.string().min(1)) }).strict()
}).strict().superRefine((plan, ctx) => {
  if (plan.daily_plans.length !== plan.plan_summary.total_days) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'daily plan count must match total days' });
  }
  const toddlerPresent = plan.traveler_group.children.some((child) => child.age <= 3);
  if (toddlerPresent) {
    plan.daily_plans.forEach((day, index) => {
      if (!day.primary_plan.lunch_rest_block || day.primary_plan.lunch_rest_block.block_type !== 'rest') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['daily_plans', index, 'primary_plan', 'lunch_rest_block'], message: 'toddler requires lunch rest block' });
      }
    });
  }
  const anySea = plan.daily_plans.some((d) => d.contains_sea_activity);
  if (anySea !== plan.plan_summary.contains_sea_activity) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'sea activity summary mismatch' });
  }
});

export type DayPlanContract = z.infer<typeof dayPlanContractSchema>;
export const safeParseDayPlan = (input: unknown) => dayPlanContractSchema.safeParse(input);
export const parseDayPlan = (input: unknown): DayPlanContract => dayPlanContractSchema.parse(input);
