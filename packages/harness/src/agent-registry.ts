import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const AGENT_REGISTRY_RELATIVE_PATH = 'packages/harness/registry/agent-registry.v1.json' as const;

export type RegistryComponentType = 'specialist' | 'orchestrator';
export type RegistryLifecycleState = 'golden_contract';

export interface AgentRegistryEntry {
  componentId: string;
  componentType: RegistryComponentType;
  name: string;
  contractVersion: string;
  lifecycleState: RegistryLifecycleState;
  packagePath: string;
  specificationRef: string;
  inputSchemaRef: string;
  outputSchemaRef: string;
  authorityPolicyRef: string;
  toolPolicyRef: string;
  sourcePolicyRef: string;
  decisionRulesRef: string;
  handoffContractsRef: string;
  evaluationRubricRef: string;
  fixturePackRef: string;
}

export interface AgentRegistry {
  schemaVersion: '1.0';
  registryId: string;
  registryVersion: string;
  catalogVersion: string;
  harnessBaselineVersion: string;
  hashStrategy: 'sha256-normalized-contract-bundle';
  entries: AgentRegistryEntry[];
}

const requiredEntryStringFields = [
  'componentId',
  'name',
  'contractVersion',
  'packagePath',
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function validateAgentRegistry(value: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(value)) return ['REGISTRY_NOT_OBJECT'];

  if (value.schemaVersion !== '1.0') errors.push('REGISTRY_SCHEMA_VERSION_INVALID');
  if (!isNonEmptyString(value.registryId)) errors.push('REGISTRY_ID_MISSING');
  if (!isNonEmptyString(value.registryVersion)) errors.push('REGISTRY_VERSION_MISSING');
  if (!isNonEmptyString(value.catalogVersion)) errors.push('CATALOG_VERSION_MISSING');
  if (!isNonEmptyString(value.harnessBaselineVersion)) errors.push('HARNESS_BASELINE_VERSION_MISSING');
  if (value.hashStrategy !== 'sha256-normalized-contract-bundle') errors.push('HASH_STRATEGY_INVALID');
  if (!Array.isArray(value.entries)) return [...errors, 'REGISTRY_ENTRIES_NOT_ARRAY'];

  const ids = new Set<string>();
  for (const [index, rawEntry] of value.entries.entries()) {
    if (!isRecord(rawEntry)) {
      errors.push(`ENTRY_${index}_NOT_OBJECT`);
      continue;
    }

    for (const field of requiredEntryStringFields) {
      if (!isNonEmptyString(rawEntry[field])) errors.push(`ENTRY_${index}_${String(field).toUpperCase()}_MISSING`);
    }

    if (rawEntry.componentType !== 'specialist' && rawEntry.componentType !== 'orchestrator') {
      errors.push(`ENTRY_${index}_COMPONENT_TYPE_INVALID`);
    }
    if (rawEntry.lifecycleState !== 'golden_contract') errors.push(`ENTRY_${index}_LIFECYCLE_STATE_INVALID`);

    if (isNonEmptyString(rawEntry.componentId)) {
      if (!/^TM-(?:AG|ORCH)-\d{3}$/.test(rawEntry.componentId)) errors.push(`ENTRY_${index}_COMPONENT_ID_INVALID`);
      if (ids.has(rawEntry.componentId)) errors.push(`DUPLICATE_COMPONENT_ID:${rawEntry.componentId}`);
      ids.add(rawEntry.componentId);
    }
  }

  return [...new Set(errors)].sort();
}

export async function loadAgentRegistry(repoRoot = process.cwd()): Promise<AgentRegistry> {
  const registryPath = resolve(repoRoot, AGENT_REGISTRY_RELATIVE_PATH);
  const raw = await readFile(registryPath, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  const errors = validateAgentRegistry(parsed);
  if (errors.length > 0) throw new Error(`Invalid agent registry: ${errors.join(', ')}`);
  return parsed as AgentRegistry;
}

export function findRegistryEntry(registry: AgentRegistry, componentId: string): AgentRegistryEntry | undefined {
  return registry.entries.find(entry => entry.componentId === componentId);
}
