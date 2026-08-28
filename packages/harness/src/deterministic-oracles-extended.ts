import type { DeterministicOracleDefinition, DeterministicOracleViolation } from './deterministic-runner.js';
import { CORE_R1_ORACLES } from './deterministic-oracles.js';

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

function violation(code: string, message: string, subjectRefs: readonly string[] = []): DeterministicOracleViolation {
  return { code, message, subjectRefs };
}

const DESTINATION_RESEARCH_EVIDENCE: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-003.DR-003.REGION_EVIDENCE_DISCIPLINE',
  componentId: 'TM-AG-003',
  oracleClass: 'relation',
  severity: 'BLOCKING',
  ruleRefs: ['DR-003', 'DR-009', 'DR-010', 'DR-014'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('DESTINATION_OUTPUT_MISSING', 'destination output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    for (const destination of records(root.destinations)) {
      const ref = typeof destination.destinationId === 'string' ? [destination.destinationId] : [];
      const evidence = records(destination.evidence);
      if (destination.relationToTarget === 'exceptional' && strings(destination.exceptionPolicyRefs).length === 0) {
        failures.push(violation('DESTINATION_EXCEPTION_POLICY_MISSING', 'exceptional destination requires exception-policy provenance', ref));
      }
      if (destination.researchStatus === 'VERIFIED_REGION_CONTEXT') {
        if (evidence.length === 0) {
          failures.push(violation('DESTINATION_VERIFIED_WITHOUT_EVIDENCE', 'verified region context requires evidence', ref));
        }
        if (evidence.length > 0 && evidence.every(item => item.sourceTier === 4)) {
          failures.push(violation('DESTINATION_TIER4_ONLY_VERIFIED', 'Tier 4-only evidence cannot verify region context', ref));
        }
        if (evidence.some(item => item.freshnessStatus === 'STALE')) {
          failures.push(violation('DESTINATION_STALE_VERIFIED', 'stale evidence cannot support verified current region context', ref));
        }
      }
    }
    return failures;
  }
};

const PLACE_DISPOSITION: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-004.PI-002.DISPOSITION_PRECEDENCE',
  componentId: 'TM-AG-004',
  oracleClass: 'state_gate',
  severity: 'BLOCKING',
  ruleRefs: ['PI-002', 'PI-004', 'PI-005', 'PI-007', 'PI-018'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('PLACE_OUTPUT_MISSING', 'place output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    const acceptedPool = records(root.candidates);
    const rejectedPool = records(root.rejectedCandidates);

    for (const candidate of [...acceptedPool, ...rejectedPool]) {
      const ref = typeof candidate.placeId === 'string' ? [candidate.placeId] : [];
      const eligibility = record(candidate.eligibility);
      const checks = records(eligibility?.hardConstraintChecks);
      const disposition = eligibility?.disposition;
      if (record(candidate.businessStatus)?.value === 'CLOSED_PERMANENTLY' && disposition !== 'REJECTED') {
        failures.push(violation('PLACE_PERMANENTLY_CLOSED_NOT_REJECTED', 'permanently closed place must be rejected', ref));
      }
      if (checks.some(item => item.status === 'VIOLATED') && disposition !== 'REJECTED') {
        failures.push(violation('PLACE_HARD_VIOLATION_NOT_REJECTED', 'hard constraint violation must reject place', ref));
      } else if (checks.some(item => item.status === 'UNVERIFIED') && disposition === 'ACCEPTED') {
        failures.push(violation('PLACE_UNVERIFIED_HARD_ACCEPTED', 'unverified hard constraint cannot be accepted', ref));
      }
    }
    if (acceptedPool.some(candidate => record(candidate.eligibility)?.disposition === 'REJECTED')) {
      failures.push(violation('PLACE_REJECTED_IN_ACCEPTED_POOL', 'REJECTED place cannot remain in candidates[]'));
    }
    if (rejectedPool.some(candidate => record(candidate.eligibility)?.disposition !== 'REJECTED')) {
      failures.push(violation('PLACE_NON_REJECTED_IN_REJECTED_POOL', 'rejectedCandidates[] must contain only REJECTED places'));
    }
    return failures;
  }
};

const ACCOMMODATION_DISPOSITION: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-005.AC-002.LIVE_AND_ELIGIBILITY_DISCIPLINE',
  componentId: 'TM-AG-005',
  oracleClass: 'state_gate',
  severity: 'BLOCKING',
  ruleRefs: ['AC-001', 'AC-002', 'AC-003', 'AC-004', 'AC-007', 'AC-008'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('ACCOMMODATION_OUTPUT_MISSING', 'accommodation output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    for (const candidate of [...records(root.candidates), ...records(root.rejectedCandidates)]) {
      const ref = typeof candidate.accommodationId === 'string' ? [candidate.accommodationId] : [];
      const availability = record(candidate.availability);
      const quote = record(candidate.priceQuote);
      const occupancy = record(candidate.occupancyFit);
      const eligibility = record(candidate.eligibility);
      const checks = records(eligibility?.hardConstraintChecks);
      const disposition = eligibility?.disposition;

      if (availability?.status === 'LIVE_UNAVAILABLE' && disposition !== 'REJECTED') {
        failures.push(violation('ACCOMMODATION_LIVE_UNAVAILABLE_NOT_REJECTED', 'LIVE_UNAVAILABLE stay must be rejected', ref));
      }
      if (occupancy?.status === 'VIOLATED' && disposition !== 'REJECTED') {
        failures.push(violation('ACCOMMODATION_OCCUPANCY_VIOLATION_NOT_REJECTED', 'occupancy violation must reject stay', ref));
      }
      if (checks.some(item => item.status === 'VIOLATED') && disposition !== 'REJECTED') {
        failures.push(violation('ACCOMMODATION_HARD_VIOLATION_NOT_REJECTED', 'hard facility/constraint violation must reject stay', ref));
      } else if ((occupancy?.status === 'UNVERIFIED' || checks.some(item => item.status === 'UNVERIFIED')) && disposition === 'ACCEPTED') {
        failures.push(violation('ACCOMMODATION_UNVERIFIED_HARD_ACCEPTED', 'unverified occupancy/hard requirement cannot be accepted', ref));
      }
      if (availability?.status === 'LIVE_AVAILABLE' && (availability.freshnessStatus !== 'CURRENT' || availability.querySignatureMatch !== true)) {
        failures.push(violation('ACCOMMODATION_FALSE_LIVE_AVAILABILITY', 'LIVE_AVAILABLE requires current matching query signature', ref));
      }
      if (quote?.status === 'LIVE' && (quote.freshnessStatus !== 'CURRENT' || quote.querySignatureMatch !== true || strings(quote.evidenceRefs).length === 0)) {
        failures.push(violation('ACCOMMODATION_FALSE_LIVE_PRICE', 'LIVE price requires current matching provider evidence', ref));
      }
    }
    return failures;
  }
};

const FOOD_DISPOSITION: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-006.FD-002.DISPOSITION_PRECEDENCE',
  componentId: 'TM-AG-006',
  oracleClass: 'state_gate',
  severity: 'BLOCKING',
  ruleRefs: ['FD-002', 'FD-003', 'FD-004', 'FD-005', 'FD-006'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('FOOD_OUTPUT_MISSING', 'food output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    for (const candidate of [...records(root.foodCandidates), ...records(root.rejectedCandidates)]) {
      const ref = typeof candidate.foodId === 'string' ? [candidate.foodId] : [];
      const eligibility = record(candidate.eligibility);
      const checks = records(eligibility?.hardConstraintChecks);
      const disposition = eligibility?.disposition;
      if (record(candidate.businessStatus)?.value === 'CLOSED_PERMANENTLY' && disposition !== 'REJECTED') {
        failures.push(violation('FOOD_PERMANENTLY_CLOSED_NOT_REJECTED', 'permanently closed venue must be rejected', ref));
      }
      if (checks.some(item => item.status === 'VIOLATED') && disposition !== 'REJECTED') {
        failures.push(violation('FOOD_HARD_VIOLATION_NOT_REJECTED', 'hard dietary/menu violation must reject venue', ref));
      } else if (checks.some(item => item.status === 'UNVERIFIED') && disposition === 'ACCEPTED') {
        failures.push(violation('FOOD_UNVERIFIED_HARD_ACCEPTED', 'unverified hard dietary/menu requirement cannot be accepted', ref));
      }
      const price = record(candidate.priceFact);
      if (numberValue(price?.amount) !== null && price?.status === 'UNKNOWN') {
        failures.push(violation('FOOD_UNKNOWN_PRICE_HAS_AMOUNT', 'UNKNOWN exact price cannot carry fabricated amount', ref));
      }
    }
    return failures;
  }
};

const TRANSPORT_EVIDENCE: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-008.TR-001.ROUTE_EVIDENCE_AND_TRAFFIC',
  componentId: 'TM-AG-008',
  oracleClass: 'relation',
  severity: 'BLOCKING',
  ruleRefs: ['TR-001', 'TR-002', 'TR-013'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('TRANSPORT_OUTPUT_MISSING', 'transport output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    for (const leg of records(root.routeLegs)) {
      const ref = typeof leg.routeLegId === 'string' ? [leg.routeLegId] : [];
      const evidence = records(leg.evidence);
      if (numberValue(leg.distanceMeters) !== null && !evidence.some(item => item.claimType === 'ROUTE_DISTANCE')) {
        failures.push(violation('ROUTE_DISTANCE_EVIDENCE_MISSING', 'route distance requires ROUTE_DISTANCE evidence', ref));
      }
      if (numberValue(leg.durationSeconds) !== null && !evidence.some(item => item.claimType === 'ROUTE_DURATION')) {
        failures.push(violation('ROUTE_DURATION_EVIDENCE_MISSING', 'route duration requires ROUTE_DURATION evidence', ref));
      }
      if (numberValue(leg.trafficAwareDurationSeconds) !== null) {
        if (leg.departureTime === null || leg.freshnessStatus !== 'CURRENT' || !evidence.some(item => item.claimType === 'TRAFFIC_DURATION' && item.freshnessStatus === 'CURRENT')) {
          failures.push(violation('TRAFFIC_DURATION_CONTEXT_INVALID', 'traffic-aware duration requires time context and current traffic evidence', ref));
        }
      }
      if (leg.freshnessStatus === 'STALE' && record(leg.routeMetadata)?.trafficDataType === 'LIVE_OR_CURRENT') {
        failures.push(violation('STALE_TRAFFIC_FALSE_CURRENT', 'stale route evidence cannot retain LIVE_OR_CURRENT traffic semantics', ref));
      }
    }
    return failures;
  }
};

const ROUTE_PLANNER_TEMPORAL: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-009.RP-003.TEMPORAL_AND_HARD_GATE',
  componentId: 'TM-AG-009',
  oracleClass: 'state_gate',
  severity: 'BLOCKING',
  ruleRefs: ['RP-002', 'RP-003', 'RP-010'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('ROUTE_PLANNER_OUTPUT_MISSING', 'route planner output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    const summary = record(root.constraintSummary);
    if (strings(summary?.violatedRefs).length > 0) {
      failures.push(violation('ROUTE_PLAN_HAS_HARD_VIOLATION', 'draft itinerary cannot accept violated hard constraints', strings(summary?.violatedRefs)));
    }

    const blockingNeeds = new Set(
      records(root.verificationNeeds)
        .filter(item => item.severity === 'BLOCKING')
        .flatMap(item => strings(item.affectsBlockRefs))
    );
    for (const day of records(root.days)) {
      const blocks = records(day.blocks).sort((a, b) => String(a.start).localeCompare(String(b.start)));
      for (let index = 1; index < blocks.length; index += 1) {
        const previous = blocks[index - 1]!;
        const current = blocks[index]!;
        if (Date.parse(String(previous.end)) > Date.parse(String(current.start))) {
          failures.push(violation('ROUTE_PLAN_BLOCK_OVERLAP', 'daily itinerary blocks cannot overlap', [String(previous.blockId), String(current.blockId)]));
        }
      }
      for (const block of blocks) {
        if (block.verificationStatus === 'VERIFIED_INPUT' && typeof block.blockId === 'string' && blockingNeeds.has(block.blockId)) {
          failures.push(violation('ROUTE_PLAN_BLOCKING_NEED_MARKED_VERIFIED', 'block with blocking verification need cannot be VERIFIED_INPUT', [block.blockId]));
        }
      }
    }
    return failures;
  }
};

const OFFICIAL_FACT_STATUS: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-011.PA-001.STATUS_EVIDENCE_GATE',
  componentId: 'TM-AG-011',
  oracleClass: 'state_gate',
  severity: 'BLOCKING',
  ruleRefs: ['PA-001', 'PA-003', 'PA-006', 'PA-008', 'PA-014', 'PA-015'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('OFFICIAL_FACT_OUTPUT_MISSING', 'OfficialFact output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    const evidence = records(root.evidence);
    const unresolvedConflict = records(root.conflicts).some(item => item.resolutionStatus === 'UNRESOLVED');

    if (root.status === 'VERIFIED') {
      const adequate = strings(root.primarySourceRefs).length > 0 && evidence.some(item =>
        item.sourceRole === 'AUTHORITATIVE' &&
        item.supports === 'SUPPORTS' &&
        item.freshnessStatus === 'CURRENT' &&
        item.sourceTier !== 4
      );
      if (!adequate) failures.push(violation('OFFICIAL_FACT_UNSUPPORTED_VERIFIED', 'VERIFIED requires current authoritative supporting evidence'));
      if (unresolvedConflict) failures.push(violation('OFFICIAL_FACT_VERIFIED_WITH_UNRESOLVED_CONFLICT', 'unresolved authoritative conflict must remain UNKNOWN'));
    }
    if (root.status === 'CONTRADICTED' && !evidence.some(item => item.supports === 'CONTRADICTS')) {
      failures.push(violation('OFFICIAL_FACT_CONTRADICTED_WITHOUT_EVIDENCE', 'CONTRADICTED requires contradicting evidence'));
    }
    if (unresolvedConflict && root.status !== 'UNKNOWN') {
      failures.push(violation('OFFICIAL_FACT_CONFLICT_NOT_UNKNOWN', 'unresolved conflict requires UNKNOWN status'));
    }
    return failures;
  }
};

const REVIEW_ARITHMETIC: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-012.RV-006.SAMPLE_AND_PREVALENCE',
  componentId: 'TM-AG-012',
  oracleClass: 'relation',
  severity: 'BLOCKING',
  ruleRefs: ['RV-006', 'RV-007', 'RV-008', 'RV-009', 'RV-018', 'RV-021'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('REVIEW_OUTPUT_MISSING', 'review output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    const sample = record(root.sample);
    const validCount = numberValue(sample?.validCount) ?? 0;
    const providerRefs = strings(sample?.sourceProviderRefs);
    if (numberValue(sample?.sourceCount) !== new Set(providerRefs).size) {
      failures.push(violation('REVIEW_SOURCE_COUNT_MISMATCH', 'sourceCount must equal unique provider count'));
    }
    if (root.snapshotMode === 'REUSED' && typeof root.inputSnapshotRef !== 'string') {
      failures.push(violation('REVIEW_REUSED_WITHOUT_INPUT_SNAPSHOT', 'REUSED snapshot mode requires inputSnapshotRef'));
    }
    if (validCount === 0 && records(root.signals).length > 0) {
      failures.push(violation('REVIEW_SIGNAL_WITH_ZERO_SAMPLE', 'zero valid sample cannot produce recurring signals'));
    }
    for (const signal of records(root.signals)) {
      const ref = typeof signal.reviewSignalId === 'string' ? [signal.reviewSignalId] : [];
      const signalSample = numberValue(signal.validSampleSize) ?? 0;
      const mentions = numberValue(signal.mentionCount) ?? 0;
      const prevalence = numberValue(signal.prevalence);
      if (signalSample > 0 && (prevalence === null || Math.abs(prevalence - mentions / signalSample) > 1e-9)) {
        failures.push(violation('REVIEW_PREVALENCE_MISMATCH', 'prevalence must equal mentionCount / validSampleSize', ref));
      }
      if (mentions > signalSample) failures.push(violation('REVIEW_MENTIONS_EXCEED_SAMPLE', 'mentionCount cannot exceed validSampleSize', ref));
      if (strings(record(signal.confidenceBasis)?.policyRuleRefs).length === 0) {
        failures.push(violation('REVIEW_CONFIDENCE_POLICY_MISSING', 'confidence must be tied to policyRuleRefs', ref));
      }
      if (signalSample <= 1 && (numberValue(signal.confidence) ?? 0) >= 0.8) {
        failures.push(violation('REVIEW_SINGLE_RECORD_HIGH_CONFIDENCE', 'single-record recurring theme cannot be high-confidence', ref));
      }
    }
    return failures;
  }
};

const ADAPTIVE_REPAIR_GATE: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-013.AR-019.PRESERVATION_AND_RECHECK',
  componentId: 'TM-AG-013',
  oracleClass: 'state_gate',
  severity: 'BLOCKING',
  ruleRefs: ['AR-004', 'AR-019', 'AR-022', 'AR-023'],
  evaluate: ({ output }) => {
    const root = record(output);
    if (!root) return [violation('ADAPTIVE_OUTPUT_MISSING', 'adaptive repair output must be an object')];
    const failures: DeterministicOracleViolation[] = [];
    const escalation = record(root.scopeEscalation);
    if (escalation?.escalated === true && (
      typeof escalation.reasonCode !== 'string' ||
      (strings(escalation.evidenceRefs).length === 0 && strings(escalation.dependencyRefs).length === 0)
    )) {
      failures.push(violation('ADAPTIVE_ESCALATION_PROVENANCE_MISSING', 'scope escalation requires reason and evidence/dependency provenance'));
    }
    for (const proof of records(root.preservationProofs)) {
      if (proof.unchanged === true && proof.beforeHash !== proof.afterHash) {
        failures.push(violation('ADAPTIVE_PROTECTED_HASH_CHANGED', 'unchanged preservation proof requires identical before/after hashes', typeof proof.scopeRef === 'string' ? [proof.scopeRef] : []));
      }
    }
    const requiredVerification = records(root.downstreamRecheckRequests).some(item => item.type === 'VERIFICATION_RECHECK' && item.required === true);
    if (['REPAIRED', 'PARTIAL'].includes(String(root.repairStatus)) && !requiredVerification) {
      failures.push(violation('ADAPTIVE_VERIFICATION_RECHECK_MISSING', 'REPAIRED/PARTIAL mutation requires VERIFICATION_RECHECK'));
    }
    if (root.repairStatus === 'NO_CHANGE_REQUIRED' && records(root.patches).length > 0) {
      failures.push(violation('ADAPTIVE_NO_CHANGE_HAS_PATCHES', 'NO_CHANGE_REQUIRED must have zero patches'));
    }
    return failures;
  }
};

const EXPLANATION_GROUNDING: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-015.EX-002.VERIFIED_SUBSET',
  componentId: 'TM-AG-015',
  oracleClass: 'relation',
  severity: 'BLOCKING',
  ruleRefs: ['EX-001', 'EX-002', 'EX-003', 'EX-004', 'EX-016'],
  evaluate: ({ input, output }) => {
    const source = record(input);
    const root = record(output);
    if (!source || !root) return [violation('EXPLANATION_CONTEXT_MISSING', 'explanation R1 requires input and output objects')];
    const failures: DeterministicOracleViolation[] = [];
    if (root.verifiedSnapshotHash !== source.verifiedSnapshotHash || root.verifiedSnapshotRef !== source.verifiedSnapshotRef) {
      failures.push(violation('EXPLANATION_SNAPSHOT_MISMATCH', 'ExplanationBundle must remain bound to verified snapshot'));
    }
    const allowedSubjects = new Set(records(source.explainableRecords).map(item => item.subjectRef).filter((ref): ref is string => typeof ref === 'string'));
    const allowedClaims = new Set(records(source.explainableRecords).flatMap(item => strings(item.allowedClaimRefs)));
    const allowedSupport = new Set(records(source.explainableRecords).flatMap(item => strings(item.supportRefs)));
    for (const block of records(root.blocks)) {
      const ref = typeof block.blockId === 'string' ? [block.blockId] : [];
      if (strings(block.subjectRefs).some(subject => !allowedSubjects.has(subject))) {
        failures.push(violation('EXPLANATION_UNVERIFIED_SUBJECT', 'explanation cannot introduce a subject outside verified universe', ref));
      }
      if (strings(block.assertedClaimRefs).some(claim => !allowedClaims.has(claim))) {
        failures.push(violation('EXPLANATION_UNVERIFIED_CLAIM', 'asserted claim must be in allowed verified claim set', ref));
      }
      if (strings(block.assertedClaimRefs).length > 0 && strings(block.supportRefs).length === 0) {
        failures.push(violation('EXPLANATION_CLAIM_WITHOUT_SUPPORT', 'asserted factual claim requires support refs', ref));
      }
      if (strings(block.supportRefs).some(support => !allowedSupport.has(support))) {
        failures.push(violation('EXPLANATION_UNVERIFIED_SUPPORT', 'support ref must originate from verified explainable records', ref));
      }
    }
    const coverage = record(root.coverage);
    if (numberValue(coverage?.assertedClaimCount) !== numberValue(coverage?.supportedAssertedClaimCount) || numberValue(coverage?.unsupportedAssertedClaimCount) !== 0) {
      failures.push(violation('EXPLANATION_COVERAGE_ARITHMETIC_INVALID', 'all asserted claims must be supported and unsupported count must be zero'));
    }
    return failures;
  }
};

const FINAL_COMPOSER_BINDING: DeterministicOracleDefinition = {
  oracleId: 'TM-AG-016.FC-002.RENDER_BINDING_GATE',
  componentId: 'TM-AG-016',
  oracleClass: 'state_gate',
  severity: 'BLOCKING',
  ruleRefs: ['FC-001', 'FC-002', 'FC-007', 'FC-016'],
  evaluate: ({ input, output }) => {
    const source = record(input);
    const root = record(output);
    if (!source || !root) return [violation('FINAL_COMPOSER_CONTEXT_MISSING', 'final composer R1 requires input and output objects')];
    const failures: DeterministicOracleViolation[] = [];
    if (root.verifiedSnapshotHash !== source.verifiedSnapshotHash || root.verifiedSnapshotRef !== source.verifiedSnapshotRef) {
      failures.push(violation('FINAL_COMPOSER_SNAPSHOT_MISMATCH', 'final plan must remain bound to verified snapshot'));
    }
    if (typeof source.explanationSnapshotHash === 'string' && source.explanationSnapshotHash !== source.verifiedSnapshotHash) {
      failures.push(violation('FINAL_COMPOSER_EXPLANATION_SNAPSHOT_MISMATCH', 'Explanation snapshot hash must match verified snapshot'));
    }
    const mandatory = new Set(strings(source.mandatoryWarningRefs));
    const rendered = new Set(strings(root.mandatoryWarningRefsRendered));
    const missing = [...mandatory].filter(ref => !rendered.has(ref));
    if (missing.length > 0) failures.push(violation('FINAL_COMPOSER_MANDATORY_WARNING_MISSING', 'all mandatory warnings must be rendered', missing));

    const validation = record(root.renderValidation);
    if (
      numberValue(validation?.unsupportedEntityRefCount) !== 0 ||
      numberValue(validation?.unsupportedClaimRefCount) !== 0 ||
      numberValue(validation?.changedVerifiedValueCount) !== 0 ||
      numberValue(validation?.missingMandatoryWarningCount) !== 0 ||
      validation?.snapshotMatch !== true
    ) {
      failures.push(violation('FINAL_COMPOSER_RENDER_VALIDATION_FAILED', 'final output cannot pass with non-zero render validation counters or snapshot mismatch'));
    }
    return failures;
  }
};

export const EXTENDED_R1_ORACLES: readonly DeterministicOracleDefinition[] = [
  DESTINATION_RESEARCH_EVIDENCE,
  PLACE_DISPOSITION,
  ACCOMMODATION_DISPOSITION,
  FOOD_DISPOSITION,
  TRANSPORT_EVIDENCE,
  ROUTE_PLANNER_TEMPORAL,
  OFFICIAL_FACT_STATUS,
  REVIEW_ARITHMETIC,
  ADAPTIVE_REPAIR_GATE,
  EXPLANATION_GROUNDING,
  FINAL_COMPOSER_BINDING
];

export const ALL_R1_ORACLES: readonly DeterministicOracleDefinition[] = [
  ...CORE_R1_ORACLES,
  ...EXTENDED_R1_ORACLES
];
