import type { HarnessProfile, MemoryClass } from './index.js';

export type ContextAuthority =
  | 'domain_truth'
  | 'approved_source'
  | 'retrieval_representation'
  | 'derived_ai_memory'
  | 'execution_context'
  | 'conversation_context';

export interface HarnessContextRecord {
  refId: string;
  scopeId: string;
  memoryClass: MemoryClass;
  authority: ContextAuthority;
  estimatedTokens: number;
  stale?: boolean;
  sensitive?: boolean;
  persistenceApproved?: boolean;
  evidenceRefs?: readonly string[];
}

export interface ContextExclusion {
  refId: string;
  reason:
    | 'SCOPE_MISMATCH'
    | 'MEMORY_CLASS_NOT_ALLOWED'
    | 'STALE_DERIVED_OR_RETRIEVAL_CONTEXT'
    | 'SENSITIVE_CONTEXT_NOT_APPROVED'
    | 'CONTEXT_BUDGET_EXCEEDED';
}

export interface BuiltHarnessContext {
  profileId: HarnessProfile['id'];
  scopeId: string;
  included: readonly HarnessContextRecord[];
  excluded: readonly ContextExclusion[];
  estimatedTokens: number;
}

const authorityRank: Record<ContextAuthority, number> = {
  domain_truth: 0,
  approved_source: 1,
  retrieval_representation: 2,
  derived_ai_memory: 3,
  execution_context: 4,
  conversation_context: 5
};

export function buildHarnessContext(
  profile: HarnessProfile,
  scopeId: string,
  records: readonly HarnessContextRecord[]
): BuiltHarnessContext {
  const excluded: ContextExclusion[] = [];
  const candidates = records
    .filter((record) => {
      if (record.scopeId !== scopeId) {
        excluded.push({ refId: record.refId, reason: 'SCOPE_MISMATCH' });
        return false;
      }

      if (!profile.allowedMemoryClasses.includes(record.memoryClass)) {
        excluded.push({ refId: record.refId, reason: 'MEMORY_CLASS_NOT_ALLOWED' });
        return false;
      }

      if (record.stale && (record.memoryClass === 'M2' || record.memoryClass === 'M4')) {
        excluded.push({ refId: record.refId, reason: 'STALE_DERIVED_OR_RETRIEVAL_CONTEXT' });
        return false;
      }

      if (record.sensitive && record.memoryClass !== 'M0' && !record.persistenceApproved) {
        excluded.push({ refId: record.refId, reason: 'SENSITIVE_CONTEXT_NOT_APPROVED' });
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const authorityDelta = authorityRank[a.authority] - authorityRank[b.authority];
      if (authorityDelta !== 0) return authorityDelta;
      return a.refId.localeCompare(b.refId);
    });

  const included: HarnessContextRecord[] = [];
  const maxTokens = profile.maxContextTokens ?? Number.POSITIVE_INFINITY;
  let estimatedTokens = 0;

  for (const record of candidates) {
    if (estimatedTokens + record.estimatedTokens > maxTokens) {
      excluded.push({ refId: record.refId, reason: 'CONTEXT_BUDGET_EXCEEDED' });
      continue;
    }

    included.push(record);
    estimatedTokens += record.estimatedTokens;
  }

  return {
    profileId: profile.id,
    scopeId,
    included,
    excluded: excluded.sort((a, b) => a.refId.localeCompare(b.refId)),
    estimatedTokens
  };
}
