import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { safeParseDestinationCandidate } from '../../contracts/src/index.js';

async function loadFixture() {
  const url = new URL('../../test-fixtures/fixtures/destination-candidate/TM-DC-HP-001.json', import.meta.url);
  return JSON.parse(await readFile(url, 'utf8'));
}

describe('H1 destination candidate contract', () => {
  it('accepts TM-DC-HP-001', async () => {
    const fixture = await loadFixture();
    const result = safeParseDestinationCandidate(fixture);
    expect(result.success).toBe(true);
    if (!result.success) throw result.error;
    expect(result.data.candidate_destinations).toHaveLength(1);
    expect(result.data.candidate_destinations[0]?.candidate_id).toBe('dest-bursa-center');
  });

  it('rejects out-of-radius candidates without an exceptional reason', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture);
    invalid.candidate_destinations[0].radius_class = 'exceptional_out_of_radius_area';
    invalid.candidate_destinations[0].estimated_distance_band_from_origin = '150_200_km';
    delete invalid.candidate_destinations[0].exceptional_reason;
    expect(safeParseDestinationCandidate(invalid).success).toBe(false);
  });

  it('rejects low-confidence candidates without verification needs', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture);
    invalid.candidate_destinations[0].confidence = 'low';
    invalid.candidate_destinations[0].evidence_status.verification_needs = [];
    expect(safeParseDestinationCandidate(invalid).success).toBe(false);
  });

  it('rejects sea candidates without the women-only beach verification marker', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture);
    invalid.candidate_destinations[0].privacy_relevance.sea_or_beach_related = true;
    invalid.candidate_destinations[0].privacy_relevance.women_only_beach_verification_required = false;
    expect(safeParseDestinationCandidate(invalid).success).toBe(false);
  });

  it('rejects sea candidates missing from the privacy verification summary', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture);
    invalid.candidate_destinations[0].privacy_relevance.sea_or_beach_related = true;
    invalid.candidate_destinations[0].privacy_relevance.women_only_beach_verification_required = true;
    invalid.privacy_verification_needs.sea_candidates_exist = true;
    invalid.privacy_verification_needs.candidates_requiring_privacy_verification = [];
    expect(safeParseDestinationCandidate(invalid).success).toBe(false);
  });

  it('rejects forbidden live-data fields', async () => {
    const fixture = await loadFixture();
    const invalid = structuredClone(fixture);
    invalid.candidate_destinations[0].live_route_duration_minutes = 90;
    expect(safeParseDestinationCandidate(invalid).success).toBe(false);
  });
});
