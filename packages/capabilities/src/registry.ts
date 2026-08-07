import type { CapabilityName, CapabilityProvider, CapabilityRequest, CapabilityResult } from './core.js';

export type RetryPolicy = {
  maxAttempts: number;
  retryableCodes: readonly string[];
};

export type CapabilityRegistration = {
  capability: CapabilityName;
  primaryProviderId: string;
  fallbackProviderIds?: readonly string[];
  timeoutMs: number;
  retryPolicy: RetryPolicy;
};

export class CapabilityRegistry {
  private readonly providers = new Map<string, CapabilityProvider>();
  private readonly registrations = new Map<CapabilityName, CapabilityRegistration>();

  registerProvider(provider: CapabilityProvider): void {
    this.providers.set(provider.providerId, provider);
  }

  registerCapability(registration: CapabilityRegistration): void {
    this.registrations.set(registration.capability, registration);
  }

  getRegistration(capability: CapabilityName): CapabilityRegistration {
    const registration = this.registrations.get(capability);
    if (!registration) throw new Error(`Capability not registered: ${capability}`);
    return registration;
  }

  getProvider(providerId: string): CapabilityProvider {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error(`Provider not registered: ${providerId}`);
    return provider;
  }

  providerChain(capability: CapabilityName): CapabilityProvider[] {
    const registration = this.getRegistration(capability);
    return [registration.primaryProviderId, ...(registration.fallbackProviderIds ?? [])]
      .map((providerId) => this.getProvider(providerId));
  }
}

export async function executeWithRegistry<TData = unknown>(
  registry: CapabilityRegistry,
  request: CapabilityRequest
): Promise<CapabilityResult<TData>> {
  const registration = registry.getRegistration(request.capability);
  const providers = registry.providerChain(request.capability);
  let lastResult: CapabilityResult<unknown> | undefined;

  for (const provider of providers) {
    for (let attempt = 1; attempt <= registration.retryPolicy.maxAttempts; attempt += 1) {
      const result = await provider.execute(request);
      lastResult = result;
      if (result.ok) return result as CapabilityResult<TData>;
      if (!registration.retryPolicy.retryableCodes.includes(result.code)) break;
    }
  }

  return (lastResult ?? {
    ok: false,
    capability: request.capability,
    traceId: request.traceId,
    code: 'PROVIDER_UNAVAILABLE',
    retryable: true
  }) as CapabilityResult<TData>;
}
