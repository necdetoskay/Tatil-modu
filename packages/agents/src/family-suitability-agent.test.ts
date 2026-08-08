import { describe, expect, it } from 'vitest';
import { FAMILY_SUITABILITY_AGENT_BOUNDARY, runFamilySuitabilityAgent } from './family-suitability-agent.js';

describe('family suitability agent L3', () => {
  it('accepts a low-tempo 2+6 family candidate with clear rest and age suitability', () => {
    const result = runFamilySuitabilityAgent({
      candidateId: 'TM-FAMILY-001',
      candidateType: 'activity',
      childrenAges: [2, 6],
      middayRestRequired: true,
      lowFatigueRequired: true,
      estimatedDurationMinutes: 120,
      walkingLevel: 'low',
      restOpportunity: 'good',
      childFacilitySignals: ['toilet', 'stroller'],
      safetyRisk: 'low',
      ageSuitabilityKnown: true
    });

    expect(result).toMatchObject({
      suitabilityLevel: 'suitable',
      toddlerFit: 'good',
      childAge6Fit: 'good',
      restFit: 'good',
      fatigueRisk: 'low',
      confidence: 'high'
    });
  });

  it('rejects high walking with no rest for a toddler', () => {
    const result = runFamilySuitabilityAgent({
      candidateId: 'TM-FAMILY-002',
      candidateType: 'activity',
      childrenAges: [2, 6],
      estimatedDurationMinutes: 240,
      walkingLevel: 'high',
      restOpportunity: 'none',
      safetyRisk: 'low',
      ageSuitabilityKnown: true
    });
    expect(result.suitabilityLevel).toBe('unsuitable');
    expect(result.toddlerFit).toBe('poor');
    expect(result.rejectionReasons).toContain('toddler_poor_fit_without_rest');
  });

  it('rejects a candidate that violates required midday rest', () => {
    const result = runFamilySuitabilityAgent({
      candidateId: 'TM-FAMILY-003',
      candidateType: 'day_block',
      childrenAges: [2, 6],
      middayRestRequired: true,
      estimatedDurationMinutes: 180,
      walkingLevel: 'medium',
      restOpportunity: 'none',
      safetyRisk: 'low',
      ageSuitabilityKnown: true
    });
    expect(result.suitabilityLevel).toBe('unsuitable');
    expect(result.rejectionReasons).toContain('midday_rest_required_but_unavailable');
  });

  it('returns needs_more_info and low confidence when critical activity evidence is missing', () => {
    const result = runFamilySuitabilityAgent({
      candidateId: 'TM-FAMILY-005',
      candidateType: 'activity',
      childrenAges: [2, 6],
      restOpportunity: 'unknown',
      walkingLevel: 'unknown',
      safetyRisk: 'unknown',
      ageSuitabilityKnown: false
    });
    expect(result.suitabilityLevel).toBe('needs_more_info');
    expect(result.confidence).toBe('low');
    expect(result.evidenceNeeds).toEqual(expect.arrayContaining([
      'child_age_suitability_source',
      'duration_estimate',
      'rest_facility_signal',
      'walking_effort_estimate'
    ]));
  });

  it('rejects known high safety risk without scoring it away', () => {
    const result = runFamilySuitabilityAgent({
      candidateId: 'unsafe-activity',
      candidateType: 'activity',
      childrenAges: [6],
      estimatedDurationMinutes: 60,
      walkingLevel: 'low',
      restOpportunity: 'good',
      safetyRisk: 'high',
      ageSuitabilityKnown: true
    });
    expect(result.suitabilityLevel).toBe('unsuitable');
    expect(result.rejectionReasons).toContain('high_safety_risk');
    expect(result.confidence).toBe('high');
  });

  it('keeps high fatigue visible when low fatigue is required', () => {
    const result = runFamilySuitabilityAgent({
      candidateId: 'fatigue-heavy',
      candidateType: 'activity',
      childrenAges: [2, 6],
      lowFatigueRequired: true,
      estimatedDurationMinutes: 240,
      walkingLevel: 'high',
      restOpportunity: 'good',
      safetyRisk: 'low',
      ageSuitabilityKnown: true
    });
    expect(result.fatigueRisk).toBe('high');
    expect(result.requiredAdjustments).toContain('replace_with_lower_fatigue_alternative');
    expect(result.suitabilityLevel).toBe('suitable_with_cautions');
  });

  it('is deterministic and preserves strict isolation boundaries', () => {
    const fixture = {
      candidateId: 'deterministic',
      candidateType: 'activity' as const,
      childrenAges: [2, 6] as const,
      estimatedDurationMinutes: 120,
      walkingLevel: 'medium' as const,
      restOpportunity: 'limited' as const,
      safetyRisk: 'low' as const,
      ageSuitabilityKnown: true
    };
    expect(runFamilySuitabilityAgent(fixture)).toEqual(runFamilySuitabilityAgent(fixture));
    expect(FAMILY_SUITABILITY_AGENT_BOUNDARY).toEqual({
      agentId: 'family_suitability_agent',
      allowedCapabilities: [],
      callsOtherAgents: false,
      writesCanonicalMemory: false,
      producesFinalUserResponse: false,
      discoversCandidates: false
    });
  });
});
