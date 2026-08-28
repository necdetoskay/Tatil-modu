# UI Readiness Review

Bu klasör H11 sonrası frontend geliştirmesinin açılıp açılamayacağını belirleyen review kanıtlarını içerir. Bu aşama UI implementation değildir; canonical UX kararlarını headless contract'lara ve güvenli runtime durumlarına bağlar.

## Review çıktıları

| Artifact | Amaç |
|---|---|
| `01-screen-flow.md` | Ana kullanıcı yolculuğu ve ekran sınırları |
| `02-state-error-matrix.md` | Başarı, loading, clarification, blocked ve failure durumları |
| `03-contract-traceability.md` | Headless response alanlarının UI yüzeylerine eşleşmesi |
| `04-accessibility-checklist.md` | Mobil, aile kullanımı ve erişilebilirlik koşulları |
| `05-ui-readiness-validation-record.md` | Otomatik review sonucu ve karar |

## Karar kuralı

`pnpm test:ui-readiness` geçmeden `uiDevelopmentAllowed` true yapılamaz. Review PASS yalnız frontend implementation gate'ini açar; UI'ın kendisi bu klasörde üretilmez.
