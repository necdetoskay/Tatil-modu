# 02 — Trip Profile Agent

| Alan | Değer |
|---|---|
| Document ID | AGENT-002-README |
| Sürüm | 1.0 |
| Durum | Taslak (Review) |
| Agent ID | `02-trip-profile` |
| Test Standard | TST-001 |
| Son Güncelleme | 2026-08-06 |

## Amaç

Trip Profile Agent, kullanıcının doğal dil girdisini (veya kısmi form verisini) alır ve tüm diğer agentların kullandığı yapılandırılmış `TripProfile` nesnesine dönüştürür.

Bu agent, agent ekosistemindeki **ilk downstream bağımlıdır** — yani Orchestrator, bu agentın ürettiği profilin `confidence ≥ 0.80` ve `conflictFlags` boş olduğunu doğruladıktan sonra diğer agentları devreye alır.

## Dosya Haritası

| Dosya | Açıklama |
|-------|----------|
| [`specification.md`](specification.md) | Tam teknik tanım (kimlik, amaç, girdi/çıktı, kurallar, metrikler) |
| [`system-prompt.md`](system-prompt.md) | Kullanılan sistem promptu (versiyonlu, composable katmanlar) |
| [`decision-rules.md`](decision-rules.md) | Deterministic rule engine, çelişki kontrolü, confidence hesaplama |
| [`tests/schemas/trip-profile.input.json`](tests/schemas/trip-profile.input.json) | Girdi JSON Schema |
| [`tests/schemas/trip-profile.output.json`](tests/schemas/trip-profile.output.json) | Çıktı JSON Schema |
| [`tests/fixtures/`](tests/fixtures/) | 12 test fixture'ı (contract, behavioral, scenario, adversarial) |
| [`tests/expected/`](tests/expected/) | Fixture'lara karşılık beklenen sonuçlar |
| [`tests/rubric/`](tests/rubric/) | 4 rubrik dosyası (contract, behavioral, scenario, adversarial) |

## Test Matrisi

| Fixture ID | Test Type | Schema | Rule | LLM Review | Expected Outcome |
|-----------|-----------|--------|------|------------|-----------------|
| `profile-family-basic` | Contract | ✅ | ✅ | ✅ | confidence ≥ 0.85, conflictFlags boş |
| `profile-solo-budget` | Contract | ✅ | ✅ | ✅ | tripPurpose=exploration, vehicle=public_transport |
| `profile-family-children` | Behavioral | ✅ | ✅ (age_band) | — | ageBand: 3→preschool, 5→preschool, 6→elementary, 2→baby |
| `profile-negative-budget` | Behavioral | ✅ | ✅ (CF-03) | ✅ | conflictFlags=[budget_invalid], confidence ≤ 0.5 |
| `profile-last-minute` | Scenario | ✅ | ✅ | ✅ | flexibility=month/flexible_3days, confidence 0.65–0.85 |
| `profile-ev-child` | Scenario | ✅ | ✅ | ✅ | vehicle.chargingNeeded=true, accessibilityRequired=true |
| `profile-conflicting-dates` | Adversarial | ✅ | ✅ (CF-01) | ✅ | conflictFlags=[date_range_invalid], confidence ≤ 0.5 |
| `profile-invalid-vehicle` | Adversarial | ✅ (reject) | ✅ (CF-06) | — | vehicle.type=any, conflictFlags=[vehicle_invalid] |
| `profile-missing-fields` | Adversarial | ✅ | ✅ | ✅ | confidence ≤ 0.3, ≥ 8 missing fields |
| `profile-unrealistic-budget` | Scenario | ✅ | ✅ (CF-07) | ✅ | conflictFlags=[budget_unrealistic], confidence ≤ 0.5 |
| `profile-elderly-accessibility` | Behavioral | ✅ | ✅ | — | elderlyCount ≥ 1, accessibilityNeeds non-empty |
| `profile-pet-friendly` | Behavioral | ✅ | ✅ | — | petFriendly=true |

## Coverage Summary

- **Schema coverage**: 100% (output schema'daki tüm alanlar en az 1 fixture'da test edilir)
- **Rule coverage**: 8/8 conflict detection rules test edilir
- **Scenario coverage**: 4/4 zor senaryo
- **Adversarial coverage**: 4/4 çelişkili girdi

## Test Çalıştırma

```bash
# Trip Profile Agent tüm testleri (fixture mode)
pnpm test -- --agent trip-profile

# Sadece contract
pnpm test -- --agent trip-profile --level contract

# Sadece behavioral
pnpm test -- --agent trip-profile --level behavioral

# Triple evaluation raporu
pnpm test -- --agent trip-profile --report triple-eval
```
