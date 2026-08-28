import { describe, expect, it } from 'vitest';
import {
  CANONICAL_TOOL_IDS,
  authorizeToolRequest,
  executeThroughToolGateway,
  loadAgentRegistry,
  loadFixtureInventory,
  loadToolAuthorityPolicies,
  type CanonicalToolId,
  type ToolAuthorityPolicyProjection
} from '../../harness/src/index.js';

function request(componentId: string, toolId: CanonicalToolId) {
  return {
    requestId: `req:${componentId}:${toolId}`,
    componentId,
    toolId,
    purpose: 'R6 contract test',
    input: {}
  } as const;
}

function scopedRequest(componentId: string, toolId: CanonicalToolId, targetScopeRef = 'day-2', escalation = false) {
  return {
    ...request(componentId, toolId),
    authorityContext: {
      repairId: 'repair-1',
      triggerRef: 'trigger-1',
      affectedScopeRef: 'day-2',
      targetScopeRef,
      scopeEscalationApproved: escalation
    }
  } as const;
}

describe('M1.5 ToolGateway R6 authority enforcement', () => {
  it('projects all 17 golden tool policies without full allow/deny overlap', async () => {
    const registry = await loadAgentRegistry();
    const policies = await loadToolAuthorityPolicies(registry);

    expect(policies).toHaveLength(17);
    expect(policies.map(policy => policy.componentId).sort()).toEqual(
      registry.entries.map(entry => entry.componentId).sort()
    );

    for (const policy of policies) {
      expect(policy.allowedToolIds.length).toBeGreaterThan(0);
      expect(policy.allowedToolIds.filter(toolId => policy.explicitForbiddenToolIds.includes(toolId))).toEqual([]);
      expect(policy.conditionalBehaviorToolIds.every(toolId => policy.allowedToolIds.includes(toolId))).toBe(true);
      expect(policy.allowedToolIds.every(toolId => CANONICAL_TOOL_IDS.includes(toolId))).toBe(true);
      expect(policy.explicitForbiddenToolIds.every(toolId => CANONICAL_TOOL_IDS.includes(toolId))).toBe(true);
    }
  });

  it('blocks Orchestrator direct domain tools before adapter execution', async () => {
    const registry = await loadAgentRegistry();
    const policies = await loadToolAuthorityPolicies(registry);
    const orchestrator = policies.find(policy => policy.componentId === 'TM-ORCH-001');
    if (!orchestrator) throw new Error('orchestrator policy missing');

    expect(orchestrator.allowedToolIds).toEqual(['TL-012', 'TL-014']);
    for (const toolId of CANONICAL_TOOL_IDS.filter(toolId => !['TL-012', 'TL-014'].includes(toolId))) {
      let adapterCalls = 0;
      const result = await executeThroughToolGateway({
        policy: orchestrator,
        request: request('TM-ORCH-001', toolId),
        adapter: () => {
          adapterCalls += 1;
          return { shouldNotRun: true };
        }
      });

      expect(result.decision.decision).toBe('DENY');
      expect(result.decision.failureClass).toBe('AUTHORITY');
      expect(result.decision.failureCode).toBe('TOOL_AUTHORITY_VIOLATION');
      expect(result.adapterExecuted).toBe(false);
      expect(adapterCalls).toBe(0);
    }
  });

  it('allows the same domain tool only for a specialist whose policy explicitly allows it', async () => {
    const registry = await loadAgentRegistry();
    const policies = await loadToolAuthorityPolicies(registry);
    const place = policies.find(policy => policy.componentId === 'TM-AG-004');
    const orchestrator = policies.find(policy => policy.componentId === 'TM-ORCH-001');
    if (!place || !orchestrator) throw new Error('required policies missing');

    expect(authorizeToolRequest(place, request('TM-AG-004', 'TL-004')).decision).toBe('ALLOW');
    expect(authorizeToolRequest(orchestrator, request('TM-ORCH-001', 'TL-004')).decision).toBe('DENY');
    expect(authorizeToolRequest(place, request('TM-AG-004', 'TL-005')).decision).toBe('DENY');
  });

  it('enforces Adaptive conditional tool scope instead of flattening it to allow/deny', async () => {
    const registry = await loadAgentRegistry();
    const policies = await loadToolAuthorityPolicies(registry);
    const adaptive = policies.find(policy => policy.componentId === 'TM-AG-013');
    if (!adaptive) throw new Error('Adaptive policy missing');

    expect(adaptive.conditionalBehaviorToolIds).toEqual(['TL-004', 'TL-005', 'TL-006', 'TL-010']);
    expect(authorizeToolRequest(adaptive, request('TM-AG-013', 'TL-004')).reason).toBe('DENY_SCOPE_CONTEXT');
    expect(authorizeToolRequest(adaptive, scopedRequest('TM-AG-013', 'TL-004')).reason).toBe('ALLOW_SCOPED');
    expect(authorizeToolRequest(adaptive, scopedRequest('TM-AG-013', 'TL-004', 'day-5')).reason).toBe('DENY_SCOPE_CONTEXT');
    expect(authorizeToolRequest(adaptive, scopedRequest('TM-AG-013', 'TL-004', 'day-5', true)).reason).toBe('ALLOW_SCOPED');
  });

  it('uses secure default DENY for tools not explicitly listed as allowed', () => {
    const policy: ToolAuthorityPolicyProjection = {
      componentId: 'TM-TEST-001',
      allowedToolIds: ['TL-012'],
      explicitForbiddenToolIds: [],
      conditionalBehaviorToolIds: [],
      sourceRef: 'synthetic-policy.md'
    };

    const decision = authorizeToolRequest(policy, request('TM-TEST-001', 'TL-001'));
    expect(decision.decision).toBe('DENY');
    expect(decision.reason).toBe('DENY_UNLISTED');
  });

  it('matches every normalized golden tool-policy fixture that declares TL-id + ALLOW/DENY', async () => {
    const registry = await loadAgentRegistry();
    const policies = await loadToolAuthorityPolicies(registry);
    const policyById = new Map(policies.map(policy => [policy.componentId, policy]));
    const inventory = await loadFixtureInventory(registry);

    const fixtureCases = inventory.packs.flatMap(pack =>
      pack.cases.filter(item => item.groupKind === 'tool_policy')
    );
    expect(fixtureCases.length).toBeGreaterThan(0);

    let executableAssertions = 0;
    const mismatches: string[] = [];
    for (const fixture of fixtureCases) {
      const tool = fixture.payload.tool;
      const expected = fixture.payload.expected;
      if (
        typeof tool !== 'string' ||
        !CANONICAL_TOOL_IDS.includes(tool as CanonicalToolId) ||
        (expected !== 'ALLOW' && expected !== 'DENY')
      ) continue;

      executableAssertions += 1;
      const policy = policyById.get(fixture.componentId);
      if (!policy) throw new Error(`policy missing: ${fixture.componentId}`);
      const canonicalTool = tool as CanonicalToolId;
      const toolRequest = expected === 'ALLOW' && policy.conditionalBehaviorToolIds.includes(canonicalTool)
        ? scopedRequest(fixture.componentId, canonicalTool)
        : request(fixture.componentId, canonicalTool);
      const actual = authorizeToolRequest(policy, toolRequest).decision;
      if (actual !== expected) mismatches.push(`${fixture.componentId}:${fixture.fixtureId}:${tool}:${expected}->${actual}`);
    }

    expect(executableAssertions).toBeGreaterThan(0);
    expect(mismatches).toEqual([]);
  });
});
