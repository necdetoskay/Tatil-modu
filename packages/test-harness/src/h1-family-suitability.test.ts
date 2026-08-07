import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { safeParseFamilySuitability } from '../../contracts/src/family-suitability.js';

async function loadFixture() {
  const url = new URL('../../test-fixtures/fixtures/family-suitability/TM-FS-HP-001.json', import.meta.url);
  return JSON.parse(await readFile(url, 'utf8')) as {
    input: any;
    expected: {
      valid: boolean;
      children: number;
      fatigue_level: string;
      midday_rest_possible: boolean;
    };
  };
}

describe('H1 family suitability contract', () => {
  it('accepts TM-FS-HP-001', async () => {
    const fixture = await loadFixture();
    const result = safeParseFamilySuitability(fixture.input);
    expect(result.success).toBe(fixture.expected.valid);
    if (!result.success) throw result.error;
    expect(result.data.child_age_fit.children).toHaveLength(fixture.expected.children);
    expect(result.data.fatigue_risk.level).toBe(fixture.expected.fatigue_level);
    expect(result.data.rest_fit.midday_rest_possible).toBe(fixture.expected.midday_rest_possible);
  });

  it('requires toddler_fit when a child is age 3 or younger', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture.input);
    delete invalid.toddler_fit;
    expect(safeParseFamilySuitability(invalid).success).toBe(false);
  });

  it('requires older_child_fit when a child is age 4 or older', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture.input);
    delete invalid.older_child_fit;
    expect(safeParseFamilySuitability(invalid).success).toBe(false);
  });

  it('requires a blocker reason when suitability is blocked', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture.input);
    invalid.family_suitability_summary.overall_fit_band = 'blocked';
    invalid.suitability_blockers = [];
    expect(safeParseFamilySuitability(invalid).success).toBe(false);
  });

  it('forbids low-confidence hard blockers', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture.input);
    invalid.confidence.level = 'low';
    invalid.suitability_blockers = ['impossible_midday_rest_when_required'];
    expect(safeParseFamilySuitability(invalid).success).toBe(false);
  });

  it('requires evidence_ref for verified facility claims', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture.input);
    invalid.evidence_markers = [{ claim: 'parking_available', status: 'verified' }];
    expect(safeParseFamilySuitability(invalid).success).toBe(false);
  });

  it('keeps unknown facility claims non-verified', async () => {
    const fixture = await loadFixture();
    const result = safeParseFamilySuitability(fixture.input);
    if (!result.success) throw result.error;
    expect(result.data.evidence_markers[0]?.status).toBe('unknown');
  });
});
