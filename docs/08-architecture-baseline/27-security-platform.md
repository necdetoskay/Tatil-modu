# Tatil Modu — Security Platform Teknik Tasarımı

**Doküman türü:** Platform teknik tasarımı
**Teknik kod adı:** `security_platform`
**Sürüm:** 1.0 Taslak
**Mimari katman:** Kimlik, yetki, veri ve işlem güvenliği
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Security Platform, Tatil Modu içindeki kullanıcı, agent, platform, tool ve dış kaynak etkileşimlerini Zero Trust ve en az ayrıcalık ilkelerine göre korur.

Temel soru:

> Bu actor, bu görev bağlamında, bu veriye veya işleme erişmeye gerçekten yetkili mi?

## 2. Temel İlkeler

- Varsayılan erişim reddedilir.
- Yetki görev, amaç ve süreyle sınırlandırılır.
- Agentlar kalıcı geniş yetki taşımaz.
- Veriler sınıflandırılır ve minimum disclosure uygulanır.
- Tool çağrıları gateway üzerinden geçer.
- Dış içerik güvenilmeyen veri kabul edilir.
- Kritik işlemler insan onayı olmadan tamamlanmaz.
- Audit kayıtları değiştirilemez.
- Secret bilgileri prompt, log ve agent context içine girmez.

## 3. Platform Bileşenleri

- Identity Registry
- Authentication Service
- Authorization Engine
- Policy Enforcement Point
- Data Classification Service
- Disclosure & Redaction Service
- Tool Permission Gateway
- Prompt Security Gateway
- Secret Vault
- Human Approval Gate
- Transaction Guard
- Audit Security Ledger
- Threat Detection
- Supply Chain Security
- Air-Gap Security Controller

## 4. Zero Trust Agent Modeli

Her görev için şu bilgiler doğrulanır:

```json
{
  "actor": "route_planner_agent",
  "actor_version": "1.0.0",
  "purpose": "route_planning",
  "task_id": "tsk_001",
  "data_scopes": [
    "trip.mobility",
    "trip.rest_windows"
  ],
  "tool_scopes": [
    "maps.route.read",
    "traffic.read"
  ],
  "expires_at": "2026-08-06T19:00:00Z"
}
```

## 5. Agent Identity

Her agent:

- benzersiz `agent_id`,
- sürüm,
- manifest checksum,
- readiness level,
- çalışma ortamı,
- izin profili

taşır.

Agent kimliği capability registry ile doğrulanır.

## 6. Authentication

Desteklenen actor türleri:

- user
- service
- agent
- platform
- worker
- administrator
- approval reviewer

Servisler arası kimlik doğrulama kısa ömürlü token veya karşılıklı TLS ile sağlanabilir.

## 7. Authorization

Ana model ABAC'tir.

Karar sinyalleri:

- actor
- action
- resource
- purpose
- trip_id
- task_id
- data classification
- environment
- time
- risk level

RBAC yalnızca üst seviye yönetim rollerinde yardımcı olabilir.

## 8. Veri Sınıflandırması

- `public`
- `internal`
- `sensitive`
- `restricted`

Örnek:

| Veri | Sınıf |
|---|---|
| POI adı | public |
| Sistem konfigürasyonu | internal |
| Kullanıcı tercihi | sensitive |
| Çocuk ve sağlık/erişilebilirlik bilgisi | restricted |

## 9. Disclosure ve Redaction

Agentlara tam veri nesnesi yerine amaca özel paket verilir.

Örnek Route Planner paketi:

```json
{
  "vehicle_mode": "private_car",
  "children_ages": [2, 6],
  "walking_tolerance": "low_to_medium",
  "stroller_required": true,
  "midday_rest_required": true
}
```

İsim, geçmiş konuşmalar ve gereksiz hassas alanlar paylaşılmaz.

## 10. Tool Permission Gateway

Her tool çağrısında:

- actor scope,
- operation scope,
- domain allowlist,
- request schema,
- rate limit,
- timeout,
- data sensitivity,
- audit context

kontrol edilir.

## 11. Prompt Security

Prompt güvenlik kuralları:

- dış içerik `untrusted_data` olarak etiketlenir,
- system instruction ile birleştirilmez,
- prompt injection sinyalleri quarantine edilir,
- tool yetkisi prompt metninden alınmaz,
- raw secrets prompta eklenmez,
- structured output zorunlu tutulur.

## 12. Secret Vault

Secret yönetimi:

- merkezi vault,
- environment isolation,
- rotation,
- versioning,
- access audit,
- runtime injection,
- log redaction

desteklemelidir.

Agent yalnızca tool capability kullanır; secret değerini göremez.

## 13. Human Approval Gate

Açık onay gerektiren işlemler:

- ödeme
- rezervasyon
- iptal
- geri ödemesiz işlem
- hassas veri dışa aktarımı
- kritik policy değişikliği
- kalıcı memory değişikliği
- destinasyon veya geceleme sayısı değişimi

## 14. Transaction Guard

İşlemsel eylemler:

```text
proposal
  ↓
policy check
  ↓
risk assessment
  ↓
human approval
  ↓
idempotency check
  ↓
execution
  ↓
receipt & audit
```

## 15. Audit Security Ledger

Kaydedilen kritik olaylar:

- yetki kararı
- policy değişikliği
- memory commit
- prompt promotion
- tool scope değişikliği
- secret rotation
- human approval
- transaction
- güvenlik olayı
- rollback

Audit kayıtları append-only olmalıdır.

## 16. Threat Detection

Tespit edilen olay türleri:

- prompt injection
- privilege escalation
- tool scope abuse
- unusual data access
- secret leakage
- repeated denied access
- malicious source content
- stale critical data use
- forged official source
- audit tampering

## 17. Supply Chain Security

- dependency pinning
- SBOM
- signed build artifacts
- image scanning
- provenance
- vulnerability scanning
- dependency update policy
- registry allowlist
- reproducible builds

## 18. Air-Gap Security

Air-gap ortamında:

- outbound erişim kapalı,
- sadece offline adapter,
- imzalı güncelleme paketi,
- local vault,
- local audit,
- kontrollü import/export,
- zararlı içerik taraması,
- veri sızıntısı önleme

uygulanır.

## 19. Güvenlik Olayı Yaşam Döngüsü

```text
detect
  ↓
classify
  ↓
contain
  ↓
investigate
  ↓
remediate
  ↓
verify
  ↓
close
```

## 20. Hata Kodları

- `SEC_AUTHENTICATION_FAILED`
- `SEC_AUTHORIZATION_DENIED`
- `SEC_SCOPE_EXPIRED`
- `SEC_DATA_CLASSIFICATION_VIOLATION`
- `SEC_DISCLOSURE_VIOLATION`
- `SEC_PROMPT_INJECTION_DETECTED`
- `SEC_SECRET_ACCESS_DENIED`
- `SEC_HUMAN_APPROVAL_REQUIRED`
- `SEC_TRANSACTION_BLOCKED`
- `SEC_AUDIT_WRITE_FAILED`
- `SEC_SUPPLY_CHAIN_RISK`

## 21. Testler

- yetkisiz memory okuma
- tool scope yükseltme
- prompt injection
- secret log sızıntısı
- restricted veri disclosure
- sahte resmî kaynak
- süresi dolmuş token
- audit değiştirme
- human approval bypass
- air-gap outbound denemesi

## 22. Kabul Kriterleri

- Varsayılan erişim reddedilmeli.
- Her görev kısa ömürlü scope taşımalı.
- Agent tüm profil verisini görememeli.
- Tool çağrıları gateway üzerinden geçmeli.
- Secret agent contextine girmemeli.
- Prompt injection karantinaya alınmalı.
- Kritik işlemler approval gate'ten geçmeli.
- Audit kayıtları immutable olmalı.
- Air-gap güvenlik modu desteklenmeli.
