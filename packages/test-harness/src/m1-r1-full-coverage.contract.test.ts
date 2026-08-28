import { describe, expect, it } from 'vitest';
import {
  ALL_R1_ORACLES,
  createDeterministicOracleContext,
  loadAgentRegistry,
  runDeterministicOracles
} from '../../harness/src/index.js';

function codes(componentId: string, output: unknown, input: unknown = null): string[] {
  return runDeterministicOracles(
    ALL_R1_ORACLES,
    createDeterministicOracleContext(componentId, { input, output })
  ).results.flatMap(result => result.violations.map(item => item.code));
}

describe('M1.3 R1 full canonical coverage', () => {
  it('covers every AgentRegistry component with at least one BLOCKING deterministic oracle', async () => {
    const registry = await loadAgentRegistry();
    const registered = registry.entries.map(entry => entry.componentId).sort();
    const covered = [...new Set(ALL_R1_ORACLES.map(oracle => oracle.componentId))].sort();

    expect(covered).toEqual(registered);
    for (const componentId of registered) {
      expect(ALL_R1_ORACLES.some(oracle => oracle.componentId === componentId && oracle.severity === 'BLOCKING')).toBe(true);
    }
  });

  it('rejects unsupported verified destination research', () => {
    expect(codes('TM-AG-003', {
      destinations: [{
        destinationId: 'd1',
        relationToTarget: 'exceptional',
        exceptionPolicyRefs: [],
        researchStatus: 'VERIFIED_REGION_CONTEXT',
        evidence: [{ sourceTier: 4, freshnessStatus: 'STALE' }]
      }]
    })).toEqual(expect.arrayContaining([
      'DESTINATION_EXCEPTION_POLICY_MISSING',
      'DESTINATION_TIER4_ONLY_VERIFIED',
      'DESTINATION_STALE_VERIFIED'
    ]));
  });

  it('rejects Place eligibility contradictions', () => {
    expect(codes('TM-AG-004', {
      candidates: [{
        placeId: 'p1',
        businessStatus: { value: 'CLOSED_PERMANENTLY' },
        eligibility: {
          disposition: 'ACCEPTED',
          hardConstraintChecks: [{ status: 'VIOLATED' }]
        }
      }],
      rejectedCandidates: []
    })).toEqual(expect.arrayContaining([
      'PLACE_PERMANENTLY_CLOSED_NOT_REJECTED',
      'PLACE_HARD_VIOLATION_NOT_REJECTED'
    ]));
  });

  it('rejects false live accommodation and occupancy acceptance', () => {
    expect(codes('TM-AG-005', {
      candidates: [{
        accommodationId: 'a1',
        availability: { status: 'LIVE_AVAILABLE', freshnessStatus: 'STALE', querySignatureMatch: false },
        priceQuote: { status: 'LIVE', freshnessStatus: 'STALE', querySignatureMatch: false, evidenceRefs: [] },
        occupancyFit: { status: 'VIOLATED' },
        eligibility: { disposition: 'ACCEPTED', hardConstraintChecks: [] }
      }],
      rejectedCandidates: []
    })).toEqual(expect.arrayContaining([
      'ACCOMMODATION_OCCUPANCY_VIOLATION_NOT_REJECTED',
      'ACCOMMODATION_FALSE_LIVE_AVAILABILITY',
      'ACCOMMODATION_FALSE_LIVE_PRICE'
    ]));
  });

  it('rejects Food hard-constraint and price contradictions', () => {
    expect(codes('TM-AG-006', {
      foodCandidates: [{
        foodId: 'f1',
        businessStatus: { value: 'CLOSED_PERMANENTLY' },
        priceFact: { status: 'UNKNOWN', amount: 500 },
        eligibility: { disposition: 'ACCEPTED', hardConstraintChecks: [{ status: 'UNVERIFIED' }] }
      }],
      rejectedCandidates: []
    })).toEqual(expect.arrayContaining([
      'FOOD_PERMANENTLY_CLOSED_NOT_REJECTED',
      'FOOD_UNVERIFIED_HARD_ACCEPTED',
      'FOOD_UNKNOWN_PRICE_HAS_AMOUNT'
    ]));
  });

  it('requires route/traffic evidence in Transportation', () => {
    expect(codes('TM-AG-008', {
      routeLegs: [{
        routeLegId: 'r1',
        distanceMeters: 1000,
        durationSeconds: 600,
        trafficAwareDurationSeconds: 700,
        departureTime: null,
        freshnessStatus: 'STALE',
        routeMetadata: { trafficDataType: 'LIVE_OR_CURRENT' },
        evidence: []
      }]
    })).toEqual(expect.arrayContaining([
      'ROUTE_DISTANCE_EVIDENCE_MISSING',
      'ROUTE_DURATION_EVIDENCE_MISSING',
      'TRAFFIC_DURATION_CONTEXT_INVALID',
      'STALE_TRAFFIC_FALSE_CURRENT'
    ]));
  });

  it('rejects Route Planner overlap and hard-constraint acceptance', () => {
    expect(codes('TM-AG-009', {
      constraintSummary: { violatedRefs: ['c-hard'] },
      verificationNeeds: [{ severity: 'BLOCKING', affectsBlockRefs: ['b2'] }],
      days: [{
        blocks: [
          { blockId: 'b1', start: '2026-08-28T09:00:00Z', end: '2026-08-28T11:00:00Z', verificationStatus: 'VERIFIED_INPUT' },
          { blockId: 'b2', start: '2026-08-28T10:30:00Z', end: '2026-08-28T12:00:00Z', verificationStatus: 'VERIFIED_INPUT' }
        ]
      }]
    })).toEqual(expect.arrayContaining([
      'ROUTE_PLAN_HAS_HARD_VIOLATION',
      'ROUTE_PLAN_BLOCK_OVERLAP',
      'ROUTE_PLAN_BLOCKING_NEED_MARKED_VERIFIED'
    ]));
  });

  it('prevents Public Authority unsupported VERIFIED status', () => {
    expect(codes('TM-AG-011', {
      status: 'VERIFIED',
      primarySourceRefs: [],
      evidence: [{ sourceTier: 4, sourceRole: 'DISCOVERY_ONLY', supports: 'SUPPORTS', freshnessStatus: 'CURRENT' }],
      conflicts: [{ resolutionStatus: 'UNRESOLVED' }]
    })).toEqual(expect.arrayContaining([
      'OFFICIAL_FACT_UNSUPPORTED_VERIFIED',
      'OFFICIAL_FACT_VERIFIED_WITH_UNRESOLVED_CONFLICT',
      'OFFICIAL_FACT_CONFLICT_NOT_UNKNOWN'
    ]));
  });

  it('validates Review sample arithmetic and confidence provenance', () => {
    expect(codes('TM-AG-012', {
      snapshotMode: 'REUSED',
      inputSnapshotRef: null,
      sample: { validCount: 1, sourceCount: 2, sourceProviderRefs: ['provider-a', 'provider-a'] },
      signals: [{
        reviewSignalId: 's1',
        validSampleSize: 1,
        mentionCount: 2,
        prevalence: 0.5,
        confidence: 0.9,
        confidenceBasis: { policyRuleRefs: [] }
      }]
    })).toEqual(expect.arrayContaining([
      'REVIEW_SOURCE_COUNT_MISMATCH',
      'REVIEW_REUSED_WITHOUT_INPUT_SNAPSHOT',
      'REVIEW_PREVALENCE_MISMATCH',
      'REVIEW_MENTIONS_EXCEED_SAMPLE',
      'REVIEW_CONFIDENCE_POLICY_MISSING',
      'REVIEW_SINGLE_RECORD_HIGH_CONFIDENCE'
    ]));
  });

  it('enforces Adaptive repair preservation and verification recheck', () => {
    expect(codes('TM-AG-013', {
      scopeEscalation: { escalated: true, reasonCode: null, evidenceRefs: [], dependencyRefs: [] },
      preservationProofs: [{ scopeRef: 'day-1', unchanged: true, beforeHash: 'before', afterHash: 'after' }],
      downstreamRecheckRequests: [],
      repairStatus: 'REPAIRED',
      patches: [{ patchId: 'patch-1' }]
    })).toEqual(expect.arrayContaining([
      'ADAPTIVE_ESCALATION_PROVENANCE_MISSING',
      'ADAPTIVE_PROTECTED_HASH_CHANGED',
      'ADAPTIVE_VERIFICATION_RECHECK_MISSING'
    ]));
  });

  it('keeps Explanation inside verified subject/claim/support universe', () => {
    const input = {
      verifiedSnapshotRef: 'snap-1',
      verifiedSnapshotHash: 'hash-1',
      explainableRecords: [{
        subjectRef: 'subject-1',
        allowedClaimRefs: ['claim-1'],
        supportRefs: ['support-1']
      }]
    };
    const output = {
      verifiedSnapshotRef: 'snap-2',
      verifiedSnapshotHash: 'hash-2',
      blocks: [{
        blockId: 'ex-1',
        subjectRefs: ['subject-new'],
        assertedClaimRefs: ['claim-new'],
        supportRefs: ['support-new']
      }],
      coverage: { assertedClaimCount: 1, supportedAssertedClaimCount: 0, unsupportedAssertedClaimCount: 1 }
    };

    expect(codes('TM-AG-015', output, input)).toEqual(expect.arrayContaining([
      'EXPLANATION_SNAPSHOT_MISMATCH',
      'EXPLANATION_UNVERIFIED_SUBJECT',
      'EXPLANATION_UNVERIFIED_CLAIM',
      'EXPLANATION_UNVERIFIED_SUPPORT',
      'EXPLANATION_COVERAGE_ARITHMETIC_INVALID'
    ]));
  });

  it('keeps Final Composer snapshot and mandatory warnings bound', () => {
    const input = {
      verifiedSnapshotRef: 'snap-1',
      verifiedSnapshotHash: 'hash-1',
      explanationSnapshotHash: 'hash-other',
      mandatoryWarningRefs: ['warn-1', 'warn-2']
    };
    const output = {
      verifiedSnapshotRef: 'snap-2',
      verifiedSnapshotHash: 'hash-2',
      mandatoryWarningRefsRendered: ['warn-1'],
      renderValidation: {
        unsupportedEntityRefCount: 1,
        unsupportedClaimRefCount: 0,
        changedVerifiedValueCount: 1,
        missingMandatoryWarningCount: 1,
        snapshotMatch: false
      }
    };

    expect(codes('TM-AG-016', output, input)).toEqual(expect.arrayContaining([
      'FINAL_COMPOSER_SNAPSHOT_MISMATCH',
      'FINAL_COMPOSER_EXPLANATION_SNAPSHOT_MISMATCH',
      'FINAL_COMPOSER_MANDATORY_WARNING_MISSING',
      'FINAL_COMPOSER_RENDER_VALIDATION_FAILED'
    ]));
  });
});
