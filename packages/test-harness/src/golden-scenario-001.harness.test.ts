import { describe, expect, it } from 'vitest';
import {
  FAMILY_TRIP_PLANNING_V1,
  isProductionSelectableCapability,
  validateStepProfile,
  type CapabilityQualificationRecord,
  type HarnessCheckpoint,
  type HarnessProfile
} from '../../harness/src/index.js';

const profiles: Record<string, HarnessProfile> = {
  'intake-minimal': {
    id: 'intake-minimal',
    allowedMemoryClasses: ['M0'],
    allowedCapabilities: [],
    verifierPolicy: 'none',
    maxContextTokens: 2500
  },
  'constraint-policy': {
    id: 'constraint-policy',
    allowedMemoryClasses: ['M0', 'M1'],
    allowedCapabilities: [],
    verifierPolicy: 'deterministic',
    maxContextTokens: 3000
  },
  'destination-research': {
    id: 'destination-research',
    allowedMemoryClasses: ['M0', 'M1', 'M2', 'M3'],
    allowedCapabilities: ['place_discovery', 'evidence_lookup'],
    forbiddenCapabilities: ['route_lookup', 'parking_lookup', 'accommodation_lookup'],
    verifierPolicy: 'deterministic',
    maxContextTokens: 5000
  },
  'family-suitability': {
    id: 'family-suitability',
    allowedMemoryClasses: ['M0', 'M1', 'M3'],
    allowedCapabilities: [],
    forbiddenCapabilities: ['place_discovery', 'route_lookup', 'accommodation_lookup'],
    verifierPolicy: 'deterministic',
    maxContextTokens: 3500
  },
  'route-logistics': {
    id: 'route-logistics',
    allowedMemoryClasses: ['M0', 'M1', 'M2', 'M3'],
    allowedCapabilities: ['route_lookup', 'parking_lookup', 'evidence_lookup'],
    forbiddenCapabilities: ['activity_lookup', 'accommodation_lookup'],
    modelAlias: 'planner',
    verifierPolicy: 'deterministic',
    maxContextTokens: 6000
  }
};

const routeProviders: CapabilityQualificationRecord[] = [
  {
    capability: 'route_lookup',
    providerId: 'mock-route-provider',
    versionOrCommit: 'fixture-v1',
    status: 'ACTIVE',
    qualifiedAgainst: ['GS-001-KOCAELI-BURSA-2D'],
    rollbackOrDisablePath: 'disable provider in capability registry'
  },
  {
    capability: 'parking_lookup',
    providerId: 'mock-parking-provider',
    versionOrCommit: 'fixture-v1',
    status: 'ACTIVE',
    qualifiedAgainst: ['GS-001-KOCAELI-BURSA-2D'],
    rollbackOrDisablePath: 'disable provider in capability registry'
  },
  {
    capability: 'evidence_lookup',
    providerId: 'mock-evidence-provider',
    versionOrCommit: 'fixture-v1',
    status: 'ACTIVE',
    qualifiedAgainst: ['GS-001-KOCAELI-BURSA-2D'],
    rollbackOrDisablePath: 'disable provider in capability registry'
  }
];

function checkpoint(stepId: string, status: HarnessCheckpoint['status']): HarnessCheckpoint {
  const step = FAMILY_TRIP_PLANNING_V1.steps.find((item) => item.stepId === stepId);
  if (!step) throw new Error(`workflow step missing: ${stepId}`);

  return {
    runId: 'run-gs001-harness-001',
    traceId: 'trace-gs001-harness-001',
    workflowId: FAMILY_TRIP_PLANNING_V1.workflowId,
    workflowVersion: FAMILY_TRIP_PLANNING_V1.version,
    stepId,
    harnessProfile: step.harnessProfile,
    status,
    inputRefs: [`input:${stepId}`],
    contextRefs: [`context:${stepId}`],
    capabilityCalls: [],
    evidenceRefs: [],
    provenance: [
      { refId: `input:${stepId}`, kind: 'input' },
      { refId: `context:${stepId}`, kind: 'context' }
    ]
  };
}

describe('Golden Scenario 001 — Harness Architecture v1 acceptance', () => {
  it('selects the canonical family-trip workflow explicitly', () => {
    expect(FAMILY_TRIP_PLANNING_V1.workflowId).toBe('family_trip_planning');
    expect(FAMILY_TRIP_PLANNING_V1.version).toBe('v1');
    expect(FAMILY_TRIP_PLANNING_V1.steps[0]?.stepId).toBe('request_intake');
  });

  it('assigns a valid minimal harness profile to each currently implemented workflow step', () => {
    for (const step of FAMILY_TRIP_PLANNING_V1.steps) {
      const profile = profiles[step.harnessProfile];
      expect(profile, `missing profile ${step.harnessProfile}`).toBeDefined();
      expect(validateStepProfile(step, profile!)).toEqual([]);
    }
  });

  it('keeps discovery, family evaluation and route planning capability scopes isolated', () => {
    expect(profiles['destination-research']!.allowedCapabilities).toEqual([
      'place_discovery',
      'evidence_lookup'
    ]);
    expect(profiles['family-suitability']!.allowedCapabilities).toEqual([]);
    expect(profiles['route-logistics']!.allowedCapabilities).toEqual([
      'route_lookup',
      'parking_lookup',
      'evidence_lookup'
    ]);
    expect(profiles['route-logistics']!.allowedCapabilities).not.toContain('activity_lookup');
    expect(profiles['route-logistics']!.allowedCapabilities).not.toContain('accommodation_lookup');
  });

  it('requires production route capabilities to be ACTIVE rather than merely discovered or qualified', () => {
    for (const provider of routeProviders) {
      expect(isProductionSelectableCapability(provider)).toBe(true);
    }

    expect(
      isProductionSelectableCapability({
        ...routeProviders[0]!,
        providerId: 'candidate-route-provider',
        status: 'QUALIFIED'
      })
    ).toBe(false);
  });

  it('records workflow/profile/context provenance before downstream planning exists', () => {
    const checkpoints: HarnessCheckpoint[] = [
      checkpoint('request_intake', 'PASS'),
      checkpoint('constraint_policy', 'PASS'),
      checkpoint('destination_discovery', 'PASS'),
      checkpoint('family_suitability', 'PASS'),
      checkpoint('route_logistics', 'NOT_IMPLEMENTED')
    ];

    for (const item of checkpoints) {
      expect(item.runId).toBeTruthy();
      expect(item.traceId).toBeTruthy();
      expect(item.workflowId).toBe('family_trip_planning');
      expect(item.workflowVersion).toBe('v1');
      expect(item.harnessProfile).toBeTruthy();
      expect(item.inputRefs.length).toBeGreaterThan(0);
      expect(item.contextRefs.length).toBeGreaterThan(0);
      expect(item.provenance.some((ref) => ref.kind === 'input')).toBe(true);
      expect(item.provenance.some((ref) => ref.kind === 'context')).toBe(true);
    }

    expect(checkpoints.at(-1)?.status).toBe('NOT_IMPLEMENTED');
  });

  it('classifies harness policy failure separately from domain or model quality', () => {
    const routeStep = FAMILY_TRIP_PLANNING_V1.steps.find((item) => item.stepId === 'route_logistics');
    if (!routeStep) throw new Error('route_logistics step missing');

    const overProvisioned: HarnessProfile = {
      ...profiles['route-logistics']!,
      allowedCapabilities: [
        'route_lookup',
        'parking_lookup',
        'evidence_lookup',
        'activity_lookup'
      ],
      forbiddenCapabilities: ['activity_lookup']
    };

    const violations = validateStepProfile(
      {
        ...routeStep,
        allowedCapabilities: [...routeStep.allowedCapabilities, 'activity_lookup']
      },
      overProvisioned
    );

    expect(violations).toContain('CAPABILITY_POLICY_VIOLATION:activity_lookup');
  });
});
