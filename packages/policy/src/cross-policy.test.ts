import { describe, expect, it } from 'vitest';
import { evaluateCandidatePolicy } from './candidate-evaluator.js';
import type { PolicyDecisionResult } from './core.js';

const result = (overrides: Partial<PolicyDecisionResult>): PolicyDecisionResult => ({
  status: 'eligible',
  reasonCodes: [],
  violatedHardConstraints: [],
  softPreferencePenalties: [],
  requiredEvidence: [],
  ...overrides
});

describe('H2 cross-policy conflict fixtures', () => {
  it('budget eligible + women-only beach needs evidence => needs_evidence', () => {
    const combined = evaluateCandidatePolicy([
      result({ status: 'eligible', reasonCodes: ['BUDGET_WITHIN_LIMIT'] }),
      result({ status: 'needs_evidence', reasonCodes: ['WOMEN_ONLY_BEACH_EVIDENCE_REQUIRED'], requiredEvidence: ['women_only_beach_status'] })
    ]);
    expect(combined.status).toBe('needs_evidence');
    expect(combined.requiredEvidence).toContain('women_only_beach_status');
  });

  it('exceptional far option conditional + toddler rest violation => ineligible', () => {
    const combined = evaluateCandidatePolicy([
      result({ status: 'conditional', reasonCodes: ['RADIUS_EXCEPTION_ACCEPTED'] }),
      result({ status: 'ineligible', reasonCodes: ['TODDLER_REST_REQUIRED'], violatedHardConstraints: ['midday_rest_required'] })
    ]);
    expect(combined.status).toBe('ineligible');
    expect(combined.violatedHardConstraints).toContain('midday_rest_required');
  });

  it('soft preference miss cannot mask missing evidence for a hard rule', () => {
    const combined = evaluateCandidatePolicy([
      result({ status: 'conditional', softPreferencePenalties: ['stroller_preferred'] }),
      result({ status: 'needs_evidence', requiredEvidence: ['parking_availability'] })
    ]);
    expect(combined.status).toBe('needs_evidence');
    expect(combined.softPreferencePenalties).toContain('stroller_preferred');
    expect(combined.requiredEvidence).toContain('parking_availability');
  });

  it('multiple hard violations are all preserved', () => {
    const combined = evaluateCandidatePolicy([
      result({ status: 'ineligible', violatedHardConstraints: ['budget_hard_limit'] }),
      result({ status: 'ineligible', violatedHardConstraints: ['max_radius_km'] })
    ]);
    expect(combined.status).toBe('ineligible');
    expect(combined.violatedHardConstraints.sort()).toEqual(['budget_hard_limit', 'max_radius_km']);
  });

  it('same logical component set yields the same aggregate result regardless of input ordering', () => {
    const a = result({ status: 'conditional', reasonCodes: ['A'], softPreferencePenalties: ['p1'] });
    const b = result({ status: 'needs_evidence', reasonCodes: ['B'], requiredEvidence: ['e1'] });
    const first = evaluateCandidatePolicy([a, b]);
    const second = evaluateCandidatePolicy([b, a]);
    expect(first.status).toBe(second.status);
    expect(first.reasonCodes).toEqual(second.reasonCodes);
    expect(first.softPreferencePenalties).toEqual(second.softPreferencePenalties);
    expect(first.requiredEvidence).toEqual(second.requiredEvidence);
  });
});
