# Test ve Değerlendirme Belgeleri

| Alan | Değer |
|---|---|
| Document ID | TST-README |
| Sürüm | 1.0 |
| Durum | Onaylandı (Taslak) |
| EOS Sürümü | EOS v1.0 |
| Son Güncelleme | 2026-08-06 |

## Amaç

Bu klasör, tatil-plan agent sisteminin **her bir agent'ını** bağımsız, deterministik ve tekrarlanabilir biçimde test etmek ve değerlendirmek için kanonik standardı ve tüm test artefaktlarını içerir.

## Doküman Haritası

- [Agent Testing & Evaluation Standard](AGENT_TESTING_STANDARDS.md) (TST-001) — Ana standardok

## Test Stratejisi Özet

Her agent için **dört seviyede test** yapılır:

1. **Contract Test** — Girdi/çıktı şeması ve tipler
2. **Behavioral Test** — Karar kurallarına uyum
3. **Scenario Test** — Zor gerçek dünya senaryoları
4. **Adversarial Test** — Çelişkili / yanıltıcı girdiler

Her test triple evaluation sisteminden geçer:

- **Schema Validator** (JSON Schema)
- **Rule Evaluator** (deterministic rule engine)
- **LLM Reviewer** (yapılandırılmış prompt → puan)
