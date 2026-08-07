# 08 — Memory and Privacy Workplan

> Tatil Modu için aile profili, çocuk yaşları, hassas tercihler, memory disclosure package ve privacy sınırlarının koddan önce tasarlanması gereken iş planı.

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
memory_runtime_allowed: false
persistent_memory_write_allowed: false
canonical_memory_design_required: true
memory_disclosure_design_required: true
privacy_review_required: true
```

Bu doküman memory implementation başlatmaz.

Bu dokümanın amacı, implementation başlamadan önce hangi memory ve privacy artifact'larının tasarlanacağını belirlemektir.

## Temel ilke

```text
Agent'lar canonical memory'ye doğrudan erişmez.
Agent'lar canonical memory'ye doğrudan yazmaz.
Agent'lara yalnızca görevleri için gerekli minimum disclosure package verilir.
```

Tatil Modu için memory, sadece kullanıcıyı hatırlamak için değil; aile güvenliği, çocuk uygunluğu, mahremiyet hassasiyeti, yorgunluk yönetimi ve plan kalitesi için kontrollü kullanılmalıdır.

## Memory tasarım hedefleri

Memory tasarımı şu soruları cevaplamalıdır:

- Hangi aile bilgileri kalıcı tutulabilir?
- Hangi bilgiler sadece oturum içinde kalmalıdır?
- Hangi bilgiler hassas kabul edilir?
- Hangi agent hangi bilgiyi görmelidir?
- Hangi bilgi final cevaba yansıtılabilir?
- Hangi bilgi kullanıcı onayı olmadan kalıcılaştırılamaz?
- Hangi memory update sadece öneri olarak kalmalıdır?
- Hangi memory kullanımının audit kaydı tutulmalıdır?

## Memory sınıfları

İlk tasarım sınıfları:

| Memory class | Açıklama | Kalıcılık | Hassasiyet |
|---|---|---:|---:|
| `family_profile` | Yetişkin/çocuk sayısı, çocuk yaşları | persistent candidate | medium |
| `travel_preferences` | düşük yorgunluk, öğle dinlenmesi, kısa rota tercihi | persistent candidate | low/medium |
| `privacy_preferences` | kadınlar plajı, mahremiyet hassasiyeti | explicit consent required | high |
| `budget_preferences` | bütçe aralığı, fiyat hassasiyeti | persistent candidate | medium |
| `mobility_constraints` | bebek arabası, uzun yürüyüşten kaçınma | persistent candidate | medium |
| `destination_history` | önceki beğenilen/beğenilmeyen destinasyonlar | persistent candidate | low/medium |
| `session_constraints` | o anki tarih, il, bütçe, süre | session only | low/medium |
| `tool_evidence_memory` | geçmiş doğrulanmış kaynak snapshot'ları | bounded cache | medium |
| `safety_notes` | güvenlik/uygunluk uyarıları | policy-controlled | high |

## Persistent ve session ayrımı

Kural:

```text
Her kullanıcı girdisi memory değildir.
Her memory adayı da canonical memory değildir.
```

Ayrım:

| Tür | Ne zaman kullanılır? | Örnek |
|---|---|---|
| `session_input` | Sadece mevcut planlama için | “Bu hafta sonu Bursa” |
| `memory_candidate` | Gelecekte faydalı olabilir ama onay gerekir | “Öğlen otelde dinlenmeyi seviyoruz” |
| `canonical_memory` | Kullanıcı tarafından onaylanmış kalıcı bilgi | “2 çocuk var: 6 ve 2 yaş” |
| `sensitive_memory_candidate` | Hassas tercih; açık onay gerekir | “Kadınlar plajı mutlaka değerlendirilsin” |
| `rejected_memory` | Kalıcılaştırılmaması gereken çıkarım | modelin tahmini veya zayıf çıkarım |

## Memory ownership

Ownership modeli:

```text
User Input
   ↓
Travel Orchestrator
   ↓
Memory Platform
   ↓
Disclosure Package
   ↓
Expert Agent
```

Kural:

- Orchestrator memory ihtiyacını belirler.
- Memory Platform disclosure package üretir.
- Expert Agent yalnız verilen disclosure package ile çalışır.
- Expert Agent canonical memory update yapmaz.
- Agent sadece `memory_update_candidate` döndürebilir.
- Memory Platform ve kullanıcı onayı olmadan kalıcı kayıt yapılmaz.

## Disclosure package tasarım sırası

Koddan önce tasarlanacak package'lar:

1. `family_trip_disclosure_package`
2. `privacy_sensitive_trip_disclosure_package`
3. `budget_sensitive_trip_disclosure_package`
4. `child_suitability_disclosure_package`
5. `route_fatigue_disclosure_package`
6. `final_response_disclosure_package`

## Minimum disclosure package alanları

İlk taslak:

```yaml
package_id: disclosure_family_trip_v1
package_type: family_trip_disclosure_package
purpose: "Çocuklu aile tatili planlama"
allowed_agent_types:
  - trip_intake_agent
  - constraint_policy_agent
  - family_suitability_agent
fields:
  family_profile:
    children_ages: [6, 2]
    adults_count: 2
  travel_preferences:
    fatigue_level: low
    midday_rest_required: true
  privacy_preferences:
    beach_privacy_requirement: women_only_option_required_if_sea
    disclosure_level: sensitive_preference
redactions:
  - exact_home_address
  - unrelated_personal_history
consent_state: required_for_persistent_write
```

## Agent bazlı memory görünürlüğü

| Agent | Görebileceği memory | Görememesi gereken |
|---|---|---|
| Trip Intake Agent | session input, temel aile profili | hassas detaylar gerekmedikçe |
| Constraint & Policy Agent | hard constraints, privacy preference summary | kişisel geçmiş |
| Family Suitability Agent | çocuk yaşları, yorgunluk tercihleri | bütçe dışı hassas bilgiler |
| Destination Candidate Agent | hedef il/bölge, genel tercihler | detaylı aile profili |
| Route & Logistics Agent | çıkış ili, yorgunluk limiti, mola ihtiyacı | mahremiyet tercihi detayı |
| Accommodation Fit Agent | çocuk yaşları, tesis ihtiyaçları, bütçe bandı | unrelated personal data |
| Activity Fit Agent | çocuk yaşları, yorgunluk limiti, ilgi alanları | finansal detaylar |
| Day Plan Composer Agent | özetlenmiş constraints | raw memory |
| Verification & Evidence Agent | kaynak doğrulama ihtiyacı | kişisel aile verisi gerekmedikçe |
| Final Response Composer Agent | user-facing summary | internal memory notes |

## Sensitive preference handling

Kadınlar plajı / mahremiyet gibi tercihler şu şekilde ele alınmalıdır:

```text
Sensitive preference is usable for planning.
Sensitive preference is not automatically stored as permanent memory.
Sensitive preference must be represented carefully in final output.
Sensitive preference requires stronger evidence before recommendation.
```

Örnek:

```yaml
preference_id: privacy_beach_requirement
classification: sensitive_preference
runtime_use: allowed
persistent_write: requires_explicit_user_confirmation
final_output_style: respectful_and_minimal
confidence_requirement: higher_than_normal_beach_recommendation
```

## Memory update candidate modeli

Agent'lar memory yazamaz; ancak öneri dönebilir.

```yaml
memory_update_candidate:
  candidate_id: muc_001
  proposed_by: trip_intake_agent
  memory_class: travel_preferences
  proposed_value:
    midday_rest_required: true
    fatigue_level: low
  evidence:
    source: user_input
    quote_or_summary: "öğle dinlenmesi ve düşük yorgunluk planı istiyor"
  confidence: high
  sensitivity: medium
  requires_user_confirmation: true
```

## Privacy riskleri

Tasarımda ele alınacak riskler:

| Risk | Önlem |
|---|---|
| Agent'a gereğinden fazla aile bilgisi verilmesi | scoped disclosure package |
| Hassas tercihin kalıcılaştırılması | explicit consent gate |
| Final cevapta gereksiz özel detay gösterilmesi | final response privacy filter |
| Tool provider'a gereksiz kişisel bilgi gönderilmesi | tool request redaction |
| Çocuk bilgisiyle üçüncü taraf sorgu yapılması | aggregate/minimal query policy |
| Memory inference'ın gerçek kabul edilmesi | memory candidate + confirmation |

## Tool ve memory ilişkisi

Tool request'leri memory'den gelen kişisel veriyi doğrudan taşımamalıdır.

Kötü örnek:

```text
6 ve 2 yaşındaki çocukları olan Necdet ailesi için kadınlar plajı ara.
```

Daha iyi örnek:

```text
family-friendly women-only beach option near target region
```

Provider'a gönderilen sorgu minimum kişisel bilgi içermelidir.

## Final response privacy rules

Final cevap:

- internal memory package içeriğini göstermemeli,
- çocuk yaşlarını sadece plan gerekçesi için gerekli olduğunda kullanmalı,
- hassas tercihleri saygılı ve minimal ifade etmeli,
- memory update önerisini açık şekilde kullanıcıya bırakmalı,
- kesin olmayan çıkarımları kalıcı tercih gibi sunmamalı.

## Gerekli tasarım artifact'ları

Koddan önce üretilecek artifact'lar:

| Artifact | Önerilen yol |
|---|---|
| Memory class registry | `docs/12-memory/memory-class-registry.md` |
| Memory sensitivity policy | `docs/12-memory/memory-sensitivity-policy.md` |
| Disclosure package standard | `docs/12-memory/disclosure-package-standard.md` |
| Family trip disclosure package | `docs/12-memory/disclosure-packages/family-trip-disclosure-package.md` |
| Privacy sensitive disclosure package | `docs/12-memory/disclosure-packages/privacy-sensitive-trip-disclosure-package.md` |
| Memory update candidate schema | `docs/12-memory/memory-update-candidate-schema.md` |
| Memory consent policy | `docs/12-memory/memory-consent-policy.md` |
| Final response privacy filter | `docs/12-memory/final-response-privacy-filter.md` |
| Tool request redaction policy | `docs/12-memory/tool-request-redaction-policy.md` |

## Tasarım sırası

1. Memory class registry
2. Sensitivity classification
3. Disclosure package standard
4. Agent-by-agent disclosure matrix
5. Memory update candidate schema
6. Consent and audit rules
7. Tool request redaction rules
8. Final response privacy filter
9. Golden fixture privacy checks
10. Pre-code memory freeze checklist

## İlk memory batch'i

İlk tasarım batch'i:

```yaml
first_memory_design_batch:
  - memory-class-registry.md
  - memory-sensitivity-policy.md
  - disclosure-package-standard.md
  - family-trip-disclosure-package.md
  - memory-update-candidate-schema.md
```

## Koddan önce geçiş şartı

Memory tasarımı tamamlanmadan şu işler başlayamaz:

- persistent memory implementation,
- user profile storage,
- memory read/write runtime,
- agent memory injection,
- tool request personalization,
- sensitive preference persistence.

## Sonraki belge

```yaml
next_design_document: 09-ui-ux-flow-workplan.md
```
