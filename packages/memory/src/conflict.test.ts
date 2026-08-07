import { describe, expect, it } from 'vitest';
import { InMemoryMemoryRepository, type MemoryRecord } from './core.js';

const now = '2026-08-07T20:30:00Z';

function record(overrides: Partial<MemoryRecord> & Pick<MemoryRecord, 'id' | 'key' | 'value'>): MemoryRecord {
  return {
    id: overrides.id,
    key: overrides.key,
    value: overrides.value,
    scope: overrides.scope ?? 'user',
    origin: overrides.origin ?? 'conversation_context',
    requiresConsent: overrides.requiresConsent ?? false,
    consentGranted: overrides.consentGranted ?? true,
    confidence: overrides.confidence ?? 1,
    createdAt: overrides.createdAt ?? '2026-08-07T20:00:00Z',
    expiresAt: overrides.expiresAt,
    status: overrides.status ?? 'active',
    provenance: overrides.provenance ?? { sourceType: 'conversation', sourceRef: 'turn-1', observedAt: '2026-08-07T20:00:00Z' },
    supersedesId: overrides.supersedesId
  };
}

function write(repo: InMemoryMemoryRepository, memory: MemoryRecord) {
  return repo.writeCandidate({ actor: 'memory_platform', record: memory });
}

describe('memory conflict/correction/disclosure semantics', () => {
  it('represents conflicting active memories instead of silently picking one', () => {
    const repo = new InMemoryMemoryRepository();
    write(repo, record({ id: 'm1', key: 'travel_pace', value: 'slow' }));
    write(repo, record({ id: 'm2', key: 'travel_pace', value: 'fast', origin: 'user_explicit' }));

    expect(repo.detectConflicts(now, 'user')).toEqual([
      { key: 'travel_pace', scope: 'user', recordIds: ['m1', 'm2'] }
    ]);
    expect(repo.resolveForRequest(now, 'user', 'travel_pace')).toMatchObject({ source: 'none' });
  });

  it('current request takes precedence over conflicting memory', () => {
    const repo = new InMemoryMemoryRepository();
    write(repo, record({ id: 'm1', key: 'travel_pace', value: 'slow' }));
    write(repo, record({ id: 'm2', key: 'travel_pace', value: 'fast' }));

    expect(repo.resolveForRequest(now, 'user', 'travel_pace', 'balanced')).toEqual({
      value: 'balanced',
      source: 'current_request'
    });
  });

  it('correction supersedes the old record and exposes only the replacement as active', () => {
    const repo = new InMemoryMemoryRepository();
    write(repo, record({ id: 'old', key: 'budget_style', value: 'economy' }));
    expect(write(repo, record({ id: 'new', key: 'budget_style', value: 'comfort', origin: 'user_explicit', supersedesId: 'old' }))).toEqual({ ok: true, recordId: 'new' });

    expect(repo.readActive(now, 'user').map((item) => item.id)).toEqual(['new']);
    expect(repo.snapshot().find((item) => item.id === 'old')?.status).toBe('superseded');
  });

  it('rejects correction that references an unknown superseded record', () => {
    const repo = new InMemoryMemoryRepository();
    expect(write(repo, record({ id: 'new', key: 'budget_style', value: 'comfort', supersedesId: 'missing' }))).toEqual({
      ok: false,
      code: 'SUPERSEDED_RECORD_NOT_FOUND'
    });
  });

  it('forget marks the record deleted and removes it from active reads', () => {
    const repo = new InMemoryMemoryRepository();
    write(repo, record({ id: 'm1', key: 'parking_preference', value: true }));
    expect(repo.forget('m1')).toBe(true);
    expect(repo.readActive(now, 'user')).toEqual([]);
    expect(repo.snapshot()[0]?.status).toBe('deleted');
  });

  it('returns disclosure metadata when memory influences resolution', () => {
    const repo = new InMemoryMemoryRepository();
    write(repo, record({
      id: 'm1',
      key: 'midday_rest',
      value: true,
      origin: 'user_explicit',
      provenance: { sourceType: 'user', sourceRef: 'turn-42', observedAt: '2026-08-07T19:00:00Z' }
    }));

    const result = repo.resolveForRequest<boolean>(now, 'user', 'midday_rest');
    expect(result).toMatchObject({
      value: true,
      source: 'memory',
      disclosure: {
        recordId: 'm1',
        key: 'midday_rest',
        scope: 'user',
        origin: 'user_explicit',
        provenance: { sourceRef: 'turn-42' }
      }
    });
  });
});
