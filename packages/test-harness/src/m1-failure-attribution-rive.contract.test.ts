import { describe, expect, it } from 'vitest';
import {
  attributeFailure,
  buildRiveDescentPlan,
  type FailureSignal
} from '../../harness/src/index.js';

const authoritySignal: FailureSignal = {
  failureClass: 'AUTHORITY',
  code: 'TOOL_AUTHORITY_VIOLATION',
  component: 'ToolGateway',
  blocking: true,
  scopePath: ['run:1', 'agent:TM-AG-013', 'tool:TL-004', 'scope:repair-day-2'],
  toolCallRefs: ['tool-call-2'],
  evidenceRefs: ['ev-auth-1'],
  reproducible: true,
  reproducerRef: 'fixture:adaptive-authority-001'
};

const modelSignal: FailureSignal = {
  failureClass: 'MODEL',
  code: 'MODEL_OUTPUT_DRIFT',
  component: 'ModelExecutionAdapter',
  blocking: true,
  scopePath: ['run:1', 'agent:TM-AG-013', 'model-output'],
  evidenceRefs: ['ev-model-1'],
  reproducible: false
};

const toolPolicySignal: FailureSignal = {
  failureClass: 'TOOL_POLICY',
  code: 'PURPOSE_OUTSIDE_REPAIR_SCOPE',
  component: 'ToolGateway',
  blocking: true,
  scopePath: ['run:1', 'agent:TM-AG-013', 'tool:TL-004'],
  toolCallRefs: ['tool-call-1'],
  reproducible: true
};

describe('M1.7 FailureAttributor + RIVE descent', () => {
  it('chooses structural authority failure as primary and keeps model/tool-policy failures secondary', () => {
    const attribution = attributeFailure({
      runId: 'run-1',
      componentId: 'TM-AG-013',
      attempt: 1,
      modelId: 'fixture-model',
      signals: [modelSignal, toolPolicySignal, authoritySignal]
    });

    expect(attribution.primaryClass).toBe('AUTHORITY');
    expect(attribution.secondaryClasses).toEqual(['TOOL_POLICY', 'MODEL']);
    expect(attribution.component).toBe('ToolGateway');
    expect(attribution.smallestFailingScope).toBe(
      'run:1 > agent:TM-AG-013 > tool:TL-004 > scope:repair-day-2'
    );
    expect(attribution.toolCallRefs).toEqual(['tool-call-1', 'tool-call-2']);
    expect(attribution.evidenceRefs).toEqual(['ev-auth-1', 'ev-model-1']);
    expect(attribution.reproducible).toBe(false);
    expect(attribution.reproducerRefs).toEqual(['fixture:adaptive-authority-001']);
  });

  it('is deterministic regardless of incoming signal order', () => {
    const first = attributeFailure({
      runId: 'run-1',
      componentId: 'TM-AG-013',
      attempt: 1,
      signals: [authoritySignal, modelSignal, toolPolicySignal]
    });
    const second = attributeFailure({
      runId: 'run-1',
      componentId: 'TM-AG-013',
      attempt: 1,
      signals: [toolPolicySignal, authoritySignal, modelSignal]
    });

    expect(second).toEqual(first);
  });

  it('ignores non-blocking observations when selecting the failure attribution', () => {
    const attribution = attributeFailure({
      runId: 'run-2',
      componentId: 'TM-AG-008',
      attempt: 2,
      signals: [
        {
          failureClass: 'MODEL',
          code: 'NON_BLOCKING_STYLE_NOTE',
          component: 'Evaluator',
          blocking: false,
          scopePath: ['run:2', 'style'],
          reproducible: false
        },
        {
          failureClass: 'TOOL_PROVIDER',
          code: 'ROUTES_PROVIDER_TIMEOUT',
          component: 'RoutesAdapter',
          blocking: true,
          scopePath: ['run:2', 'agent:TM-AG-008', 'tool:TL-005', 'provider:routes'],
          toolCallRefs: ['tool-call-timeout'],
          reproducible: true,
          reproducerRef: 'fixture:routes-timeout-001'
        }
      ]
    });

    expect(attribution.primaryClass).toBe('TOOL_PROVIDER');
    expect(attribution.secondaryClasses).toEqual([]);
    expect(attribution.failureCodes).toEqual(['ROUTES_PROVIDER_TIMEOUT']);
    expect(attribution.reproducible).toBe(true);
  });

  it('builds a RIVE descent from run scope to the smallest known failing scope', () => {
    const attribution = attributeFailure({
      runId: 'run-1',
      componentId: 'TM-AG-013',
      attempt: 1,
      signals: [authoritySignal]
    });

    expect(buildRiveDescentPlan(attribution)).toEqual([
      { depth: 0, scope: 'run:1' },
      { depth: 1, scope: 'run:1 > agent:TM-AG-013' },
      { depth: 2, scope: 'run:1 > agent:TM-AG-013 > tool:TL-004' },
      { depth: 3, scope: 'run:1 > agent:TM-AG-013 > tool:TL-004 > scope:repair-day-2' }
    ]);
  });

  it('fails closed when a failed run has no blocking signal or no scope', () => {
    expect(() => attributeFailure({
      runId: 'run-empty',
      componentId: 'TM-AG-001',
      attempt: 1,
      signals: []
    })).toThrow('FAILURE_BLOCKING_SIGNAL_MISSING');

    expect(() => attributeFailure({
      runId: 'run-noscope',
      componentId: 'TM-AG-001',
      attempt: 1,
      signals: [{
        failureClass: 'SCHEMA',
        code: 'OUTPUT_SCHEMA_INVALID',
        component: 'SchemaCompiler',
        blocking: true,
        scopePath: [],
        reproducible: true
      }]
    })).toThrow('FAILURE_SCOPE_MISSING:OUTPUT_SCHEMA_INVALID');
  });
});
