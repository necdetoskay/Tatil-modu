import { describe, expect, it } from 'vitest';
import { evaluatePolicy, resolveConstraintPrecedence, type PolicyEvaluationInput } from './core.js';

describe('H2 deterministic policy core', () => {
  it('lets hard constraints override soft preferences for the same key', () => {
    const resolved = resolveConstraintPrecedence([
      { id: 'soft-default', key: 'women_only_beach', expected: false, strength: 'soft', source: 'default' },
      { id: 'hard-user', key: 'women_only_beach', expected: true, strength: 'hard', source: 'user_explicit' }
    ]);

    expect(resolved).toEqual([
      { id: 'hard-user', key: 'women_only_beach', expected: true, strength: 'hard', source: 'user_explicit' }
    ]);
  });

  it('uses source precedence among constraints with equal strength', () => {
    const resolved = resolveConstraintPrecedence([
      { id: 'memory', key: 'midday_rest', expected: false, strength: 'hard', source: 'memory_disclosure' },
      { id: 'user', key: 'midday_rest', expected: true, strength: 'hard', source: 'user_explicit' }
    ]);

    expect(resolved[0]?.id).toBe('user');
  });

  it('marks a hard constraint mismatch as ineligible', () => {
    const result = evaluatePolicy({
      constraints: [{ id: 'hc-1', key: 'women_only_beach', expected: true, strength: 'hard', source: 'user_explicit' }],
      candidateFacts: [{ key: 'women_only_beach', value: false, evidence: 'verified' }]
    });

    expect(result.status).toBe('ineligible');
    expect(result.violatedHardConstraints).toEqual(['hc-1']);
  });

  it('requires evidence before a hard constraint can pass', () => {
    const result = evaluatePolicy({
      constraints: [{ id: 'hc-1', key: 'women_only_beach', expected: true, strength: 'hard', source: 'user_explicit' }],
      candidateFacts: [{ key: 'women_only_beach', value: true, evidence: 'unverified' }]
    });

    expect(result.status).toBe('needs_evidence');
    expect(result.requiredEvidence).toEqual(['women_only_beach']);
    expect(result.violatedHardConstraints).toEqual([]);
  });

  it('treats soft preference mismatch as conditional, never ineligible', () => {
    const result = evaluatePolicy({
      constraints: [{ id: 'sp-1', key: 'stroller_friendly', expected: true, strength: 'soft', source: 'user_explicit' }],
      candidateFacts: [{ key: 'stroller_friendly', value: false, evidence: 'verified' }]
    });

    expect(result.status).toBe('conditional');
    expect(result.softPreferencePenalties).toEqual(['sp-1']);
    expect(result.violatedHardConstraints).toEqual([]);
  });

  it('returns eligible only when hard constraints pass and no soft penalty or evidence gap exists', () => {
    const result = evaluatePolicy({
      constraints: [
        { id: 'hc-1', key: 'midday_rest', expected: true, strength: 'hard', source: 'user_explicit' },
        { id: 'sp-1', key: 'parking', expected: true, strength: 'soft', source: 'default' }
      ],
      candidateFacts: [
        { key: 'midday_rest', value: true, evidence: 'verified' },
        { key: 'parking', value: true, evidence: 'verified' }
      ]
    });

    expect(result.status).toBe('eligible');
  });

  it('is deterministic for identical input', () => {
    const input: PolicyEvaluationInput = {
      constraints: [
        { id: 'sp-b', key: 'parking', expected: true, strength: 'soft', source: 'default' },
        { id: 'hc-a', key: 'midday_rest', expected: true, strength: 'hard', source: 'user_explicit' }
      ],
      candidateFacts: [{ key: 'parking', value: false, evidence: 'verified' }]
    };

    expect(evaluatePolicy(input)).toEqual(evaluatePolicy(input));
  });
});
