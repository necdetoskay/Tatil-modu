import { describe, expect, it } from 'vitest';
import { buildHarnessContext } from './context-builder.js';
import type { HarnessProfile } from './index.js';

const routeProfile: HarnessProfile = {
  id: 'route-logistics',
  allowedMemoryClasses: ['M0', 'M1', 'M2', 'M3'],
  allowedCapabilities: ['route_lookup', 'parking_lookup', 'evidence_lookup'],
  maxContextTokens: 1000
};

describe('deterministic Context Builder', () => {
  it('hard-fails context inclusion across scope boundaries by exclusion', () => {
    const built = buildHarnessContext(routeProfile, 'trip-1', [
      { refId: 'trip-1-domain', scopeId: 'trip-1', memoryClass: 'M3', authority: 'domain_truth', estimatedTokens: 100 },
      { refId: 'trip-2-domain', scopeId: 'trip-2', memoryClass: 'M3', authority: 'domain_truth', estimatedTokens: 100 }
    ]);

    expect(built.included.map((record) => record.refId)).toEqual(['trip-1-domain']);
    expect(built.excluded).toContainEqual({ refId: 'trip-2-domain', reason: 'SCOPE_MISMATCH' });
  });

  it('excludes memory classes not allowed by the harness profile', () => {
    const built = buildHarnessContext(routeProfile, 'trip-1', [
      { refId: 'conversation', scopeId: 'trip-1', memoryClass: 'M5', authority: 'conversation_context', estimatedTokens: 100 }
    ]);

    expect(built.included).toEqual([]);
    expect(built.excluded).toContainEqual({ refId: 'conversation', reason: 'MEMORY_CLASS_NOT_ALLOWED' });
  });

  it('keeps higher-authority context first and respects token budget', () => {
    const built = buildHarnessContext(routeProfile, 'trip-1', [
      { refId: 'retrieval', scopeId: 'trip-1', memoryClass: 'M2', authority: 'retrieval_representation', estimatedTokens: 600 },
      { refId: 'domain', scopeId: 'trip-1', memoryClass: 'M3', authority: 'domain_truth', estimatedTokens: 600 }
    ]);

    expect(built.included.map((record) => record.refId)).toEqual(['domain']);
    expect(built.excluded).toContainEqual({ refId: 'retrieval', reason: 'CONTEXT_BUDGET_EXCEEDED' });
  });

  it('rejects stale derived/retrieval context and unapproved sensitive persistent context', () => {
    const built = buildHarnessContext(routeProfile, 'trip-1', [
      { refId: 'stale-retrieval', scopeId: 'trip-1', memoryClass: 'M2', authority: 'retrieval_representation', estimatedTokens: 100, stale: true },
      { refId: 'sensitive-domain', scopeId: 'trip-1', memoryClass: 'M3', authority: 'domain_truth', estimatedTokens: 100, sensitive: true, persistenceApproved: false }
    ]);

    expect(built.included).toEqual([]);
    expect(built.excluded).toEqual([
      { refId: 'sensitive-domain', reason: 'SENSITIVE_CONTEXT_NOT_APPROVED' },
      { refId: 'stale-retrieval', reason: 'STALE_DERIVED_OR_RETRIEVAL_CONTEXT' }
    ]);
  });
});
