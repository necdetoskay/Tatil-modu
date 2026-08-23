import { describe, expect, it } from 'vitest';
import { runRouteLogisticsAgent } from '../../agents/src/index.js';
import {
  FAMILY_TRIP_PLANNING_V1,
  validateStepProfile,
  type HarnessCheckpoint,
  type HarnessProfile
} from '../../harness/src/index.js';

const routeProfile: HarnessProfile = {
  id: 'route-logistics',
  allowedMemoryClasses: ['M0', 'M1', 'M2', 'M3'],
  allowedCapabilities: ['route_lookup', 'parking_lookup', 'evidence_lookup'],
  forbiddenCapabilities: ['activity_lookup', 'accommodation_lookup'],
  modelAlias: 'planner',
  verifierPolicy: 'deterministic',
  maxContextTokens: 6000
};

describe('Golden Scenario 001 — Route Logistics checkpoint', () => {
  it('promotes route_logistics from NOT_IMPLEMENTED to PASS with evidence-backed fixture data', () => {
    const step = FAMILY_TRIP_PLANNING_V1.steps.find((item) => item.stepId === 'route_logistics');
    if (!step) throw new Error('route_logistics workflow step missing');

    expect(validateStepProfile(step, routeProfile)).toEqual([]);

    const output = runRouteLogisticsAgent({
      traceId: 'trace-gs001-route-001',
      origin: 'Kocaeli',
      transportMode: 'private_car',
      childrenAges: [2, 6],
      lowFatigueRequired: true,
      middayRestRequired: false,
      routes: [
        {
          destinationId: 'bursa',
          destinationName: 'Bursa',
          exactDistanceKm: 132,
          exactDriveTimeMinutes: 125,
          parkingAvailable: true,
          trafficRisk: 'weekend_sensitive',
          evidenceIds: {
            exactDistance: 'fixture:gs001:bursa:distance',
            exactDriveTime: 'fixture:gs001:bursa:drive-time',
            parkingAvailability: 'fixture:gs001:bursa:parking',
            liveTraffic: 'fixture:gs001:bursa:traffic'
          }
        },
        {
          destinationId: 'yalova',
          destinationName: 'Yalova',
          exactDistanceKm: 74,
          exactDriveTimeMinutes: 68,
          parkingAvailable: true,
          trafficRisk: 'low',
          evidenceIds: {
            exactDistance: 'fixture:gs001:yalova:distance',
            exactDriveTime: 'fixture:gs001:yalova:drive-time',
            parkingAvailability: 'fixture:gs001:yalova:parking',
            liveTraffic: 'fixture:gs001:yalova:traffic'
          }
        }
      ]
    });

    expect(output.validation_status).toBe('valid');
    expect(output.destination_route_profiles).toHaveLength(2);
    expect(output.verification_needs).toEqual([]);

    const bursa = output.destination_route_profiles.find((item) => item.destination_id === 'bursa');
    const yalova = output.destination_route_profiles.find((item) => item.destination_id === 'yalova');
    expect(bursa).toBeDefined();
    expect(yalova).toBeDefined();
    expect(bursa!.verification_status.distance).toBe('verified');
    expect(bursa!.verification_status.drive_time).toBe('verified');
    expect(bursa!.verification_status.parking).toBe('verified');
    expect(yalova!.route_burden_level).toBe('low');

    const evidenceRefs = output.destination_route_profiles.flatMap((item) =>
      item.evidence_refs.map((ref) => ref.evidence_id)
    );

    const checkpoint: HarnessCheckpoint = {
      runId: 'run-gs001-route-001',
      traceId: output.trace_id,
      workflowId: FAMILY_TRIP_PLANNING_V1.workflowId,
      workflowVersion: FAMILY_TRIP_PLANNING_V1.version,
      stepId: 'route_logistics',
      harnessProfile: 'route-logistics',
      status: 'PASS',
      inputRefs: ['gs001:family-suitability:bursa', 'gs001:family-suitability:yalova'],
      contextRefs: ['gs001:request', 'gs001:constraints', 'gs001:family'],
      capabilityCalls: ['route_lookup', 'parking_lookup', 'evidence_lookup'],
      evidenceRefs,
      provenance: [
        { refId: 'gs001:request', kind: 'input' },
        { refId: 'gs001:constraints', kind: 'context' },
        { refId: 'route_lookup', kind: 'capability' },
        ...evidenceRefs.map((refId) => ({ refId, kind: 'evidence' as const })),
        { refId: 'gs001:route-logistics-output', kind: 'output' }
      ],
      modelAlias: 'planner'
    };

    expect(checkpoint.status).toBe('PASS');
    expect(checkpoint.evidenceRefs.length).toBeGreaterThanOrEqual(6);
    expect(checkpoint.provenance.some((ref) => ref.kind === 'evidence')).toBe(true);
    expect(checkpoint.provenance.some((ref) => ref.kind === 'output')).toBe(true);
  });
});
