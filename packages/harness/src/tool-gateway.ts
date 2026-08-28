import type { AgentRegistry } from './agent-registry.js';
import { loadResolvedContractBundle } from './contract-loader.js';

export type CanonicalToolId =
  | 'TL-001'
  | 'TL-002'
  | 'TL-003'
  | 'TL-004'
  | 'TL-005'
  | 'TL-006'
  | 'TL-007'
  | 'TL-008'
  | 'TL-009'
  | 'TL-010'
  | 'TL-011'
  | 'TL-012'
  | 'TL-013'
  | 'TL-014';

export const CANONICAL_TOOL_IDS: readonly CanonicalToolId[] = [
  'TL-001', 'TL-002', 'TL-003', 'TL-004', 'TL-005', 'TL-006', 'TL-007',
  'TL-008', 'TL-009', 'TL-010', 'TL-011', 'TL-012', 'TL-013', 'TL-014'
];

export interface ToolAuthorityPolicyProjection {
  componentId: string;
  allowedToolIds: readonly CanonicalToolId[];
  explicitForbiddenToolIds: readonly CanonicalToolId[];
  sourceRef: string;
}

export interface ToolGatewayRequest {
  requestId: string;
  componentId: string;
  toolId: CanonicalToolId;
  purpose: string;
  input: unknown;
}

export type ToolGatewayDecisionReason = 'ALLOW_EXPLICIT' | 'DENY_EXPLICIT' | 'DENY_UNLISTED';

export interface ToolGatewayDecision {
  requestId: string;
  componentId: string;
  toolId: CanonicalToolId;
  decision: 'ALLOW' | 'DENY';
  reason: ToolGatewayDecisionReason;
  failureClass: 'AUTHORITY' | null;
  failureCode: 'TOOL_AUTHORITY_VIOLATION' | null;
  policySourceRef: string;
}

export interface ToolGatewayExecutionResult<T = unknown> {
  decision: ToolGatewayDecision;
  adapterExecuted: boolean;
  output: T | null;
}

function uniqueSortedTools(values: Iterable<string>): CanonicalToolId[] {
  const canonical = new Set<string>(CANONICAL_TOOL_IDS);
  return [...new Set(values)]
    .filter((value): value is CanonicalToolId => canonical.has(value))
    .sort();
}

function extractToolsBySection(markdown: string): {
  allowed: CanonicalToolId[];
  forbidden: CanonicalToolId[];
} {
  const allowed: string[] = [];
  const forbidden: string[] = [];
  let section: 'allowed' | 'forbidden' | null = null;

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      const title = heading[1]!.toLowerCase();
      if (title.startsWith('allowed')) section = 'allowed';
      else if (title.startsWith('forbidden')) section = 'forbidden';
      else section = null;
      continue;
    }

    const matches = line.match(/TL-\d{3}/g) ?? [];
    if (section === 'allowed') allowed.push(...matches);
    if (section === 'forbidden') forbidden.push(...matches);
  }

  return {
    allowed: uniqueSortedTools(allowed),
    forbidden: uniqueSortedTools(forbidden)
  };
}

export function projectToolAuthorityPolicy(args: {
  componentId: string;
  markdown: string;
  sourceRef: string;
}): ToolAuthorityPolicyProjection {
  const extracted = extractToolsBySection(args.markdown);
  const overlap = extracted.allowed.filter(toolId => extracted.forbidden.includes(toolId));
  if (overlap.length > 0) {
    throw new Error(`TOOL_POLICY_ALLOW_DENY_OVERLAP:${args.componentId}:${overlap.join(',')}`);
  }

  return {
    componentId: args.componentId,
    allowedToolIds: extracted.allowed,
    explicitForbiddenToolIds: extracted.forbidden,
    sourceRef: args.sourceRef
  };
}

export async function loadToolAuthorityPolicies(
  registry: AgentRegistry,
  repoRoot = process.cwd()
): Promise<readonly ToolAuthorityPolicyProjection[]> {
  const bundles = await Promise.all(
    registry.entries.map(entry => loadResolvedContractBundle(entry, repoRoot))
  );
  return bundles
    .map(bundle => projectToolAuthorityPolicy({
      componentId: bundle.entry.componentId,
      markdown: bundle.artifacts.toolPolicy.content,
      sourceRef: bundle.entry.toolPolicyRef
    }))
    .sort((a, b) => a.componentId.localeCompare(b.componentId));
}

export function authorizeToolRequest(
  policy: ToolAuthorityPolicyProjection,
  request: ToolGatewayRequest
): ToolGatewayDecision {
  if (policy.componentId !== request.componentId) {
    throw new Error(`TOOL_POLICY_COMPONENT_MISMATCH:${request.componentId}:${policy.componentId}`);
  }

  const explicitlyForbidden = policy.explicitForbiddenToolIds.includes(request.toolId);
  const allowed = policy.allowedToolIds.includes(request.toolId);
  const decision: 'ALLOW' | 'DENY' = allowed && !explicitlyForbidden ? 'ALLOW' : 'DENY';
  const reason: ToolGatewayDecisionReason = decision === 'ALLOW'
    ? 'ALLOW_EXPLICIT'
    : explicitlyForbidden
      ? 'DENY_EXPLICIT'
      : 'DENY_UNLISTED';

  return {
    requestId: request.requestId,
    componentId: request.componentId,
    toolId: request.toolId,
    decision,
    reason,
    failureClass: decision === 'DENY' ? 'AUTHORITY' : null,
    failureCode: decision === 'DENY' ? 'TOOL_AUTHORITY_VIOLATION' : null,
    policySourceRef: policy.sourceRef
  };
}

export async function executeThroughToolGateway<T>(args: {
  policy: ToolAuthorityPolicyProjection;
  request: ToolGatewayRequest;
  adapter: (request: Readonly<ToolGatewayRequest>) => Promise<T> | T;
}): Promise<ToolGatewayExecutionResult<T>> {
  const decision = authorizeToolRequest(args.policy, args.request);
  if (decision.decision === 'DENY') {
    return { decision, adapterExecuted: false, output: null };
  }

  const output = await args.adapter(args.request);
  return { decision, adapterExecuted: true, output };
}
