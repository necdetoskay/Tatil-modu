export type CapabilityName =
  | 'place_discovery'
  | 'route_lookup'
  | 'weather_lookup'
  | 'accommodation_lookup'
  | 'activity_lookup'
  | 'opening_hours_lookup'
  | 'price_lookup'
  | 'parking_lookup'
  | 'beach_attribute_lookup'
  | 'evidence_lookup';

export type CapabilityFaultCode =
  | 'UNAUTHORIZED_CAPABILITY'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_RATE_LIMIT'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_NOT_ACTIVE'
  | 'MALFORMED_PROVIDER_PAYLOAD'
  | 'PARTIAL_PROVIDER_PAYLOAD'
  | 'CONTRADICTORY_PROVIDER_EVIDENCE'
  | 'MISSING_PROVIDER_EVIDENCE'
  | 'EMPTY_RESULT';

export interface CapabilityRequest<TPayload = unknown> {
  capability: CapabilityName;
  traceId: string;
  fixtureId?: string;
  payload: TPayload;
}

export interface CapabilityEvidence {
  sourceId: string;
  sourceType: 'mock' | 'provider';
  observedAt: string;
  freshness: 'fresh' | 'stale' | 'unknown';
}

export interface CapabilityExecutionAttempt {
  providerId: string;
  attempt: number;
  outcome: 'success' | CapabilityFaultCode;
  fallback: boolean;
  durationMs?: number;
}

export interface CapabilityExecutionMeta {
  selectedProviderId?: string;
  fallbackUsed: boolean;
  attempts: CapabilityExecutionAttempt[];
}

export interface CapabilitySuccess<TData = unknown> {
  ok: true;
  capability: CapabilityName;
  traceId: string;
  data: TData;
  evidence: CapabilityEvidence[];
  execution?: CapabilityExecutionMeta;
}

export interface CapabilityFailure {
  ok: false;
  capability: CapabilityName;
  traceId: string;
  code: CapabilityFaultCode;
  retryable: boolean;
  execution?: CapabilityExecutionMeta;
}

export type CapabilityResult<TData = unknown> = CapabilitySuccess<TData> | CapabilityFailure;

/**
 * Provider adapters operate at the untyped transport boundary. Typed capability
 * response contracts are owned by the gateway/registry layer, not forced onto
 * each adapter as an impossible "supports every TData" generic promise.
 */
export interface CapabilityProvider {
  readonly providerId: string;
  execute(request: CapabilityRequest): Promise<CapabilityResult<unknown>>;
}

export interface CapabilityPolicy {
  allowedCapabilities: readonly CapabilityName[];
}

export class CapabilityGateway {
  constructor(
    private readonly provider: CapabilityProvider,
    private readonly policy: CapabilityPolicy
  ) {}

  async execute<TData = unknown>(request: CapabilityRequest): Promise<CapabilityResult<TData>> {
    if (!request.traceId.trim()) {
      throw new Error('traceId is required');
    }

    if (!this.policy.allowedCapabilities.includes(request.capability)) {
      return {
        ok: false,
        capability: request.capability,
        traceId: request.traceId,
        code: 'UNAUTHORIZED_CAPABILITY',
        retryable: false
      };
    }

    const result = await this.provider.execute(request);

    if (result.traceId !== request.traceId || result.capability !== request.capability) {
      return {
        ok: false,
        capability: request.capability,
        traceId: request.traceId,
        code: 'MALFORMED_PROVIDER_PAYLOAD',
        retryable: false
      };
    }

    return result as CapabilityResult<TData>;
  }
}
