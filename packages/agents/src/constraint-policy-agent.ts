export type ConstraintConfidence = 'high' | 'medium' | 'low';

export interface ConstraintPolicyInput {
  requestId: string;
  childrenAges?: readonly number[];
  budgetAmount?: number;
  womenOnlyBeachRequired?: boolean;
  seaAllowed?: boolean;
  middayRestRequired?: boolean;
  lowFatigueRequired?: boolean;
  maxDistanceKm?: number;
  maxDistanceIsFlexible?: boolean;
  manyActivitiesRequested?: boolean;
  transportMode?: 'own_car' | 'public_transport' | 'flight' | 'unknown';
}

export interface ClassifiedConstraint {
  id: string;
  confidence: ConstraintConfidence;
  evidenceRequired?: boolean;
}

export interface ConstraintPolicyResult {
  agentId: 'constraint_policy_agent';
  hardConstraints: ClassifiedConstraint[];
  softPreferences: ClassifiedConstraint[];
  policyWarnings: { id: string; severity: 'low' | 'medium' | 'high' }[];
  clarificationRequired: string[];
  rejectedInterpretations: string[];
  conflicts: string[];
  evidenceRequirements: { constraintId: string; requiredEvidenceType: string }[];
  confidence: {
    overall: ConstraintConfidence;
    unknowns: string[];
  };
}

export const CONSTRAINT_POLICY_AGENT_BOUNDARY = {
  agentId: 'constraint_policy_agent',
  allowedCapabilities: [] as const,
  callsOtherAgents: false,
  writesCanonicalMemory: false,
  producesFinalUserResponse: false,
  performsPolicyEnforcement: false
} as const;

export function runConstraintPolicyAgent(input: ConstraintPolicyInput): ConstraintPolicyResult {
  const hardConstraints: ClassifiedConstraint[] = [];
  const softPreferences: ClassifiedConstraint[] = [];
  const policyWarnings: ConstraintPolicyResult['policyWarnings'] = [];
  const clarificationRequired: string[] = [];
  const rejectedInterpretations: string[] = [];
  const conflicts: string[] = [];
  const evidenceRequirements: ConstraintPolicyResult['evidenceRequirements'] = [];
  const unknowns: string[] = [];

  if (input.childrenAges?.length) {
    hardConstraints.push({ id: 'child_age_safety', confidence: 'high' });
  } else {
    unknowns.push('children_ages');
    clarificationRequired.push('children_ages_required_for_safety');
    policyWarnings.push({ id: 'child_suitability_uncertain', severity: 'high' });
  }

  if (input.budgetAmount !== undefined) {
    hardConstraints.push({ id: 'budget_limit', confidence: 'high' });
  } else {
    unknowns.push('budget');
  }

  if (input.middayRestRequired === true) {
    hardConstraints.push({ id: 'midday_rest_required', confidence: 'high' });
  }

  if (input.lowFatigueRequired === true) {
    softPreferences.push({ id: 'low_fatigue', confidence: 'high' });
  }

  if (input.maxDistanceKm !== undefined) {
    hardConstraints.push({ id: 'max_distance_boundary', confidence: input.maxDistanceIsFlexible ? 'medium' : 'high' });
    if (input.maxDistanceIsFlexible === undefined) {
      clarificationRequired.push('max_distance_flexibility_unclear');
    }
  }

  if (input.transportMode && input.transportMode !== 'unknown') {
    hardConstraints.push({ id: 'transport_mode', confidence: 'high' });
  } else {
    unknowns.push('transport_mode');
  }

  if (input.seaAllowed && input.womenOnlyBeachRequired === true) {
    hardConstraints.push({
      id: 'women_only_beach_required_when_sea_recommended',
      confidence: 'high',
      evidenceRequired: true
    });
    policyWarnings.push({ id: 'women_only_beach_status_unverified', severity: 'high' });
    evidenceRequirements.push({
      constraintId: 'women_only_beach_required_when_sea_recommended',
      requiredEvidenceType: 'public_authority_or_official_facility_source'
    });
  } else if (input.seaAllowed && input.womenOnlyBeachRequired === undefined) {
    clarificationRequired.push('women_only_beach_requirement_unclear');
  }

  if (input.manyActivitiesRequested && input.lowFatigueRequired) {
    conflicts.push('many_activities_vs_low_fatigue');
  }

  rejectedInterpretations.push('privacy_sensitive_preferences_are_session_only_unless_explicitly_persisted');
  rejectedInterpretations.push('hard_constraints_cannot_be_converted_to_soft_scores');

  const overall: ConstraintConfidence = clarificationRequired.length > 0 || conflicts.length > 0
    ? 'medium'
    : unknowns.length > 1
      ? 'medium'
      : 'high';

  return {
    agentId: 'constraint_policy_agent',
    hardConstraints: [...hardConstraints].sort((a, b) => a.id.localeCompare(b.id)),
    softPreferences: [...softPreferences].sort((a, b) => a.id.localeCompare(b.id)),
    policyWarnings: [...policyWarnings].sort((a, b) => a.id.localeCompare(b.id)),
    clarificationRequired: [...new Set(clarificationRequired)].sort(),
    rejectedInterpretations: [...rejectedInterpretations].sort(),
    conflicts: [...new Set(conflicts)].sort(),
    evidenceRequirements: [...evidenceRequirements].sort((a, b) => a.constraintId.localeCompare(b.constraintId)),
    confidence: { overall, unknowns: [...new Set(unknowns)].sort() }
  };
}
