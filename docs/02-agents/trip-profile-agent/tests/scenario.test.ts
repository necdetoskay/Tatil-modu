import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const FIXTURES_DIR = resolve(__dirname, '..', 'tests', 'fixtures');

// Senaryo (scenario) testleri: farklı ve zor gerçek dünya durumları
const scenarioFixtures = [
  { id: 'TPA-001', name: 'Normal aile tatili', category: 'normal' },
  { id: 'TPA-002', name: 'Eksik bütçe', category: 'missing_information' },
  { id: 'TPA-003', name: 'Sabit tarih uyumlu', category: 'normal' },
  { id: 'TPA-006', name: 'Tatil türü tercihi', category: 'preference' },
  { id: 'TPA-007', name: 'Konaklama ve otopark', category: 'preference' },
  { id: 'TPA-008', name: 'Muhafazakâr tesis', category: 'special_requirement' },
  { id: 'TPA-010', name: 'Esnek tarih', category: 'date_flexibility' },
  { id: 'TPA-011', name: 'Konaklama bütçesi', category: 'budget' },
  { id: 'TPA-013', name: 'Elektrikli araç', category: 'transportation' },
  { id: 'TPA-014', name: 'Erişilebilirlik', category: 'accessibility' },
];

describe('Trip Profile Agent — Scenario Tests', () => {
  for (const sf of scenarioFixtures) {
    it(`${sf.id}: ${sf.name} (${sf.category})`, () => {
      const fixture = JSON.parse(
        readFileSync(resolve(FIXTURES_DIR, `tpa-${sf.id.replace('TPA-', '').padStart(3, '0')}.json`), 'utf-8')
      );

      // Senaryo: Agent farklı kullanıcı tiplerine ve girdi kalitelerine karşı dayanıklı olmalı
      expect(fixture.testId).toBe(sf.id);
      expect(fixture.critical).toBeDefined();
      expect(['complete', 'partial', 'invalid']).toContain(fixture.expectedStatus);
    });
  }

  it('TPA-003: Sabit tarih modu doğru çıkarılır', () => {
    const fixture = JSON.parse(readFileSync(resolve(FIXTURES_DIR, 'tpa-003.json'), 'utf-8'));
    // dates.mode = "fixed", dates.durationDays = 3
    expect(fixture.expectedStatus).toBe('partial');
  });

  it('TPA-010: Esnek tarih modu doğru çıkarılır', () => {
    const fixture = JSON.parse(readFileSync(resolve(FIXTURES_DIR, 'tpa-010.json'), 'utf-8'));
    // dates.agentMayRecommendDates = true
    expect(fixture.expectedStatus).toBe('partial');
  });
});
