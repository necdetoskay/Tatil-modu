import { describe, expect, it } from 'vitest';
import type { PolicyDecisionResult } from './core.js';
import { evaluateCandidatePolicy } from './candidate-evaluator.js';

const r = (status: PolicyDecisionResult['status'], suffix: string): PolicyDecisionResult => ({
  status,
  reasonCodes: [`R:${suffix}`],
  violatedHardConstraints: status === 'ineligible' ? [`H:${suffix}`] : [],
  softPreferencePenalties: status === 'conditional' ? [`S:${suffix}`] : [],
  requiredEvidence: status === 'needs_evidence' ? [`E:${suffix}`] : []
});

describe('candidate policy evaluator', () => {
  it('returns eligible when every component is eligible', () => {
    expect(evaluateCandidatePolicy([r('eligible', 'a'), r('eligible', 'b')]).status).toBe('eligible');
  });

  it('promotes conditional above eligible', () => {
    expect(evaluateCandidatePolicy([r('eligible', 'a'), r('conditional', 'b')]).status).toBe('conditional');
  });

  it('promotes needs_evidence above conditional', () => {
    expect(evaluateCandidatePolicy([r('conditional', 'a'), r('needs_evidence', 'b')]).status).toBe('needs_evidence');
  });

  it('ineligible dominates every other status', () => {
    expect(evaluateCandidatePolicy([r('needs_evidence', 'a'), r('ineligible', 'b'), r('conditional', 'c')]).status).toBe('ineligible');
  });

  it('preserves all reason, violation, soft-penalty and evidence signals', () => {
    const out = evaluateCandidatePolicy([r('ineligible', 'a'), r('conditional', 'b'), r('needs_evidence', 'c')]);
    expect(out.reasonCodes).toEqual(['R:a', 'R:b', 'R:c']);
    expect(out.violatedHardConstraints).toEqual(['H:a']);
    expect(out.softPreferencePenalties).toEqual(['S:b']);
    expect(out.requiredEvidence).toEqual(['E:c']);
  });

  it('deduplicates merged signals deterministically', () => {
    const duplicate = r('needs_evidence', 'same');
    expect(evaluateCandidatePolicy([duplicate, duplicate])).toEqual(evaluateCandidatePolicy([duplicate, duplicate]));
    expect(evaluateCandidatePolicy([duplicate, duplicate]).requiredEvidence).toEqual(['E:same']);
  });

  it('does not let a soft result mask an ineligible result', () => {
    const out = evaluateCandidatePolicy([r('conditional', 'soft'), r('ineligible', 'hard')]);
    expect(out.status).toBe('ineligible');
    expect(out.violatedHardConstraints).toEqual(['H:hard']);
  });
});
