import { describe, expect, it } from 'vitest';
import type { CapabilityRequest } from '@tatil-modu/capabilities';
import {
  MAPBOX_ROUTE_PROVIDER_ID,
  MAPBOX_ROUTE_PROVIDER_QUALIFICATION,
  MapboxRouteProvider,
  type MapboxFetch
} from './index.js';

const request: CapabilityRequest = {
  capability: 'route_lookup',
  traceId: 'trace-mapbox',
  payload: {
    origin: { longitude: 29.9169, latitude: 40.7654 },
    destination: { longitude: 29.0610, latitude: 40.1950 }
  }
};

function jsonResponse(status: number, body: unknown): Awaited<ReturnType<MapboxFetch>> {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    }
  };
}

describe('MapboxRouteProvider', () => {
  it('is shipped as QUALIFIED rather than ACTIVE', () => {
    expect(MAPBOX_ROUTE_PROVIDER_QUALIFICATION).toBe('QUALIFIED');
  });

  it('uses driving-traffic and normalizes distance/duration with provider evidence', async () => {
    let requestedUrl = '';
    const fetchImpl: MapboxFetch = async (url) => {
      requestedUrl = url;
      return jsonResponse(200, {
        routes: [{ distance: 132450, duration: 7260 }]
      });
    };

    const provider = new MapboxRouteProvider({
      accessToken: 'test-token',
      fetchImpl,
      now: () => '2026-08-23T05:50:00.000Z'
    });
    const result = await provider.execute(request);

    expect(requestedUrl).toContain('/directions/v5/mapbox/driving-traffic/');
    expect(requestedUrl).toContain('depart_at=now');
    expect(result).toMatchObject({
      ok: true,
      capability: 'route_lookup',
      traceId: 'trace-mapbox',
      data: {
        distanceKm: 132.45,
        durationMinutes: 121,
        trafficAware: true,
        provider: MAPBOX_ROUTE_PROVIDER_ID
      },
      evidence: [{
        sourceId: MAPBOX_ROUTE_PROVIDER_ID,
        sourceType: 'provider',
        observedAt: '2026-08-23T05:50:00.000Z',
        freshness: 'fresh'
      }]
    });
  });

  it('requires an access token', () => {
    expect(() => new MapboxRouteProvider({ accessToken: '   ', fetchImpl: async () => jsonResponse(200, {}) }))
      .toThrow('Mapbox access token is required');
  });

  it('normalizes HTTP 429 into retryable PROVIDER_RATE_LIMIT', async () => {
    const provider = new MapboxRouteProvider({
      accessToken: 'test-token',
      fetchImpl: async () => jsonResponse(429, { message: 'rate limited' })
    });

    await expect(provider.execute(request)).resolves.toMatchObject({
      ok: false,
      code: 'PROVIDER_RATE_LIMIT',
      retryable: true,
      traceId: 'trace-mapbox'
    });
  });

  it('normalizes network failures into retryable PROVIDER_UNAVAILABLE', async () => {
    const provider = new MapboxRouteProvider({
      accessToken: 'test-token',
      fetchImpl: async () => { throw new Error('network'); }
    });

    await expect(provider.execute(request)).resolves.toMatchObject({
      ok: false,
      code: 'PROVIDER_UNAVAILABLE',
      retryable: true
    });
  });

  it('rejects malformed and empty route payloads', async () => {
    const malformed = new MapboxRouteProvider({
      accessToken: 'test-token',
      fetchImpl: async () => jsonResponse(200, { unexpected: true })
    });
    const empty = new MapboxRouteProvider({
      accessToken: 'test-token',
      fetchImpl: async () => jsonResponse(200, { routes: [] })
    });

    await expect(malformed.execute(request)).resolves.toMatchObject({ ok: false, code: 'MALFORMED_PROVIDER_PAYLOAD' });
    await expect(empty.execute(request)).resolves.toMatchObject({ ok: false, code: 'EMPTY_RESULT' });
  });

  it('refuses capabilities outside route_lookup', async () => {
    const provider = new MapboxRouteProvider({
      accessToken: 'test-token',
      fetchImpl: async () => jsonResponse(200, {})
    });

    await expect(provider.execute({ ...request, capability: 'parking_lookup' })).resolves.toMatchObject({
      ok: false,
      code: 'UNAUTHORIZED_CAPABILITY',
      retryable: false
    });
  });
});
