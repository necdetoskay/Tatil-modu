import { describe, expect, it } from 'vitest';
import type { CapabilityProvider, CapabilityRequest, CapabilityResult } from '@tatil-modu/capabilities';
import { MAPBOX_ROUTE_PROVIDER_ID } from './index.js';
import { blockedMapboxQualification, qualifyMapboxRouteProvider } from './qualification.js';

class StaticProvider implements CapabilityProvider {
  readonly providerId = MAPBOX_ROUTE_PROVIDER_ID;
  constructor(private readonly resultFactory: (request: CapabilityRequest) => CapabilityResult<unknown>) {}
  async execute(request: CapabilityRequest): Promise<CapabilityResult<unknown>> {
    return this.resultFactory(request);
  }
}

describe('Mapbox live qualification gate', () => {
  it('returns BLOCKED_MISSING_SECRET without pretending success', () => {
    const report = blockedMapboxQualification('trace-secret');
    expect(report.status).toBe('BLOCKED_MISSING_SECRET');
    expect(report.eligibleForActivation).toBe(false);
    expect(report.checks).toContainEqual({
      id: 'secret_available',
      status: 'FAIL',
      detail: 'MAPBOX_ACCESS_TOKEN is not configured.'
    });
  });

  it('marks a plausible traffic-aware evidence-backed probe as eligible for activation', async () => {
    const provider = new StaticProvider((request) => ({
      ok: true,
      capability: 'route_lookup',
      traceId: request.traceId,
      data: {
        distanceKm: 132.45,
        durationMinutes: 121,
        trafficAware: true,
        provider: MAPBOX_ROUTE_PROVIDER_ID
      },
      evidence: [{
        sourceId: MAPBOX_ROUTE_PROVIDER_ID,
        sourceType: 'provider',
        observedAt: '2026-08-23T05:55:00.000Z',
        freshness: 'fresh'
      }]
    }));

    const report = await qualifyMapboxRouteProvider(provider, 'trace-pass');
    expect(report.status).toBe('PASS');
    expect(report.eligibleForActivation).toBe(true);
    expect(report.checks.every((check) => check.status === 'PASS')).toBe(true);
  });

  it('fails qualification on implausible route values', async () => {
    const provider = new StaticProvider((request) => ({
      ok: true,
      capability: 'route_lookup',
      traceId: request.traceId,
      data: {
        distanceKm: 12,
        durationMinutes: 10,
        trafficAware: true,
        provider: MAPBOX_ROUTE_PROVIDER_ID
      },
      evidence: [{
        sourceId: MAPBOX_ROUTE_PROVIDER_ID,
        sourceType: 'provider',
        observedAt: '2026-08-23T05:55:00.000Z',
        freshness: 'fresh'
      }]
    }));

    const report = await qualifyMapboxRouteProvider(provider, 'trace-bad-distance');
    expect(report.status).toBe('FAIL');
    expect(report.eligibleForActivation).toBe(false);
    expect(report.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'distance_plausible', status: 'FAIL' }),
      expect.objectContaining({ id: 'duration_plausible', status: 'FAIL' })
    ]));
  });

  it('fails qualification when fresh provider evidence is absent', async () => {
    const provider = new StaticProvider((request) => ({
      ok: true,
      capability: 'route_lookup',
      traceId: request.traceId,
      data: {
        distanceKm: 132.45,
        durationMinutes: 121,
        trafficAware: true,
        provider: MAPBOX_ROUTE_PROVIDER_ID
      },
      evidence: []
    }));

    const report = await qualifyMapboxRouteProvider(provider, 'trace-no-evidence');
    expect(report.status).toBe('FAIL');
    expect(report.checks).toContainEqual(expect.objectContaining({ id: 'fresh_provider_evidence', status: 'FAIL' }));
  });

  it('fails closed when provider execution fails', async () => {
    const provider = new StaticProvider((request) => ({
      ok: false,
      capability: 'route_lookup',
      traceId: request.traceId,
      code: 'PROVIDER_UNAVAILABLE',
      retryable: true
    }));

    const report = await qualifyMapboxRouteProvider(provider, 'trace-provider-fail');
    expect(report.status).toBe('FAIL');
    expect(report.eligibleForActivation).toBe(false);
    expect(report.checks).toContainEqual(expect.objectContaining({ id: 'provider_call_success', status: 'FAIL' }));
  });
});
