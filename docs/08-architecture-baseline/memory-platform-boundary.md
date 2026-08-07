# Tatil Modu — Memory Platform Boundary

**Doküman türü:** Architecture boundary  
**Teknik kod adı:** `memory_platform_boundary`  
**Sürüm:** 1.0 Taslak  
**Architecture Review:** ARF-015  
**component_type:** `platform`  
**canonical_status:** `canonical_baseline`  
**owner:** Memory Platform / Data Governance  
**depends_on:** Architecture Terminology Registry, Architecture Dependency Index, Universal Evidence Model, Family Graph Schema  
**related_artifacts:** Family Graph Schema, User Preference Schema, Consent & Retention Policy

## Amaç

Bu doküman, Tatil Modu içindeki Memory Platform adlandırmasını ve ownership sınırını netleştirir.

ARF-015 kararı: Memory; agent, planner veya Travel Knowledge Store içinde dağınık tutulmaz. Memory Platform, kullanıcıya ve aileye ilişkin kalıcı, izinli, açıklanabilir ve yaşam döngüsü yönetilen bilgilerin canonical sınırıdır.

## Memory Platform nedir?

Memory Platform, kullanıcı ve aile bağlamını yöneten ortak platformdur.

Sahip olduğu alanlar:

- aile profili,
- kişi profili,
- çocuk yaşları ve hassasiyetleri,
- kalıcı seyahat tercihleri,
- erişilebilirlik ve özel ihtiyaç bilgileri,
- konservatif/mahremiyet tercihleri,
- tekrar eden bütçe ve konfor tercihleri,
- kullanıcı tarafından onaylanmış kalıcı notlar,
- consent, retention ve deletion lifecycle,
- memory provenance ve audit kayıtları.

## Memory Platform ne değildir?

Memory Platform şu sorumlulukları üstlenmez:

- destinasyon, POI, otel, restoran veya rota bilgisinin canonical kaynağı değildir,
- Travel Knowledge Store yerine kullanılmaz,
- anlık tool çıktısı veya doğrulanmamış web datası saklama alanı değildir,
- agent çalışma belleği değildir,
- Planner karar geçmişinin tamamını sahiplenmez,
- kullanıcı adına yeni tercih uydurmaz,
- hassas bilgiyi açık rıza ve amaç olmadan kalıcılaştırmaz.

## Katman ayrımı

| Bileşen | Memory ile ilişkisi |
|---|---|
| Trip Profile Agent | Kullanıcı isteğini ve bu yolculuğa ait geçici profili çıkarır; canonical memory yazmaz. |
| Preference Agent | Soft preference sinyallerini yorumlar; kalıcı yazım için Memory Platform'a aday öneri üretir. |
| Policy Agent | Hard constraint ve yasak/uygunluk kararlarını uygular; memory ownership almaz. |
| Travel Knowledge Store | Destinasyon/POI/otel/aktivite bilgisini tutar; kullanıcı hafızası değildir. |
| Travel Intelligence Modules | Memory'den gelen izinli bağlamı değerlendirme girdisi olarak kullanır; memory yazmaz. |
| Planner / Orchestrator | Memory'den disclosure package alır; doğrudan canonical memory mutate etmez. |

## Yazma kuralı

Hiçbir expert agent canonical memory'ye doğrudan yazmaz.

Kalıcı memory değişiklikleri şu akışla yapılır:

```text
Agent / Planner observation
        ↓
Memory write candidate
        ↓
Consent / policy / purpose check
        ↓
Memory Platform validation
        ↓
Canonical memory mutation
        ↓
Audit and lifecycle record
```

## Okuma kuralı

Agentlar tüm memory'yi görmez. Memory Platform, Disclosure Service üzerinden amaca uygun en küçük bağlam paketini üretir.

Disclosure package şunları içermelidir:

- purpose,
- allowed fields,
- redacted fields,
- expiry / validity window,
- provenance reference,
- consent basis,
- requesting component.

## Privacy ve lifecycle

Memory kayıtları şu metadata'yı taşımalıdır:

- `memory_id`,
- `subject_type`,
- `subject_ref`,
- `memory_type`,
- `value`,
- `source`,
- `consent_basis`,
- `purpose`,
- `created_at`,
- `updated_at`,
- `expires_at`,
- `retention_policy`,
- `deletion_state`,
- `audit_ref`.

## Repo completeness kararı

ARF-015 kapsamında Memory Platform için minimum canonical boundary dosyası oluşturulmuştur. Freeze öncesinde Family Graph Schema, User Preference Schema ve Consent & Retention Policy artifact'ları ayrıca schema/registry olarak tamamlanmalıdır.

Bu dosya Memory Platform için canonical naming ve ownership sınırını belirler; runtime implementasyon tamamlandığı anlamına gelmez.
