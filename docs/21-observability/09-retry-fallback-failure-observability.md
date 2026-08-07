# Retry, Fallback and Failure Observability

## Amaç
Retry, recovery, fallback ve failure davranışlarının normal başarı istatistikleri içinde kaybolmasını engeller ve hangi failure sınıfının hangi recovery yoluna dönüştüğünü izlenebilir kılar.

## Failure sınıfları
```yaml
failure_classes:
  - contract_invalid
  - missing_required_input
  - capability_timeout
  - capability_unavailable
  - provider_error
  - evidence_gap
  - verification_failure
  - policy_block
  - quality_blocker
  - orchestration_invariant_violation
  - unknown_failure
```

## Retry/fallback sinyalleri
- retry_attempted_total
- retry_succeeded_total
- retry_failed_total
- retry_budget_exhausted_total
- fallback_applied_total
- fallback_succeeded_total
- fallback_failed_total
- degraded_completion_after_fallback_total

## Trace gereksinimi
Her recovery olayı şu ilişkiyi korumalıdır:
```text
original_failure
→ failure_class/reason
→ recovery_action
→ attempt number
→ recovery outcome
→ downstream impact
```

## Kurallar
1. Retry sayısı ve sebebi ayrı görünür olmalıdır.
2. Aynı girdiye kör tekrar normal retry politikası değildir.
3. Fallback hard constraint veya privacy requirement gevşetemediği için böyle bir deneme invariant violation olarak görünür olmalıdır.
4. Başarılı fallback sonucu `completed` yerine gerektiğinde `degraded` olarak ayrıştırılır.
5. Provider raw error telemetry içine kontrolsüz yazılmaz.
6. Unknown failure oranı yükselirse taxonomy/design eksikliği sinyali sayılır.
