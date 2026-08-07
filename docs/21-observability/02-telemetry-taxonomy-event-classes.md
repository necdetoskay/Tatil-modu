# Telemetry Taxonomy and Event Classes

## Amaç
Tatil Modu içindeki gözlemlenebilir sinyaller için ortak sınıflandırma tanımlar. Amaç her bileşenin farklı ve karşılaştırılamaz event isimleri üretmesini engellemektir.

## Ana telemetry sınıfları

```yaml
telemetry_classes:
  execution:
    - workflow_started
    - workflow_completed
    - workflow_blocked
    - workflow_failed
  stage:
    - stage_started
    - stage_completed
    - stage_failed
    - stage_degraded
  handoff:
    - handoff_dispatched
    - handoff_accepted
    - handoff_rejected
  gate:
    - gate_evaluated
    - gate_blocked
    - gate_revision_requested
  tool_model:
    - capability_call_started
    - capability_call_completed
    - capability_call_failed
  evidence:
    - evidence_required
    - evidence_verified
    - evidence_gap_detected
    - evidence_stale_detected
  quality:
    - quality_review_completed
    - quality_blocker_detected
    - quality_revision_requested
  resilience:
    - retry_scheduled
    - fallback_applied
    - retry_budget_exhausted
  finalization:
    - finalization_started
    - finalization_completed
    - finalization_blocked
```

## Severity
- `debug`: geliştirme ayrıntısı; production canonical sinyal olmak zorunda değil.
- `info`: normal yaşam döngüsü olayı.
- `warning`: degraded durum, fallback, uncertainty veya beklenmeyen ama yönetilen koşul.
- `error`: stage veya capability başarısızlığı.
- `critical`: güvenli finalization'ı engelleyen sistemsel failure.

## Kurallar
1. Event adı davranışı açıklar; serbest metin karar sebebi yerine geçmez.
2. Reason code ayrı alan olarak taşınır.
3. Domain-specific outcome telemetry sınıfına gömülmez; artifact/decision ref ile bağlanır.
4. Aynı semantic olay farklı componentlerde farklı adlarla üretilmez.
5. Privacy-sensitive içerik event name veya label içine yazılmaz.
