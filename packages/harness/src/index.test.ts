import { describe, expect, it } from 'vitest';
import {
  FAMILY_TRIP_PLANNING_V1,
  isProductionSelectableCapability,
  validateStepProfile,
  type CapabilityQualificationRecord,
  type HarnessProfile
} from './index.js';

const routeProfile: HarnessProfile = {
  id: 'route-logistics',
  allowedMemoryClasses: ['M0', 'M1', 'M2', 'M3'],
  allowedCapabilities: ['route_lookup', 'parking_lookup', 'evidence_lookup'],
  forbiddenCapabilities: ['accommodation_lookup', 'activity_lookup'],
  modelAlias: 'planner',
  verifierPolicy: 'deterministic',
  maxContextTokens: 6000
};

describe('Harness Architecture v1 contracts', () => {
  it('keeps the family-trip workflow explicit and versioned', () => {
    expect(FAMILY_TRIP_PLANNING_V1.workflowId).toBe('family_trip_planning');
    expect(FAMILY_TRIP_PLANNING_V1.version).toBe('v1');
    expect(FAMILY_TRIP_PLANNING_V1.steps.map((step) => step.stepId)).toEqual([
      'request_intake',
      'constraint_policy',
      'destination_discovery',
      'family_suitability',
      'route_logistics'
    ]);
  });

  it('provisions route logistics with only route-scoped capabilities', () => {
    const step = FAMILY_TRIP_PLANNING_V1.steps.find((item) => item.stepId === 'route_logistics');
    if (!step) throw new Error('route_logistics step missing');

    expect(validateStepProfile(step, routeProfile)).toEqual([]);
    expect(step.allowedCapabilities).toEqual(['route_lookup', 'parking_lookup', 'evidence_lookup']);
    expect(step.allowedCapabilities).not.toContain('activity_lookup');
    expect(step.allowedCapabilities).not.toContain('accommodation_lookup');
  });

  it('detects harness-profile and capability-policy violations independently from agent output', () => {
    const step = FAMILY_TRIP_PLANNING_V1.steps.find((item) => item.stepId === 'route_logistics');
    if (!step) throw new Error('route_logistics step missing');

    const invalidProfile: HarnessProfile = {
      ...routeProfile,
      id: 'activity-research',
      allowedCapabilities: ['activity_lookup']
    };

    expect(validateStepProfile(step, invalidProfile)).toEqual([
      'CAPABILITY_POLICY_VIOLATION:evidence_lookup',
      'CAPABILITY_POLICY_VIOLATION:parking_lookup',
      'CAPABILITY_POLICY_VIOLATION:route_lookup',
      'HARNESS_PROFILE_VIOLATION'
    ]);
  });

  it('does not allow discovered/reviewed/qualified providers to become production-active implicitly', () => {
    const base: Omit<CapabilityQualificationRecord, 'status'> = {
      capability: 'route_lookup',
      providerId: 'provider-a',
      versionOrCommit: '1.0.0'
    };

    expect(isProductionSelectableCapability({ ...base, status: 'DISCOVERED' })).toBe(false);
    expect(isProductionSelectableCapability({ ...base, status: 'REVIEWED' })).toBe(false);
    expect(isProductionSelectableCapability({ ...base, status: 'QUALIFIED' })).toBe(false);
    expect(isProductionSelectableCapability({ ...base, status: 'APPROVED' })).toBe(false);
    expect(isProductionSelectableCapability({ ...base, status: 'ACTIVE' })).toBe(true);
    expect(isProductionSelectableCapability({ ...base, status: 'REVOKED' })).toBe(false);
  });
});
