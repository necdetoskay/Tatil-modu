export type MemoryScope = 'user' | 'household' | 'trip';
export type MemoryOrigin = 'user_explicit' | 'conversation_context' | 'inferred';
export type MemoryStatus = 'active' | 'deleted' | 'expired' | 'superseded' | 'invalidated';

export interface MemoryProvenance {
  sourceType: 'user' | 'conversation' | 'system';
  sourceRef: string;
  observedAt: string;
}

export interface MemoryRecord<TValue = unknown> {
  id: string;
  key: string;
  value: TValue;
  scope: MemoryScope;
  origin: MemoryOrigin;
  requiresConsent: boolean;
  consentGranted: boolean;
  confidence: number;
  createdAt: string;
  expiresAt?: string;
  status: MemoryStatus;
  provenance: MemoryProvenance;
}

export interface MemoryWriteCandidate<TValue = unknown> {
  record: MemoryRecord<TValue>;
  actor: 'memory_platform' | 'agent';
}

export type MemoryWriteResult =
  | { ok: true; recordId: string }
  | { ok: false; code: 'UNAUTHORIZED_WRITER' | 'CONSENT_REQUIRED' };

export class InMemoryMemoryRepository {
  private readonly records = new Map<string, MemoryRecord>();

  writeCandidate(candidate: MemoryWriteCandidate): MemoryWriteResult {
    if (candidate.actor !== 'memory_platform') {
      return { ok: false, code: 'UNAUTHORIZED_WRITER' };
    }
    if (candidate.record.requiresConsent && !candidate.record.consentGranted) {
      return { ok: false, code: 'CONSENT_REQUIRED' };
    }
    this.records.set(candidate.record.id, structuredClone(candidate.record));
    return { ok: true, recordId: candidate.record.id };
  }

  readActive(nowIso: string, scope?: MemoryScope): MemoryRecord[] {
    const now = Date.parse(nowIso);
    return [...this.records.values()]
      .filter((record) => record.status === 'active')
      .filter((record) => !scope || record.scope === scope)
      .filter((record) => !record.expiresAt || Date.parse(record.expiresAt) > now)
      .sort((a, b) => {
        const originRank: Record<MemoryOrigin, number> = { user_explicit: 0, conversation_context: 1, inferred: 2 };
        return originRank[a.origin] - originRank[b.origin] || a.key.localeCompare(b.key) || a.id.localeCompare(b.id);
      })
      .map((record) => structuredClone(record));
  }

  snapshot(): MemoryRecord[] {
    return [...this.records.values()].map((record) => structuredClone(record));
  }
}
