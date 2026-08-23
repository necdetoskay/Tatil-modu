import { describe, expect, it } from 'vitest';
import { runRouteLogisticsAgent } from './route-logistics-agent.js';

describe('route logistics agent', () => {
  it('emits exact route facts only when evidence is present', () => {
    const result = runRouteLogisticsAgent({
      traceId: 'trace-route-001',
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
            exactDistance: 'ev-route-distance-001',
            exactDriveTime: 'ev-route-time-001',
            parkingAvailability: 'ev-parking-001',
            liveTraffic: 'ev-traffic-001'
          }
        }
      ]
    });

    const route = result.destination_route_profiles[0]!;
    expect(result.validation_status).toBe('valid');
    expect(route.exact_distance_km).toBe(132);
    expect(route.exact_drive_time_minutes).toBe(125);
    expect(route.parking_available).toBe(true);
    expect(route.verification_status.distance).toBe('verified');
    expect(route.verification_status.drive_time).toBe('verified');
    expect(route.verification_status.parking).toBe('verified');
    expect(route.evidence_refs.map((ref) => ref.claim)).toEqual(
      expect.arrayContaining(['exact_distance', 'exact_drive_time', 'parking_availability', 'live_traffic'])
    );
  });

  it('drops unsupported exact facts and requests verification instead of inventing confidence', () => {
    const result = runRouteLogisticsAgent({
      traceId: 'trace-route-002',
      origin: 'Kocaeli',
      transportMode: 'private_car',
      childrenAges: [2, 6],
      lowFatigueRequired: true,
      middayRestRequired: true,
      routes: [
        {
          destinationId: 'yalova',
          destinationName: 'Yalova',
          exactDistanceKm: 74,
          exactDriveTimeMinutes: 68,
          parkingAvailable: true,
          evidenceIds: {}
        }
      ]
    });

    const route = result.destination_route_profiles[0]!;
    expect(result.validation_status).toBe('valid_with_warnings');
    expect(route.exact_distance_km).toBeUndefined();
    expect(route.exact_drive_time_minutes).toBeUndefined();
    expect(route.parking_available).toBeUndefined();
    expect(route.verification_status.distance).toBe('needs_verification');
    expect(route.verification_status.drive_time).toBe('needs_verification');
    expect(route.verification_status.parking).toBe('needs_verification');
    expect(result.verification_needs).toEqual([
      'yalova:exact_distance',
      'yalova:exact_drive_time',
      'yalova:parking_availability'
    ]);
  });

  it('raises fatigue burden for toddler travel when drive time is long', () => {
    const result = runRouteLogisticsAgent({
      traceId: 'trace-route-003',
      origin: 'Kocaeli',
      transportMode: 'private_car',
      childrenAges: [2, 6],
      lowFatigueRequired: true,
      middayRestRequired: true,
      routes: [
        {
          destinationId: 'far-option',
          destinationName: 'Far Option',
          exactDistanceKm: 230,
          exactDriveTimeMinutes: 210,
          evidenceIds: {
            exactDistance: 'ev-distance-far',
            exactDriveTime: 'ev-time-far'
          }
        }
      ]
    });

    const route = result.destination_route_profiles[0]!;
    expect(route.route_burden_level).toBe('high');
    expect(route.child_fatigue_risk).toBe('high');
    expect(route.rest_stop_need).toBe('required');
    expect(route.midday_rest_compatibility).toBe('conflict');
    expect(result.logistics_warnings).toContain('far-option:low_fatigue_preference_at_risk');
  });
});
