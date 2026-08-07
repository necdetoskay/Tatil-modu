import { describe, expect, it } from 'vitest';
import fixture from '../../test-fixtures/contracts/day-plan/TM-DP-HP-001.json' with { type: 'json' };
import { safeParseDayPlan } from '@tatil-modu/contracts';

describe('H1 day plan contract', () => {
  it('accepts the canonical happy-path fixture', () => {
    expect(safeParseDayPlan(fixture).success).toBe(true);
  });

  it('requires 2 to 3 alternatives per day', () => {
    const input = structuredClone(fixture) as any;
    input.daily_plans[0].alternatives = [input.daily_plans[0].alternatives[0]];
    expect(safeParseDayPlan(input).success).toBe(false);
  });

  it('requires lunch rest when toddler is present', () => {
    const input = structuredClone(fixture) as any;
    input.daily_plans[0].primary_plan.lunch_rest_block = null;
    expect(safeParseDayPlan(input).success).toBe(false);
  });

  it('requires women-only beach verification when sea privacy constraint applies', () => {
    const input = structuredClone(fixture) as any;
    input.daily_plans[0].verification_needs = [];
    expect(safeParseDayPlan(input).success).toBe(false);
  });

  it('requires low-fatigue alternative on long-drive day', () => {
    const input = structuredClone(fixture) as any;
    input.daily_plans[0].alternatives = input.daily_plans[0].alternatives.filter((a: any) => a.alternative_type !== 'low_fatigue');
    input.daily_plans[0].alternatives.push({ alternative_id: 'alt-child', alternative_type: 'child_friendly', replacement_blocks: ['afternoon_block'] });
    expect(safeParseDayPlan(input).success).toBe(false);
  });

  it('rejects hard-constraint violation', () => {
    const input = structuredClone(fixture) as any;
    input.daily_plans[0].hard_constraint_violation = true;
    expect(safeParseDayPlan(input).success).toBe(false);
  });

  it('rejects exact price without evidence', () => {
    const input = structuredClone(fixture) as any;
    input.daily_plans[0].primary_plan.afternoon_block.exact_price = { amount: 500, currency: 'TRY', evidence_refs: [] };
    expect(safeParseDayPlan(input).success).toBe(false);
  });

  it('requires daily plan count to match summary total_days', () => {
    const input = structuredClone(fixture) as any;
    input.plan_summary.total_days = 2;
    expect(safeParseDayPlan(input).success).toBe(false);
  });
});
