# Tatil Modu — Observability Platform Teknik Tasarımı

**Doküman türü:** Platform teknik tasarımı
**Teknik kod adı:** `observability_platform`
**Sürüm:** 1.0 Taslak
**Mimari katman:** İzleme, denetim ve operasyon
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Observability Platform, Tatil Modu'nun agent, platform, model, tool ve pipeline davranışını uçtan uca görünür hale getirir.

Temel soru:

> Sistem ne yaptı, neden yaptı, ne kadar sürdü, ne kadara mal oldu ve nerede hata verdi?

## 2. Temel Bileşenler

- Distributed Tracing
- Metrics
- Structured Logging
- Audit Events
- Cost Telemetry
- Model Telemetry
- Tool Telemetry
- Confidence Monitoring
- Data Freshness Monitoring
- Alerting
- Dashboards
- SLO Management

## 3. Telemetry Kimlikleri

- request_id
- trace_id
- span_id
- parent_span_id
- trip_id
- task_id
- agent_run_id
- tool_call_id
- model_call_id
- decision_id
- evaluation_run_id

## 4. Trace Modeli

Örnek trace:

```text
user request
└── travel orchestrator
    ├── profile agent
    ├── policy agent
    ├── hotel agent
    │   ├── prompt load
    │   ├── hotel tool
    │   └── verification
    ├── route planner
    └── optimization platform
```

## 5. Span Standardı

Her span şu alanları taşır:

```json
{
  "trace_id": "trc_001",
  "span_id": "span_001",
  "parent_span_id": null,
  "name": "agent.route_planner.execute",
  "start_time": "2026-08-06T18:00:00Z",
  "end_time": "2026-08-06T18:00:04Z",
  "status": "ok",
  "attributes": {
    "agent.version": "1.0.0",
    "trip.id": "trip_001",
    "attempt": 1,
    "cache.hit": false
  }
}
```

## 6. Structured Logging

Loglar serbest metin yerine yapılandırılmış olmalıdır.

```json
{
  "level": "warn",
  "event": "verification_conflict",
  "trace_id": "trc_001",
  "task_id": "tsk_003",
  "entity_id": "hotel_001",
  "claim_key": "women_only_pool",
  "message": "Kaynaklar çelişiyor."
}
```

## 7. Log Seviyeleri

- `debug`
- `info`
- `warn`
- `error`
- `critical`
- `audit`

Production'da hassas içerik debug loga yazılmaz.

## 8. Temel Metrikler

### Agent Metrikleri

- success rate
- partial rate
- failure rate
- retry count
- timeout count
- p50/p95/p99 latency
- average confidence
- evidence coverage
- output schema failure rate

### Tool Metrikleri

- provider success rate
- cache hit
- rate limit
- circuit breaker state
- freshness
- cost
- response validation failure

### Pipeline Metrikleri

- total duration
- total cost
- agent count
- parallelism
- critical path duration
- verification coverage
- partial completion rate

## 9. Cost Telemetry

İzlenecek alanlar:

- model alias
- provider
- token
- unit price
- tool cost
- cache savings
- scenario cost
- user request cost
- trip lifecycle cost

## 10. Confidence Monitoring

Amaç:

- yüksek confidence / düşük doğruluk
- düşük confidence / yüksek doğruluk
- agent calibration drift
- source confidence drift

tespit etmektir.

## 11. Data Freshness Monitoring

Her veri türü için:

- current age
- allowed TTL
- stale rate
- last verified
- refresh failure

izlenir.

## 12. Decision Observability

Her önemli karar:

- selected option
- rejected options
- objective scores
- hard constraints
- evidence
- confidence
- trade-offs

ile kayıt altına alınır.

## 13. Audit Log

Audit eventler:

- policy change
- memory commit
- prompt promotion
- tool permission change
- reservation approval
- manual override
- rollback
- deletion request

Audit kayıtları değiştirilemez olmalıdır.

## 14. SLO Örnekleri

### Planning SLO

- p95 pipeline latency < 60 sn
- critical agent success > %99
- hard constraint violation = 0
- evidence coverage > %85
- verification coverage > %80

### Live Replan SLO

- p95 replan latency < 10 sn
- stale context rate < %2
- failed replan < %1

## 15. Alerting

Kritik alarm örnekleri:

- hard constraint violation
- prompt injection success
- memory permission breach
- cost spike
- provider outage
- stale official data
- verification failure surge
- latency SLO breach
- confidence calibration drift

## 16. Dashboardlar

### Executive Dashboard
- toplam başarı
- maliyet
- kullanıcı memnuniyeti
- release health

### Agent Dashboard
- agent bazlı scorecard
- latency
- cost
- failures
- confidence

### Tool Dashboard
- provider sağlık
- quota
- cache
- error rate

### Safety Dashboard
- injection
- permission violations
- sensitive data events

## 17. Sampling

Bütün audit ve hata eventleri %100 tutulur.

Yüksek hacimli debug trace'lerde sampling uygulanabilir.

Sampling kuralları:

- error traces: %100
- critical trips: %100
- normal success: ayarlanabilir
- canary release: yüksek oran

## 18. PII ve Hassas Veri

- isim yerine person_id
- adres minimizasyonu
- hassas alan masking
- secret redaction
- prompt/body retention sınırı
- erişim logu
- veri silme politikası

## 19. OpenTelemetry Uyumu

Önerilen temel:

- traces: OpenTelemetry
- metrics: OpenTelemetry Metrics
- logs: structured JSON + collector
- exporter: ortama göre değişebilir

Vendor lock-in önlenmelidir.

## 20. Air-Gap Modu

Air-gap ortamda:

- local collector
- local metrics store
- local dashboard
- file/batch export
- signed telemetry export
- dış SaaS bağımlılığı olmadan çalışma

desteklenir.

## 21. Retention

Örnek başlangıç politikası:

- audit: uzun süreli
- security events: uzun süreli
- detailed traces: 7–30 gün
- aggregated metrics: 12+ ay
- raw prompt/tool content: minimum süre
- PII: en kısa gerekli süre

## 22. Hata Modeli

- `OBS_TRACE_EXPORT_FAILED`
- `OBS_METRIC_WRITE_FAILED`
- `OBS_LOG_SCHEMA_INVALID`
- `OBS_AUDIT_WRITE_FAILED`
- `OBS_COST_ATTRIBUTION_FAILED`
- `OBS_PII_REDACTION_FAILED`
- `OBS_SLO_BREACH`
- `OBS_TELEMETRY_BACKPRESSURE`

## 23. Testler

- trace propagation
- parent/child spans
- retry spanları
- cost attribution
- PII redaction
- audit immutability
- offline collector
- backpressure
- alert rule
- SLO calculation

## 24. Kabul Kriterleri

- Her request uçtan uca trace edilebilmeli.
- Agent, tool ve model çağrıları ayrı span taşımalı.
- Cost attribution request ve trip seviyesinde yapılabilmeli.
- Audit kayıtları immutable olmalı.
- PII redaction zorunlu olmalı.
- SLO ve alert kuralları tanımlı olmalı.
- Air-gap ortamda local gözlemlenebilirlik çalışmalı.
- Vendor-neutral telemetry standardı kullanılmalı.
