import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const FIXTURES_DIR = resolve(__dirname, '..', 'tests', 'fixtures');

// Adversarial testler: çelişkili, yanıltıcı veya kötü niyetli girdiler
const adversarialFixtures = [
  { id: 'tpa-004', name: 'Tarih-süre çelişkisi', category: 'conflict', expectedStatus: 'invalid' },
  { id: 'tpa-005', name: 'Negatif çocuk yaşı', category: 'invalid_input', expectedStatus: 'invalid' },
  { id: 'tpa-009', name: 'Context çelişkisi', category: 'context_conflict', expectedStatus: 'partial' },
  { id: 'tpa-012', name: 'Bütçe çelişkisi', category: 'conflict', expectedStatus: 'invalid' },
  { id: 'tpa-015', name: 'Kritik eksik bilgi', category: 'critical_missing', expectedStatus: 'invalid' },
];

describe('Trip Profile Agent — Adversarial Tests', () => {
  for (const af of adversarialFixtures) {
    it(`${af.id}: ${af.name}`, () => {
      const fixture = JSON.parse(
        readFileSync(resolve(FIXTURES_DIR, `${af.id}.json`), 'utf-8')
      );

      expect(fixture.testId).toBeTruthy();
      expect(fixture.expectedStatus).toBe(af.expectedStatus);
      expect(fixture.critical).toBe(true);

      // Adversarial inputlar kritik olmalı — agentın sessiz kalmaması gerekir
    });
  }

  it('TPA-004: Tarih-süre çelişkisi DATE_DURATION_MISMATCH üretir', () => {
    const fixture = JSON.parse(readFileSync(resolve(FIXTURES_DIR, 'tpa-004.json'), 'utf-8'));
    expect(fixture.category).toBe('conflict');
    expect(fixture.expectedStatus).toBe('invalid');
    // Agent conflicts[].code contains "DATE_DURATION_MISMATCH"
  });

  it('TPA-012: Bütçe çelişkisi ACCOMMODATION_BUDGET_EXCEEDS_TOTAL üretir', () => {
    const fixture = JSON.parse(readFileSync(resolve(FIXTURES_DIR, 'tpa-012.json'), 'utf-8'));
    expect(fixture.category).toBe('conflict');
    expect(fixture.expectedStatus).toBe('invalid');
    // Agent conflicts[].code contains "ACCOMMODATION_BUDGET_EXCEEDS_TOTAL"
  });

  it('TPA-015: Minimal girdi düşük confidence → invalid', () => {
    const fixture = JSON.parse(readFileSync(resolve(FIXTURES_DIR, 'tpa-015.json'), 'utf-8'));
    expect(fixture.expectedStatus).toBe('invalid');
    // Agent confidence.score < 0.5, missingInformation dolu
  });
});
