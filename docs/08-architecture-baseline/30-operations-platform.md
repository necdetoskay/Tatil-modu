# Tatil Modu — Operations Platform Teknik Tasarımı

**Doküman türü:** Platform teknik tasarımı
**Teknik kod adı:** `operations_platform`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Çok yüksek

## 1. Amaç

Operations Platform, Tatil Modu'nun canlı ortamda güvenli, ölçülebilir ve geri alınabilir biçimde işletilmesini sağlar.

## 2. Bileşenler

- Health Management
- Maintenance Mode
- Incident Management
- Runbook Registry
- Release Operations
- Canary Controller
- Rollback Manager
- Runtime Diagnostics
- Backup/Restore Operations
- Secret Rotation Operations
- Queue Recovery
- Capacity Alerts

## 3. Health Management

Kontrol edilen bileşenler:

- API
- Orchestrator
- Worker
- Queue
- PostgreSQL
- Redis
- Object Storage
- Vault
- Tool Gateway
- Model Gateway
- Observability Collector

## 4. Maintenance Modları

- `normal`
- `read_only`
- `planning_disabled`
- `transactions_disabled`
- `admin_only`
- `evaluation_paused`
- `full_maintenance`

## 5. Incident Yaşam Döngüsü

```text
detect → classify → assign → mitigate → recover → verify → postmortem
```

Önem seviyeleri:

- SEV-1: güvenlik, veri kaybı, tüm sistem kesintisi
- SEV-2: kritik planlama servisi bozuk
- SEV-3: kısmi özellik kaybı
- SEV-4: düşük etkili operasyonel sorun

## 6. Runbooklar

Zorunlu runbooklar:

- servis restart
- queue recovery
- DLQ replay
- database restore
- cache flush
- secret rotation
- model alias switch
- prompt rollback
- tool provider outage
- air-gap update import
- telemetry backlog recovery

## 7. Canary Release

Canary aşamaları:

```text
internal → %5 → %20 → %50 → %100
```

Her aşamada:

- kalite
- hata
- latency
- maliyet
- safety
- confidence calibration

kontrol edilir.

## 8. Rollback

Rollback hedefleri:

- application image
- agent version
- prompt bundle
- model alias
- tool adapter
- config
- feature flag
- database migration

## 9. Runtime Diagnostics

Tanılama çıktıları:

- queue depth
- worker saturation
- provider health
- circuit state
- stale data rate
- error distribution
- cost spike
- latency critical path
- failed task samples

## 10. Operasyon Metrikleri

- availability
- MTTR
- incident count
- rollback count
- deployment success
- queue age
- worker utilization
- backup success
- restore test success
- secret rotation success

## 11. Hata Kodları

- `OPS_MAINTENANCE_ACTIVE`
- `OPS_INCIDENT_DECLARED`
- `OPS_RUNBOOK_FAILED`
- `OPS_ROLLBACK_FAILED`
- `OPS_BACKUP_FAILED`
- `OPS_RESTORE_FAILED`
- `OPS_CANARY_BLOCKED`
- `OPS_DIAGNOSTIC_UNAVAILABLE`

## 12. Kabul Kriterleri

- Kritik servisler health modeline dahil olmalı.
- Her SEV-1/2 olay için runbook bulunmalı.
- Canary ve rollback desteklenmeli.
- Bakım modları merkezi yönetilmeli.
- Backup ve restore düzenli test edilmeli.
- Incident sonrası postmortem zorunlu olmalı.
