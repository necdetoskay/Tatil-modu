import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ALL_R1_ORACLES,
  loadAgentRegistry,
  loadFixtureInventory,
  loadResolvedContractBundle,
  loadToolAuthorityPolicies,
  validateResolvedContractBundle
} from '../../harness/src/index.js';

interface RecordedExecutionHeader {
  componentId: string;
  fixtureId: string;
}

async function loadRecordedR2Coverage(repoRoot = process.cwd()): Promise<Map<string, Set<string>>> {
  const directory = resolve(repoRoot, 'packages/test-harness/fixtures/recorded');
  const filenames = (await readdir(directory))
    .filter(name => name.endsWith('.execution.json'))
    .sort();
  const coverage = new Map<string, Set<string>>();

  for (const filename of filenames) {
    const parsed = JSON.parse(await readFile(resolve(directory, filename), 'utf8')) as RecordedExecutionHeader;
    if (typeof parsed.componentId !== 'string' || parsed.componentId.length === 0) {
      throw new Error(`RECORDED_R2_COMPONENT_ID_MISSING:${filename}`);
    }
    if (typeof parsed.fixtureId !== 'string' || parsed.fixtureId.length === 0) {
      throw new Error(`RECORDED_R2_FIXTURE_ID_MISSING:${filename}`);
    }
    const fixtureIds = coverage.get(parsed.componentId) ?? new Set<string>();
    if (fixtureIds.has(parsed.fixtureId)) {
      throw new Error(`RECORDED_R2_DUPLICATE_FIXTURE:${parsed.componentId}:${parsed.fixtureId}`);
    }
    fixtureIds.add(parsed.fixtureId);
    coverage.set(parsed.componentId, fixtureIds);
  }

  return coverage;
}

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
      if (contractErrors.length > 0) failures.push(`${entry.componentId}:R0:${contractErrors.join(',')}`);

      const blockingR1 = ALL_R1_ORACLES.filter(
        oracle => oracle.componentId === entry.componentId && oracle.severity === 'BLOCKING'
      );
      if (blockingR1.length === 0) failures.push(`${entry.componentId}:R1:NO_BLOCKING_ORACLE`);

      const row = rowById.get(entry.componentId);
      if (!row) failures.push(`${entry.componentId}:R2:FIXTURE_ROW_MISSING`);
      else {
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

  it('requires at least one real recorded canonical R2 execution for every registered component', async () => {
    const registry = await loadAgentRegistry();
    const coverage = await loadRecordedR2Coverage();
    const registeredIds = new Set(registry.entries.map(entry => entry.componentId));
    const unknownRecordedComponents = [...coverage.keys()]
      .filter(componentId => !registeredIds.has(componentId))
      .sort();
    const missingRecordedComponents = registry.entries
      .map(entry => entry.componentId)
      .filter(componentId => (coverage.get(componentId)?.size ?? 0) === 0)
      .sort();

    expect(unknownRecordedComponents).toEqual([]);
    expect(missingRecordedComponents).toEqual([]);
    expect(coverage.size).toBe(17);
    for (const entry of registry.entries) {
      expect(coverage.get(entry.componentId)?.size ?? 0).toBeGreaterThanOrEqual(1);
    }
  });
});
