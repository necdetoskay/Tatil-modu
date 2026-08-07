# Dashboard, Alert and Operational View Design

## Amaç
Observability sinyallerinin hangi operasyonel görünümler altında bir araya getirileceğini ve hangi koşulların alert adayı olacağını tasarlar. Bu belge dashboard implementation veya alert deployment değildir.

## Canonical operational views

### 1. E2E Workflow Health
Gösterilecek ana sinyaller:
- workflow volume
- completed / degraded / blocked / failed oranları
- P50/P95/P99 workflow duration
- retry ve fallback oranları
- finalization blocker oranı

### 2. Agent and Stage Health
- stage latency
- stage failure rate
- contract rejection rate
- revision rate
- quality blocker origin rate
- evidence gap rate

### 3. Gate and Policy View
- gate pass/block/revise oranları
- en sık reason code'lar
- hard constraint blocker trendi
- privacy-sensitive blocker trendi
- budget hard-limit blocker trendi

### 4. Evidence and Verification View
- evidence gap oranı
- stale/conflicting evidence trendi
- verification failure oranı
- source fallback oranı

### 5. Quality View
- quality pass/block/revision oranları
- quality dimension trendleri
- en sık blocker kategorileri
- repeated regression sinyalleri

### 6. Cost and Latency View
- workflow/stage maliyet tahmini
- model/tool maliyet katkısı
- retry/fallback ek maliyeti
- latency hotspot'ları

### 7. Resilience View
- failure class dağılımı
- retry budget exhaustion
- fallback success/degraded/failure oranı
- unknown failure trendi

## Alert adayları
Alert mantığı tek olay yerine oran, süreklilik veya kritik invariant ihlaline dayanmalıdır.

```yaml
alert_candidates:
  - critical_orchestration_invariant_violation
  - sustained_workflow_failure_rate
  - sustained_quality_blocker_spike
  - sustained_evidence_gap_spike
  - retry_budget_exhaustion_spike
  - unexpected_cost_spike
  - severe_latency_regression
  - sensitive_telemetry_redaction_failure
```

## Alert ilkeleri
1. Her warning alert değildir.
2. Kullanıcı kaynaklı normal hard constraint block operasyonel incident değildir.
3. Alert reason code ve ilgili trace'e bağlanabilmelidir.
4. Alert threshold'ları bu tasarım aşamasında production sayısına sabitlenmez.
5. Dashboard canonical karar kaynağı değildir; ilgili artifact, decision ve quality report'a referans verir.
6. Privacy-safe aggregation korunmalıdır.

## SLO ilişkisi
Dashboard/alert tasarımı gelecekte SLI/SLO tasarımına girdi sağlayabilir; bu belge production SLO hedefleri tanımlamaz.
