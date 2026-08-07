import type { PolicyDecisionResult } from './core.js';

const verdictRank: Record<PolicyDecisionResult['status'], number> = {
  eligible: 0,
  conditional: 1,
  needs_evidence: 2,
  ineligible: 3
};

export type CandidatePolicyEvaluation = {
  status: PolicyDecisionResult['status'];
  reason_codes: string[];
  violated_hard_constraints: string[];
  soft_preference_penalties: string[];
  required_evidence: string[];
  blockers: string[];
  component_results: PolicyDecisionResult[];
};

export function evaluateCandidatePolicy(results: readonly PolicyDecisionResult[]): CandidatePolicyEvaluation {
  const status = results.reduce<PolicyDecisionResult['status']>((current, next) =>
    verdictRank[next.status] > verdictRank[current] ? next.status : current,
  'eligible');

  const unique = (items: string[]) => [...new Set(items)];

  return {
    status,
    reason_codes: unique(results.flatMap((r) => r.reason_codes)),
    violated_hard_constraints: unique(results.flatMap((r) => r.violated_hard_constraints)),
    soft_preference_penalties: unique(results.flatMap((r) => r.soft_preference_penalties)),
    required_evidence: unique(results.flatMap((r) => r.required_evidence)),
    blockers: unique(results.flatMap((r) => r.blockers ?? [])),
    component_results: [...results]
  };
}
