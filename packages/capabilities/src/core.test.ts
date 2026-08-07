import { describe, expect, it } from 'vitest';
import { CapabilityGateway, type CapabilityProvider } from './core.js';

describe('CapabilityGateway', () => {
  it('rejects unauthorized capability without calling provider', async () => {
    let calls = 0;
    const provider: CapabilityProvider = {
      providerId: 'fake',
      async execute(request) {
        calls += 1;
        return { ok: true, capability: request.capability, traceId: request.traceId, data: {}, evidence: [] };
      }
    };
    const gateway = new CapabilityGateway(provider, { allowedCapabilities: ['route_lookup'] });
    const result = await gateway.execute({ capability: 'price_lookup', traceId: 't-1', payload: {} });
    expect(result).toMatchObject({ ok: false, code: 'UNAUTHORIZED_CAPABILITY', retryable: false });
    expect(calls).toBe(0);
  });

  it('preserves trace and evidence on success', async () => {
    const provider: CapabilityProvider = {
      providerId: 'fake',
      async execute(request) {
        return {
          ok: true,
          capability: request.capability,
          traceId: request.traceId,
          data: { km: 42 },
          evidence: [{ sourceId: 'fx', sourceType: 'mock', observedAt: '2026-08-07T20:00:00Z', freshness: 'fresh' }]
        };
      }
    };
    const gateway = new CapabilityGateway(provider, { allowedCapabilities: ['route_lookup'] });
    const result = await gateway.execute({ capability: 'route_lookup', traceId: 'trace-42', payload: {} });
    expect(result).toMatchObject({ ok: true, traceId: 'trace-42', capability: 'route_lookup' });
    if (result.ok) expect(result.evidence[0]?.sourceId).toBe('fx');
  });

  it('normalizes malformed trace/capability response', async () => {
    const provider: CapabilityProvider = {
      providerId: 'fake',
      async execute() {
        return { ok: false, capability: 'route_lookup', traceId: 'wrong', code: 'PROVIDER_TIMEOUT', retryable: true };
      }
    };
    const gateway = new CapabilityGateway(provider, { allowedCapabilities: ['route_lookup'] });
    await expect(gateway.execute({ capability: 'route_lookup', traceId: 'expected', payload: {} }))
      .resolves.toMatchObject({ ok: false, code: 'MALFORMED_PROVIDER_PAYLOAD', retryable: false });
  });

  it('requires trace id', async () => {
    const provider: CapabilityProvider = { providerId: 'fake', async execute(request) { return { ok: true, capability: request.capability, traceId: request.traceId, data: {}, evidence: [] }; } };
    const gateway = new CapabilityGateway(provider, { allowedCapabilities: ['route_lookup'] });
    await expect(gateway.execute({ capability: 'route_lookup', traceId: ' ', payload: {} })).rejects.toThrow('traceId is required');
  });
});
