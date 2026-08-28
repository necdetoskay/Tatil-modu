export type CanonicalFailureClass =
  | 'CONTRACT'
  | 'SCHEMA'
  | 'DETERMINISTIC_RULE'
  | 'CONTEXT_ASSEMBLY'
  | 'CONTEXT_SCOPE'
  | 'PROMPT'
  | 'MODEL'
  | 'TOOL_SELECTION'
  | 'TOOL_POLICY'
  | 'TOOL_PROVIDER'
  | 'TOOL_ADAPTER'
  | 'NORMALIZATION'
  | 'AUTHORITY'
  | 'HANDOFF'
  | 'ORCHESTRATION'
  | 'VERIFICATION'
  | 'EVALUATOR'
  | 'STATE_COMMIT'
  | 'UNKNOWN';

export const FAILURE_CLASS_PRECEDENCE: readonly CanonicalFailureClass[] = [
  'CONTRACT',
  'SCHEMA',
  'AUTHORITY',
  'CONTEXT_SCOPE',
  'CONTEXT_ASSEMBLY',
  'DETERMINISTIC_RULE',
  'TOOL_POLICY',
  'TOOL_SELECTION',
  'TOOL_ADAPTER',
  'TOOL_PROVIDER',
  'NORMALIZATION',
  'HANDOFF',
  'ORCHESTRATION',
  'VERIFICATION',
  'STATE_COMMIT',
  'PROMPT',
  'MODEL',
  'EVALUATOR',
  'UNKNOWN'
];

export interface FailureSignal {
  failureClass: CanonicalFailureClass;
  code: string;
  component: string;
  blocking: boolean;
  scopePath: readonly string[];
  toolCallRefs?: readonly string[];
  evidenceRefs?: readonly string[];
  reproducible: boolean;
  reproducerRef?: string | null;
}

export interface FailureAttributionInput {
  runId: string;
  componentId: string;
  attempt: number;
  modelId?: string | null;
  signals: readonly FailureSignal[];
}

export interface FailureAttribution {
  runId: string;
  primaryClass: CanonicalFailureClass;
  secondaryClasses: readonly CanonicalFailureClass[];
  component: string;
  agentId: string;
  attempt: number;
  modelId: string | null;
  failureCodes: readonly string[];
  toolCallRefs: readonly string[];
  evidenceRefs: readonly string[];
  reproducible: boolean;
  reproducerRefs: readonly string[];
  smallestFailingScope: string;
}

export interface RiveDescentStep {
  depth: number;
  scope: string;
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function classRank(value: CanonicalFailureClass): number {
  const rank = FAILURE_CLASS_PRECEDENCE.indexOf(value);
  return rank === -1 ? FAILURE_CLASS_PRECEDENCE.length : rank;
}

function compareSignals(a: FailureSignal, b: FailureSignal): number {
  const classDelta = classRank(a.failureClass) - classRank(b.failureClass);
  if (classDelta !== 0) return classDelta;
  const depthDelta = b.scopePath.length - a.scopePath.length;
  if (depthDelta !== 0) return depthDelta;
  const componentDelta = a.component.localeCompare(b.component);
  if (componentDelta !== 0) return componentDelta;
  return a.code.localeCompare(b.code);
}

function scopeString(path: readonly string[]): string {
  return path.join(' > ');
}

export function attributeFailure(input: FailureAttributionInput): FailureAttribution {
  if (!Number.isInteger(input.attempt) || input.attempt < 1) throw new Error('FAILURE_ATTEMPT_INVALID');
  const blocking = input.signals.filter(signal => signal.blocking);
  if (blocking.length === 0) throw new Error('FAILURE_BLOCKING_SIGNAL_MISSING');
  for (const signal of blocking) {
    if (signal.scopePath.length === 0) throw new Error(`FAILURE_SCOPE_MISSING:${signal.code}`);
  }

  const ordered = [...blocking].sort(compareSignals);
  const primarySignal = ordered[0]!;
  const primaryClass = primarySignal.failureClass;
  const primaryClassSignals = ordered.filter(signal => signal.failureClass === primaryClass);
  const mostSpecificPrimary = [...primaryClassSignals]
    .sort((a, b) => {
      const depthDelta = b.scopePath.length - a.scopePath.length;
      return depthDelta !== 0 ? depthDelta : scopeString(a.scopePath).localeCompare(scopeString(b.scopePath));
    })[0]!;

  const allClasses = uniqueSorted(ordered.map(signal => signal.failureClass)) as CanonicalFailureClass[];
  const secondaryClasses = allClasses
    .filter(value => value !== primaryClass)
    .sort((a, b) => classRank(a) - classRank(b));
  const toolCallRefs = uniqueSorted(ordered.flatMap(signal => [...(signal.toolCallRefs ?? [])]));
  const evidenceRefs = uniqueSorted(ordered.flatMap(signal => [...(signal.evidenceRefs ?? [])]));
  const reproducerRefs = uniqueSorted(
    ordered
      .map(signal => signal.reproducerRef)
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
  );

  return Object.freeze({
    runId: input.runId,
    primaryClass,
    secondaryClasses: Object.freeze(secondaryClasses),
    component: mostSpecificPrimary.component,
    agentId: input.componentId,
    attempt: input.attempt,
    modelId: input.modelId ?? null,
    failureCodes: Object.freeze(uniqueSorted(ordered.map(signal => signal.code))),
    toolCallRefs: Object.freeze(toolCallRefs),
    evidenceRefs: Object.freeze(evidenceRefs),
    reproducible: ordered.every(signal => signal.reproducible),
    reproducerRefs: Object.freeze(reproducerRefs),
    smallestFailingScope: scopeString(mostSpecificPrimary.scopePath)
  });
}

export function buildRiveDescentPlan(attribution: FailureAttribution): readonly RiveDescentStep[] {
  const parts = attribution.smallestFailingScope.split(' > ').filter(Boolean);
  if (parts.length === 0) throw new Error('RIVE_SMALLEST_SCOPE_MISSING');

  return Object.freeze(parts.map((_, index) => ({
    depth: index,
    scope: parts.slice(0, index + 1).join(' > ')
  })));
}
