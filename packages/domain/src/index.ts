export const DOMAIN_PACKAGE = '@tatil-modu/domain' as const;

export type Confidence = 'low' | 'medium' | 'high';
export type ValidationStatus =
  | 'valid'
  | 'valid_with_missing_non_blocking_info'
  | 'needs_clarification'
  | 'invalid';

export type TransportMode = 'own_car' | 'public_transport' | 'flight' | 'mixed' | 'unknown';
export type ConstraintStrength = 'hard' | 'soft';
export type EvidenceStatus = 'verified' | 'unverified' | 'unknown' | 'conflicting' | 'stale';
export type VerificationStatus = 'verified' | 'rejected' | 'needs_evidence' | 'conflicting';

export interface Money {
  amount: number;
  currency: string;
}

export interface DistanceKm {
  km: number;
}

export interface ChildTraveler {
  age: number;
}

export interface TravelParty {
  adults: number | null;
  children: ChildTraveler[];
}

export interface TraceableId {
  value: string;
}

export const invariant = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message);
};
