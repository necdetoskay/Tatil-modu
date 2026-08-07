import { describe, expect, it } from 'vitest';
import { DeterministicMockProvider } from './index.js';

const fixtures = [
  { fixtureId: 'ok-route', data: { km: 42 }, evidence: [{ sourceId: 'route-fixture', observedAt: '2026-08-07T20:00:00Z', freshness: 'fresh' as const }] },
  { fixtureId: 'timeout', fault: 'timeout' as const },
  { fixtureId: 'rate', fault: 'rate_limit' as const },
  { fixtureId: 'down', fault: 'unavailable' as const },
  { fixtureId: 'bad', fault: 'malformed' as const },
  { fixtureId: 'empty', fault: 'empty' as const }
];

describe('DeterministicMockProvider', () => {
  it('replays the same fixture deterministically', async () => {
    const provider = new DeterministicMockProvider(fixtures);
    const request = { capability: 'route_lookup' as const, traceId: 'trace-1', fixtureId: 'ok-route', payload: { from: 'A', to: 'B' } };
    expect(await provider.execute(request)).toEqual(await provider.execute(request));
  });

  it.each([
    ['timeout', 'PROVIDER_TIMEOUT', true],
    ['rate', 'PROVIDER_RATE_LIMIT', true],
    ['down', 'PROVIDER_UNAVAILABLE', true],
    ['empty', 'EMPTY_RESULT', false]
  ] as const)('normalizes fault %s', async (fixtureId, code, retryable) => {
    const provider = new DeterministicMockProvider(fixtures);
    const result = await provider.execute({ capability: 'route_lookup', traceId: 'trace-x', fixtureId, payload: {} });
    expect(result).toMatchObject({ ok: false, code, retryable });
  });

  it('returns normalized evidence envelope on success', async () => {
    const provider = new DeterministicMockProvider(fixtures);
    const result = await provider.execute<{ km: number }>({ capability: 'route_lookup', traceId: 'trace-2', fixtureId: 'ok-route', payload: {} });
    expect(result).toMatchObject({ ok: true, capability: 'route_lookup', traceId: 'trace-2' });
    if (result.ok) {
      expect(result.data.km).toBe(42);
      expect(result.evidence[0]).toMatchObject({ sourceId: 'route-fixture', sourceType: 'mock', freshness: 'fresh' });
    }
  });

  it('does not require or invoke network for deterministic fixtures', async () => {
    const originalFetch = globalThis.fetch;
    let networkCalls = 0;
    globalThis.fetch = (async () => { networkCalls += 1; throw new Error('network forbidden'); }) as typeof fetch;
    try {
      const provider = new DeterministicMockProvider(fixtures);
      const result = await provider.execute({ capability: 'route_lookup', traceId: 'trace-net', fixtureId: 'ok-route', payload: {} });
      expect(result.ok).toBe(true);
      expect(networkCalls).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
