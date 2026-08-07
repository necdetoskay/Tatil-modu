import { describe, expect, it } from 'vitest';
import { CapabilityRegistry } from './registry.js';
import type { CapabilityName, CapabilityProvider, CapabilityRequest, CapabilityResult } from './core.js';

const allCapabilities: CapabilityName[] = [
  'place_discovery',
  'route_lookup',
  'weather_lookup',
  'accommodation_lookup',
  'activity_lookup',
  'opening_hours_lookup',
  'price_lookup',
  'parking_lookup',
  'beach_attribute_lookup',
  'evidence_lookup'
];

class NoopProvider implements CapabilityProvider {
  readonly providerId = 'mock:coverage';
  async execute(request: CapabilityRequest): Promise<CapabilityResult<unknown>> {
    return { ok: false, capability: request.capability, traceId: request.traceId, code: 'EMPTY_RESULT', retryable: false };
  }
}

describe('canonical capability coverage', () => {
  it('registers every canonical capability family', () => {
    const registry = new CapabilityRegistry();
    const provider = new NoopProvider();
    registry.registerProvider(provider);

    for (const capability of allCapabilities) {
      registry.registerCapability({
        capability,
        primaryProviderId: provider.providerId,
        timeoutMs: 1000,
        retryPolicy: { maxAttempts: 1, retryableCodes: [] }
      });
    }

    expect(allCapabilities).toHaveLength(10);
    for (const capability of allCapabilities) {
      expect(registry.getRegistration(capability).capability).toBe(capability);
      expect(registry.providerChain(capability)).toHaveLength(1);
    }
  });
});
