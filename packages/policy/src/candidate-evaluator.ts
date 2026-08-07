import type { PolicyDecisionResult } from './core.js';

const verdictRank: Record<PolicyDecisionResult['status'], number> = {
  eligible: 0,
  conditional: 1,
  needs_evidence: 2,
  ineligible: 3
};

export type CandidatePolicyEvaluation = {
  status: PolicyDecisionResult['status'];
  reasonCodes: string[];
  violatedHardConstraints: string[];
  softPreferencePenalties: string[];
  requiredEvidence: string[];
  componentResults: PolicyDecisionResult[];
};

export function evaluateCandidatePolicy(results: readonly PolicyDecisionResult[]): CandidatePolicyEvaluation {
  const status = results.reduce<PolicyDecisionResult['status']>((current, next) =>
    verdictRank[next.status] > verdictRank[current] ? next.status : current,
  'eligible');

  const unique = (items: string[]) => [...new Set(items)].sort();

  return {
    status,
    reasonCodes: unique(results.flatMap((r) => r.reasonCodes)),
    violatedHardConstraints: unique(results.flatMap((r) => r.violatedHardConstraints)),
    softPreferencePenalties: unique(results.flatMap((r) => r.softPreferencePenalties)),
    requiredEvidence: unique(results.flatMap((r) => r.requiredEvidence)),
    componentResults: [...results]
  };
}
