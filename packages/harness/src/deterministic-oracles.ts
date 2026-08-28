import type {
  DeterministicOracleDefinition,
  DeterministicOracleViolation
} from './deterministic-runner.js';

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.map(record).filter((item): item is JsonRecord => item !== null) : [];
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function numberValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function approxEqual(left: number, right: number): boolean {
  return Math.abs(left - right) <= 1e-9;
}

function violation(code: string, message: string, subjectRefs: readonly string[] = []): DeterministicOracleViolation {
  return { code, message, subjectRefs };
}

const PROFILE_PARTY_DERIVATION: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-001.PR-004.PARTY_DERIVATION',
  componentId: 'TM-AG-001',
  oracleClass: 'relation',
  severity: 'BLOCKING',
  ruleRefs: ['PR-004', 'PR-011'],
  evaluate: ({ output }) => {
    const root = record(output);
    const party = record(root?.party);
    if (!party) return [violation('PROFILE_PARTY_MISSING', 'party object is required for R1 evaluation')];

    const adults = numberValue(party.adults);
    const children = Array.isArray(party.children) ? party.children : null;
    if (adults === null || children === null) return null;

    const expected = adults + children.length;
    const actual = numberValue(party.totalTravelers);
    const failures: DeterministicOracleViolation[] = [];
    if (actual === null || actual !== expected) {
      failures.push(violation(
        'PROFILE_TOTAL_TRAVELERS_MISMATCH',
        `totalTravelers must equal adults + child count (${expected})`,
        ['party.totalTravelers']
      ));
    }

    const evidence = records(root?.evidence);
    const hasNormalization = evidence.some(item =>
      item.type === 'NORMALIZATION' && item.fieldPath === 'party.totalTravelers'
    );
    if (!hasNormalization) {
      failures.push(violation(
        'PROFILE_TOTAL_TRAVELERS_NORMALIZATION_EVIDENCE_MISSING',
        'derived totalTravelers must carry NORMALIZATION evidence',
        ['party.totalTravelers']
      ));
    }

    return failures;
  }
};

const PROFILE_CRITICAL_EVIDENCE: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-001.PR-011.CRITICAL_EVIDENCE',
  componentId: 'TM-AG-001',
  oracleClass: 'relation',
  severity: 'BLOCKING',
  ruleRefs: ['PR-011'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('PROFILE_OUTPUT_MISSING', 'profile output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    const evidence = records(root.evidence);
    const evidenceIds = new Set(evidence.map(item => item.evidenceId).filter((id): id is string => typeof id === 'string'));
    const hasFieldEvidence = (fieldPath: string): boolean => evidence.some(item => item.fieldPath === fieldPath);

    const party = record(root.party);
    if (numberValue(party?.adults) !== null && !hasFieldEvidence('party.adults')) {
      failures.push(violation('PROFILE_ADULTS_EVIDENCE_MISSING', 'non-null adults must be evidence-backed', ['party.adults']));
    }

    for (const [index, child] of records(party?.children).entries()) {
      if (numberValue(child.ageYears) === null) continue;
      const refs = strings(child.evidenceRefs);
      if (refs.length === 0 || refs.some(ref => !evidenceIds.has(ref))) {
        failures.push(violation(
          'PROFILE_CHILD_AGE_EVIDENCE_MISSING',
          'non-null child age must reference existing evidence',
          [`party.children[${index}].ageYears`]
        ));
      }
    }

    const tripContext = record(root.tripContext);
    for (const field of ['origin', 'destination'] as const) {
      const sourced = record(tripContext?.[field]);
      if (typeof sourced?.value === 'string') {
        const refs = strings(sourced.evidenceRefs);
        if (refs.length === 0 || refs.some(ref => !evidenceIds.has(ref))) {
          failures.push(violation(
            'PROFILE_LOCATION_EVIDENCE_MISSING',
            `non-null ${field} must reference existing evidence`,
            [`tripContext.${field}`]
          ));
        }
      }
    }

    const transport = record(root.transport);
    if (transport?.mode !== 'unknown' && typeof transport?.mode === 'string') {
      const refs = strings(transport.evidenceRefs);
      if (refs.length === 0 || refs.some(ref => !evidenceIds.has(ref))) {
        failures.push(violation(
          'PROFILE_TRANSPORT_EVIDENCE_MISSING',
          'known transport mode must reference existing evidence',
          ['transport.mode']
        ));
      }
    }

    return failures;
  }
};

const PREFERENCE_CONDITIONAL_HARD: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-002.PP-004.CONDITIONAL_HARD_CONDITION',
  componentId: 'TM-AG-002',
  oracleClass: 'relation',
  severity: 'BLOCKING',
  ruleRefs: ['PP-004', 'PP-005'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('PREFERENCE_OUTPUT_MISSING', 'preference-policy output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    for (const constraint of records(root.constraints)) {
      if (constraint.kind === 'CONDITIONAL_HARD' && record(constraint.condition) === null) {
        failures.push(violation(
          'CONDITIONAL_HARD_CONDITION_MISSING',
          'CONDITIONAL_HARD constraint must preserve its condition',
          typeof constraint.constraintId === 'string' ? [constraint.constraintId] : []
        ));
      }
    }
    return failures;
  }
};

const WEATHER_DATA_TYPE_SEMANTICS: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-007.WX-005.DATA_TYPE_SEMANTICS',
  componentId: 'TM-AG-007',
  oracleClass: 'relation',
  severity: 'BLOCKING',
  ruleRefs: ['WX-002', 'WX-005', 'WX-012'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('WEATHER_OUTPUT_MISSING', 'weather output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    for (const signal of records(root.signals)) {
      const ref = typeof signal.weatherSignalId === 'string' ? [signal.weatherSignalId] : [];
      const evidence = records(signal.evidence);
      if (signal.dataType === 'CLIMATE_NORMAL') {
        if (signal.issuedAt !== null || signal.forecastHorizonHours !== null) {
          failures.push(violation(
            'CLIMATE_AS_FORECAST',
            'CLIMATE_NORMAL cannot carry forecast issuedAt or forecast horizon semantics',
            ref
          ));
        }
        if (evidence.some(item => item.sourceType === 'WEATHER_PROVIDER')) {
          failures.push(violation(
            'CLIMATE_SOURCE_TYPE_INVALID',
            'CLIMATE_NORMAL cannot be represented as provider forecast evidence',
            ref
          ));
        }
      }

      if (signal.dataType === 'FORECAST' && evidence.length > 0 && evidence.every(item => item.sourceType === 'KNOWLEDGE_SNAPSHOT')) {
        failures.push(violation(
          'KNOWLEDGE_REPLACED_FRESH_FORECAST',
          'knowledge snapshot alone cannot satisfy fresh forecast semantics',
          ref
        ));
      }
    }
    return failures;
  }
};

const WEATHER_STALE_FORECAST: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-007.WX-003.STALE_FORECAST_CERTAINTY',
  componentId: 'TM-AG-007',
  oracleClass: 'fact',
  severity: 'BLOCKING',
  ruleRefs: ['WX-003', 'WX-004'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('WEATHER_OUTPUT_MISSING', 'weather output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    for (const signal of records(root.signals)) {
      if (signal.dataType !== 'FORECAST' || signal.freshnessStatus !== 'STALE') continue;
      const ref = typeof signal.weatherSignalId === 'string' ? [signal.weatherSignalId] : [];
      if (signal.riskLevel !== 'UNKNOWN' || !['CAUTION', 'NO_SIGNAL'].includes(String(signal.planBias))) {
        failures.push(violation(
          'STALE_FORECAST_FALSE_CURRENT',
          'stale forecast must not emit definitive current-trip risk or directional plan bias',
          ref
        ));
      }
    }
    return failures;
  }
};

function dedupeBudgetItems(items: JsonRecord[]): JsonRecord[] {
  const seen = new Set<string>();
  const unique: JsonRecord[] = [];
  for (const item of items) {
    const key = typeof item.dedupeKey === 'string' ? item.dedupeKey : `__missing__:${unique.length}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

function knownBudgetContribution(item: JsonRecord): number {
  const amount = numberValue(item.normalizedAmount);
  if (amount === null) return 0;
  if (item.priceStatus !== 'LIVE' && item.priceStatus !== 'OFFICIAL') return 0;
  if (item.priceStatus === 'LIVE' && item.contextValidity === 'MISMATCHED') return 0;
  if (item.priceStatus === 'LIVE' && item.freshnessStatus === 'STALE') return 0;
  return amount;
}

function estimatedBudgetContribution(item: JsonRecord): number {
  const amount = numberValue(item.normalizedAmount);
  return item.priceStatus === 'ESTIMATED' && amount !== null ? amount : 0;
}

const BUDGET_ARITHMETIC: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-010.BG-001.BUDGET_ARITHMETIC',
  componentId: 'TM-AG-010',
  oracleClass: 'relation',
  severity: 'BLOCKING',
  ruleRefs: ['BG-001', 'BG-002', 'BG-003', 'BG-004', 'BG-005', 'BG-006', 'BG-007'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('BUDGET_OUTPUT_MISSING', 'budget output must be an object')];
    const items = dedupeBudgetItems(records(root.items));
    const failures: DeterministicOracleViolation[] = [];

    const expectedKnown = items.reduce((sum, item) => sum + knownBudgetContribution(item), 0);
    const expectedProjected = expectedKnown + items.reduce((sum, item) => sum + estimatedBudgetContribution(item), 0);
    const expectedUnknownCount = items.filter(item => item.priceStatus === 'UNKNOWN').length;

    const knownTotal = numberValue(root.knownTotal);
    if (knownTotal === null || !approxEqual(knownTotal, expectedKnown)) {
      failures.push(violation(
        'BUDGET_KNOWN_TOTAL_MISMATCH',
        `knownTotal must equal deduped LIVE/OFFICIAL current contribution (${expectedKnown})`,
        ['knownTotal']
      ));
    }

    const projectedTotal = numberValue(root.projectedTotal);
    if (projectedTotal === null || !approxEqual(projectedTotal, expectedProjected)) {
      failures.push(violation(
        'BUDGET_PROJECTED_TOTAL_MISMATCH',
        `projectedTotal must equal known + ESTIMATED contribution (${expectedProjected})`,
        ['projectedTotal']
      ));
    }

    if (root.unknownItemCount !== expectedUnknownCount) {
      failures.push(violation(
        'BUDGET_UNKNOWN_COUNT_MISMATCH',
        `unknownItemCount must equal deduped UNKNOWN item count (${expectedUnknownCount})`,
        ['unknownItemCount']
      ));
    }

    for (const item of items) {
      if (item.calculationMethod !== 'QUANTITY_X_UNIT') continue;
      const quantity = numberValue(item.quantity);
      const unitAmount = numberValue(item.unitAmount);
      const sourceAmount = numberValue(item.sourceAmount);
      if (quantity !== null && unitAmount !== null && (sourceAmount === null || !approxEqual(sourceAmount, quantity * unitAmount))) {
        failures.push(violation(
          'BUDGET_QUANTITY_UNIT_MISMATCH',
          'sourceAmount must equal quantity × unitAmount for QUANTITY_X_UNIT',
          typeof item.itemId === 'string' ? [item.itemId] : []
        ));
      }
    }

    return failures;
  }
};

const BUDGET_ASSESSMENT_PRECEDENCE: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-010.BG-009.ASSESSMENT_PRECEDENCE',
  componentId: 'TM-AG-010',
  oracleClass: 'state_gate',
  severity: 'BLOCKING',
  ruleRefs: ['BG-008', 'BG-009', 'BG-010', 'BG-015', 'BG-016', 'BG-018'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('BUDGET_OUTPUT_MISSING', 'budget output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    const items = dedupeBudgetItems(records(root.items));
    const assessment = record(root.assessment);
    const hardFail = records(root.budgetLimits).some(limit => limit.kind === 'HARD' && limit.status === 'FAIL');
    const criticalUnknown = items.some(item => item.priceStatus === 'UNKNOWN' && item.budgetCriticality === 'CRITICAL');

    if (hardFail && assessment?.status !== 'OVER_BUDGET') {
      failures.push(violation(
        'BUDGET_HARD_FAIL_FALSE_STATUS',
        'any HARD budget limit failure must produce OVER_BUDGET',
        ['assessment.status']
      ));
    }
    if (!hardFail && criticalUnknown && assessment?.status === 'WITHIN_BUDGET') {
      failures.push(violation(
        'BUDGET_CRITICAL_UNKNOWN_FALSE_CERTAINTY',
        'critical UNKNOWN cost exposure cannot produce WITHIN_BUDGET',
        ['assessment.status']
      ));
    }

    for (const item of items) {
      if (
        typeof item.sourceCurrency === 'string' &&
        typeof item.targetCurrency === 'string' &&
        item.sourceCurrency !== item.targetCurrency &&
        numberValue(item.normalizedAmount) !== null &&
        (item.conversionRef === null || typeof item.conversionRef !== 'string')
      ) {
        failures.push(violation(
          'BUDGET_CONVERSION_PROVENANCE_MISSING',
          'cross-currency normalized amount requires conversionRef',
          typeof item.itemId === 'string' ? [item.itemId] : []
        ));
      }
    }

    return failures;
  }
};

const VERIFICATION_FALSE_PASS: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-014.VR-026.FALSE_PASS_GUARD',
  componentId: 'TM-AG-014',
  oracleClass: 'state_gate',
  severity: 'BLOCKING',
  ruleRefs: ['VR-003', 'VR-004', 'VR-005', 'VR-006', 'VR-026', 'VR-027'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('VERIFICATION_OUTPUT_MISSING', 'verification output must be an object')];
    const failures: DeterministicOracleViolation[] = [];

    if (root.status === 'PASS') {
      if (records(root.blockingFindings).length > 0) {
        failures.push(violation('VERIFICATION_PASS_WITH_BLOCKING_FINDING', 'PASS requires zero blocking findings'));
      }
      if (records(root.gates).some(gate => gate.status === 'FAIL' || gate.status === 'REPAIR')) {
        failures.push(violation('VERIFICATION_PASS_WITH_FAILED_GATE', 'PASS cannot coexist with FAIL/REPAIR mandatory gate'));
      }

      const authority = record(root.authoritySummary);
      const authorityViolations = [
        ...strings(authority?.agentViolations),
        ...strings(authority?.toolViolations),
        ...strings(authority?.orchestratorDirectDomainToolViolations)
      ];
      if (authorityViolations.length > 0) {
        failures.push(violation('VERIFICATION_PASS_WITH_AUTHORITY_VIOLATION', 'PASS cannot hide authority violations'));
      }

      const provenance = record(root.provenanceSummary);
      const provenanceFailures = [
        ...strings(provenance?.missingRefs),
        ...strings(provenance?.brokenLineageRefs),
        ...strings(provenance?.snapshotMismatchRefs),
        ...strings(provenance?.adaptivePreservationFailures)
      ];
      if (provenanceFailures.length > 0) {
        failures.push(violation('VERIFICATION_PASS_WITH_PROVENANCE_FAILURE', 'PASS cannot hide critical provenance failures'));
      }

      const coverage = record(root.evidenceCoverage);
      if ((numberValue(coverage?.criticalClaimsUnknown) ?? 0) > 0 || (numberValue(coverage?.criticalClaimsConflicting) ?? 0) > 0) {
        failures.push(violation('VERIFICATION_PASS_WITH_CRITICAL_UNKNOWN', 'PASS cannot contain unknown/conflicting critical claims'));
      }
      if (records(root.requiredRechecks).some(recheck => recheck.blocking === true)) {
        failures.push(violation('VERIFICATION_PASS_WITH_BLOCKING_RECHECK', 'PASS cannot leave blocking rechecks unresolved'));
      }
    }

    if (root.status === 'REPAIR' && records(root.repairTargets).length === 0) {
      failures.push(violation('VERIFICATION_REPAIR_WITHOUT_TARGET', 'REPAIR requires at least one actionable repair target'));
    }

    return failures;
  }
};

const ORCHESTRATOR_HANDOFF_GATE: DeterministicOracleDefinition = {
  oracleId: 'TM-ORCH-001.OR-007.HANDOFF_GATE',
  componentId: 'TM-ORCH-001',
  oracleClass: 'state_gate',
  severity: 'BLOCKING',
  ruleRefs: ['OR-007'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('ORCHESTRATION_OUTPUT_MISSING', 'orchestration output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    for (const handoff of records(root.handoffs)) {
      if (handoff.accepted !== true) continue;
      const valid = handoff.schemaValidationStatus === 'PASS' &&
        (handoff.snapshotCompatibilityStatus === 'PASS' || handoff.snapshotCompatibilityStatus === 'NOT_APPLICABLE') &&
        handoff.authorityValidationStatus === 'PASS';
      if (!valid) {
        failures.push(violation(
          'ORCHESTRATOR_INVALID_HANDOFF_ACCEPTED',
          'accepted handoff requires schema, snapshot and authority validation success',
          typeof handoff.handoffId === 'string' ? [handoff.handoffId] : []
        ));
      }
    }
    return failures;
  }
};

const ORCHESTRATOR_GRAPH_REVISION: DeterministicOracleDefinition = {
  oracleId: 'TM-ORCH-001.OR-002.GRAPH_REVISION_CHAIN',
  componentId: 'TM-ORCH-001',
  oracleClass: 'state_gate',
  severity: 'BLOCKING',
  ruleRefs: ['OR-002', 'GraphRevision'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('ORCHESTRATION_OUTPUT_MISSING', 'orchestration output must be an object')];
    const initial = typeof root.initialGraphHash === 'string' ? root.initialGraphHash : null;
    const final = typeof root.finalGraphHash === 'string' ? root.finalGraphHash : null;
    const revisions = records(root.graphRevisions).sort((a, b) => Number(a.revision) - Number(b.revision));
    const failures: DeterministicOracleViolation[] = [];

    if (initial !== null && final !== null && initial !== final && revisions.length === 0) {
      failures.push(violation('ORCHESTRATOR_GRAPH_MUTATION_WITHOUT_REVISION', 'changed graph hash requires GraphRevision lineage'));
      return failures;
    }

    let cursor = initial;
    for (const revision of revisions) {
      if (cursor !== null && revision.priorGraphHash !== cursor) {
        failures.push(violation(
          'ORCHESTRATOR_GRAPH_REVISION_CHAIN_BROKEN',
          'GraphRevision priorGraphHash must match previous graph hash',
          typeof revision.revision === 'number' ? [`revision:${revision.revision}`] : []
        ));
      }
      cursor = typeof revision.newGraphHash === 'string' ? revision.newGraphHash : cursor;
    }
    if (revisions.length > 0 && final !== null && cursor !== final) {
      failures.push(violation('ORCHESTRATOR_FINAL_GRAPH_HASH_MISMATCH', 'finalGraphHash must equal the last GraphRevision newGraphHash'));
    }
    return failures;
  }
};

const ORCHESTRATOR_COMMIT_AND_FAILURE_ATTRIBUTION: DeterministicOracleDefinition = {
  oracleId: 'TM-ORCH-001.OR-011.COMMIT_AND_ATTRIBUTION_GATE',
  componentId: 'TM-ORCH-001',
  oracleClass: 'state_gate',
  severity: 'BLOCKING',
  ruleRefs: ['OR-008', 'OR-011', 'OR-012'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('ORCHESTRATION_OUTPUT_MISSING', 'orchestration output must be an object')];
    const failures: DeterministicOracleViolation[] = [];

    for (const attempt of records(root.stateCommitAttempts)) {
      if (attempt.decision === 'COMMITTED' && attempt.verificationStatus !== 'PASS') {
        failures.push(violation(
          'ORCHESTRATOR_COMMIT_WITHOUT_PASS',
          'state commit is allowed only with verification PASS',
          typeof attempt.stateCommitAttemptId === 'string' ? [attempt.stateCommitAttemptId] : []
        ));
      }
    }

    const attributionRefs = new Set(
      records(root.failureAttributions)
        .map(item => item.nodeRunRef)
        .filter((ref): ref is string => typeof ref === 'string')
    );
    for (const run of records(root.nodeRuns)) {
      if (!['FAILED', 'BLOCKED', 'TIMED_OUT'].includes(String(run.status))) continue;
      if (typeof run.nodeRunId === 'string' && !attributionRefs.has(run.nodeRunId)) {
        failures.push(violation(
          'ORCHESTRATOR_FAILURE_ATTRIBUTION_MISSING',
          'failed or blocked node run requires FailureAttribution',
          [run.nodeRunId]
        ));
      }
    }

    if (root.finalStatus === 'COMPLETED' && (typeof root.finalVerificationRef !== 'string' || typeof root.finalPlanRef !== 'string')) {
      failures.push(violation(
        'ORCHESTRATOR_COMPLETED_WITHOUT_TERMINAL_REFS',
        'COMPLETED requires final verification and final plan refs'
      ));
    }

    return failures;
  }
};

export const CORE_R1_ORACLES: readonly DeterministicOracleDefinition[] = [
  PROFILE_PARTY_DERIVATION,
  PROFILE_CRITICAL_EVIDENCE,
  PREFERENCE_CONDITIONAL_HARD,
  WEATHER_DATA_TYPE_SEMANTICS,
  WEATHER_STALE_FORECAST,
  BUDGET_ARITHMETIC,
  BUDGET_ASSESSMENT_PRECEDENCE,
  VERIFICATION_FALSE_PASS,
  ORCHESTRATOR_HANDOFF_GATE,
  ORCHESTRATOR_GRAPH_REVISION,
  ORCHESTRATOR_COMMIT_AND_FAILURE_ATTRIBUTION
];
