export type BoundaryDecisionStatus = 'eligible' | 'ineligible' | 'conditional' | 'needs_evidence';

export type BoundaryDecision = {
  status: BoundaryDecisionStatus;
  reason_codes: string[];
};

export function evaluateRadius(input: {
  distance_km: number;
  max_radius_km: number;
  far_option_requires_strong_justification: boolean;
  exceptional_reason?: string;
}): BoundaryDecision {
  if (input.distance_km <= input.max_radius_km) {
    return { status: 'eligible', reason_codes: [] };
  }
  if (!input.far_option_requires_strong_justification) {
    return { status: 'conditional', reason_codes: ['radius_exceeded'] };
  }
  if (!input.exceptional_reason?.trim()) {
    return { status: 'ineligible', reason_codes: ['radius_exceeded_without_exceptional_reason'] };
  }
  return { status: 'conditional', reason_codes: ['radius_exception_requires_review'] };
}

export function evaluateBudget(input: {
  estimated_total: number;
  hard_limit: number;
  flexibility: 'strict' | 'flexible';
}): BoundaryDecision {
  if (input.estimated_total <= input.hard_limit) {
    return { status: 'eligible', reason_codes: [] };
  }
  if (input.flexibility === 'strict') {
    return { status: 'ineligible', reason_codes: ['hard_budget_exceeded'] };
  }
  return { status: 'conditional', reason_codes: ['budget_exceeded_but_flexible'] };
}

export function evaluateToddlerRest(input: {
  child_ages: number[];
  midday_rest_required: boolean;
  midday_rest_present: boolean;
}): BoundaryDecision {
  const hasToddler = input.child_ages.some((age) => age <= 3);
  if (!hasToddler || !input.midday_rest_required) {
    return { status: 'eligible', reason_codes: [] };
  }
  if (!input.midday_rest_present) {
    return { status: 'ineligible', reason_codes: ['toddler_midday_rest_missing'] };
  }
  return { status: 'eligible', reason_codes: [] };
}

export function evaluateWomenOnlyBeach(input: {
  sea_recommended: boolean;
  women_only_beach_required: boolean;
  verification_status: 'verified' | 'unverified' | 'failed' | 'not_applicable';
}): BoundaryDecision {
  if (!input.sea_recommended || !input.women_only_beach_required) {
    return { status: 'eligible', reason_codes: [] };
  }
  if (input.verification_status === 'verified') {
    return { status: 'eligible', reason_codes: [] };
  }
  if (input.verification_status === 'failed') {
    return { status: 'ineligible', reason_codes: ['women_only_beach_requirement_failed'] };
  }
  return { status: 'needs_evidence', reason_codes: ['women_only_beach_verification_required'] };
}

export function evaluateTravelLoad(input: {
  long_drive: boolean;
  low_fatigue_required: boolean;
  low_fatigue_alternative_present: boolean;
}): BoundaryDecision {
  if (!input.long_drive || !input.low_fatigue_required) {
    return { status: 'eligible', reason_codes: [] };
  }
  if (!input.low_fatigue_alternative_present) {
    return { status: 'ineligible', reason_codes: ['long_drive_without_low_fatigue_alternative'] };
  }
  return { status: 'eligible', reason_codes: [] };
}
