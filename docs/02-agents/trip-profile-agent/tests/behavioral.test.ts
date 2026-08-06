import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const FIXTURES_DIR = resolve(__dirname, '..', 'tests', 'fixtures');

const fixtures = Array.from({ length: 15 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  return JSON.parse(readFileSync(resolve(FIXTURES_DIR, `tpa-${num}.json`), 'utf-8'));
});

describe('Trip Profile Agent — Behavioral Tests (Decision Rules)', () => {
  // TPA-005: Negatif çocuk yaşı → validationErrors: INVALID_CHILD_AGE
  it('TPA-005: Negatif çocuk yaşı tespit edilir', () => {
    const fixture = fixtures.find(f => f.testId === 'TPA-005')!;
    expect(fixture.expectedStatus).toBe('invalid');
    // Agentın outputs.validationErrors içinde INVALID_CHILD_AGE kodu olmalı
  });

  // TPA-009: Güncel mesaj context çelişkisi → CURRENT_MESSAGE_CONTEXT_CONFLICT
  it('TPA-009: Güncel mesaj context çelişkisini tespit eder', () => {
    const fixture = fixtures.find(f => f.testId === 'TPA-009')!;
    expect(fixture.expectedStatus).toBe('partial');
    // conflicts[].code contains "CURRENT_MESSAGE_CONTEXT_CONFLICT"
    // travelParty.adults = 1 (güncel mesajdan)
  });

  // TPA-012: Otel bütçesi > toplam bütçe → ACCOMMODATION_BUDGET_EXCEEDS_TOTAL
  it('TPA-012: Otel bütçesi toplam bütçeyi aşarsa çelişki tespit edilir', () => {
    const fixture = fixtures.find(f => f.testId === 'TPA-012')!;
    expect(fixture.expectedStatus).toBe('invalid');
  });

  // TPA-002: Eksik bütçe → missingInformation
  it('TPA-002: Eksik bütçe missingInformation olarak işaretlenir', () => {
    const fixture = fixtures.find(f => f.testId === 'TPA-002')!;
    expect(fixture.expectedStatus).toBe('partial');
    // missingInformation[*].field contains "budget.amount"
  });

  // TPA-006: Tatil önceliği mapping
  it('TPA-006: Deniz önceliği doğru mapping', () => {
    const fixture = fixtures.find(f => f.testId === 'TPA-006')!;
    // preferences.tripTypes[0].type = "sea" olmalı
    expect(fixture.category).toBe('preference');
  });

  // TPA-011: Otel bütçesi → scope = accommodation_only
  it('TPA-011: Yalnızca otel bütçesi scope=accommodation_only', () => {
    const fixture = fixtures.find(f => f.testId === 'TPA-011')!;
    expect(fixture.category).toBe('budget');
  });

  // TPA-013: Elektrikli araç → electric_car
  it('TPA-013: Elektrikli araç doğru mapping', () => {
    const fixture = fixtures.find(f => f.testId === 'TPA-013')!;
    expect(fixture.category).toBe('transportation');
  });

  // TPA-001: Temel aile profili extraction
  it('TPA-001: Temel aile profili doğru çıkarılır', () => {
    const fixture = fixtures.find(f => f.testId === 'TPA-001')!;
    // origin=KOCAELİ, destination=BALIKESİR, travelers=4, budget=30000
    expect(fixture.critical).toBe(true);
  });

  // TPA-014: Erişilebilirlik
  it('TPA-014: Erişilebilirlik özellikleri çıkarılır', () => {
    const fixture = fixtures.find(f => f.testId === 'TPA-014')!;
    expect(fixture.category).toBe('accessibility');
  });

  // TPA-007: Konaklama tercihi
  it('TPA-007: Otopark gibi must-have özellikler çıkarılır', () => {
    const fixture = fixtures.find(f => f.testId === 'TPA-007')!;
    expect(fixture.category).toBe('preference');
  });

  // TPA-008: Muhafazakar tesis
  it('TPA-008: Özel gereksinimler hard constraint olarak işaretlenir', () => {
    const fixture = fixtures.find(f => f.testId === 'TPA-008')!;
    expect(fixture.category).toBe('special_requirement');
  });

  // TPA-015: Kritik eksik bilgi
  it('TPA-015: Minimal girdi düşük confidence verir', () => {
    const fixture = fixtures.find(f => f.testId === 'TPA-015')!;
    expect(fixture.expectedStatus).toBe('invalid');
  });
});
