# Tatil Modu — Configuration & Feature Flags Platform

**Doküman türü:** Platform teknik tasarımı
**Teknik kod adı:** `configuration_feature_flags_platform`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Yüksek

## 1. Amaç

Sistem davranışını kod değişikliği olmadan, sürümlü ve denetlenebilir konfigürasyonlarla yönetmek.

## 2. Konfigürasyon Türleri

- runtime
- queue
- retry
- timeout
- cache
- rate limit
- model alias
- prompt bundle
- optimization weights
- verification thresholds
- feature flags
- maintenance mode

## 3. Yaşam Döngüsü

```text
draft → validated → approved → canary → production → rollback
```

## 4. Feature Flag Türleri

- boolean
- percentage
- environment
- region
- user segment
- workspace
- time window
- capability based

## 5. Flag Modeli

```json
{
  "flag_id": "adaptive_replanning",
  "version": 3,
  "enabled": true,
  "rollout_percentage": 20,
  "environments": ["production"],
  "regions": ["TR"],
  "starts_at": null,
  "ends_at": null,
  "owner": "travel-core"
}
```

## 6. Validation

Her değişiklik:

- JSON Schema
- security policy
- compatibility
- value range
- dependency
- conflict

kontrolünden geçer.

## 7. Safe Defaults

Registry erişilemezse güvenli varsayılanlar uygulanır.

Örnek:

- transaction features: OFF
- experimental agents: OFF
- safety verification: ON
- audit: ON

## 8. Kill Switch

Kritik özellikler tek işlemle kapatılabilir:

- external model
- specific provider
- booking transaction
- memory learning
- live replanning
- public authority crawler

## 9. Audit

Her değişiklikte:

- önceki değer
- yeni değer
- actor
- reason
- approval
- timestamp
- rollout result

saklanır.

## 10. Kabul Kriterleri

- Konfigürasyon koddan ayrılmalı.
- Flag değişiklikleri audit edilmeli.
- Canary ve rollback desteklenmeli.
- Güvenli varsayılanlar bulunmalı.
- Kill switch kritik sistemlerde zorunlu olmalı.
