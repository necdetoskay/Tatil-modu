import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AGENT_REGISTRY_RELATIVE_PATH,
  loadAgentRegistry,
  validateAgentRegistry,
  type AgentRegistryEntry
} from '../../harness/src/index.js';

const expectedComponentIds = [
  'TM-AG-001',
  'TM-AG-002',
  'TM-AG-003',
  'TM-AG-004',
  'TM-AG-005',
  'TM-AG-006',
  'TM-AG-007',
  'TM-AG-008',
  'TM-AG-009',
  'TM-AG-010',
  'TM-AG-011',
  'TM-AG-012',
  'TM-AG-013',
  'TM-AG-014',
  'TM-AG-015',
  'TM-AG-016',
  'TM-ORCH-001'
] as const;

const contractRefFields = [
  'specificationRef',
  'inputSchemaRef',
  'outputSchemaRef',
  'authorityPolicyRef',
  'toolPolicyRef',
  'sourcePolicyRef',
  'decisionRulesRef',
  'handoffContractsRef',
  'evaluationRubricRef',
  'fixturePackRef'
] as const satisfies readonly (keyof AgentRegistryEntry)[];

async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function parsesAsJson(path: string): Promise<boolean> {
  try {
    const raw = await readFile(path, 'utf8');
    JSON.parse(raw);
    return true;
  } catch {
    return false;
  }
}

describe('M1.1 canonical AgentRegistry', () => {
  it('loads a structurally valid machine-readable registry', async () => {
    expect(await exists(AGENT_REGISTRY_RELATIVE_PATH)).toBe(true);
    const raw = JSON.parse(await readFile(AGENT_REGISTRY_RELATIVE_PATH, 'utf8')) as unknown;
    expect(validateAgentRegistry(raw)).toEqual([]);

    const registry = await loadAgentRegistry();
    expect(registry.schemaVersion).toBe('1.0');
    expect(registry.catalogVersion).toBe('1.1');
    expect(registry.harnessBaselineVersion).toBe('1.0');
    expect(registry.hashStrategy).toBe('sha256-normalized-contract-bundle');
  });

  it('contains exactly the 16 canonical specialists plus Travel Orchestrator', async () => {
    const registry = await loadAgentRegistry();
    const actualIds = registry.entries.map(entry => entry.componentId).sort();
    expect(actualIds).toEqual([...expectedComponentIds].sort());
    expect(new Set(actualIds).size).toBe(17);
    expect(registry.entries.filter(entry => entry.componentType === 'specialist')).toHaveLength(16);
    expect(registry.entries.filter(entry => entry.componentType === 'orchestrator')).toHaveLength(1);
  });

  it('binds every component to the full golden contract package', async () => {
    const registry = await loadAgentRegistry();
    const missing: string[] = [];

    for (const entry of registry.entries) {
      for (const field of contractRefFields) {
        const ref = entry[field];
        if (typeof ref !== 'string' || !(await exists(ref))) missing.push(`${entry.componentId}:${String(field)}:${String(ref)}`);
      }
    }

    expect(missing).toEqual([]);
  });

  it('keeps package paths and all contract refs internally consistent', async () => {
    const registry = await loadAgentRegistry();
    const violations: string[] = [];

    for (const entry of registry.entries) {
      for (const field of contractRefFields) {
        const ref = entry[field];
        if (typeof ref === 'string' && !ref.startsWith(`${entry.packagePath}/`)) {
          violations.push(`${entry.componentId}:${String(field)}:OUTSIDE_PACKAGE`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('parses every input schema, output schema and fixture pack as JSON', async () => {
    const registry = await loadAgentRegistry();
    const invalidJson: string[] = [];

    for (const entry of registry.entries) {
      for (const ref of [entry.inputSchemaRef, entry.outputSchemaRef, entry.fixturePackRef]) {
        if (!(await parsesAsJson(ref))) invalidJson.push(`${entry.componentId}:${ref}`);
      }
    }

    expect(invalidJson).toEqual([]);
  });

  it('does not let the pre-freeze legacy workflow define the new registry', async () => {
    const registry = await loadAgentRegistry();
    const names = registry.entries.map(entry => entry.name);
    expect(names).not.toContain('Family Suitability Agent');
    expect(names).not.toContain('Route & Logistics Agent');
    expect(names).not.toContain('Trip Intake Agent');
  });
});
