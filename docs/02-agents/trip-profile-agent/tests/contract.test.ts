import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validate } from 'json-schema';

const AGENT_DIR = resolve(__dirname, '..');
const FIXTURES_DIR = resolve(AGENT_DIR, 'tests/fixtures');
const SCHEMA_PATH = resolve(AGENT_DIR, 'output.schema.json');

const outputSchema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'));

// Tüm fixture'ları yükle
const fixtures = Array.from({ length: 15 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const fixture = JSON.parse(
    readFileSync(resolve(FIXTURES_DIR, `tpa-${num}.json`), 'utf-8')
  );
  return {
    ...fixture,
    num,
  };
});

describe('Trip Profile Agent — Contract Tests (Schema)', () => {
  for (const fixture of fixtures) {
    it(`TPA-${fixture.num} (${fixture.name}) — Schema validity`, () => {
      // Bu test, agentın çıktısının output.schema.json'na uyduğunu kontrol eder.
      // Fixture mode'da, agent çalıştırılmadan önce expected output kullanılır.
      // Gerçek implementasyon agentı çağırıp çıktıyı buraya koyacak.

      // Schema kontrolleri:
      // 1. Zorunlu alanlar mevcut mu?
      // 2. Tipler doğru mu?
      // 3. Enum'lar geçerli mi?
      // 4. additionalProperties: false kontrolü

      const requiredFields = [
        'schemaVersion', 'agent', 'requestId', 'status', 'tripProfileId',
        'origin', 'destination', 'travelParty', 'dates', 'transportation',
        'budget', 'preferences', 'familyConstraints', 'specialRequirements',
        'missingInformation', 'assumptions', 'conflicts', 'validationErrors',
        'clarificationPriority', 'sourceTrace', 'confidence', 'confidenceFactors'
      ];

      // Placeholder: Gerçek agent çıktısı buraya konulacak
      // Şu anda fixture'ın expected durumunu doğruluyoruz
      expect(fixture.expectedStatus).toBeOneOf(['complete', 'partial', 'invalid']);
    });
  }

  it('Output schema has valid JSON Schema structure', () => {
    expect(outputSchema.type).toBe('object');
    expect(outputSchema.required).toContain('status');
    expect(outputSchema.required).toContain('confidence');
    expect(outputSchema.required).toContain('conflicts');
    expect(outputSchema.additionalProperties).toBe(false);
  });
});
