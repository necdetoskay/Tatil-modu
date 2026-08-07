# Tatil Modu — Backup & Disaster Recovery Platform

**Doküman türü:** Platform ve operasyon standardı
**Teknik kod adı:** `backup_disaster_recovery_platform`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Çok yüksek
**Durum:** Architecture Freeze öncesi kanonik taslak

## 1. Amaç

Backup & Disaster Recovery Platform, veri kaybı, servis bozulması, hatalı deployment, güvenlik olayı ve altyapı arızası sonrasında Tatil Modu'nun kontrollü biçimde geri döndürülmesini sağlar.

## 2. Korunan Varlıklar

- PostgreSQL
- Redis kalıcı state ve queue metadata
- Object Storage
- Prompt Registry
- Schema Library
- Agent Capability Registry
- Tool Capability Registry
- Policy ve Configuration Registry
- Feature Flags
- Audit Ledger
- Workflow State
- Secrets metadata ve recovery prosedürleri
- Container image ve deployment manifestleri
- Offline/Air-Gap senkronizasyon paketleri

## 3. Recovery Kavramları

### RPO

Kabul edilebilir veri kaybı süresi.

### RTO

Sistemin kabul edilebilir geri dönüş süresi.

### Recovery Priority

Bileşenlerin geri getirilme sırası.

### Recovery Scope

Tek servis, tek veri deposu, bölgesel ortam veya tüm sistem.

## 4. Önerilen Başlangıç Hedefleri

| Varlık | RPO | RTO |
|---|---:|---:|
| PostgreSQL canonical data | 15 dk | 2 saat |
| Audit ledger | 0–15 dk | 2 saat |
| Prompt/Schema/Registry | son onaylı sürüm | 1 saat |
| Object Storage | 24 saat | 4 saat |
| Redis cache | yeniden üretilebilir | 30 dk |
| Workflow state | 15 dk | 1 saat |
| Telemetry | 24 saat | 8 saat |

Bu hedefler üretim yükü ve maliyetle kalibre edilmelidir.

## 5. Backup Stratejisi

### PostgreSQL

- günlük full backup
- WAL arşivleme
- point-in-time recovery
- şifreli off-host kopya
- düzenli restore testi

### Redis

- queue/workflow state için AOF veya uygun kalıcılık
- cache verisi için yeniden üretim
- kritik runtime metadata için ayrı yedek politikası

### Object Storage

- versioning
- lifecycle
- replication veya offline copy
- checksum

### Registries ve Dokümantasyon

- Git tabanlı sürümleme
- imzalı release paketi
- checksum manifest
- son production snapshot

## 6. Restore Sırası

```text
Infrastructure
  ↓
Network & DNS
  ↓
Secret Vault
  ↓
PostgreSQL
  ↓
Object Storage
  ↓
Registries & Schemas
  ↓
Runtime State
  ↓
Security & Tool Gateway
  ↓
Workers
  ↓
Observability
  ↓
Traffic
```

## 7. Felaket Senaryoları

- disk kaybı
- PostgreSQL corruption
- yanlış migration
- yanlış prompt/config promotion
- Redis kaybı
- object storage kaybı
- worker cluster kaybı
- secret/API key sızıntısı
- provider kesintisi
- audit bütünlüğü bozulması
- ransomware/supply-chain olayı
- air-gap ortam bozulması

## 8. Recovery Runbook İçeriği

Her runbook:

- tetikleyici
- olay sınıfı
- etki
- sorumlu rol
- gerekli erişimler
- adım adım restore
- verification
- rollback
- kullanıcı iletişimi
- audit kapanışı

alanlarını taşır.

## 9. Hatalı Deployment Kurtarma

```text
incident detect
  ↓
traffic freeze
  ↓
last known good image
  ↓
prompt/config rollback
  ↓
schema compatibility check
  ↓
health verification
  ↓
traffic restore
```

## 10. Migration Güvenliği

- expand/contract migration
- backward-compatible release
- dry-run
- backup checkpoint
- migration checksum
- irreversible migration approval
- rollback veya forward-fix planı

## 11. Secret Compromise

- anahtarı iptal et
- bağımlı servisleri belirle
- rotation yap
- log ve prompt sızıntısı kontrol et
- tool erişimlerini geçici durdur
- audit ve incident review
- yeni secret ile kontrollü açılış

## 12. Air-Gap Recovery

Air-gap recovery paketi:

- imzalı image bundle
- local database backup
- registry snapshot
- offline model artifacts
- secret recovery kit
- checksum manifest
- restore runbook
- malware scan prosedürü

## 13. Restore Verification

Restore sonrası:

- veri bütünlüğü
- referential integrity
- registry checksum
- schema compatibility
- audit continuity
- ACP contract
- health/readiness
- golden scenario smoke test
- security smoke test

kontrol edilir.

## 14. DR Tatbikatı

- üç ayda bir component restore
- altı ayda bir full environment restore
- yılda en az bir felaket senaryosu
- air-gap için offline restore denemesi

## 15. Hata Kodları

- `DR_BACKUP_FAILED`
- `DR_BACKUP_STALE`
- `DR_RESTORE_FAILED`
- `DR_INTEGRITY_CHECK_FAILED`
- `DR_RPO_BREACHED`
- `DR_RTO_BREACHED`
- `DR_SECRET_RECOVERY_FAILED`
- `DR_REGISTRY_MISMATCH`
- `DR_AUDIT_CONTINUITY_FAILED`

## 16. Kabul Kriterleri

- Kritik varlıkların RPO/RTO hedefleri tanımlı olmalı.
- Restore sırası ve runbooklar bulunmalı.
- Backup tek başına başarı sayılmamalı; restore test edilmeli.
- Prompt/config/schema rollback desteklenmeli.
- Irreversible migration açık onay gerektirmeli.
- Air-gap restore prosedürü bulunmalı.
- Restore sonrası golden scenario smoke testi çalıştırılmalı.
