import type {
  CapabilityProvider,
  CapabilityRequest,
  CapabilityResult
} from '@tatil-modu/capabilities';

export type MockFixture = {
  fixtureId: string;
  data?: unknown;
  evidence?: { sourceId: string; observedAt: string; freshness: 'fresh' | 'stale' | 'unknown' }[];
  fault?: 'timeout' | 'rate_limit' | 'unavailable' | 'malformed' | 'empty';
};

export class DeterministicMockProvider implements CapabilityProvider {
  readonly providerId = 'mock:deterministic';

  constructor(private readonly fixtures: readonly MockFixture[]) {}

  async execute<TData = unknown>(request: CapabilityRequest): Promise<CapabilityResult<TData>> {
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
    if (fixture.fault === 'empty') {
      return { ok: false, capability: request.capability, traceId: request.traceId, code: 'EMPTY_RESULT', retryable: false };
    }

    return {
      ok: true,
      capability: request.capability,
      traceId: request.traceId,
      data: fixture.data as TData,
      evidence: (fixture.evidence ?? []).map((item) => ({ ...item, sourceType: 'mock' as const }))
    };
  }
}

export const PROVIDERS_MOCK_PACKAGE = '@tatil-modu/providers-mock' as const;
