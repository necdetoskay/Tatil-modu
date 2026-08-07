export type PolicyDecisionStatus = 'eligible' | 'ineligible' | 'conditional' | 'needs_evidence';

export type ConstraintStrength = 'hard' | 'soft';
export type ConstraintSource = 'user_explicit' | 'conversation_context' | 'memory_disclosure' | 'default';
export type EvidenceState = 'verified' | 'unverified' | 'missing' | 'not_required';

export interface PolicyConstraint {
  id: string;
  key: string;
  expected: unknown;
  strength: ConstraintStrength;
  source: ConstraintSource;
}

export interface PolicyCandidateFact {
  key: string;
  value: unknown;
  evidence: EvidenceState;
}

export interface PolicyEvaluationInput {
  constraints: PolicyConstraint[];
  candidateFacts: PolicyCandidateFact[];
}

export interface PolicyDecisionResult {
  status: PolicyDecisionStatus;
  reasonCodes: string[];
  violatedHardConstraints: string[];
  softPreferencePenalties: string[];
  requiredEvidence: string[];
}

const sourcePriority: Record<ConstraintSource, number> = {
  user_explicit: 4,
  conversation_context: 3,
  memory_disclosure: 2,
  default: 1
};

export function resolveConstraintPrecedence(constraints: PolicyConstraint[]): PolicyConstraint[] {
  const byKey = new Map<string, PolicyConstraint>();

  for (const constraint of constraints) {
    const current = byKey.get(constraint.key);
    if (!current) {
      byKey.set(constraint.key, constraint);
      continue;
    }

    const incomingWinsByStrength = current.strength === 'soft' && constraint.strength === 'hard';
    const sameStrengthHigherSource =
      current.strength === constraint.strength &&
      sourcePriority[constraint.source] > sourcePriority[current.source];

    if (incomingWinsByStrength || sameStrengthHigherSource) {
      byKey.set(constraint.key, constraint);
    }
  }

  return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function evaluatePolicy(input: PolicyEvaluationInput): PolicyDecisionResult {
  const constraints = resolveConstraintPrecedence(input.constraints);
  const facts = new Map(input.candidateFacts.map((fact) => [fact.key, fact]));

  const violatedHardConstraints: string[] = [];
  const softPreferencePenalties: string[] = [];
  const requiredEvidence: string[] = [];
  const reasonCodes: string[] = [];

  for (const constraint of constraints) {
    const fact = facts.get(constraint.key);

    if (!fact) {
      if (constraint.strength === 'hard') {
        requiredEvidence.push(constraint.key);
        reasonCodes.push(`HARD_CONSTRAINT_FACT_MISSING:${constraint.key}`);
      } else {
        softPreferencePenalties.push(constraint.id);
        reasonCodes.push(`SOFT_PREFERENCE_FACT_MISSING:${constraint.key}`);
      }
      continue;
    }

    if (constraint.strength === 'hard' && ['missing', 'unverified'].includes(fact.evidence)) {
      requiredEvidence.push(constraint.key);
      reasonCodes.push(`HARD_CONSTRAINT_EVIDENCE_REQUIRED:${constraint.key}`);
      continue;
    }

    if (!sameValue(fact.value, constraint.expected)) {
      if (constraint.strength === 'hard') {
        violatedHardConstraints.push(constraint.id);
        reasonCodes.push(`HARD_CONSTRAINT_VIOLATION:${constraint.key}`);
      } else {
        softPreferencePenalties.push(constraint.id);
        reasonCodes.push(`SOFT_PREFERENCE_MISS:${constraint.key}`);
      }
    }
  }

  const unique = (values: string[]) => [...new Set(values)].sort();
  const hard = unique(violatedHardConstraints);
  const evidence = unique(requiredEvidence);
  const soft = unique(softPreferencePenalties);
  const reasons = unique(reasonCodes);

  let status: PolicyDecisionStatus = 'eligible';
  if (hard.length > 0) status = 'ineligible';
  else if (evidence.length > 0) status = 'needs_evidence';
  else if (soft.length > 0) status = 'conditional';

  return {
    status,
    reasonCodes: reasons,
    violatedHardConstraints: hard,
    softPreferencePenalties: soft,
    requiredEvidence: evidence
  };
}
