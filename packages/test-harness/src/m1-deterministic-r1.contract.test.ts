import { describe, expect, it } from 'vitest';
import {
  CORE_R1_ORACLES,
  createDeterministicOracleContext,
  runDeterministicOracles,
  type DeterministicOracleDefinition
} from '../../harness/src/index.js';

function failureCodes(result: ReturnType<typeof runDeterministicOracles>): string[] {
  return result.results.flatMap(item => item.violations.map(violation => violation.code));
}

function profileOutput(totalTravelers = 4) {
  return {
    party: {
      adults: 2,
      children: [
        { ageYears: 2, evidenceRefs: ['ev-child-1'] },
        { ageYears: 6, evidenceRefs: ['ev-child-2'] }
      ],
      totalTravelers
    },
    tripContext: {
      origin: { value: 'Kocaeli', evidenceRefs: ['ev-origin'] },
      destination: { value: 'Bursa', evidenceRefs: ['ev-destination'] }
    },
    transport: { mode: 'own_car', evidenceRefs: ['ev-transport'] },
    evidence: [
      { evidenceId: 'ev-adults', type: 'USER_EXPLICIT', fieldPath: 'party.adults' },
      { evidenceId: 'ev-child-1', type: 'USER_EXPLICIT', fieldPath: 'party.children[0].ageYears' },
      { evidenceId: 'ev-child-2', type: 'USER_EXPLICIT', fieldPath: 'party.children[1].ageYears' },
      { evidenceId: 'ev-origin', type: 'USER_EXPLICIT', fieldPath: 'tripContext.origin' },
      { evidenceId: 'ev-destination', type: 'USER_EXPLICIT', fieldPath: 'tripContext.destination' },
      { evidenceId: 'ev-transport', type: 'USER_EXPLICIT', fieldPath: 'transport.mode' },
      { evidenceId: 'ev-total', type: 'NORMALIZATION', fieldPath: 'party.totalTravelers' }
    ]
  };
}

function budgetOutput() {
  return {
    items: [
      {
        itemId: 'hotel',
        dedupeKey: 'hotel:1',
        budgetCriticality: 'CRITICAL',
        normalizedAmount: 2000,
        sourceAmount: 2000,
        sourceCurrency: 'TRY',
        targetCurrency: 'TRY',
        conversionRef: null,
        priceStatus: 'OFFICIAL',
        calculationMethod: 'DIRECT',
        quantity: null,
        unitAmount: null,
        freshnessStatus: 'CURRENT',
        contextValidity: 'MATCHED'
      },
      {
        itemId: 'museum',
        dedupeKey: 'museum:1',
        budgetCriticality: 'NON_CRITICAL',
        normalizedAmount: 300,
        sourceAmount: 300,
        sourceCurrency: 'TRY',
        targetCurrency: 'TRY',
        conversionRef: null,
        priceStatus: 'ESTIMATED',
        calculationMethod: 'QUANTITY_X_UNIT',
        quantity: 3,
        unitAmount: 100,
        freshnessStatus: 'CURRENT',
        contextValidity: 'MATCHED'
      },
      {
        itemId: 'food',
        dedupeKey: 'food:unknown',
        budgetCriticality: 'CRITICAL',
        normalizedAmount: null,
        sourceAmount: null,
        sourceCurrency: 'TRY',
        targetCurrency: 'TRY',
        conversionRef: null,
        priceStatus: 'UNKNOWN',
        calculationMethod: 'UNKNOWN',
        quantity: null,
        unitAmount: null,
        freshnessStatus: 'UNKNOWN',
        contextValidity: 'UNKNOWN'
      }
    ],
    knownTotal: 2000,
    projectedTotal: 2300,
    unknownItemCount: 1,
    budgetLimits: [],
    assessment: { status: 'PROVISIONALLY_WITHIN', unknownExposure: 'CRITICAL' }
  };
}

function verificationOutput(status: 'PASS' | 'REPAIR' | 'FAIL' = 'PASS') {
  return {
    status,
    gates: [
      { gateId: 'g0', status: 'PASS' },
      { gateId: 'g1', status: 'PASS' }
    ],
    blockingFindings: [],
    repairTargets: status === 'REPAIR' ? [{ repairTargetId: 'rt-1' }] : [],
    authoritySummary: {
      agentViolations: [],
      toolViolations: [],
      orchestratorDirectDomainToolViolations: []
    },
    provenanceSummary: {
      missingRefs: [],
      brokenLineageRefs: [],
      snapshotMismatchRefs: [],
      adaptivePreservationFailures: []
    },
    evidenceCoverage: {
      criticalClaimsUnknown: 0,
      criticalClaimsConflicting: 0
    },
    requiredRechecks: []
  };
}

describe('M1.3 deterministic R1 runner', () => {
  it('scopes and orders oracle execution deterministically', () => {
    const definitions: DeterministicOracleDefinition[] = [
      {
        oracleId: 'z-last',
        componentId: 'TM-AG-001',
        oracleClass: 'fact',
        severity: 'BLOCKING',
        ruleRefs: [],
        evaluate: () => []
      },
      {
        oracleId: 'a-first',
        componentId: 'TM-AG-001',
        oracleClass: 'fact',
        severity: 'BLOCKING',
        ruleRefs: [],
        evaluate: () => []
      },
      {
        oracleId: 'other',
        componentId: 'TM-AG-002',
        oracleClass: 'fact',
        severity: 'BLOCKING',
        ruleRefs: [],
        evaluate: () => [{ code: 'SHOULD_NOT_RUN', message: 'wrong component', subjectRefs: [] }]
      }
    ];

    const result = runDeterministicOracles(
      definitions,
      createDeterministicOracleContext('TM-AG-001')
    );

    expect(result.status).toBe('PASS');
    expect(result.results.map(item => item.oracleId)).toEqual(['a-first', 'z-last']);
  });

  it('enforces Profile party arithmetic and evidence lineage', () => {
    const good = runDeterministicOracles(
      CORE_R1_ORACLES,
      createDeterministicOracleContext('TM-AG-001', { output: profileOutput() })
    );
    expect(good.status).toBe('PASS');

    const bad = runDeterministicOracles(
      CORE_R1_ORACLES,
      createDeterministicOracleContext('TM-AG-001', { output: profileOutput(5) })
    );
    expect(bad.status).toBe('FAIL');
    expect(failureCodes(bad)).toContain('PROFILE_TOTAL_TRAVELERS_MISMATCH');
  });

  it('preserves CONDITIONAL_HARD conditions in Preference & Policy output', () => {
    const goodOutput = {
      constraints: [{ constraintId: 'c1', kind: 'CONDITIONAL_HARD', condition: { field: 'activity.type' } }]
    };
    const good = runDeterministicOracles(
      CORE_R1_ORACLES,
      createDeterministicOracleContext('TM-AG-002', { output: goodOutput })
    );
    expect(good.status).toBe('PASS');

    const bad = runDeterministicOracles(
      CORE_R1_ORACLES,
      createDeterministicOracleContext('TM-AG-002', {
        output: { constraints: [{ constraintId: 'c1', kind: 'CONDITIONAL_HARD', condition: null }] }
      })
    );
    expect(failureCodes(bad)).toContain('CONDITIONAL_HARD_CONDITION_MISSING');
  });

  it('keeps climate normals and stale forecasts from masquerading as current forecasts', () => {
    const good = runDeterministicOracles(
      CORE_R1_ORACLES,
      createDeterministicOracleContext('TM-AG-007', {
        output: {
          signals: [
            {
              weatherSignalId: 'wx-climate',
              dataType: 'CLIMATE_NORMAL',
              issuedAt: null,
              forecastHorizonHours: null,
              freshnessStatus: 'CURRENT',
              riskLevel: 'MEDIUM',
              planBias: 'CAUTION',
              evidence: [{ sourceType: 'CLIMATE_PROVIDER' }]
            }
          ]
        }
      })
    );
    expect(good.status).toBe('PASS');

    const bad = runDeterministicOracles(
      CORE_R1_ORACLES,
      createDeterministicOracleContext('TM-AG-007', {
        output: {
          signals: [
            {
              weatherSignalId: 'wx-climate',
              dataType: 'CLIMATE_NORMAL',
              issuedAt: '2026-08-28T05:00:00Z',
              forecastHorizonHours: 72,
              freshnessStatus: 'CURRENT',
              riskLevel: 'LOW',
              planBias: 'PREFER_OUTDOOR',
              evidence: [{ sourceType: 'WEATHER_PROVIDER' }]
            },
            {
              weatherSignalId: 'wx-stale',
              dataType: 'FORECAST',
              issuedAt: '2026-08-20T05:00:00Z',
              forecastHorizonHours: 72,
              freshnessStatus: 'STALE',
              riskLevel: 'LOW',
              planBias: 'PREFER_OUTDOOR',
              evidence: [{ sourceType: 'WEATHER_PROVIDER' }]
            }
          ]
        }
      })
    );
    expect(failureCodes(bad)).toEqual(expect.arrayContaining([
      'CLIMATE_AS_FORECAST',
      'CLIMATE_SOURCE_TYPE_INVALID',
      'STALE_FORECAST_FALSE_CURRENT'
    ]));
  });

  it('reproduces Budget arithmetic and forbids UNKNOWN-as-zero certainty', () => {
    const good = runDeterministicOracles(
      CORE_R1_ORACLES,
      createDeterministicOracleContext('TM-AG-010', { output: budgetOutput() })
    );
    expect(good.status).toBe('PASS');

    const badOutput = budgetOutput();
    badOutput.knownTotal = 2300;
    badOutput.projectedTotal = 2300;
    badOutput.unknownItemCount = 0;
    badOutput.assessment.status = 'WITHIN_BUDGET';

    const bad = runDeterministicOracles(
      CORE_R1_ORACLES,
      createDeterministicOracleContext('TM-AG-010', { output: badOutput })
    );
    expect(failureCodes(bad)).toEqual(expect.arrayContaining([
      'BUDGET_KNOWN_TOTAL_MISMATCH',
      'BUDGET_UNKNOWN_COUNT_MISMATCH',
      'BUDGET_CRITICAL_UNKNOWN_FALSE_CERTAINTY'
    ]));
  });

  it('blocks Verification false-PASS states before semantic judgement', () => {
    const good = runDeterministicOracles(
      CORE_R1_ORACLES,
      createDeterministicOracleContext('TM-AG-014', { output: verificationOutput('PASS') })
    );
    expect(good.status).toBe('PASS');

    const badOutput = verificationOutput('PASS');
    badOutput.blockingFindings.push({ findingId: 'f1' });
    badOutput.authoritySummary.toolViolations.push('tool-leak');
    badOutput.evidenceCoverage.criticalClaimsUnknown = 1;

    const bad = runDeterministicOracles(
      CORE_R1_ORACLES,
      createDeterministicOracleContext('TM-AG-014', { output: badOutput })
    );
    expect(failureCodes(bad)).toEqual(expect.arrayContaining([
      'VERIFICATION_PASS_WITH_BLOCKING_FINDING',
      'VERIFICATION_PASS_WITH_AUTHORITY_VIOLATION',
      'VERIFICATION_PASS_WITH_CRITICAL_UNKNOWN'
    ]));
  });

  it('enforces Orchestrator handoff, graph lineage, attribution and state-commit gates', () => {
    const goodOutput = {
      initialGraphHash: 'g1',
      finalGraphHash: 'g2',
      graphRevisions: [
        { revision: 1, priorGraphHash: 'g1', newGraphHash: 'g2' }
      ],
      handoffs: [
        {
          handoffId: 'h1',
          accepted: true,
          schemaValidationStatus: 'PASS',
          snapshotCompatibilityStatus: 'PASS',
          authorityValidationStatus: 'PASS'
        }
      ],
      stateCommitAttempts: [
        { stateCommitAttemptId: 'sc1', verificationStatus: 'PASS', decision: 'COMMITTED' }
      ],
      nodeRuns: [],
      failureAttributions: [],
      finalStatus: 'COMPLETED',
      finalVerificationRef: 'verification:1',
      finalPlanRef: 'plan:1'
    };

    const good = runDeterministicOracles(
      CORE_R1_ORACLES,
      createDeterministicOracleContext('TM-ORCH-001', { output: goodOutput })
    );
    expect(good.status).toBe('PASS');

    const badOutput = {
      ...goodOutput,
      graphRevisions: [],
      handoffs: [
        {
          handoffId: 'h1',
          accepted: true,
          schemaValidationStatus: 'FAIL',
          snapshotCompatibilityStatus: 'PASS',
          authorityValidationStatus: 'PASS'
        }
      ],
      stateCommitAttempts: [
        { stateCommitAttemptId: 'sc1', verificationStatus: 'REPAIR', decision: 'COMMITTED' }
      ],
      nodeRuns: [{ nodeRunId: 'run-failed', status: 'FAILED' }],
      failureAttributions: [],
      finalVerificationRef: null,
      finalPlanRef: null
    };

    const bad = runDeterministicOracles(
      CORE_R1_ORACLES,
      createDeterministicOracleContext('TM-ORCH-001', { output: badOutput })
    );
    expect(failureCodes(bad)).toEqual(expect.arrayContaining([
      'ORCHESTRATOR_INVALID_HANDOFF_ACCEPTED',
      'ORCHESTRATOR_GRAPH_MUTATION_WITHOUT_REVISION',
      'ORCHESTRATOR_COMMIT_WITHOUT_PASS',
      'ORCHESTRATOR_FAILURE_ATTRIBUTION_MISSING',
      'ORCHESTRATOR_COMPLETED_WITHOUT_TERMINAL_REFS'
    ]));
  });
});
