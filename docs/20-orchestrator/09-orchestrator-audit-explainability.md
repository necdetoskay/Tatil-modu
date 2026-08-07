# Orchestrator Audit & Explainability

## Amaç
Bu belge Orchestrator'ın kritik routing, gate, retry, fallback ve finalization kararlarının sonradan açıklanabilir ve denetlenebilir olmasını sağlayacak tasarım sınırlarını tanımlar. Runtime logging implementation değildir.

## Audit kapsamı
Aşağıdaki olaylar audit trace'e bağlanabilir olmalıdır:
- workflow başlangıcı ve terminal durumu
- stage dispatch ve completion
- handoff kabul/red kararı
- gate sonucu ve reason code'ları
- retry/revision/fallback kararı
- blocker/warning oluşumu ve çözümü
- parallel branch join sonucu
- quality feedback route'u
- finalization kararı

## Mantıksal audit event
```yaml
audit_event:
  event_id: required
  workflow_id: required
  correlation_id: required
  event_type: required
  stage: required
  actor_or_component: required
  decision_ref: optional
  input_artifact_refs: []
  output_artifact_refs: []
  reason_codes: []
  blocker_refs: []
  warning_refs: []
  occurred_at: required
```

## Explainability ilkesi
Kritik bir Orchestrator kararı şu sorulara cevap verebilmelidir:
1. Hangi stage'deydik?
2. Hangi canonical input/artifact'lar kullanıldı?
3. Hangi gate/policy sonucu etkili oldu?
4. Neden bu route seçildi?
5. Hangi alternatif route'lar neden seçilmedi?
6. Bir degradation/fallback olduysa kullanıcıya nasıl disclosure taşındı?

## Yasaklar
- raw provider internals'ı canonical decision reason gibi sunmak
- reason code olmadan hard block üretmek
- audit trace içinde hassas kullanıcı verisini gereksiz çoğaltmak
- geçmiş event'i overwrite ederek karar geçmişini kaybetmek
- Orchestrator'ın üretmediği expert kararını kendi kararı gibi sahiplenmek

## Privacy ve minimization
Audit kayıtları açıklanabilirlik için gerekli referansları taşır; hassas memory veya kişisel verinin tam kopyasını taşımak zorunda değildir. Canonical artifact ref ve redacted metadata tercih edilir.

## Observability ilişkisi
Bu belge Orchestrator düzeyindeki audit semantiğini tanımlar. Metrics, traces, dashboards, alerting, SLO ve production telemetry sonraki Observability üst katmanının sorumluluğudur.
