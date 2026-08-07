import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  commonEvidenceEnvelopeSchema,
  commonErrorEnvelopeSchema,
  constraintPolicyEnvelopeSchema
} from '../../contracts/src/index.js';

async function load(path: string) {
  const url = new URL(`../../test-fixtures/fixtures/contracts/${path}`, import.meta.url);
  return JSON.parse(await readFile(url, 'utf8')) as { input: any; expected: { valid: boolean } };
}

describe('H1 shared contract slice', () => {
  it('accepts the canonical evidence fixture', async () => {
    const fixture = await load('TM-EVIDENCE-ENVELOPE-001.json');
    expect(commonEvidenceEnvelopeSchema.safeParse(fixture.input).success).toBe(fixture.expected.valid);
  });

  it('rejects unverified evidence presented as fact', async () => {
    const fixture = await load('TM-EVIDENCE-ENVELOPE-001.json');
    const invalid = structuredClone(fixture.input);
    invalid.user_visibility.must_not_present_as_fact = false;
    expect(commonEvidenceEnvelopeSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects time-sensitive evidence without freshness requirement', async () => {
    const fixture = await load('TM-EVIDENCE-ENVELOPE-001.json');
    const invalid = structuredClone(fixture.input);
    invalid.freshness.required = false;
    expect(commonEvidenceEnvelopeSchema.safeParse(invalid).success).toBe(false);
  });

  it('accepts the canonical hard-blocker error fixture', async () => {
    const fixture = await load('TM-ERROR-ENVELOPE-001.json');
    expect(commonErrorEnvelopeSchema.safeParse(fixture.input).success).toBe(fixture.expected.valid);
  });

  it('rejects a hidden hard blocker', async () => {
    const fixture = await load('TM-ERROR-ENVELOPE-001.json');
    const invalid = structuredClone(fixture.input);
    invalid.user_visible = false;
    expect(commonErrorEnvelopeSchema.safeParse(invalid).success).toBe(false);
  });

  it('accepts the canonical constraint policy fixture', async () => {
    const fixture = await load('TM-CONSTRAINT-POLICY-001.json');
    expect(constraintPolicyEnvelopeSchema.safeParse(fixture.input).success).toBe(fixture.expected.valid);
  });

  it('rejects low-confidence hard constraints', async () => {
    const fixture = await load('TM-CONSTRAINT-POLICY-001.json');
    const invalid = structuredClone(fixture.input);
    invalid.payload.hard_constraints[0].confidence = 'low';
    expect(constraintPolicyEnvelopeSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects policy that allows soft preferences to override hard constraints', async () => {
    const fixture = await load('TM-CONSTRAINT-POLICY-001.json');
    const invalid = structuredClone(fixture.input);
    invalid.payload.downstream_application_rules.ranking.soft_preferences_cannot_override_hard_constraints = false;
    expect(constraintPolicyEnvelopeSchema.safeParse(invalid).success).toBe(false);
  });
});
