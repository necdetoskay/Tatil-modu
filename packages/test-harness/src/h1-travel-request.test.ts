import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { safeParseTravelRequest } from '../../contracts/src/index';

async function loadFixture() {
  const url = new URL('../../test-fixtures/fixtures/trip-intake/TM-TI-HP-001.json', import.meta.url);
  return JSON.parse(await readFile(url, 'utf8')) as {
    input: unknown;
    expected: {
      valid: boolean;
      contract_id: string;
      contract_version: string;
    };
  };
}

describe('H1 travel request contract', () => {
  it('accepts TM-TI-HP-001', async () => {
    const fixture = await loadFixture();
    const result = safeParseTravelRequest(fixture.input);

    expect(result.success).toBe(fixture.expected.valid);
    if (!result.success) throw result.error;
    expect(result.data.contract_id).toBe(fixture.expected.contract_id);
    expect(result.data.contract_version).toBe(fixture.expected.contract_version);
    expect(result.data.payload.hard_constraint_candidates).toHaveLength(2);
    expect(result.data.payload.date_window).toBeUndefined();
    expect(
      result.data.payload.privacy_preferences?.women_only_beach_required_when_sea_recommended
        ?.persistence_allowed_without_user_approval
    ).toBe(false);
  });

  it('rejects a missing contract version', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture.input) as Record<string, unknown>;
    delete invalid.contract_version;
    expect(safeParseTravelRequest(invalid).success).toBe(false);
  });

  it('rejects forbidden extra fields', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture.input) as Record<string, unknown>;
    const payload = invalid.payload as Record<string, unknown>;
    payload.final_itinerary = ['forbidden'];
    expect(safeParseTravelRequest(invalid).success).toBe(false);
  });

  it('rejects sensitive preference persistence without user approval', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture.input) as any;
    invalid.payload.privacy_preferences.women_only_beach_required_when_sea_recommended
      .persistence_allowed_without_user_approval = true;
    expect(safeParseTravelRequest(invalid).success).toBe(false);
  });
});
