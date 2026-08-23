import { describe, expect, it } from 'vitest';
import {
  ScriptedTripIntakeModelAdapter,
  TripIntakeAgent,
  runConstraintPolicyAgent,
  runDestinationCandidateAgent,
  runFamilySuitabilityAgent,
  type TripIntakeDraft
} from '../../agents/src/index.js';

type CheckpointStatus =
  | 'PASS'
  | 'FAIL'
  | 'PARTIAL'
  | 'NOT_IMPLEMENTED'
  | 'TOOL_FAILURE'
  | 'NO_DATA'
  | 'LOW_CONFIDENCE'
  | 'NOT_APPLICABLE';

const fixtureId = 'GS-001-KOCAELI-BURSA-2D';

const intakeDraft: TripIntakeDraft = {
  origin: { value: 'Kocaeli', source: 'user_explicit', confidence: 'high' },
  destination: { value: null, source: 'open_choice', confidence: 'high' },
  duration: { days: 2, nights: 1, source: 'user_explicit' },
  travelers: {
    adults: 2,
    children: [{ age: 2 }, { age: 6 }],
    source: 'user_explicit'
  },
  budget: { amount: null, currency: 'TRY', source: 'missing' },
  preferences: {
    women_only_beach_required: true,
    child_friendly_required: true,
    midday_rest_required: false,
    low_fatigue_required: true,
    daily_alternatives_required: null
  },
  hardConstraints: ['duration_2_days', 'origin_kocaeli', 'own_car', 'children_ages_2_6'],
  softConstraints: ['low_fatigue', 'parking_considered', 'traffic_considered', 'radius_150km_flexible'],
  missingRequiredFields: [],
  clarificationQuestions: [],
  assumptionsNotAllowed: ['invent_budget', 'invent_live_route_time', 'invent_parking_availability'],
  handoffNotes: ['return_route_opportunities_required', 'valuable_detour_allowed_when_strongly_justified']
};

const expectedDownstream: Record<string, CheckpointStatus> = {
  route_logistics: 'NOT_IMPLEMENTED',
  parking: 'NOT_IMPLEMENTED',
  destination_selection: 'NOT_IMPLEMENTED',
  day_1_activity_discovery: 'NOT_IMPLEMENTED',
  day_1_continuation: 'NOT_IMPLEMENTED',
  accommodation: 'NOT_IMPLEMENTED',
  day_1_validation: 'NOT_IMPLEMENTED',
  day_2_planning: 'NOT_IMPLEMENTED',
  baseline_return_route: 'NOT_IMPLEMENTED',
  return_route_opportunity_discovery: 'NOT_IMPLEMENTED',
  valuable_detour_decision: 'NOT_IMPLEMENTED',
  evidence_verification: 'NOT_IMPLEMENTED',
  final_constraint_gate: 'NOT_IMPLEMENTED',
  final_response: 'NOT_IMPLEMENTED'
};

describe('Golden Scenario 001 — Kocaeli to Bursa, 2-day family trip', () => {
  it('passes the currently implemented deterministic first slice and exposes downstream gaps', async () => {
    const intakeAgent = new TripIntakeAgent(
      new ScriptedTripIntakeModelAdapter({ [fixtureId]: intakeDraft })
    );

    const intake = await intakeAgent.execute({
      fixtureId,
      userMessage:
        'Kocaeli çıkışlı 2 günlük aile gezisi; 2 ve 6 yaşında çocuklar, özel araç, yaklaşık 150 km alan, düşük yorgunluk, trafik ve park dikkate alınsın. Dönüşte değerli yol üstü veya makul sapmalı alternatifler değerlendirilsin.'
    });

    expect(intake.origin.value).toBe('Kocaeli');
    expect(intake.duration).toEqual({ days: 2, nights: 1, source: 'user_explicit' });
    expect(intake.travelers.adults).toBe(2);
    expect(intake.travelers.children.map((child) => child.age)).toEqual([2, 6]);
    expect(intake.destination.source).toBe('open_choice');
    expect(intake.budget.amount).toBeNull();
    expect(intake.assumptionsNotAllowed).toContain('invent_live_route_time');
    expect(intake.assumptionsNotAllowed).toContain('invent_parking_availability');

    const policy = runConstraintPolicyAgent({
      requestId: fixtureId,
      childrenAges: [2, 6],
      womenOnlyBeachRequired: true,
      seaAllowed: true,
      middayRestRequired: false,
      lowFatigueRequired: true,
      maxDistanceKm: 150,
      maxDistanceIsFlexible: true,
      transportMode: 'own_car'
    });

    expect(policy.hardConstraints.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        'child_age_safety',
        'max_distance_boundary',
        'transport_mode',
        'women_only_beach_required_when_sea_recommended'
      ])
    );
    expect(policy.softPreferences.map((item) => item.id)).toContain('low_fatigue');
    expect(policy.evidenceRequirements).toContainEqual({
      constraintId: 'women_only_beach_required_when_sea_recommended',
      requiredEvidenceType: 'public_authority_or_official_facility_source'
    });
    expect(policy.conflicts).toEqual([]);

    const destinations = runDestinationCandidateAgent({
      requestId: fixtureId,
      origin: 'Kocaeli',
      targetRegion: 'Kocaeli çevresi',
      durationDays: 2,
      maxRadiusKm: 150,
      allowOutOfRadius: true,
      lowFatigueRequired: true,
      womenOnlyBeachRequiredWhenSeaRecommended: true,
      candidatePool: [
        {
          candidateId: 'bursa',
          name: 'Bursa',
          type: 'mixed',
          relationToTarget: 'nearby',
          estimatedDistanceBucket: '100_150_km',
          likelyTripRole: 'base_stay',
          familyRelevanceHypothesis: 'Strong two-day family activity density with zoo and urban alternatives.',
          fatigueRisk: 'medium'
        },
        {
          candidateId: 'yalova',
          name: 'Yalova',
          type: 'mixed',
          relationToTarget: 'nearby',
          estimatedDistanceBucket: '50_100_km',
          likelyTripRole: 'base_stay',
          familyRelevanceHypothesis: 'Shorter drive and lower travel burden for a two-day family trip.',
          seaRelevant: true,
          fatigueRisk: 'low'
        },
        {
          candidateId: 'far-exception',
          name: 'Exceptional Far Option',
          type: 'nature_area',
          relationToTarget: 'exceptional',
          estimatedDistanceBucket: 'over_150_km',
          likelyTripRole: 'backup_option',
          familyRelevanceHypothesis: 'Only considered if uniquely valuable.',
          exceptionalReason: 'Unique family experience unavailable inside the normal radius.',
          fatigueRisk: 'high'
        }
      ]
    });

    const nearbyNames = destinations.candidateGroups
      .find((group) => group.groupId === 'near_radius_area')!
      .candidates.map((candidate) => candidate.name);
    expect(nearbyNames).toEqual(['Bursa', 'Yalova']);

    const exceptional = destinations.candidateGroups
      .find((group) => group.groupId === 'exceptional_out_of_radius_area')!
      .candidates;
    expect(exceptional).toHaveLength(1);
    expect(exceptional[0]!.exceptionalReason).toBeTruthy();

    const yalova = destinations.candidateGroups
      .flatMap((group) => group.candidates)
      .find((candidate) => candidate.candidateId === 'yalova')!;
    expect(yalova.constraintNotes).toContain('women_only_beach_required_when_sea_recommended');
    expect(yalova.evidenceRequiredLater).toContain('beach_privacy_suitability_check');

    const bursaFamilyFit = runFamilySuitabilityAgent({
      candidateId: 'bursa',
      candidateType: 'destination',
      childrenAges: [2, 6],
      lowFatigueRequired: true,
      estimatedDurationMinutes: 120,
      walkingLevel: 'medium',
      restOpportunity: 'good',
      childFacilitySignals: ['toilet_access', 'family_rest_areas'],
      safetyRisk: 'low',
      ageSuitabilityKnown: true
    });

    expect(bursaFamilyFit.suitabilityLevel).toBe('suitable_with_cautions');
    expect(bursaFamilyFit.toddlerFit).toBe('caution');
    expect(bursaFamilyFit.childAge6Fit).toBe('good');
    expect(bursaFamilyFit.parentBurden).toBe('medium');
    expect(bursaFamilyFit.rejectionReasons).toEqual([]);

    const checkpointStatus: Record<string, CheckpointStatus> = {
      request_intake: 'PASS',
      constraint_policy: 'PASS',
      destination_discovery: 'PASS',
      family_suitability: 'PASS',
      ...expectedDownstream
    };

    expect(checkpointStatus.request_intake).toBe('PASS');
    expect(checkpointStatus.constraint_policy).toBe('PASS');
    expect(checkpointStatus.destination_discovery).toBe('PASS');
    expect(checkpointStatus.family_suitability).toBe('PASS');
    expect(checkpointStatus.route_logistics).toBe('NOT_IMPLEMENTED');
    expect(checkpointStatus.baseline_return_route).toBe('NOT_IMPLEMENTED');
    expect(checkpointStatus.valuable_detour_decision).toBe('NOT_IMPLEMENTED');
  });
});
