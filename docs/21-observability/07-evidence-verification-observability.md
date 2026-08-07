# Evidence and Verification Observability

## Amaç
Evidence ve verification süreçlerindeki eksik, stale, conflict ve confidence problemlerinin workflow içinde nerede oluştuğunu görünür hale getirir. Observability doğrulama yapmaz; Verification Platform sonucunu gözlemler.

## Temel sinyaller
```yaml
evidence_observability:
  - evidence_required_total
  - evidence_found_total
  - evidence_gap_total
  - stale_evidence_total
  - conflicting_evidence_total
  - verification_pass_total
  - verification_conditional_total
  - verification_failed_total
  - source_fallback_total
```

## Trace alanları
- correlation_id
- stage_id
- claim/evidence reference
- verification outcome
- confidence band
- freshness state
- source class
- reason code

## Kurallar
1. Raw evidence içeriği telemetry içine kopyalanmaz; evidence ref kullanılır.
2. Verification confidence Observability tarafından yeniden hesaplanmaz.
3. Stale ve conflicting evidence ayrı operational sinyallerdir.
4. Kaynak fallback kullanımı normal verification success içinde gizlenmez.
5. Privacy-sensitive claim telemetry label'ına yazılmaz.
6. Evidence gap'in hangi downstream gate veya quality sonucu etkilediği trace edilebilir olmalıdır.

## Operasyonel amaç
Bu görünüm sayesinde örneğin belirli bir veri sınıfında sürekli evidence gap yaşanıyorsa bunun research, capability, source veya verification tasarımı kaynaklı olup olmadığı anlaşılabilir.
