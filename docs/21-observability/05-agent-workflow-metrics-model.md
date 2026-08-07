# Agent and Workflow Metrics Model

## Amaç
Agent ve workflow davranışını yalnızca başarı/başarısızlık üzerinden değil; kalite, contract uygunluğu, latency ve orchestration sonucu ile birlikte ölçülebilir hale getirir.

## Workflow metrikleri
```yaml
workflow_metrics:
  - workflow_started_total
  - workflow_completed_total
  - workflow_blocked_total
  - workflow_failed_total
  - workflow_degraded_total
  - workflow_duration_ms
  - stages_per_workflow
  - revisions_per_workflow
  - retries_per_workflow
  - fallbacks_per_workflow
```

## Stage / agent metrikleri
```yaml
stage_metrics:
  - stage_started_total
  - stage_completed_total
  - stage_failed_total
  - stage_duration_ms
  - contract_rejection_total
  - revision_requested_total
  - evidence_gap_total
  - quality_blocker_origin_total
```

## Outcome boyutları
Metrikler gerektiğinde şu düşük-cardinality boyutlarla ayrıştırılabilir:
- workflow_type
- stage_type
- component_id
- outcome_class
- failure_class
- retry_class
- environment_class

## Yasak yüksek-cardinality etiketler
- user id
- correlation id
- raw destination name
- free-text prompt
- raw error message
- evidence URL

Bunlar metrics label değil; trace/event referansı olarak kullanılmalıdır.

## Başarı tanımı
Bir agent veya stage için 'success' yalnız teknik olarak cevap dönmesi değildir. Contract-valid çıktı üretmesi ve downstream tarafından kabul edilmesi gerekir. Quality sonucu ayrı metrik olarak takip edilir.

## Kurallar
1. P50/P95/P99 latency gibi dağılımlar tasarımda desteklenmelidir.
2. Retry sonrası success, first-attempt success ile aynı metrikte gizlenmemelidir.
3. Degraded completion normal completed outcome'dan ayrılmalıdır.
4. Agent karşılaştırması sadece hız veya token sayısına indirgenmez.
5. Metric modeli implementation/provider bağımsızdır.
