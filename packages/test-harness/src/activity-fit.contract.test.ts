import { describe, expect, it } from 'vitest';
import fixture from '../../test-fixtures/contracts/activity-fit/TM-ACT-HP-001.json' with { type: 'json' };
import { safeParseActivityFit } from '@tatil-modu/contracts';

describe('H1 activity fit contract', () => {
  it('accepts the canonical happy-path fixture', () => {
    expect(safeParseActivityFit(fixture).success).toBe(true);
  });

  it('rejects verified opening hours without evidence', () => {
    const input = structuredClone(fixture) as any;
    input.activity_profiles[0].opening_hours_claim = { value: '09:00-18:00', verification_status: 'verified', evidence_refs: [] };
    expect(safeParseActivityFit(input).success).toBe(false);
  });

  it('rejects verified ticket price without evidence', () => {
    const input = structuredClone(fixture) as any;
    input.activity_profiles[0].ticket_price_claim = { value: 500, verification_status: 'verified', evidence_refs: [] };
    expect(safeParseActivityFit(input).success).toBe(false);
  });

  it('rejects verified parking availability without evidence', () => {
    const input = structuredClone(fixture) as any;
    input.activity_profiles[0].parking_claim = { value: true, verification_status: 'verified', evidence_refs: [] };
    expect(safeParseActivityFit(input).success).toBe(false);
  });

  it('rejects sea privacy satisfaction without verified women-only beach evidence', () => {
    const input = structuredClone(fixture) as any;
    input.activity_profiles[1].privacy_requirement_status = 'satisfied';
    expect(safeParseActivityFit(input).success).toBe(false);
  });

  it('blocks hard-constraint-violating activity', () => {
    const input = structuredClone(fixture) as any;
    input.activity_profiles[1].hard_constraint_violation = true;
    input.activity_profiles[1].validation_status = 'needs_verification';
    expect(safeParseActivityFit(input).success).toBe(false);
  });

  it('requires blocker reason for blocked activities', () => {
    const input = structuredClone(fixture) as any;
    input.activity_profiles[0].validation_status = 'blocked';
    input.activity_profiles[0].activity_blockers = [];
    expect(safeParseActivityFit(input).success).toBe(false);
  });

  it('does not allow low confidence alone to create a hard blocker', () => {
    const input = structuredClone(fixture) as any;
    input.activity_profiles[0].confidence = 'low';
    input.activity_profiles[0].validation_status = 'blocked';
    input.activity_profiles[0].activity_blockers = ['uncertain'];
    input.activity_profiles[0].hard_constraint_violation = false;
    expect(safeParseActivityFit(input).success).toBe(false);
  });
});
