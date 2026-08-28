import { describe, expect, it } from 'vitest';
import {
  runHeadlessTripPlan,
  type HeadlessTripPlanInput
} from '../../orchestrator/src/index.js';
import { composeVerifiedFinalPlan } from '../../quality/src/index.js';
import { verifyRuntimePlan } from '../../verification/src/index.js';

function validSeaPlanInput(): HeadlessTripPlanInput {
  return {
    traceId: 'runtime-e2e-001',
    origin: 'Istanbul',
    targetRegion: 'Marmara',
    durationDays: 2,
    childrenAges: [2, 6],
    budgetAmount: 40_000,
    maxRadiusKm: 150,
    lowFatigueRequired: true,
    middayRestRequired: true,
    womenOnlyBeachRequiredWhenSeaRecommended: true,
    candidatePool: [{
      candidateId: 'candidate-yalova',
      name: 'Yalova',
      type: 'mixed',
      relationToTarget: 'primary',
      estimatedDistanceBucket: '50_100_km',
      likelyTripRole: 'base_stay',
      familyRelevanceHypothesis: 'Short transfer and family rest options.',
      seaRelevant: true,
      fatigueRisk: 'low'
    }],
    routes: [{
      destinationId: 'candidate-yalova',
      destinationName: 'Yalova',
      exactDistanceKm: 92,
      exactDriveTimeMinutes: 85,
      parkingAvailable: true,
      trafficRisk: 'low',
      evidenceIds: {
        exactDistance: 'route-distance-001',
        exactDriveTime: 'route-duration-001',
        parkingAvailability: 'parking-001',
        liveTraffic: 'traffic-001'
      }
    }],
    evidence: {
      womenOnlyBeach: {
        evidenceId: 'official-facility-001',
        sourceType: 'official_facility'
      }
    }
  };
}

describe('headless runtime vertical slice', () => {
  it('executes orchestrator -> specialists -> verification -> final composer', () => {
    const result = runHeadlessTripPlan(validSeaPlanInput());

    expect(result.status).toBe('completed');
    expect(result.trace.map((entry) => entry.stage)).toEqual([
      'constraint_policy',
      'destination_discovery',
      'family_suitability',
      'route_logistics',
      'verification',
      'final_composition'
    ]);
    expect(result.trace.every((entry) => entry.status === 'completed')).toBe(true);
    expect(result.verification.validation_status).toBe('valid');
    expect(result.finalResponse?.validation_status).toBe('pass');
    expect(result.finalResponse?.final_response.daily_plan_cards).toHaveLength(2);
    expect(result.finalResponse?.final_response.verification_disclosures).toEqual([
      expect.objectContaining({
        claim_category: 'women_only_beach_status',
        status: 'verified'
      })
    ]);
  });

  it('blocks final composition when required privacy evidence is absent', () => {
    const input = validSeaPlanInput();
    input.evidence = {};

    const result = runHeadlessTripPlan(input);

    expect(result.status).toBe('blocked');
    expect(result.verification.validation_status).toBe('blocked');
    expect(result.verification.hard_blockers).toContain('women_only_beach_status_unverified');
    expect(result.trace.at(-1)).toEqual({
      stage: 'final_composition',
      componentId: 'final_response_composer_agent',
      status: 'blocked'
    });
    expect(result.finalResponse).toBeNull();
  });

  it('rejects a plan snapshot changed after verification', () => {
    const verified = verifyRuntimePlan({
      traceId: 'runtime-e2e-tamper',
      durationDays: 2,
      privacyConstraintActive: false,
      policyClarifications: [],
      policyConflicts: [],
      destinationOpenQuestions: [],
      selectedCandidate: {
        candidateId: 'candidate-safe',
        name: 'Safe Candidate',
        containsSeaActivity: false,
        familySuitability: 'suitable',
        familyRejectionReasons: [],
        routeBurden: 'low',
        routeVerificationNeeds: []
      }
    });
    verified.snapshot.durationDays = 3;

    expect(() => composeVerifiedFinalPlan(verified)).toThrow('verified_snapshot_hash_mismatch');
  });
});
