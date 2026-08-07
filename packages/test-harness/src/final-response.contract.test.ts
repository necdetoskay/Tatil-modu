import { describe, expect, it } from 'vitest';
import fixture from '../../test-fixtures/contracts/final-response/TM-FR-HP-001.json' with { type: 'json' };
import { safeParseFinalResponse } from '@tatil-modu/contracts';

describe('H1 final response contract', () => {
  it('accepts the canonical happy-path fixture', () => {
    expect(safeParseFinalResponse(fixture).success).toBe(true);
  });

  it('rejects hiding an upstream hard blocker', () => {
    const input = structuredClone(fixture) as any;
    input.final_response.hard_blockers = [];
    expect(safeParseFinalResponse(input).success).toBe(false);
  });

  it('requires blocked status when upstream hard blockers exist', () => {
    const input = structuredClone(fixture) as any;
    input.validation_status = 'pass_with_warnings';
    expect(safeParseFinalResponse(input).success).toBe(false);
  });

  it('requires low confidence when hard blockers exist', () => {
    const input = structuredClone(fixture) as any;
    input.final_response.confidence_summary.overall_confidence = 'medium';
    expect(safeParseFinalResponse(input).success).toBe(false);
  });

  it('requires visible verification guidance when confidence is low', () => {
    const input = structuredClone(fixture) as any;
    input.final_response.confidence_summary.user_should_verify_before_trip = [];
    expect(safeParseFinalResponse(input).success).toBe(false);
  });

  it('requires women-only beach disclosure for sea plan with privacy constraint', () => {
    const input = structuredClone(fixture) as any;
    input.final_response.verification_disclosures = input.final_response.verification_disclosures.filter((d: any) => d.claim_category !== 'women_only_beach_status');
    expect(safeParseFinalResponse(input).success).toBe(false);
  });

  it('rejects day-card count mismatch', () => {
    const input = structuredClone(fixture) as any;
    input.final_response.daily_plan_cards.pop();
    expect(safeParseFinalResponse(input).success).toBe(false);
  });

  it('rejects a verified disclosure without evidence refs', () => {
    const input = structuredClone(fixture) as any;
    input.final_response.verification_disclosures[0].status = 'verified';
    input.final_response.verification_disclosures[0].source_evidence_item_ids = [];
    expect(safeParseFinalResponse(input).success).toBe(false);
  });
});
