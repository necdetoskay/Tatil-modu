# Tatil Modu — Governance Platform Teknik Tasarımı

**Doküman türü:** Yönetişim standardı
**Teknik kod adı:** `governance_platform`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Çok yüksek

## 1. Amaç

Governance Platform; mimari kararların, promptların, modellerin, tool'ların, şemaların ve dokümantasyonun kontrollü yaşam döngüsünü yönetir.

## 2. Bileşenler

- ADR Registry
- Prompt Governance
- Model Governance
- Tool Governance
- Schema Governance
- Documentation Governance
- Change Approval
- Deprecation Management
- Compatibility Management
- Ownership Registry

## 3. ADR Standardı

Her önemli karar:

- bağlam
- karar
- alternatifler
- sonuçlar
- riskler
- geri dönüş planı
- sahip
- tarih

alanlarını taşır.

## 4. Prompt Governance

```text
draft → review → eval → canary → production → deprecated
```

Production prompt değişikliği eval gate olmadan yapılamaz.

## 5. Model Governance

Yeni model değerlendirmeleri:

- kalite
- safety
- maliyet
- latency
- structured output
- tool calling
- context limit
- provider riski
- offline uygunluğu

## 6. Tool Governance

Yeni tool için:

- veri kaynağı
- güvenlik
- lisans
- maliyet
- rate limit
- SLA
- offline/mock desteği
- bakım sahipliği
- veri retention

incelenir.

## 7. Schema Governance

- semantic versioning
- backward compatibility
- migration adapter
- deprecation window
- contract tests
- schema ownership

zorunludur.

## 8. Documentation Governance

Her doküman:

- owner
- reviewer
- version
- status
- last_reviewed
- linked ADR
- superseded_by

metadata'sı taşır.

## 9. Deprecation Yaşam Döngüsü

```text
supported → deprecated → frozen → archived → removed
```

Removal öncesinde uyumluluk ve migration planı gerekir.

## 10. Compatibility Matrix

Takip edilen ilişkiler:

- ACP ↔ Agent SDK
- Schema ↔ Agent versions
- Prompt bundle ↔ Model alias
- Runtime ↔ SDK
- Tool adapter ↔ Capability registry
- Deployment ↔ Storage migrations

## 11. Değişiklik Sınıfları

- low risk
- standard
- high risk
- emergency

High risk değişiklikler insan onayı ve tam regression gerektirir.

## 12. Kabul Kriterleri

- Büyük kararlar ADR ile kayıtlı olmalı.
- Prompt/model/tool değişiklikleri onay sürecinden geçmeli.
- Compatibility matrix güncel tutulmalı.
- Deprecation ve migration politikası bulunmalı.
- Her kanonik dokümanın sahibi tanımlı olmalı.
