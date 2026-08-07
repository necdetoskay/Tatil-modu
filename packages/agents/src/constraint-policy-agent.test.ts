import { describe, expect, it } from 'vitest';
import { CONSTRAINT_POLICY_AGENT_BOUNDARY, runConstraintPolicyAgent } from './constraint-policy-agent.js';

describe('Constraint & Policy Agent L3', () => {
  it('keeps women-only beach as hard and evidence-required when sea is allowed', () => {
    const result = runConstraintPolicyAgent({
      requestId: 'TM-CONSTRAINT-001',
      childrenAges: [6, 2],
      budgetAmount: 30000,
      womenOnlyBeachRequired: true,
      seaAllowed: true,
      middayRestRequired: true,
      lowFatigueRequired: true,
      transportMode: 'own_car'
    });
    expect(result.hardConstraints).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'women_only_beach_required_when_sea_recommended', confidence: 'high', evidenceRequired: true })
    ]));
    expect(result.evidenceRequirements).toEqual([
      {
        constraintId: 'women_only_beach_required_when_sea_recommended',
        requiredEvidenceType: 'public_authority_or_official_facility_source'
      }
    ]);
    expect(result.policyWarnings).toEqual(expect.arrayContaining([
      { id: 'women_only_beach_status_unverified', severity: 'high' }
    ]));
  });

  it('does not invent a budget constraint when budget is missing', () => {
    const result = runConstraintPolicyAgent({ requestId: 'TM-CONSTRAINT-002', childrenAges: [6, 2] });
    expect(result.hardConstraints.some((item) => item.id === 'budget_limit')).toBe(false);
    expect(result.confidence.unknowns).toContain('budget');
  });

  it('requires clarification and lowers certainty when child ages are missing', () => {
    const result = runConstraintPolicyAgent({ requestId: 'TM-CONSTRAINT-MISSING-CHILD', budgetAmount: 30000 });
    expect(result.clarificationRequired).toContain('children_ages_required_for_safety');
    expect(result.policyWarnings).toContainEqual({ id: 'child_suitability_uncertain', severity: 'high' });
    expect(result.confidence.overall).toBe('medium');
  });

  it('surfaces distance flexibility ambiguity instead of silently choosing hard/soft semantics', () => {
    const result = runConstraintPolicyAgent({ requestId: 'TM-CONSTRAINT-003', childrenAges: [6, 2], maxDistanceKm: 150 });
    expect(result.hardConstraints).toContainEqual(expect.objectContaining({ id: 'max_distance_boundary' }));
    expect(result.clarificationRequired).toContain('max_distance_flexibility_unclear');
  });

  it('makes many-activities vs low-fatigue conflict explicit', () => {
    const result = runConstraintPolicyAgent({
      requestId: 'TM-CONSTRAINT-005',
      childrenAges: [6, 2],
      manyActivitiesRequested: true,
      lowFatigueRequired: true
    });
    expect(result.conflicts).toEqual(['many_activities_vs_low_fatigue']);
  });

  it('never upgrades privacy-sensitive preference into persistent memory semantics', () => {
    const result = runConstraintPolicyAgent({ requestId: 'TM-CONSTRAINT-PRIVACY', childrenAges: [6, 2], seaAllowed: true, womenOnlyBeachRequired: true });
    expect(result.rejectedInterpretations).toContain('privacy_sensitive_preferences_are_session_only_unless_explicitly_persisted');
  });

  it('is deterministic for identical input', () => {
    const input = { requestId: 'TM-CONSTRAINT-004', childrenAges: [6, 2], middayRestRequired: true, lowFatigueRequired: true } as const;
    expect(runConstraintPolicyAgent(input)).toEqual(runConstraintPolicyAgent(input));
  });

  it('has no tool, provider, direct-agent, memory-write or enforcement authority', () => {
    expect(CONSTRAINT_POLICY_AGENT_BOUNDARY).toEqual({
      agentId: 'constraint_policy_agent',
      allowedCapabilities: [],
      callsOtherAgents: false,
      writesCanonicalMemory: false,
      producesFinalUserResponse: false,
      performsPolicyEnforcement: false
    });
  });
});
