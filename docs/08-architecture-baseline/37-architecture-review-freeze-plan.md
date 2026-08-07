# Tatil Modu — Architecture Review & Freeze Planı

**Doküman türü:** Mimari kalite ve dondurma planı
**Teknik kod adı:** `architecture_review_freeze`
**Sürüm:** 1.0
**Durum:** Uygulanmaya hazır

## 1. Amaç

Kanonik dokümantasyonun, şemaların ve registry'lerin uygulama öncesinde tutarlı, eksiksiz, izlenebilir ve birbirleriyle uyumlu olduğunu doğrulamak.

Architecture Freeze, değişikliklerin tamamen yasaklanması değildir. Freeze sonrasında değişiklikler ADR, versioning ve migration süreciyle yapılır.

## 2. Freeze Çıktıları

- Canonical Documentation Baseline
- Architecture Decision Index
- Terminology Glossary
- Dependency Map
- Compatibility Matrix
- Schema Baseline
- Registry Baseline
- Known Gaps & Deferred Scope
- MVP Boundary
- Freeze Report
- Handbook Source Set

## 3. İnceleme Akışları

### A. Terminoloji

Kontrol:

- aynı kavram tek isimle mi kullanılıyor,
- agent/platform/service ayrımı net mi,
- Memory/Knowledge/Context karışıyor mu,
- constraint/preference/policy ayrımı tutarlı mı.

### B. Sorumluluk Sınırları

Her bileşen için:

- ne yapar,
- ne yapmaz,
- girdisi,
- çıktısı,
- bağlı olduğu platformlar,
- doğrudan erişemeyeceği kaynaklar

kontrol edilir.

### C. Veri Sahipliği

Her veri türü için tek canonical owner belirlenir.

Örnek:

- Family Graph → Profile/Memory
- Preference Package → Preference Agent
- Constraint Package → Policy Agent
- External claim → Verification/Knowledge
- Workflow State → Runtime
- Audit → Observability/Security Ledger

### D. Tekrar ve Çelişki

- duplicated rules
- conflicting TTL
- conflicting confidence levels
- inconsistent lifecycle states
- duplicate registry ownership
- farklı hata kodu biçimleri

tespit edilir.

### E. Bağımlılık

- ACP → SDK → Runtime
- Security → Gateway → Tool Adapter
- Prompt Registry → Agent Manifest
- Schema → Contract Tests
- Memory → Data Lifecycle
- Evaluation → Release Gate
- Deployment → DR

doğrulanır.

### F. Uygulama Hazırlığı

Şu işlemlerin dokümante olduğu doğrulanır:

- yeni agent ekleme
- yeni tool ekleme
- yeni model ekleme
- prompt yayınlama
- schema değiştirme
- feature flag açma
- migration yapma
- rollback
- incident yönetme
- backup restore

## 4. İnceleme Seviyeleri

- `pass`
- `pass_with_action`
- `blocked`
- `deferred`

Blocked madde çözülmeden freeze yapılamaz.

## 5. Freeze Kontrol Listesi

### Architecture

- [ ] Agent ve platform listesi tamam
- [ ] Sorumluluk çakışması yok
- [ ] E2E pipeline güncel
- [ ] Human approval noktaları net

### Contracts

- [ ] ACP baseline
- [ ] JSON Schema baseline
- [ ] Common errors standard
- [ ] Evidence model
- [ ] Compatibility matrix

### Security

- [ ] Default deny
- [ ] Disclosure
- [ ] Secret isolation
- [ ] Prompt injection
- [ ] Audit
- [ ] Air-gap security

### Operations

- [ ] SLO
- [ ] Runbooks
- [ ] DR
- [ ] Capacity
- [ ] Deployment
- [ ] Rollback

### Evaluation

- [ ] Golden Bursa fixture
- [ ] Safety suite scope
- [ ] Regression gates
- [ ] Cost/latency budgets
- [ ] Confidence calibration

## 6. Freeze Öncesi Zorunlu Belgeler

- Backup & DR
- Version & Compatibility
- Compatibility Matrix
- Error Code Registry
- ADR Index
- Glossary
- Cross-Reference Map
- Gap Register

## 7. Freeze Baseline Sürümü

Önerilen etiket:

```text
architecture-baseline-v1.0
```

İçerir:

- docs checksum
- schema manifest
- registry manifest
- golden fixture versions
- freeze report
- known gaps

## 8. Freeze Sonrası Değişiklik

Her değişiklik:

```text
change request
  ↓
ADR / impact analysis
  ↓
version classification
  ↓
implementation
  ↓
eval
  ↓
migration/rollback
  ↓
new baseline
```

## 9. Handbook Hazırlık Kuralı

AI Agent Architecture Handbook yalnızca:

- freeze raporu onaylandıktan,
- terminology glossary tamamlandıktan,
- cross-reference map üretildikten,
- çelişkiler kapatıldıktan

sonra hazırlanır.

## 10. Kabul Kriterleri

- Blocked review maddesi kalmamalı.
- Canonical owner'lar belirlenmeli.
- Dependency ve compatibility haritaları tamamlanmalı.
- Freeze baseline checksum ile sabitlenmeli.
- Bilinen eksikler açıkça deferred olarak kayıtlı olmalı.
- Handbook source set onaylanmalı.
