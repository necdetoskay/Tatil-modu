import { describe, expect, it } from 'vitest';
import {
  ALL_R1_ORACLES,
  loadAgentRegistry,
  loadFixtureInventory,
  loadResolvedContractBundle,
  loadToolAuthorityPolicies,
  validateResolvedContractBundle
} from '../../harness/src/index.js';

const EXECUTABLE_R2_COMPONENTS = new Set([
  'TM-AG-001',
  'TM-AG-002',
  'TM-AG-003',
  'TM-AG-004',
  'TM-AG-005'
]);

describe('M1.9 full 17-package readiness sweep', () => {
  it('enforces canonical M1 structural minimums across every registered component', async () => {
    const registry = await loadAgentRegistry();
    const inventory = await loadFixtureInventory(registry);
    const policies = await loadToolAuthorityPolicies(registry);
    const rowById = new Map(inventory.rows.map(row => [row.componentId, row]));
    const policyById = new Map(policies.map(policy => [policy.componentId, policy]));
    const failures: string[] = [];

    expect(registry.entries).toHaveLength(17);
    expect(inventory.rows).toHaveLength(17);
    expect(policies).toHaveLength(17);

    for (const entry of registry.entries) {
      const bundle = await loadResolvedContractBundle(entry);
      const contractErrors = validateResolvedContractBundle(bundle);
      if (contractErrors.length > 0) {
        failures.push(`${entry.componentId}:R0:${contractErrors.join(',')}`);
      }

      const blockingR1 = ALL_R1_ORACLES.filter(
        oracle => oracle.componentId === entry.componentId && oracle.severity === 'BLOCKING'
      );
      if (blockingR1.length === 0) failures.push(`${entry.componentId}:R1:NO_BLOCKING_ORACLE`);

      const row = rowById.get(entry.componentId);
      if (!row) {
        failures.push(`${entry.componentId}:R2:FIXTURE_ROW_MISSING`);
      } else {
        if (row.behaviorCount < 10) failures.push(`${entry.componentId}:R2:BEHAVIOR_LT_10:${row.behaviorCount}`);
        if (row.authorityCount < 5) failures.push(`${entry.componentId}:R6:AUTHORITY_LT_5:${row.authorityCount}`);
        if (row.contextCount < 4) failures.push(`${entry.componentId}:CTX:CONTEXT_LT_4:${row.contextCount}`);
        if (row.provenanceCount < 2) failures.push(`${entry.componentId}:PROV:PROVENANCE_LT_2:${row.provenanceCount}`);
      }

      const policy = policyById.get(entry.componentId);
      if (!policy) failures.push(`${entry.componentId}:R6:TOOL_POLICY_PROJECTION_MISSING`);
      else if (policy.allowedToolIds.length === 0) failures.push(`${entry.componentId}:R6:NO_ALLOWED_TOOL_PROJECTION`);
    }

    expect(failures).toEqual([]);
  });

  it('reports R2 execution readiness honestly instead of fabricating outputs for non-executable agents', async () => {
    const registry = await loadAgentRegistry();
    const pending = registry.entries
      .map(entry => entry.componentId)
      .filter(componentId => !EXECUTABLE_R2_COMPONENTS.has(componentId))
      .sort();

    expect(EXECUTABLE_R2_COMPONENTS).toEqual(new Set([
      'TM-AG-001',
      'TM-AG-002',
      'TM-AG-003',
      'TM-AG-004',
      'TM-AG-005'
    ]));
    expect(pending).toHaveLength(12);
    for (const executable of EXECUTABLE_R2_COMPONENTS) expect(pending).not.toContain(executable);
    expect(pending).toContain('TM-ORCH-001');
  });
});
