import { describe, expect, it } from 'vitest';
import { InMemoryMemoryRepository, type MemoryRecord } from './core.js';

const now = '2026-08-07T20:30:00Z';

function rec(input: Pick<MemoryRecord, 'id' | 'key' | 'value'> & Partial<MemoryRecord>): MemoryRecord {
  const base: MemoryRecord = {
    id: input.id,
    key: input.key,
    value: input.value,
    scope: input.scope ?? 'user',
    origin: input.origin ?? 'conversation_context',
    requiresConsent: input.requiresConsent ?? false,
    consentGranted: input.consentGranted ?? true,
    confidence: input.confidence ?? 1,
    createdAt: input.createdAt ?? '2026-08-07T20:00:00Z',
    status: input.status ?? 'active',
    provenance: input.provenance ?? { sourceType: 'conversation', sourceRef: 'turn-x', observedAt: '2026-08-07T20:00:00Z' }
  };
  if (input.expiresAt !== undefined) base.expiresAt = input.expiresAt;
  if (input.supersedesId !== undefined) base.supersedesId = input.supersedesId;
  return base;
}

function write(repo: InMemoryMemoryRepository, record: MemoryRecord) {
  return repo.writeCandidate({ actor: 'memory_platform', record });
}

describe('aggregate H4 memory lifecycle', () => {
  it('classifies fresh, approaching-expiry, expired and inactive deterministically', () => {
    const repo = new InMemoryMemoryRepository();
    write(repo, rec({ id: 'fresh', key: 'a', value: 1, expiresAt: '2026-08-10T20:30:00Z' }));
    write(repo, rec({ id: 'soon', key: 'b', value: 2, expiresAt: '2026-08-08T08:30:00Z' }));
    write(repo, rec({ id: 'expired', key: 'c', value: 3, expiresAt: '2026-08-07T20:00:00Z' }));
    write(repo, rec({ id: 'deleted', key: 'd', value: 4, status: 'deleted' }));

    expect(repo.classifyStaleness('fresh', now)).toBe('fresh');
    expect(repo.classifyStaleness('soon', now)).toBe('approaching_expiry');
    expect(repo.classifyStaleness('expired', now)).toBe('expired');
    expect(repo.classifyStaleness('deleted', now)).toBe('inactive');
  });

  it('keeps snapshots deterministic regardless of write order', () => {
    const a = new InMemoryMemoryRepository();
    const b = new InMemoryMemoryRepository();
    const one = rec({ id: 'a', key: 'pace', value: 'slow' });
    const two = rec({ id: 'b', key: 'rest', value: true, origin: 'user_explicit' });
    write(a, two); write(a, one);
    write(b, one); write(b, two);
    expect(a.snapshot()).toEqual(b.snapshot());
  });

  it('handles conflict to correction to forget without leaking stale active state', () => {
    const repo = new InMemoryMemoryRepository();
    write(repo, rec({ id: 'old-1', key: 'pace', value: 'slow' }));
    write(repo, rec({ id: 'old-2', key: 'pace', value: 'fast', origin: 'user_explicit' }));

    expect(repo.detectConflicts(now, 'user')[0]?.recordIds).toEqual(['old-1', 'old-2']);
    expect(repo.resolveForRequest(now, 'user', 'pace', 'balanced')).toEqual({ value: 'balanced', source: 'current_request' });

    expect(write(repo, rec({ id: 'new', key: 'pace', value: 'balanced', origin: 'user_explicit', supersedesId: 'old-2' }))).toEqual({ ok: true, recordId: 'new' });
    expect(repo.forget('old-1')).toBe(true);

    expect(repo.detectConflicts(now, 'user')).toEqual([]);
    expect(repo.resolveForRequest(now, 'user', 'pace')).toMatchObject({ value: 'balanced', source: 'memory' });
    expect(repo.readActive(now, 'user').map((item) => item.id)).toEqual(['new']);
  });
});
