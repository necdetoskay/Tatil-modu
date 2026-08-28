import { describe, expect, it } from 'vitest';
import type { CapabilityRequest } from '@tatil-modu/capabilities';
import { FixtureDestinationProvider, FixtureRouteProvider } from './index.js';

const request = (capability: CapabilityRequest['capability']): CapabilityRequest => ({ capability, traceId: 'travel-provider-test', payload: {} });

describe('fixture travel provider adapters', () => {
  it('returns destination candidates with source evidence', async () => {
    await expect(new FixtureDestinationProvider().execute(request('place_discovery'))).resolves.toMatchObject({ ok: true, data: { candidates: [{ candidateId: 'candidate-yalova' }] }, evidence: [{ sourceType: 'mock' }] });
  });

  it('returns route facts with source evidence', async () => {
    await expect(new FixtureRouteProvider().execute(request('route_lookup'))).resolves.toMatchObject({ ok: true, data: { routes: [{ destinationId: 'candidate-yalova', exactDistanceKm: 92 }] }, evidence: [{ sourceType: 'mock' }] });
  });

  it.each(['rate_limit', 'unavailable', 'empty'] as const)('normalizes %s without fabricating data', async (fault) => {
    const result = await new FixtureRouteProvider(fault).execute(request('route_lookup'));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBeTruthy();
  });

  it('refuses a capability outside the destination adapter boundary', async () => {
    await expect(new FixtureDestinationProvider().execute(request('route_lookup'))).resolves.toMatchObject({ ok: false, code: 'UNAUTHORIZED_CAPABILITY', retryable: false });
  });
});
