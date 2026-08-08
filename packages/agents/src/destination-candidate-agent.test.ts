import { describe, expect, it } from 'vitest';
import { DESTINATION_CANDIDATE_AGENT_BOUNDARY, runDestinationCandidateAgent } from './destination-candidate-agent.js';

const pool = [
  {
    candidateId: 'balikesir-core',
    name: 'Balikesir Core',
    type: 'mixed' as const,
    relationToTarget: 'primary' as const,
    estimatedDistanceBucket: 'unknown' as const,
    likelyTripRole: 'base_stay' as const,
    familyRelevanceHypothesis: 'Primary target area',
    fatigueRisk: 'low' as const
  },
  {
    candidateId: 'ayvalik',
    name: 'Ayvalik',
    type: 'beach_area' as const,
    relationToTarget: 'nearby' as const,
    estimatedDistanceBucket: '100_150_km' as const,
    likelyTripRole: 'day_trip' as const,
    familyRelevanceHypothesis: 'Sea-oriented family option',
    seaRelevant: true,
    fatigueRisk: 'medium' as const
  },
  {
    candidateId: 'far-exception',
    name: 'Far Exception',
    type: 'nature_area' as const,
    relationToTarget: 'exceptional' as const,
    estimatedDistanceBucket: 'over_150_km' as const,
    likelyTripRole: 'backup_option' as const,
    familyRelevanceHypothesis: 'Only for a uniquely strong reason',
    exceptionalReason: 'Unique family experience not available in nearer radius',
    fatigueRisk: 'high' as const
  }
] as const;

describe('Destination Candidate Agent L3', () => {
  it('separates primary, nearby and exceptional candidates', () => {
    const result = runDestinationCandidateAgent({ requestId: 'TM-DEST-001', origin: 'Kocaeli', targetRegion: 'Balikesir', durationDays: 3, maxRadiusKm: 150, allowOutOfRadius: true, candidatePool: pool });
    expect(result.candidateGroups[0]!.candidates.map((c) => c.candidateId)).toEqual(['balikesir-core']);
    expect(result.candidateGroups[1]!.candidates.map((c) => c.candidateId)).toEqual(['ayvalik']);
    expect(result.candidateGroups[2]!.candidates.map((c) => c.candidateId)).toEqual(['far-exception']);
  });

  it('rejects out-of-radius candidate without justification', () => {
    const result = runDestinationCandidateAgent({ requestId: 'TM-DEST-003', origin: 'Kocaeli', targetRegion: 'Balikesir', maxRadiusKm: 150, allowOutOfRadius: true, candidatePool: [{ ...pool[2], exceptionalReason: undefined }] });
    expect(result.excludedRegions).toEqual([{ candidateId: 'far-exception', reason: 'exceptional_reason_required' }]);
  });

  it('carries women-only beach constraint and verification need forward', () => {
    const result = runDestinationCandidateAgent({ requestId: 'TM-DEST-004', origin: 'Kocaeli', targetRegion: 'Balikesir', maxRadiusKm: 150, allowOutOfRadius: false, womenOnlyBeachRequiredWhenSeaRecommended: true, candidatePool: [pool[1]] });
    const candidate = result.candidateGroups[1]!.candidates[0]!;
    expect(candidate.constraintNotes).toContain('women_only_beach_required_when_sea_recommended');
    expect(candidate.evidenceRequiredLater).toContain('beach_privacy_suitability_check');
  });

  it('does not claim exact route duration and requires route evidence later', () => {
    const result = runDestinationCandidateAgent({ requestId: 'TM-DEST-002', origin: 'Kocaeli', targetRegion: 'Balikesir', maxRadiusKm: 150, candidatePool: [pool[0]] });
    const candidate = result.candidateGroups[0]!.candidates[0]!;
    expect(candidate.evidenceRequiredLater).toContain('route_distance');
    expect(JSON.stringify(candidate)).not.toContain('durationMinutes');
  });

  it('flags low-fatigue conflict for short trip with high-fatigue pool', () => {
    const result = runDestinationCandidateAgent({ requestId: 'TM-DEST-005', origin: 'Kocaeli', targetRegion: 'Balikesir', durationDays: 3, maxRadiusKm: 150, allowOutOfRadius: true, lowFatigueRequired: true, candidatePool: pool });
    expect(result.openQuestions).toContain('broad_area_vs_low_fatigue_conflict');
    expect(result.confidence).toBe('low');
  });

  it('excludes all out-of-radius candidates when policy disallows them', () => {
    const result = runDestinationCandidateAgent({ requestId: 'TM-DEST-003B', origin: 'Kocaeli', targetRegion: 'Balikesir', maxRadiusKm: 150, allowOutOfRadius: false, candidatePool: [pool[2]] });
    expect(result.candidateGroups[2]!.candidates).toHaveLength(0);
    expect(result.excludedRegions[0]!.reason).toBe('out_of_radius_not_allowed');
  });

  it('is deterministic for the same logical pool independent of input order', () => {
    const a = runDestinationCandidateAgent({ requestId: 'TM-DEST-DET', origin: 'Kocaeli', targetRegion: 'Balikesir', maxRadiusKm: 150, allowOutOfRadius: true, candidatePool: pool });
    const b = runDestinationCandidateAgent({ requestId: 'TM-DEST-DET', origin: 'Kocaeli', targetRegion: 'Balikesir', maxRadiusKm: 150, allowOutOfRadius: true, candidatePool: [...pool].reverse() });
    expect(a).toEqual(b);
  });

  it('keeps strict isolation boundaries', () => {
    expect(DESTINATION_CANDIDATE_AGENT_BOUNDARY.allowedCapabilities).toEqual([]);
    expect(DESTINATION_CANDIDATE_AGENT_BOUNDARY.callsOtherAgents).toBe(false);
    expect(DESTINATION_CANDIDATE_AGENT_BOUNDARY.writesCanonicalMemory).toBe(false);
    expect(DESTINATION_CANDIDATE_AGENT_BOUNDARY.producesFinalUserResponse).toBe(false);
    expect(DESTINATION_CANDIDATE_AGENT_BOUNDARY.calculatesRouteDuration).toBe(false);
    expect(DESTINATION_CANDIDATE_AGENT_BOUNDARY.recommendsHotelsOrActivities).toBe(false);
  });
});
