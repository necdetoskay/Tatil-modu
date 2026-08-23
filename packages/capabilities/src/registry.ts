import type {
  CapabilityExecutionAttempt,
  CapabilityName,
  CapabilityProvider,
  CapabilityRequest,
  CapabilityResult
} from './core.js';

export type RetryPolicy = {
  maxAttempts: number;
  retryableCodes: readonly string[];
};

export type ProviderQualificationStatus =
  | 'DISCOVERED'
  | 'REVIEWED'
  | 'QUALIFIED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'REVOKED';

export type ProviderRegistration = {
  provider: CapabilityProvider;
  qualificationStatus: ProviderQualificationStatus;
  versionOrCommit?: string;
};

export type CapabilityRegistration = {
  capability: CapabilityName;
  primaryProviderId: string;
  fallbackProviderIds?: readonly string[];
  timeoutMs: number;
  retryPolicy: RetryPolicy;
};

export class CapabilityRegistry {
  private readonly providers = new Map<string, ProviderRegistration>();
  private readonly registrations = new Map<CapabilityName, CapabilityRegistration>();

  registerProvider(
    provider: CapabilityProvider,
    qualificationStatus: ProviderQualificationStatus = 'DISCOVERED',
    versionOrCommit?: string
  ): void {
    this.providers.set(provider.providerId, { provider, qualificationStatus, versionOrCommit });
  }

  setProviderQualification(providerId: string, qualificationStatus: ProviderQualificationStatus): void {
    const registration = this.providers.get(providerId);
    if (!registration) throw new Error(`Provider not registered: ${providerId}`);
    this.providers.set(providerId, { ...registration, qualificationStatus });
  }

  registerCapability(registration: CapabilityRegistration): void {
    this.registrations.set(registration.capability, registration);
  }

  getRegistration(capability: CapabilityName): CapabilityRegistration {
    const registration = this.registrations.get(capability);
    if (!registration) throw new Error(`Capability not registered: ${capability}`);
    return registration;
  }

  getProviderRegistration(providerId: string): ProviderRegistration {
    const registration = this.providers.get(providerId);
    if (!registration) throw new Error(`Provider not registered: ${providerId}`);
    return registration;
  }

  getProvider(providerId: string): CapabilityProvider {
    return this.getProviderRegistration(providerId).provider;
  }

  providerChain(capability: CapabilityName): ProviderRegistration[] {
    const registration = this.getRegistration(capability);
    return [registration.primaryProviderId, ...(registration.fallbackProviderIds ?? [])]
      .map((providerId) => this.getProviderRegistration(providerId));
  }

  activeProviderChain(capability: CapabilityName): ProviderRegistration[] {
    return this.providerChain(capability).filter((registration) => registration.qualificationStatus === 'ACTIVE');
  }
}

async function executeWithTimeout(
  provider: CapabilityProvider,
  request: CapabilityRequest,
  timeoutMs: number
): Promise<CapabilityResult<unknown>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<CapabilityResult<unknown>>((resolve) => {
    timer = setTimeout(() => resolve({
      ok: false,
      capability: request.capability,
      traceId: request.traceId,
      code: 'PROVIDER_TIMEOUT',
      retryable: true
    }), timeoutMs);
  });

  try {
    return await Promise.race([provider.execute(request), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function executeWithRegistry<TData = unknown>(
  registry: CapabilityRegistry,
  request: CapabilityRequest
): Promise<CapabilityResult<TData>> {
  const registration = registry.getRegistration(request.capability);
  const configuredProviders = registry.providerChain(request.capability);
  const providers = configuredProviders.filter((candidate) => candidate.qualificationStatus === 'ACTIVE');
  const attempts: CapabilityExecutionAttempt[] = [];

  if (providers.length === 0) {
    return {
      ok: false,
      capability: request.capability,
      traceId: request.traceId,
      code: 'PROVIDER_NOT_ACTIVE',
      retryable: false,
      execution: { fallbackUsed: false, attempts }
    } as CapabilityResult<TData>;
  }

  let lastResult: CapabilityResult<unknown> | undefined;

  for (let providerIndex = 0; providerIndex < providers.length; providerIndex += 1) {
    const provider = providers[providerIndex]!.provider;
    const fallback = providerIndex > 0 || provider.providerId !== registration.primaryProviderId;

    for (let attempt = 1; attempt <= registration.retryPolicy.maxAttempts; attempt += 1) {
      const startedAt = Date.now();
      const result = await executeWithTimeout(provider, request, registration.timeoutMs);
      const durationMs = Date.now() - startedAt;
      lastResult = result;
      attempts.push({
        providerId: provider.providerId,
        attempt,
        outcome: result.ok ? 'success' : result.code,
        fallback,
        durationMs
      });

      if (result.ok) {
        return {
          ...result,
          execution: {
            selectedProviderId: provider.providerId,
            fallbackUsed: fallback,
            attempts
          }
        } as CapabilityResult<TData>;
      }

      if (!registration.retryPolicy.retryableCodes.includes(result.code)) break;
    }
  }

  const failure = lastResult ?? {
    ok: false as const,
    capability: request.capability,
    traceId: request.traceId,
    code: 'PROVIDER_UNAVAILABLE' as const,
    retryable: true
  };

  return {
    ...failure,
    execution: {
      fallbackUsed: attempts.some((attempt) => attempt.fallback),
      attempts
    }
  } as CapabilityResult<TData>;
}
