import { describe, expect, it } from 'vitest';
import { safeParseRouteLogistics } from './route-logistics.js';

const valid = {
  contract_id: 'route_logistics_contract',
  contract_version: '0.1.0',
  producer_agent: 'route_logistics_agent',
  trace_id: 'trace-route-001',
  validation_status: 'valid_with_warnings',
  logistics_scope_summary: { origin: 'Kocaeli', transport_mode: 'private_car' },
  destination_route_profiles: [{
    destination_id: 'bursa_zoo_area',
    destination_name: 'Bursa Hayvanat Bahçesi çevresi',
    origin: 'Kocaeli',
    route_distance_band: 'medium',
    drive_time_band: 'medium',
    route_burden_level: 'moderate',
    child_fatigue_risk: 'medium',
    parking_risk: 'needs_verification',
    traffic_risk: 'weekend_sensitive',
    rest_stop_need: 'optional',
    midday_rest_compatibility: 'compatible_if_afternoon_light',
    verification_status: { distance: 'needs_verification', drive_time: 'needs_verification', parking: 'needs_verification' },
    confidence: { value: 'medium', reasons: ['origin_known', 'destination_known', 'live_traffic_not_checked'] },
    evidence_refs: [],
    blocker_reasons: []
  }],
  logistics_blockers: [],
  logistics_warnings: ['weekend_or_holiday_traffic_may_change_plan_quality'],
  verification_needs: ['parking_availability', 'current_drive_time'],
  clarification_requirements: []
} as const;

describe('route logistics runtime contract', () => {
  it('accepts the canonical happy path', () => {
    expect(safeParseRouteLogistics(valid).success).toBe(true);
  });

  it('rejects exact drive time without evidence', () => {
    const value = structuredClone(valid) as any;
    value.destination_route_profiles[0].exact_drive_time_minutes = 95;
    expect(safeParseRouteLogistics(value).success).toBe(false);
  });

  it('rejects parking availability without evidence', () => {
    const value = structuredClone(valid) as any;
    value.destination_route_profiles[0].parking_available = true;
    expect(safeParseRouteLogistics(value).success).toBe(false);
  });

  it('requires blocker reason for blocked route', () => {
    const value = structuredClone(valid) as any;
    value.destination_route_profiles[0].route_burden_level = 'blocked';
    expect(safeParseRouteLogistics(value).success).toBe(false);
  });

  it('forbids low-confidence hard blocker', () => {
    const value = structuredClone(valid) as any;
    value.destination_route_profiles[0].route_burden_level = 'blocked';
    value.destination_route_profiles[0].blocker_reasons = ['route_burden_excessive'];
    value.destination_route_profiles[0].confidence.value = 'low';
    expect(safeParseRouteLogistics(value).success).toBe(false);
  });

  it('does not allow midday-rest conflict to be called low burden', () => {
    const value = structuredClone(valid) as any;
    value.destination_route_profiles[0].midday_rest_compatibility = 'conflict';
    value.destination_route_profiles[0].route_burden_level = 'low';
    expect(safeParseRouteLogistics(value).success).toBe(false);
  });
});
