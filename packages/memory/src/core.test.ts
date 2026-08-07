import { describe, expect, it } from 'vitest';
import { InMemoryMemoryRepository, type MemoryRecord } from './core.js';

const baseRecord = (overrides: Partial<MemoryRecord> = {}): MemoryRecord => ({
  id: 'mem-1',
  key: 'travel.preference.low_fatigue',
  value: true,
  scope: 'user',
  origin: 'user_explicit',
  requiresConsent: false,
  consentGranted: true,
  confidence: 1,
  createdAt: '2026-08-07T20:00:00Z',
  status: 'active',
  provenance: { sourceType: 'user', sourceRef: 'turn-1', observedAt: '2026-08-07T20:00:00Z' },
  ...overrides
});

describe('InMemoryMemoryRepository', () => {
  it('rejects direct agent canonical writes', () => {
    const repo = new InMemoryMemoryRepository();
    expect(repo.writeCandidate({ actor: 'agent', record: baseRecord() })).toEqual({ ok: false, code: 'UNAUTHORIZED_WRITER' });
    expect(repo.snapshot()).toHaveLength(0);
  });

  it('requires consent when the record is consent-gated', () => {
    const repo = new InMemoryMemoryRepository();
    const record = baseRecord({ requiresConsent: true, consentGranted: false });
    expect(repo.writeCandidate({ actor: 'memory_platform', record })).toEqual({ ok: false, code: 'CONSENT_REQUIRED' });
    expect(repo.snapshot()).toHaveLength(0);
  });

  it('preserves provenance on canonical write and read', () => {
    const repo = new InMemoryMemoryRepository();
    const record = baseRecord();
    expect(repo.writeCandidate({ actor: 'memory_platform', record }).ok).toBe(true);
    const [read] = repo.readActive('2026-08-07T21:00:00Z');
    expect(read?.provenance).toEqual(record.provenance);
  });

  it('does not return expired records as active memory', () => {
    const repo = new InMemoryMemoryRepository();
    repo.writeCandidate({ actor: 'memory_platform', record: baseRecord({ expiresAt: '2026-08-07T20:30:00Z' }) });
    expect(repo.readActive('2026-08-07T21:00:00Z')).toHaveLength(0);
  });

  it.each(['deleted', 'expired', 'superseded', 'invalidated'] as const)('does not return %s records as active memory', (status) => {
    const repo = new InMemoryMemoryRepository();
    repo.writeCandidate({ actor: 'memory_platform', record: baseRecord({ status }) });
    expect(repo.readActive('2026-08-07T21:00:00Z')).toHaveLength(0);
  });

  it('isolates reads by scope', () => {
    const repo = new InMemoryMemoryRepository();
    repo.writeCandidate({ actor: 'memory_platform', record: baseRecord({ id: 'user-1', scope: 'user' }) });
    repo.writeCandidate({ actor: 'memory_platform', record: baseRecord({ id: 'trip-1', scope: 'trip' }) });
    expect(repo.readActive('2026-08-07T21:00:00Z', 'trip').map((item) => item.id)).toEqual(['trip-1']);
  });

  it('orders explicit memory ahead of contextual and inferred memory deterministically', () => {
    const repo = new InMemoryMemoryRepository();
    repo.writeCandidate({ actor: 'memory_platform', record: baseRecord({ id: 'm3', key: 'k', origin: 'inferred' }) });
    repo.writeCandidate({ actor: 'memory_platform', record: baseRecord({ id: 'm2', key: 'k', origin: 'conversation_context' }) });
    repo.writeCandidate({ actor: 'memory_platform', record: baseRecord({ id: 'm1', key: 'k', origin: 'user_explicit' }) });
    expect(repo.readActive('2026-08-07T21:00:00Z').map((item) => item.id)).toEqual(['m1', 'm2', 'm3']);
  });
});
