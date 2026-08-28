export type DeterministicOracleClass = 'fact' | 'relation' | 'trace' | 'state_gate';
export type DeterministicOracleSeverity = 'BLOCKING' | 'NON_BLOCKING';
export type DeterministicOracleStatus = 'PASS' | 'FAIL' | 'SKIP';

export interface DeterministicOracleContext {
  componentId: string;
  input: unknown;
  output: unknown;
  trace: unknown;
  state: unknown;
}

export interface DeterministicOracleViolation {
  code: string;
  message: string;
  subjectRefs: readonly string[];
}

export interface DeterministicOracleDefinition {
  oracleId: string;
  componentId: string;
  oracleClass: DeterministicOracleClass;
  severity: DeterministicOracleSeverity;
  ruleRefs: readonly string[];
  evaluate: (
    context: Readonly<DeterministicOracleContext>
  ) => readonly DeterministicOracleViolation[] | null;
}

export interface DeterministicOracleResult {
  oracleId: string;
  componentId: string;
  oracleClass: DeterministicOracleClass;
  severity: DeterministicOracleSeverity;
  ruleRefs: readonly string[];
  status: DeterministicOracleStatus;
  violations: readonly DeterministicOracleViolation[];
}

export interface DeterministicRunResult {
  componentId: string;
  status: DeterministicOracleStatus;
  executed: number;
  passed: number;
  failed: number;
  skipped: number;
  blockingFailures: number;
  results: readonly DeterministicOracleResult[];
}

export function createDeterministicOracleContext(
  componentId: string,
  values: Partial<Omit<DeterministicOracleContext, 'componentId'>> = {}
): DeterministicOracleContext {
  return {
    componentId,
    input: values.input ?? null,
    output: values.output ?? null,
    trace: values.trace ?? null,
    state: values.state ?? null
  };
}

function evaluateOracle(
  definition: DeterministicOracleDefinition,
  context: Readonly<DeterministicOracleContext>
): DeterministicOracleResult {
  const violations = definition.evaluate(context);
  if (violations === null) {
    return {
      oracleId: definition.oracleId,
      componentId: definition.componentId,
      oracleClass: definition.oracleClass,
      severity: definition.severity,
      ruleRefs: definition.ruleRefs,
      status: 'SKIP',
      violations: []
    };
  }

  return {
    oracleId: definition.oracleId,
    componentId: definition.componentId,
    oracleClass: definition.oracleClass,
    severity: definition.severity,
    ruleRefs: definition.ruleRefs,
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    violations: [...violations]
  };
}

export function runDeterministicOracles(
  definitions: readonly DeterministicOracleDefinition[],
  context: Readonly<DeterministicOracleContext>
): DeterministicRunResult {
  const selected = definitions
    .filter(definition => definition.componentId === context.componentId)
    .sort((a, b) => a.oracleId.localeCompare(b.oracleId));

  const results = selected.map(definition => evaluateOracle(definition, context));
  const failedResults = results.filter(result => result.status === 'FAIL');
  const passed = results.filter(result => result.status === 'PASS').length;
  const skipped = results.filter(result => result.status === 'SKIP').length;
  const blockingFailures = failedResults.filter(result => result.severity === 'BLOCKING').length;

  return {
    componentId: context.componentId,
    status: failedResults.length > 0 ? 'FAIL' : results.length === 0 || skipped === results.length ? 'SKIP' : 'PASS',
    executed: results.length - skipped,
    passed,
    failed: failedResults.length,
    skipped,
    blockingFailures,
    results
  };
}
