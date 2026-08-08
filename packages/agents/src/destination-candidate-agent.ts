export type DistanceBucket = 'unknown' | 'under_50_km' | '50_100_km' | '100_150_km' | 'over_150_km';
export type CandidateRelation = 'primary' | 'nearby' | 'extended_radius' | 'exceptional';

export interface DestinationSeed {
  candidateId: string;
  name: string;
  type: 'city' | 'district' | 'resort_area' | 'nature_area' | 'thermal_area' | 'beach_area' | 'mixed';
  relationToTarget: CandidateRelation;
  estimatedDistanceBucket: DistanceBucket;
  likelyTripRole: 'base_stay' | 'day_trip' | 'half_day_stop' | 'backup_option';
  familyRelevanceHypothesis: string;
  exceptionalReason?: string;
  seaRelevant?: boolean;
  fatigueRisk?: 'low' | 'medium' | 'high' | 'unknown';
}

export interface DestinationCandidateInput {
  requestId: string;
  origin?: string;
  targetRegion?: string;
  durationDays?: number;
  maxRadiusKm?: number;
  allowOutOfRadius?: boolean;
  lowFatigueRequired?: boolean;
  womenOnlyBeachRequiredWhenSeaRecommended?: boolean;
  candidatePool: readonly DestinationSeed[];
}

export interface DestinationCandidate {
  candidateId: string;
  name: string;
  type: DestinationSeed['type'];
  relationToTarget: CandidateRelation;
  estimatedDistanceBucket: DistanceBucket;
  familyRelevanceHypothesis: string;
  likelyTripRole: DestinationSeed['likelyTripRole'];
  constraintNotes: string[];
  evidenceRequiredLater: string[];
  exclusionRisk: 'low' | 'medium' | 'high';
  exceptionalReason?: string;
}

export interface DestinationCandidateResult {
  agentId: 'destination_candidate_agent';
  candidateGroups: {
    groupId: 'primary_target_area' | 'near_radius_area' | 'exceptional_out_of_radius_area';
    candidates: DestinationCandidate[];
  }[];
  excludedRegions: { candidateId: string; reason: string }[];
  openQuestions: string[];
  confidence: 'high' | 'medium' | 'low';
}

export const DESTINATION_CANDIDATE_AGENT_BOUNDARY = {
  agentId: 'destination_candidate_agent',
  allowedCapabilities: [] as const,
  callsOtherAgents: false,
  writesCanonicalMemory: false,
  producesFinalUserResponse: false,
  calculatesRouteDuration: false,
  recommendsHotelsOrActivities: false
} as const;

function toCandidate(seed: DestinationSeed, input: DestinationCandidateInput): DestinationCandidate {
  const constraintNotes: string[] = [];
  const evidenceRequiredLater = ['route_distance', 'accommodation_availability_check'];

  if (seed.seaRelevant && input.womenOnlyBeachRequiredWhenSeaRecommended) {
    constraintNotes.push('women_only_beach_required_when_sea_recommended');
    evidenceRequiredLater.push('beach_privacy_suitability_check');
  }
  if (input.lowFatigueRequired) {
    constraintNotes.push('low_fatigue');
    evidenceRequiredLater.push('traffic_risk');
  }
  if (seed.type === 'beach_area' || seed.type === 'mixed') {
    evidenceRequiredLater.push('parking_availability_hint');
  }

  const exclusionRisk: DestinationCandidate['exclusionRisk'] =
    seed.relationToTarget === 'exceptional' || seed.estimatedDistanceBucket === 'over_150_km'
      ? 'high'
      : seed.fatigueRisk === 'high'
        ? 'medium'
        : 'low';

  return {
    candidateId: seed.candidateId,
    name: seed.name,
    type: seed.type,
    relationToTarget: seed.relationToTarget,
    estimatedDistanceBucket: seed.estimatedDistanceBucket,
    familyRelevanceHypothesis: seed.familyRelevanceHypothesis,
    likelyTripRole: seed.likelyTripRole,
    constraintNotes: [...new Set(constraintNotes)].sort(),
    evidenceRequiredLater: [...new Set(evidenceRequiredLater)].sort(),
    exclusionRisk,
    ...(seed.exceptionalReason ? { exceptionalReason: seed.exceptionalReason } : {})
  };
}

export function runDestinationCandidateAgent(input: DestinationCandidateInput): DestinationCandidateResult {
  const openQuestions: string[] = [];
  const excludedRegions: DestinationCandidateResult['excludedRegions'] = [];

  if (!input.origin) openQuestions.push('origin_required');
  if (!input.targetRegion) openQuestions.push('target_region_required');
  if (input.maxRadiusKm === undefined) openQuestions.push('radius_rule_required');
  if (input.lowFatigueRequired && (input.durationDays ?? 0) <= 3 && input.candidatePool.some((c) => c.fatigueRisk === 'high')) {
    openQuestions.push('broad_area_vs_low_fatigue_conflict');
  }

  const groups: DestinationCandidateResult['candidateGroups'] = [
    { groupId: 'primary_target_area', candidates: [] },
    { groupId: 'near_radius_area', candidates: [] },
    { groupId: 'exceptional_out_of_radius_area', candidates: [] }
  ];

  for (const seed of [...input.candidatePool].sort((a, b) => a.candidateId.localeCompare(b.candidateId))) {
    const outOfRadius = seed.estimatedDistanceBucket === 'over_150_km' || seed.relationToTarget === 'exceptional';
    if (outOfRadius) {
      if (!input.allowOutOfRadius) {
        excludedRegions.push({ candidateId: seed.candidateId, reason: 'out_of_radius_not_allowed' });
        continue;
      }
      if (!seed.exceptionalReason) {
        excludedRegions.push({ candidateId: seed.candidateId, reason: 'exceptional_reason_required' });
        continue;
      }
    }

    const candidate = toCandidate(seed, input);
    if (seed.relationToTarget === 'primary') groups[0]!.candidates.push(candidate);
    else if (outOfRadius) groups[2]!.candidates.push(candidate);
    else groups[1]!.candidates.push(candidate);
  }

  for (const group of groups) group.candidates.sort((a, b) => a.candidateId.localeCompare(b.candidateId));
  excludedRegions.sort((a, b) => a.candidateId.localeCompare(b.candidateId));

  const confidence: DestinationCandidateResult['confidence'] = openQuestions.length > 0
    ? 'low'
    : groups[2]!.candidates.length > 0
      ? 'medium'
      : 'high';

  return {
    agentId: 'destination_candidate_agent',
    candidateGroups: groups,
    excludedRegions,
    openQuestions: [...new Set(openQuestions)].sort(),
    confidence
  };
}
