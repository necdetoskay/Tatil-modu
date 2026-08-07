import { describe, expect, it } from 'vitest';
import fixture from '../../test-fixtures/contracts/verification-evidence/TM-VE-HP-001.json' with { type: 'json' };
import { safeParseVerificationEvidence } from '@tatil-modu/contracts';

describe('H1 verification evidence contract', () => {
  it('accepts the canonical happy-path fixture', () => {
    expect(safeParseVerificationEvidence(fixture).success).toBe(true);
  });

  it('rejects an unverified claim hidden from the user', () => {
    const input = structuredClone(fixture) as any;
    input.evidence_items[0].user_visible_status = 'may_hide';
    expect(safeParseVerificationEvidence(input).success).toBe(false);
  });

  it('rejects an unresolved hard gap without a hard blocker', () => {
    const input = structuredClone(fixture) as any;
    input.hard_blockers = [];
    expect(safeParseVerificationEvidence(input).success).toBe(false);
  });

  it('rejects an unresolved hard gap without blocked validation status', () => {
    const input = structuredClone(fixture) as any;
    input.validation_status = 'needs_verification';
    expect(safeParseVerificationEvidence(input).success).toBe(false);
  });

  it('rejects high confidence while a hard evidence gap remains', () => {
    const input = structuredClone(fixture) as any;
    input.confidence.value = 'high';
    expect(safeParseVerificationEvidence(input).success).toBe(false);
  });

  it('rejects a women-only beach uncertainty without an explicit final-response rule', () => {
    const input = structuredClone(fixture) as any;
    input.final_response_rules = ['show_price_as_requires_current_check'];
    expect(safeParseVerificationEvidence(input).success).toBe(false);
  });

  it('rejects unknown evidence gap ids', () => {
    const input = structuredClone(fixture) as any;
    input.unresolved_evidence_gaps.push('ev-does-not-exist');
    expect(safeParseVerificationEvidence(input).success).toBe(false);
  });

  it('rejects a verified claim that remains a hard blocker', () => {
    const input = structuredClone(fixture) as any;
    input.evidence_items[0].verification_status = 'verified';
    input.evidence_items[0].user_visible_status = 'may_show_as_verified';
    expect(safeParseVerificationEvidence(input).success).toBe(false);
  });
});
