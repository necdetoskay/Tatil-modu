import type {
  CapabilityProvider,
  CapabilityRequest,
  CapabilityResult
} from '@tatil-modu/capabilities';

export type MockFixture = {
  fixtureId: string;
  data?: unknown;
  evidence?: { sourceId: string; observedAt: string; freshness: 'fresh' | 'stale' | 'unknown' }[];
  fault?:
    | 'timeout'
    | 'rate_limit'
    | 'unavailable'
    | 'malformed'
    | 'partial'
    | 'contradictory'
    | 'missing_evidence'
    | 'empty';
};

export class DeterministicMockProvider implements CapabilityProvider {
  readonly providerId = 'mock:deterministic';

  constructor(private readonly fixtures: readonly MockFixture[]) {}

  async execute(request: CapabilityRequest): Promise<CapabilityResult<unknown>> {
    const fixture = this.fixtures.find((item) => item.fixtureId === request.fixtureId);

    if (!fixture) {
      return {
        ok: false,
        capability: request.capability,
        traceId: request.traceId,
        code: 'EMPTY_RESULT',
        retryable: false
      };
    }

    if (fixture.fault === 'timeout') {
      return { ok: false, capability: request.capability, traceId: request.traceId, code: 'PROVIDER_TIMEOUT', retryable: true };
    }
    if (fixture.fault === 'rate_limit') {
      return { ok: false, capability: request.capability, traceId: request.traceId, code: 'PROVIDER_RATE_LIMIT', retryable: true };
    }
    if (fixture.fault === 'unavailable') {
      return { ok: false, capability: request.capability, traceId: request.traceId, code: 'PROVIDER_UNAVAILABLE', retryable: true };
    }
    if (fixture.fault === 'malformed') {
      return { ok: false, capability: request.capability, traceId: 'wrong-trace', code: 'MALFORMED_PROVIDER_PAYLOAD', retryable: false };
    }
    if (fixture.fault === 'partial') {
      return { ok: false, capability: request.capability, traceId: request.traceId, code: 'PARTIAL_PROVIDER_PAYLOAD', retryable: false };
    }
    if (fixture.fault === 'contradictory') {
      return { ok: false, capability: request.capability, traceId: request.traceId, code: 'CONTRADICTORY_PROVIDER_EVIDENCE', retryable: false };
    }
    if (fixture.fault === 'missing_evidence') {
      return { ok: false, capability: request.capability, traceId: request.traceId, code: 'MISSING_PROVIDER_EVIDENCE', retryable: false };
    }
    if (fixture.fault === 'empty') {
      return { ok: false, capability: request.capability, traceId: request.traceId, code: 'EMPTY_RESULT', retryable: false };
    }

    return {
      ok: true,
      capability: request.capability,
      traceId: request.traceId,
      data: fixture.data,
      evidence: (fixture.evidence ?? []).map((item) => ({ ...item, sourceType: 'mock' as const }))
    };
  }
}

export const PROVIDERS_MOCK_PACKAGE = '@tatil-modu/providers-mock' as const;

export class FixtureDestinationProvider implements CapabilityProvider {
  readonly providerId = 'mock:destination-fixture';
  constructor(private readonly fault?: MockFixture['fault']) {}

  async execute(request: CapabilityRequest): Promise<CapabilityResult<unknown>> {
    if (request.capability !== 'place_discovery') return { ok: false, capability: request.capability, traceId: request.traceId, code: 'UNAUTHORIZED_CAPABILITY', retryable: false };
    if (this.fault === 'timeout') return new Promise(() => undefined);
    if (this.fault === 'rate_limit') return { ok: false, capability: request.capability, traceId: request.traceId, code: 'PROVIDER_RATE_LIMIT', retryable: true };
    if (this.fault === 'unavailable') return { ok: false, capability: request.capability, traceId: request.traceId, code: 'PROVIDER_UNAVAILABLE', retryable: true };
    if (this.fault === 'malformed') return { ok: false, capability: request.capability, traceId: 'wrong-trace', code: 'MALFORMED_PROVIDER_PAYLOAD', retryable: false };
    if (this.fault === 'empty') return { ok: false, capability: request.capability, traceId: request.traceId, code: 'EMPTY_RESULT', retryable: false };
    return { ok: true, capability: request.capability, traceId: request.traceId, data: { candidates: [{ candidateId: 'candidate-yalova', name: 'Yalova', type: 'mixed', relationToTarget: 'primary', estimatedDistanceBucket: '50_100_km', likelyTripRole: 'base_stay', familyRelevanceHypothesis: 'Short transfer and family rest options.', seaRelevant: true, fatigueRisk: 'low' }] }, evidence: [{ sourceId: 'mock:destination-fixture', sourceType: 'mock', observedAt: '2026-08-28T00:00:00.000Z', freshness: 'fresh' }] };
  }
}

export class FixtureRouteProvider implements CapabilityProvider {
  readonly providerId = 'mock:route-fixture';
  constructor(private readonly fault?: MockFixture['fault']) {}

  async execute(request: CapabilityRequest): Promise<CapabilityResult<unknown>> {
    if (request.capability !== 'route_lookup') return { ok: false, capability: request.capability, traceId: request.traceId, code: 'UNAUTHORIZED_CAPABILITY', retryable: false };
    if (this.fault === 'timeout') return new Promise(() => undefined);
    if (this.fault === 'rate_limit') return { ok: false, capability: request.capability, traceId: request.traceId, code: 'PROVIDER_RATE_LIMIT', retryable: true };
    if (this.fault === 'unavailable') return { ok: false, capability: request.capability, traceId: request.traceId, code: 'PROVIDER_UNAVAILABLE', retryable: true };
    if (this.fault === 'malformed') return { ok: false, capability: request.capability, traceId: 'wrong-trace', code: 'MALFORMED_PROVIDER_PAYLOAD', retryable: false };
    if (this.fault === 'empty') return { ok: false, capability: request.capability, traceId: request.traceId, code: 'EMPTY_RESULT', retryable: false };
    return { ok: true, capability: request.capability, traceId: request.traceId, data: { routes: [{ destinationId: 'candidate-yalova', destinationName: 'Yalova', exactDistanceKm: 92, exactDriveTimeMinutes: 85, parkingAvailable: true, trafficRisk: 'low', evidenceIds: { exactDistance: 'route-distance-001', exactDriveTime: 'route-duration-001', parkingAvailability: 'parking-001', liveTraffic: 'traffic-001' } }] }, evidence: [{ sourceId: 'mock:route-fixture', sourceType: 'mock', observedAt: '2026-08-28T00:00:00.000Z', freshness: 'fresh' }] };
  }
}
