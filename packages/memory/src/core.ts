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
  supersedesId?: string;
}

export interface MemoryWriteCandidate<TValue = unknown> {
  record: MemoryRecord<TValue>;
  actor: 'memory_platform' | 'agent';
}

export type MemoryWriteResult =
  | { ok: true; recordId: string }
  | { ok: false; code: 'UNAUTHORIZED_WRITER' | 'CONSENT_REQUIRED' | 'SUPERSEDED_RECORD_NOT_FOUND' };

export interface MemoryConflict {
  key: string;
  scope: MemoryScope;
  recordIds: string[];
}

export interface MemoryDisclosure {
  recordId: string;
  key: string;
  scope: MemoryScope;
  origin: MemoryOrigin;
  provenance: MemoryProvenance;
}

const originRank: Record<MemoryOrigin, number> = {
  user_explicit: 0,
  conversation_context: 1,
  inferred: 2
};

export class InMemoryMemoryRepository {
  private readonly records = new Map<string, MemoryRecord>();

  writeCandidate(candidate: MemoryWriteCandidate): MemoryWriteResult {
    if (candidate.actor !== 'memory_platform') {
      return { ok: false, code: 'UNAUTHORIZED_WRITER' };
    }
    if (candidate.record.requiresConsent && !candidate.record.consentGranted) {
      return { ok: false, code: 'CONSENT_REQUIRED' };
    }
    if (candidate.record.supersedesId) {
      const previous = this.records.get(candidate.record.supersedesId);
      if (!previous) return { ok: false, code: 'SUPERSEDED_RECORD_NOT_FOUND' };
      this.records.set(previous.id, { ...previous, status: 'superseded' });
    }
    this.records.set(candidate.record.id, structuredClone(candidate.record));
    return { ok: true, recordId: candidate.record.id };
  }

  forget(recordId: string): boolean {
    const record = this.records.get(recordId);
    if (!record) return false;
    this.records.set(recordId, { ...record, status: 'deleted' });
    return true;
  }

  readActive(nowIso: string, scope?: MemoryScope): MemoryRecord[] {
    const now = Date.parse(nowIso);
    return [...this.records.values()]
      .filter((record) => record.status === 'active')
      .filter((record) => !scope || record.scope === scope)
      .filter((record) => !record.expiresAt || Date.parse(record.expiresAt) > now)
      .sort((a, b) => originRank[a.origin] - originRank[b.origin] || a.key.localeCompare(b.key) || a.id.localeCompare(b.id))
      .map((record) => structuredClone(record));
  }

  detectConflicts(nowIso: string, scope: MemoryScope): MemoryConflict[] {
    const grouped = new Map<string, MemoryRecord[]>();
    for (const record of this.readActive(nowIso, scope)) {
      const bucket = grouped.get(record.key) ?? [];
      bucket.push(record);
      grouped.set(record.key, bucket);
    }
    return [...grouped.entries()]
      .filter(([, records]) => new Set(records.map((record) => JSON.stringify(record.value))).size > 1)
      .map(([key, records]) => ({ key, scope, recordIds: records.map((record) => record.id).sort() }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  resolveForRequest<TValue>(
    nowIso: string,
    scope: MemoryScope,
    key: string,
    currentRequest?: TValue
  ): { value?: TValue; source: 'current_request' | 'memory' | 'none'; disclosure?: MemoryDisclosure; conflict?: MemoryConflict } {
    if (currentRequest !== undefined) {
      return { value: currentRequest, source: 'current_request' };
    }
    const records = this.readActive(nowIso, scope).filter((record) => record.key === key);
    if (records.length === 0) return { source: 'none' };
    const distinct = new Set(records.map((record) => JSON.stringify(record.value)));
    if (distinct.size > 1) {
      return { source: 'none', conflict: { key, scope, recordIds: records.map((record) => record.id).sort() } };
    }
    const selected = records[0]!;
    return {
      value: selected.value as TValue,
      source: 'memory',
      disclosure: {
        recordId: selected.id,
        key: selected.key,
        scope: selected.scope,
        origin: selected.origin,
        provenance: structuredClone(selected.provenance)
      }
    };
  }

  snapshot(): MemoryRecord[] {
    return [...this.records.values()].map((record) => structuredClone(record));
  }
}
