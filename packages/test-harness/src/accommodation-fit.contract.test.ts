import { describe, expect, it } from 'vitest';
import fixture from '../../test-fixtures/contracts/accommodation-fit/TM-AF-HP-001.json' with { type: 'json' };
import { safeParseAccommodationFit } from '@tatil-modu/contracts';

describe('H1 accommodation fit contract', () => {
  it('accepts the canonical happy-path fixture', () => {
    expect(safeParseAccommodationFit(fixture).success).toBe(true);
  });

  it('rejects a verified facility claim without evidence', () => {
    const input = structuredClone(fixture);
    input.accommodation_profiles[0].facility_claims.thermal_spa_claim.verification_status = 'verified';
    expect(safeParseAccommodationFit(input).success).toBe(false);
  });

  it('rejects exact price without evidence', () => {
    const input = structuredClone(fixture) as any;
    input.accommodation_profiles[0].exact_price = { amount: 6500, currency: 'TRY', evidence_refs: [] };
    expect(safeParseAccommodationFit(input).success).toBe(false);
  });

  it('rejects exact availability without evidence', () => {
    const input = structuredClone(fixture) as any;
    input.accommodation_profiles[0].exact_availability = { available: true, evidence_refs: [] };
    expect(safeParseAccommodationFit(input).success).toBe(false);
  });

  it('blocks hard budget exceedance without explicit user override', () => {
    const input = structuredClone(fixture) as any;
    input.accommodation_profiles[0].hard_budget_limit_exceeded = true;
    input.accommodation_profiles[0].budget_fit_band = 'medium';
    expect(safeParseAccommodationFit(input).success).toBe(false);
  });

  it('blocks family hard-constraint violations', () => {
    const input = structuredClone(fixture) as any;
    input.accommodation_profiles[0].family_hard_constraint_violation = true;
    input.accommodation_profiles[0].family_fit_band = 'high';
    expect(safeParseAccommodationFit(input).success).toBe(false);
  });

  it('requires a reason when accommodation is blocked', () => {
    const input = structuredClone(fixture) as any;
    input.accommodation_profiles[0].budget_fit_band = 'blocked';
    input.accommodation_profiles[0].blocked_reasons = [];
    expect(safeParseAccommodationFit(input).success).toBe(false);
  });
});
