import { describe, expect, it } from 'vitest';
import {
  evaluateBudget,
  evaluateRadius,
  evaluateToddlerRest,
  evaluateTravelLoad,
  evaluateWomenOnlyBeach
} from './travel-boundaries.js';

describe('H2 travel boundary policies', () => {
  it('accepts exact radius boundary', () => {
    expect(evaluateRadius({ distance_km: 150, max_radius_km: 150, far_option_requires_strong_justification: true }))
      .toEqual({ status: 'eligible', reason_codes: [] });
  });

  it('rejects just-outside radius without exceptional reason', () => {
    expect(evaluateRadius({ distance_km: 150.1, max_radius_km: 150, far_option_requires_strong_justification: true }))
      .toEqual({ status: 'ineligible', reason_codes: ['radius_exceeded_without_exceptional_reason'] });
  });

  it('allows far option only conditionally with exceptional reason', () => {
    expect(evaluateRadius({ distance_km: 165, max_radius_km: 150, far_option_requires_strong_justification: true, exceptional_reason: 'unique family attraction' }))
      .toEqual({ status: 'conditional', reason_codes: ['radius_exception_requires_review'] });
  });

  it('accepts exact hard budget boundary', () => {
    expect(evaluateBudget({ estimated_total: 30000, hard_limit: 30000, flexibility: 'strict' }))
      .toEqual({ status: 'eligible', reason_codes: [] });
  });

  it('rejects one unit over strict hard budget', () => {
    expect(evaluateBudget({ estimated_total: 30001, hard_limit: 30000, flexibility: 'strict' }))
      .toEqual({ status: 'ineligible', reason_codes: ['hard_budget_exceeded'] });
  });

  it('requires toddler midday rest when configured', () => {
    expect(evaluateToddlerRest({ child_ages: [2, 6], midday_rest_required: true, midday_rest_present: false }))
      .toEqual({ status: 'ineligible', reason_codes: ['toddler_midday_rest_missing'] });
  });

  it('does not impose toddler rule when no toddler exists', () => {
    expect(evaluateToddlerRest({ child_ages: [6], midday_rest_required: true, midday_rest_present: false }))
      .toEqual({ status: 'eligible', reason_codes: [] });
  });

  it('requires evidence for women-only beach when sea is recommended', () => {
    expect(evaluateWomenOnlyBeach({ sea_recommended: true, women_only_beach_required: true, verification_status: 'unverified' }))
      .toEqual({ status: 'needs_evidence', reason_codes: ['women_only_beach_verification_required'] });
  });

  it('rejects sea option when women-only beach verification fails', () => {
    expect(evaluateWomenOnlyBeach({ sea_recommended: true, women_only_beach_required: true, verification_status: 'failed' }))
      .toEqual({ status: 'ineligible', reason_codes: ['women_only_beach_requirement_failed'] });
  });

  it('requires a low-fatigue alternative for long drive when requested', () => {
    expect(evaluateTravelLoad({ long_drive: true, low_fatigue_required: true, low_fatigue_alternative_present: false }))
      .toEqual({ status: 'ineligible', reason_codes: ['long_drive_without_low_fatigue_alternative'] });
  });

  it('is deterministic across repeated calls', () => {
    const input = { distance_km: 151, max_radius_km: 150, far_option_requires_strong_justification: true, exceptional_reason: 'rare option' };
    expect(evaluateRadius(input)).toEqual(evaluateRadius(input));
  });
});
