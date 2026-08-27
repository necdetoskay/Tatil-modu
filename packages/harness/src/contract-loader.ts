import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { AgentRegistryEntry } from './agent-registry.js';

export interface LoadedContractArtifact {
  ref: string;
  content: string;
  normalizedContent: string;
}

export interface ResolvedAgentContractBundle {
  entry: AgentRegistryEntry;
  artifacts: {
    specification: LoadedContractArtifact;
    inputSchema: LoadedContractArtifact;
    outputSchema: LoadedContractArtifact;
    authorityPolicy: LoadedContractArtifact;
    toolPolicy: LoadedContractArtifact;
    sourcePolicy: LoadedContractArtifact;
    decisionRules: LoadedContractArtifact;
    handoffContracts: LoadedContractArtifact;
    evaluationRubric: LoadedContractArtifact;
    fixturePack: LoadedContractArtifact;
  };
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  fixturePack: Record<string, unknown>;
  contractHash: string;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableJson(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function normalizeText(content: string): string {
  return content
    .replaceAll('\r\n', '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trimEnd();
}

function normalizeArtifact(ref: string, content: string): string {
  if (ref.endsWith('.json')) {
    const parsed: unknown = JSON.parse(content);
    return stableJson(parsed);
  }
  return normalizeText(content);
}

async function loadArtifact(repoRoot: string, ref: string): Promise<LoadedContractArtifact> {
  const content = await readFile(resolve(repoRoot, ref), 'utf8');
  return { ref, content, normalizedContent: normalizeArtifact(ref, content) };
}

function parseJsonRecord(artifact: LoadedContractArtifact, label: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(artifact.content);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object: ${artifact.ref}`);
  }
  return parsed as Record<string, unknown>;
}

export function computeContractBundleHash(bundle: Omit<ResolvedAgentContractBundle, 'contractHash'>): string {
  const orderedArtifacts = [
    bundle.artifacts.specification,
    bundle.artifacts.inputSchema,
    bundle.artifacts.outputSchema,
    bundle.artifacts.authorityPolicy,
    bundle.artifacts.toolPolicy,
    bundle.artifacts.sourcePolicy,
    bundle.artifacts.decisionRules,
    bundle.artifacts.handoffContracts,
    bundle.artifacts.evaluationRubric,
    bundle.artifacts.fixturePack
  ];

  const hash = createHash('sha256');
  hash.update(`componentId=${bundle.entry.componentId}\n`);
  hash.update(`contractVersion=${bundle.entry.contractVersion}\n`);
  for (const artifact of orderedArtifacts) {
    hash.update(`ref=${artifact.ref}\n`);
    hash.update(artifact.normalizedContent);
    hash.update('\n---\n');
  }
  return hash.digest('hex');
}

export function validateResolvedContractBundle(bundle: ResolvedAgentContractBundle): string[] {
  const errors: string[] = [];

  if (bundle.entry.lifecycleState !== 'golden_contract') errors.push('CONTRACT_NOT_GOLDEN');
  if (bundle.artifacts.specification.normalizedContent.length === 0) errors.push('SPECIFICATION_EMPTY');
  if (bundle.artifacts.authorityPolicy.normalizedContent.length === 0) errors.push('AUTHORITY_POLICY_EMPTY');
  if (bundle.artifacts.toolPolicy.normalizedContent.length === 0) errors.push('TOOL_POLICY_EMPTY');
  if (bundle.artifacts.sourcePolicy.normalizedContent.length === 0) errors.push('SOURCE_POLICY_EMPTY');
  if (bundle.artifacts.decisionRules.normalizedContent.length === 0) errors.push('DECISION_RULES_EMPTY');
  if (bundle.artifacts.handoffContracts.normalizedContent.length === 0) errors.push('HANDOFF_CONTRACTS_EMPTY');
  if (bundle.artifacts.evaluationRubric.normalizedContent.length === 0) errors.push('EVALUATION_RUBRIC_EMPTY');

  for (const [label, schema] of [
    ['INPUT', bundle.inputSchema],
    ['OUTPUT', bundle.outputSchema]
  ] as const) {
    if (typeof schema.$schema !== 'string') errors.push(`${label}_SCHEMA_DIALECT_MISSING`);
    if (typeof schema.$id !== 'string') errors.push(`${label}_SCHEMA_ID_MISSING`);
    if (schema.type !== 'object') errors.push(`${label}_SCHEMA_ROOT_NOT_OBJECT`);
  }

  const fixtureOwner = bundle.fixturePack.agentId ?? bundle.fixturePack.orchestratorId;
  if (fixtureOwner !== bundle.entry.componentId) errors.push('FIXTURE_OWNER_MISMATCH');
  if (bundle.fixturePack.schemaVersion !== '1.0') errors.push('FIXTURE_SCHEMA_VERSION_INVALID');

  if (!/^[a-f0-9]{64}$/.test(bundle.contractHash)) errors.push('CONTRACT_HASH_INVALID');
  return [...new Set(errors)].sort();
}

export async function loadResolvedContractBundle(
  entry: AgentRegistryEntry,
  repoRoot = process.cwd()
): Promise<ResolvedAgentContractBundle> {
  const [
    specification,
    inputSchemaArtifact,
    outputSchemaArtifact,
    authorityPolicy,
    toolPolicy,
    sourcePolicy,
    decisionRules,
    handoffContracts,
    evaluationRubric,
    fixturePackArtifact
  ] = await Promise.all([
    loadArtifact(repoRoot, entry.specificationRef),
    loadArtifact(repoRoot, entry.inputSchemaRef),
    loadArtifact(repoRoot, entry.outputSchemaRef),
    loadArtifact(repoRoot, entry.authorityPolicyRef),
    loadArtifact(repoRoot, entry.toolPolicyRef),
    loadArtifact(repoRoot, entry.sourcePolicyRef),
    loadArtifact(repoRoot, entry.decisionRulesRef),
    loadArtifact(repoRoot, entry.handoffContractsRef),
    loadArtifact(repoRoot, entry.evaluationRubricRef),
    loadArtifact(repoRoot, entry.fixturePackRef)
  ]);

  const withoutHash = {
    entry,
    artifacts: {
      specification,
      inputSchema: inputSchemaArtifact,
      outputSchema: outputSchemaArtifact,
      authorityPolicy,
      toolPolicy,
      sourcePolicy,
      decisionRules,
      handoffContracts,
      evaluationRubric,
      fixturePack: fixturePackArtifact
    },
    inputSchema: parseJsonRecord(inputSchemaArtifact, 'input schema'),
    outputSchema: parseJsonRecord(outputSchemaArtifact, 'output schema'),
    fixturePack: parseJsonRecord(fixturePackArtifact, 'fixture pack')
  } satisfies Omit<ResolvedAgentContractBundle, 'contractHash'>;

  return { ...withoutHash, contractHash: computeContractBundleHash(withoutHash) };
}
