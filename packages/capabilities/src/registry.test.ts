import { describe, expect, it } from 'vitest';
import type { CapabilityProvider, CapabilityRequest, CapabilityResult } from './core.js';
import { CapabilityRegistry, executeWithRegistry } from './registry.js';

class SequenceProvider implements CapabilityProvider {
  readonly calls: string[] = [];
  constructor(readonly providerId: string, private readonly results: CapabilityResult<unknown>[]) {}

  async execute(request: CapabilityRequest): Promise<CapabilityResult<unknown>> {
    this.calls.push(request.traceId);
    return this.results[Math.min(this.calls.length - 1, this.results.length - 1)]!;
  }
}

class HangingProvider implements CapabilityProvider {
  readonly providerId = 'hanging';
  readonly calls: string[] = [];
  async execute(request: CapabilityRequest): Promise<CapabilityResult<unknown>> {
    this.calls.push(request.traceId);
    return await new Promise<CapabilityResult<unknown>>(() => undefined);
  }
}

const request = { capability: 'route_lookup' as const, traceId: 'trace-registry', payload: {} };
const failure = (code: 'PROVIDER_TIMEOUT' | 'PROVIDER_RATE_LIMIT' | 'PROVIDER_UNAVAILABLE' | 'EMPTY_RESULT', retryable = true): CapabilityResult<unknown> => ({
  ok: false,
  capability: 'route_lookup',
  traceId: 'trace-registry',
  code,
  retryable
});
const success = (providerId: string, km: number): CapabilityResult<unknown> => ({
  ok: true,
  capability: 'route_lookup',
  traceId: 'trace-registry',
  data: { providerId, km },
  evidence: []
});

function registryWith(primary: CapabilityProvider, fallback?: CapabilityProvider, maxAttempts = 2, timeoutMs = 1000) {
  const registry = new CapabilityRegistry();
  registry.registerProvider(primary);
  if (fallback) registry.registerProvider(fallback);
  registry.registerCapability({
    capability: 'route_lookup',
    primaryProviderId: primary.providerId,
    fallbackProviderIds: fallback ? [fallback.providerId] : [],
    timeoutMs,
    retryPolicy: { maxAttempts, retryableCodes: ['PROVIDER_TIMEOUT', 'PROVIDER_RATE_LIMIT', 'PROVIDER_UNAVAILABLE'] }
  });
  return registry;
}

describe('CapabilityRegistry', () => {
  it('uses primary provider when it succeeds', async () => {
    const primary = new SequenceProvider('primary', [success('primary', 42)]);
    const fallback = new SequenceProvider('fallback', [success('fallback', 43)]);
    const result = await executeWithRegistry(registryWith(primary, fallback), request);
    expect(result.ok).toBe(true);
    expect(primary.calls).toHaveLength(1);
    expect(fallback.calls).toHaveLength(0);
  });

  it('retries retryable failure before fallback', async () => {
    const primary = new SequenceProvider('primary', [failure('PROVIDER_TIMEOUT'), success('primary', 42)]);
    const fallback = new SequenceProvider('fallback', [success('fallback', 43)]);
    const result = await executeWithRegistry(registryWith(primary, fallback), request);
    expect(result.ok).toBe(true);
    expect(primary.calls).toHaveLength(2);
    expect(fallback.calls).toHaveLength(0);
  });

  it('falls back after primary exhausts retries', async () => {
    const primary = new SequenceProvider('primary', [failure('PROVIDER_UNAVAILABLE')]);
    const fallback = new SequenceProvider('fallback', [success('fallback', 43)]);
    const result = await executeWithRegistry(registryWith(primary, fallback), request);
    expect(result.ok).toBe(true);
    expect(primary.calls).toHaveLength(2);
    expect(fallback.calls).toHaveLength(1);
  });

  it('does not retry non-retryable fault on same provider', async () => {
    const primary = new SequenceProvider('primary', [failure('EMPTY_RESULT', false)]);
    const fallback = new SequenceProvider('fallback', [success('fallback', 43)]);
    const result = await executeWithRegistry(registryWith(primary, fallback), request);
    expect(result.ok).toBe(true);
    expect(primary.calls).toHaveLength(1);
    expect(fallback.calls).toHaveLength(1);
  });

  it('throws for unregistered capability', () => {
    const registry = new CapabilityRegistry();
    expect(() => registry.getRegistration('route_lookup')).toThrow('Capability not registered');
  });

  it('enforces deterministic maxAttempts', async () => {
    const primary = new SequenceProvider('primary', [failure('PROVIDER_RATE_LIMIT')]);
    const result = await executeWithRegistry(registryWith(primary, undefined, 3), request);
    expect(result.ok).toBe(false);
    expect(primary.calls).toHaveLength(3);
  });

  it('normalizes a hanging provider into PROVIDER_TIMEOUT and can fall back', async () => {
    const primary = new HangingProvider();
    const fallback = new SequenceProvider('fallback', [success('fallback', 43)]);
    const result = await executeWithRegistry(registryWith(primary, fallback, 1, 5), request);
    expect(result.ok).toBe(true);
    expect(primary.calls).toHaveLength(1);
    expect(fallback.calls).toHaveLength(1);
  });
});
