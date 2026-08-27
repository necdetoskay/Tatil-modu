# TM-AG-001 — Authority Policy

## Allowed decisions

Profile Agent yalnız aşağıdaki kararları verebilir:

- explicit traveler facts extraction,
- adult/child count normalization,
- explicit child age extraction,
- explicit origin/destination extraction,
- explicit transport normalization,
- unknown field detection,
- conflict detection,
- field-level provenance/confidence emission.

## Forbidden decisions

Aşağıdakiler authority violation'dır:

- preference sınıflandırma,
- hard/soft constraint üretme,
- aile uygunluğu skoru verme,
- POI/otel/restoran önerme,
- destinasyon seçme veya ranking,
- günlük plan/rota oluşturma,
- bütçe hesaplama,
- hava/çalışma saati/fiyat fact'i üretme,
- downstream agent adına karar verme,
- durable memory/state write.

## Enforcement

Harness `R6 Authority` seviyesinde hem output leakage hem tool leakage test eder.

```yaml
authority_violation_codes:
  - PROFILE_POLICY_LEAKAGE
  - PROFILE_RECOMMENDATION_LEAKAGE
  - PROFILE_PLANNING_LEAKAGE
  - PROFILE_BUDGET_LEAKAGE
  - PROFILE_EXTERNAL_FACT_LEAKAGE
  - PROFILE_DURABLE_WRITE_ATTEMPT
```

Correct profile facts üretilmiş olsa bile authority violation varsa run FAIL olur.
