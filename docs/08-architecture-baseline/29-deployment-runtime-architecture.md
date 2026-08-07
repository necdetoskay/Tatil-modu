# Tatil Modu — Deployment & Runtime Architecture

**Doküman türü:** Dağıtım ve altyapı mimarisi
**Sürüm:** 1.0 Taslak
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Bu doküman Tatil Modu bileşenlerinin geliştirme, tek sunucu, yüksek erişilebilirlik ve air-gap ortamlarda nasıl dağıtılacağını tanımlar.

## 2. Mantıksal Mimari

```text
Client
  ↓
Reverse Proxy / API Gateway
  ↓
API Service
  ↓
Travel Orchestrator
  ↓
Runtime Queue
  ↓
Worker Pools
  ├── Agent SDK
  ├── Prompt Registry Client
  ├── Tool Gateway
  └── Platform Clients

Data Services
  ├── PostgreSQL
  ├── Redis
  ├── Object Storage
  ├── Optional Vector/Graph Store
  └── Telemetry Store
```

## 3. Dağıtılabilir Servisler

- web
- api
- orchestrator
- runtime dispatcher
- worker
- tool gateway
- memory service
- knowledge service
- verification service
- security service
- observability collector
- scheduler

İlk MVP'de bazıları modüler monolith içinde birleşebilir.

## 4. MVP Dağıtım Modeli

Öneri:

- Docker Compose
- tek Linux sunucu
- PostgreSQL
- Redis
- S3 uyumlu object storage
- bir API container
- bir orchestrator/worker container
- local observability stack

## 5. Ölçeklenebilir Model

İleride:

- Kubernetes
- ayrı worker deploymentları
- autoscaling
- managed PostgreSQL
- Redis cluster
- object storage
- OpenTelemetry collector
- ingress gateway
- network policies

## 6. Ağ Bölgeleri

- public ingress zone
- application zone
- worker zone
- data zone
- management zone
- controlled outbound zone

Data servisleri public ağa açılmaz.

## 7. Outbound Erişim

Dış servis erişimi yalnızca Tool Gateway üzerinden yapılır.

- domain allowlist
- proxy
- rate limit
- audit
- egress policy

uygulanır.

## 8. Konfigürasyon

Konfigürasyon kaynakları:

- versioned config registry
- environment variables
- secret vault
- feature flags
- runtime overrides

Secret değerleri config dosyasına yazılmaz.

## 9. Veri Depoları

### PostgreSQL

- users/families
- trips
- policies
- memory versions
- evidence
- workflow state
- audit references

### Redis

- queue
- cache
- locks
- rate limits
- ephemeral state

### Object Storage

- fixture
- export
- report
- snapshot
- media
- offline sync package

## 10. Yedekleme

- PostgreSQL point-in-time recovery
- günlük tam yedek
- object storage versioning
- registry ve prompt yedekleri
- encryption key prosedürü
- restore testleri

## 11. Disaster Recovery

Tanımlanması gerekenler:

- RPO
- RTO
- restore sırası
- failover
- DNS/gateway değişimi
- secret recovery
- audit bütünlüğü
- düzenli DR tatbikatı

## 12. Upgrade

Güvenli upgrade akışı:

```text
backup
  ↓
schema compatibility
  ↓
canary
  ↓
migration
  ↓
health checks
  ↓
traffic shift
  ↓
verification
```

## 13. Rollback

Rollback kapsamları:

- application image
- prompt version
- model alias
- config
- database migration
- tool adapter
- agent version

Geri döndürülemez migration öncesi açık onay gerekir.

## 14. Air-Gap Deployment

Air-gap paketi:

- imzalı container images
- dependency mirror
- offline model
- offline adapters
- local registry
- local vault
- local telemetry
- offline map/POI datasets
- imzalı update bundle

## 15. Güvenlik Kontrolleri

- rootless container
- read-only filesystem
- least privilege
- network segmentation
- image scanning
- signed artifacts
- secret mount
- no public database port
- immutable audit export
- backup encryption

## 16. Environmentlar

- local
- development
- test
- staging
- production
- air-gap production

Her ortam farklı secret ve veri seti kullanır.

## 17. Health ve Readiness

Deployment health:

- API
- orchestrator
- queue
- workers
- database
- Redis
- vault
- tool gateway
- telemetry

kontrollerini içerir.

## 18. Capacity Planning

İzlenecek kapasite boyutları:

- eşzamanlı kullanıcı
- günlük trip request
- agent task per request
- model token
- tool call
- queue depth
- database growth
- telemetry volume
- cache size

## 19. İlk MVP Topolojisi

```text
1 x Reverse Proxy
1 x API/Orchestrator
1–2 x Worker
1 x PostgreSQL
1 x Redis
1 x Object Storage
1 x OTel Collector
```

## 20. Kabul Kriterleri

- MVP tek sunucuda çalışabilmeli.
- Servis sınırları ileride ayrılabilir olmalı.
- Data servisleri public olmamalı.
- Outbound sadece Tool Gateway üzerinden yapılmalı.
- Backup ve restore test edilmelidir.
- Prompt, model, config ve application rollback desteklenmeli.
- Air-gap dağıtım paketi tanımlı olmalı.
- Health/readiness kontrolleri eksiksiz olmalı.
