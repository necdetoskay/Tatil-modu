export type SuitabilityLevel = 'suitable' | 'suitable_with_cautions' | 'unsuitable' | 'needs_more_info';
export type FitLevel = 'good' | 'caution' | 'poor' | 'unknown';
export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FamilyCandidateInput {
  candidateId: string;
  candidateType: 'destination' | 'route' | 'activity' | 'accommodation' | 'day_block';
  childrenAges?: readonly number[];
  middayRestRequired?: boolean;
  lowFatigueRequired?: boolean;
  estimatedDurationMinutes?: number;
  walkingLevel?: 'low' | 'medium' | 'high' | 'unknown';
  restOpportunity?: 'good' | 'limited' | 'none' | 'unknown';
  childFacilitySignals?: readonly string[];
  safetyRisk?: 'low' | 'medium' | 'high' | 'unknown';
  ageSuitabilityKnown?: boolean;
}

export interface FamilySuitabilityResult {
  agentId: 'family_suitability_agent';
  candidateId: string;
  suitabilityLevel: SuitabilityLevel;
  fatigueRisk: RiskLevel;
  toddlerFit: FitLevel;
  childAge6Fit: FitLevel;
  restFit: FitLevel;
  parentBurden: RiskLevel;
  safetyNotes: string[];
  requiredAdjustments: string[];
  rejectionReasons: string[];
  clarificationNeeded: string[];
  evidenceNeeds: string[];
  confidence: ConfidenceLevel;
}

export const FAMILY_SUITABILITY_AGENT_BOUNDARY = {
  agentId: 'family_suitability_agent',
  allowedCapabilities: [] as const,
  callsOtherAgents: false,
  writesCanonicalMemory: false,
  producesFinalUserResponse: false,
  discoversCandidates: false
} as const;

export function runFamilySuitabilityAgent(input: FamilyCandidateInput): FamilySuitabilityResult {
  const ages = input.childrenAges ?? [];
  const hasToddler = ages.some((age) => age <= 2);
  const hasSix = ages.some((age) => age === 6);
  const safetyNotes: string[] = [];
  const requiredAdjustments: string[] = [];
  const rejectionReasons: string[] = [];
  const clarificationNeeded: string[] = [];
  const evidenceNeeds: string[] = [];

  if (ages.length === 0) clarificationNeeded.push('children_ages_required');
  if (input.estimatedDurationMinutes === undefined) evidenceNeeds.push('duration_estimate');
  if (!input.walkingLevel || input.walkingLevel === 'unknown') evidenceNeeds.push('walking_effort_estimate');
  if (!input.restOpportunity || input.restOpportunity === 'unknown') evidenceNeeds.push('rest_facility_signal');
  if (!input.ageSuitabilityKnown) evidenceNeeds.push('child_age_suitability_source');

  let toddlerFit: FitLevel = hasToddler ? 'good' : 'unknown';
  let childAge6Fit: FitLevel = hasSix ? 'good' : 'unknown';
  let restFit: FitLevel = input.restOpportunity === 'good' ? 'good' : input.restOpportunity === 'limited' ? 'caution' : input.restOpportunity === 'none' ? 'poor' : 'unknown';
  let fatigueRisk: RiskLevel = 'low';
  let parentBurden: RiskLevel = 'low';

  if (input.walkingLevel === 'high') {
    fatigueRisk = 'high';
    parentBurden = hasToddler ? 'high' : 'medium';
    if (hasToddler) {
      toddlerFit = input.restOpportunity === 'none' ? 'poor' : 'caution';
      safetyNotes.push('toddler_long_walk_fatigue_risk');
    }
  } else if (input.walkingLevel === 'medium') {
    fatigueRisk = 'medium';
    parentBurden = hasToddler ? 'medium' : 'low';
    if (hasToddler) toddlerFit = 'caution';
  }

  if (input.estimatedDurationMinutes !== undefined && input.estimatedDurationMinutes > 180) {
    fatigueRisk = 'high';
    if (hasToddler) toddlerFit = input.restOpportunity === 'good' ? 'caution' : 'poor';
  }

  if (input.middayRestRequired && input.restOpportunity === 'none') {
    restFit = 'poor';
    rejectionReasons.push('midday_rest_required_but_unavailable');
  } else if (input.middayRestRequired && input.restOpportunity === 'limited') {
    restFit = 'caution';
    requiredAdjustments.push('add_explicit_midday_rest_block');
  }

  if (input.safetyRisk === 'high') {
    rejectionReasons.push('high_safety_risk');
    safetyNotes.push('candidate_has_high_safety_risk');
  }

  if (input.lowFatigueRequired && fatigueRisk === 'high') {
    requiredAdjustments.push('replace_with_lower_fatigue_alternative');
  }

  const hardFamilyFailure = rejectionReasons.length > 0 || (hasToddler && toddlerFit === 'poor' && input.restOpportunity === 'none');
  if (hasToddler && toddlerFit === 'poor' && input.restOpportunity === 'none') {
    rejectionReasons.push('toddler_poor_fit_without_rest');
  }

  const missingCriticalInfo = ages.length === 0 || input.candidateType === 'activity' && (!input.ageSuitabilityKnown || !input.walkingLevel || input.walkingLevel === 'unknown');

  let suitabilityLevel: SuitabilityLevel;
  if (hardFamilyFailure) suitabilityLevel = 'unsuitable';
  else if (missingCriticalInfo) suitabilityLevel = 'needs_more_info';
  else if (fatigueRisk === 'high' || toddlerFit === 'caution' || restFit === 'caution' || requiredAdjustments.length > 0) suitabilityLevel = 'suitable_with_cautions';
  else suitabilityLevel = 'suitable';

  const confidence: ConfidenceLevel = hardFamilyFailure && input.safetyRisk === 'high'
    ? 'high'
    : evidenceNeeds.length > 0 || clarificationNeeded.length > 0
      ? 'low'
      : 'high';

  return {
    agentId: 'family_suitability_agent',
    candidateId: input.candidateId,
    suitabilityLevel,
    fatigueRisk,
    toddlerFit,
    childAge6Fit,
    restFit,
    parentBurden,
    safetyNotes: [...new Set(safetyNotes)].sort(),
    requiredAdjustments: [...new Set(requiredAdjustments)].sort(),
    rejectionReasons: [...new Set(rejectionReasons)].sort(),
    clarificationNeeded: [...new Set(clarificationNeeded)].sort(),
    evidenceNeeds: [...new Set(evidenceNeeds)].sort(),
    confidence
  };
}
