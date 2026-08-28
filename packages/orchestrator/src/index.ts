import {
  runConstraintPolicyAgent,
  runDestinationCandidateAgent,
  runFamilySuitabilityAgent,
  runRouteLogisticsAgent,
  type DestinationSeed,
  type RouteEvidenceInput
} from '../../agents/src/index.js';
import {
  composeVerifiedFinalPlan,
  FinalCompositionBlockedError
} from '../../quality/src/index.js';
import {
  verifyRuntimePlan,
  type RuntimeEvidenceInput,
  type RuntimePlanSnapshot
} from '../../verification/src/index.js';

export const ORCHESTRATOR_PACKAGE = '@tatil-modu/orchestrator' as const;

export interface HeadlessTripPlanInput {
  traceId: string;
  origin: string;
  targetRegion: string;
  durationDays: number;
  childrenAges: readonly number[];
  budgetAmount: number;
  maxRadiusKm: number;
  lowFatigueRequired: boolean;
  middayRestRequired: boolean;
  womenOnlyBeachRequiredWhenSeaRecommended: boolean;
  candidatePool: readonly DestinationSeed[];
  routes: readonly RouteEvidenceInput[];
  evidence?: RuntimeEvidenceInput;
}

export interface OrchestrationTraceEntry {
  stage: 'constraint_policy' | 'destination_discovery' | 'family_suitability' | 'route_logistics' | 'verification' | 'final_composition';
  componentId: string;
  status: 'completed' | 'blocked';
}

export type HeadlessTripPlanResult = {
  traceId: string;
  status: 'completed' | 'blocked';
  trace: OrchestrationTraceEntry[];
  verification: ReturnType<typeof verifyRuntimePlan>['report'];
  finalResponse: ReturnType<typeof composeVerifiedFinalPlan> | null;
};

export function runHeadlessTripPlan(input: HeadlessTripPlanInput): HeadlessTripPlanResult {
  const trace: OrchestrationTraceEntry[] = [];
  const policy = runConstraintPolicyAgent({
    requestId: input.traceId,
    childrenAges: input.childrenAges,
    budgetAmount: input.budgetAmount,
    womenOnlyBeachRequired: input.womenOnlyBeachRequiredWhenSeaRecommended,
    seaAllowed: true,
    middayRestRequired: input.middayRestRequired,
    lowFatigueRequired: input.lowFatigueRequired,
    maxDistanceKm: input.maxRadiusKm,
    maxDistanceIsFlexible: false,
    transportMode: 'own_car'
  });
  trace.push({ stage: 'constraint_policy', componentId: policy.agentId, status: 'completed' });

  const destinations = runDestinationCandidateAgent({
    requestId: input.traceId,
    origin: input.origin,
    targetRegion: input.targetRegion,
    durationDays: input.durationDays,
    maxRadiusKm: input.maxRadiusKm,
    allowOutOfRadius: false,
    lowFatigueRequired: input.lowFatigueRequired,
    womenOnlyBeachRequiredWhenSeaRecommended: input.womenOnlyBeachRequiredWhenSeaRecommended,
    candidatePool: input.candidatePool
  });
  trace.push({ stage: 'destination_discovery', componentId: destinations.agentId, status: 'completed' });

  const routeResult = runRouteLogisticsAgent({
    traceId: input.traceId,
    origin: input.origin,
    transportMode: 'private_car',
    childrenAges: input.childrenAges,
    lowFatigueRequired: input.lowFatigueRequired,
    middayRestRequired: input.middayRestRequired,
    routes: input.routes
  });

  const allCandidates = destinations.candidateGroups.flatMap((group) => group.candidates);
  const familyResults = allCandidates.map((candidate) => {
    const route = input.routes.find((item) => item.destinationId === candidate.candidateId);
    return runFamilySuitabilityAgent({
      candidateId: candidate.candidateId,
      candidateType: 'destination',
      childrenAges: input.childrenAges,
      middayRestRequired: input.middayRestRequired,
      lowFatigueRequired: input.lowFatigueRequired,
      ...(route?.exactDriveTimeMinutes !== undefined
        ? { estimatedDurationMinutes: route.exactDriveTimeMinutes }
        : {}),
      walkingLevel: 'low',
      restOpportunity: 'good',
      childFacilitySignals: ['family_rest_area'],
      safetyRisk: 'low',
      ageSuitabilityKnown: true
    });
  });
  trace.push({ stage: 'family_suitability', componentId: 'family_suitability_agent', status: 'completed' });
  trace.push({ stage: 'route_logistics', componentId: routeResult.producer_agent, status: 'completed' });

  const eligible = allCandidates
    .map((candidate) => ({
      candidate,
      family: familyResults.find((item) => item.candidateId === candidate.candidateId),
      route: routeResult.destination_route_profiles.find((item) => item.destination_id === candidate.candidateId),
      seed: input.candidatePool.find((item) => item.candidateId === candidate.candidateId)
    }))
    .filter((item) => item.family && item.route)
    .sort((a, b) => {
      const riskOrder = { low: 0, medium: 1, high: 2 } as const;
      return riskOrder[a.candidate.exclusionRisk] - riskOrder[b.candidate.exclusionRisk]
        || a.candidate.candidateId.localeCompare(b.candidate.candidateId);
    });
  const selected = eligible[0];
  const snapshot: RuntimePlanSnapshot = {
    traceId: input.traceId,
    durationDays: input.durationDays,
    privacyConstraintActive: input.womenOnlyBeachRequiredWhenSeaRecommended,
    policyClarifications: policy.clarificationRequired,
    policyConflicts: policy.conflicts,
    destinationOpenQuestions: destinations.openQuestions,
    selectedCandidate: selected && selected.family && selected.route
      ? {
          candidateId: selected.candidate.candidateId,
          name: selected.candidate.name,
          containsSeaActivity: selected.seed?.seaRelevant === true,
          familySuitability: selected.family.suitabilityLevel,
          familyRejectionReasons: selected.family.rejectionReasons,
          routeBurden: selected.route.route_burden_level,
          routeVerificationNeeds: routeResult.verification_needs.filter((need) =>
            need.startsWith(`${selected.candidate.candidateId}:`)
          )
        }
      : null
  };

  const verified = verifyRuntimePlan(snapshot, input.evidence);
  const verificationBlocked = verified.report.validation_status === 'blocked';
  trace.push({
    stage: 'verification',
    componentId: 'verification_quality_reviewer_agent',
    status: verificationBlocked ? 'blocked' : 'completed'
  });

  if (verificationBlocked) {
    trace.push({ stage: 'final_composition', componentId: 'final_response_composer_agent', status: 'blocked' });
    return {
      traceId: input.traceId,
      status: 'blocked',
      trace,
      verification: verified.report,
      finalResponse: null
    };
  }

  try {
    const finalResponse = composeVerifiedFinalPlan(verified);
    trace.push({ stage: 'final_composition', componentId: finalResponse.producer_agent, status: 'completed' });
    return {
      traceId: input.traceId,
      status: 'completed',
      trace,
      verification: verified.report,
      finalResponse
    };
  } catch (error) {
    if (!(error instanceof FinalCompositionBlockedError)) throw error;
    trace.push({ stage: 'final_composition', componentId: 'final_response_composer_agent', status: 'blocked' });
    return {
      traceId: input.traceId,
      status: 'blocked',
      trace,
      verification: verified.report,
      finalResponse: null
    };
  }
}
