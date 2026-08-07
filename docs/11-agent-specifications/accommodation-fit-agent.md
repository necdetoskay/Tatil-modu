# Accommodation Fit Agent Specification

**Doküman türü:** canonical agent specification  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Accommodation Fit Agent, Tatil Modu içinde konaklama adaylarının çocuklu aile seyahati açısından uygunluğunu değerlendirmek için tasarlanır.

Bu agent otel aramaz, rezervasyon yapmaz, fiyat garantisi vermez ve canlı provider çağırmaz.

Görevi, başka kaynaklardan veya mock fixture'lardan gelen konaklama adaylarını aile profili, rota yükü, dinlenme ihtiyacı, havuz/kaplıca beklentisi, park/lokasyon kolaylığı ve bütçe uygunluğu açısından sınıflandırmaktır.

```yaml
agent_id: accommodation_fit_agent
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
calls_tools: false
calls_other_agents: false
writes_canonical_memory: false
produces_final_user_response: false
```

## 2. Non-goals

Bu agent şunları yapmaz:

- canlı otel araması yapmaz,
- rezervasyon yapmaz,
- ödeme yönlendirmez,
- fiyatın kesin olduğunu söylemez,
- müsaitlik garantisi vermez,
- yorum sitelerinden veri çekmez,
- aile profili memory'sini güncellemez,
- nihai kullanıcı mesajı yazmaz,
- günlük gezi planı oluşturmaz,
- konaklama dışındaki aktiviteleri puanlamaz.

## 3. Inputs

Beklenen girdiler:

```yaml
inputs:
  normalized_travel_request: travel_request_normalized_v1
  constraint_policy_result: constraint_policy_result_v1
  family_suitability_profile: family_suitability_profile_v1
  route_logistics_result: route_logistics_result_v1
  accommodation_candidates: accommodation_candidate_v1[]
  budget_context: budget_context_v1
  evidence_context: evidence_envelope_v1[]
```

## 4. Outputs

Beklenen çıktı:

```yaml
output: accommodation_fit_result_v1
fields:
  candidate_id: string
  fit_level: excellent | good | acceptable | weak | reject
  family_fit_score_band: high | medium | low
  child_fit_notes: string[]
  rest_fit_notes: string[]
  facility_fit_notes: string[]
  parking_location_notes: string[]
  budget_fit: within_budget | near_limit | over_budget | unknown
  evidence_required: string[]
  warnings: string[]
  rejection_reasons: string[]
  confidence: low | medium | high
```

## 5. Required context

Bu agentın değerlendirme yapabilmesi için en az şu bağlam gerekir:

- çocuk yaşları,
- yetişkin sayısı,
- seyahat süresi,
- hedef bölge,
- bütçe aralığı,
- rota yükü,
- öğle dinlenmesi gereksinimi,
- konaklama adayının lokasyonu,
- konaklama adayının temel tesis bilgileri,
- havuz / kaplıca / spa / aile odası / otopark gibi alanların bilinip bilinmediği.

## 6. Forbidden context

Bu agent'a verilmemesi gereken bağlam:

- gereksiz kişisel aile detayları,
- çocukların isimleri,
- ödeme bilgileri,
- kullanıcı kimlik bilgileri,
- tam adres gibi gereksiz hassas bilgiler,
- provider API anahtarları,
- canlı rezervasyon endpoint bilgileri.

## 7. Dependencies

Bu agentın kavramsal bağımlılıkları:

```yaml
depends_on:
  - trip-intake-agent.md
  - constraint-policy-agent.md
  - family-suitability-agent.md
  - route-logistics-agent.md
  - evidence-envelope-v1
  - accommodation-candidate-v1
```

Bu bağımlılıklar runtime çağrı anlamına gelmez.

Expert agentlar birbirini doğrudan çağırmaz.

## 8. Handoff rules

Accommodation Fit Agent, Travel Orchestrator tarafından çağrılır.

Girdi olarak yalnızca normalize edilmiş context ve konaklama adayları alır.

Çıktısı başka agentlara doğrudan gönderilmez; Travel Orchestrator tarafından toplanır ve sonraki agentlara contract olarak aktarılır.

## 9. Hard constraints

Bu agent şu hard constraint türlerini işaretleyebilir:

```yaml
hard_constraint_flags:
  unsafe_for_toddler: reject
  no_rest_possible_for_family: reject_or_clarify
  location_too_far_from_plan_base: reject_or_warn
  over_budget_without_user_approval: reject_or_clarify
  missing_required_privacy_facility: clarify
  no_evidence_for_claimed_facility: warn_or_clarify
```

Örnek:

- Eğer kullanıcı havuz/kaplıca açıkça istediyse ve adayda bu bilgi yoksa agent bunu kesin varmış gibi kabul edemez.
- Eğer konaklama, günlük rota yükünü çocuklar için aşırı artırıyorsa `location_too_far_from_plan_base` uyarısı üretir.

## 10. Evidence requirements

Bu agentın evidence ihtiyacı yüksektir.

Aşağıdaki iddialar kanıtlanmadan yüksek güvenle sunulamaz:

- fiyat,
- müsaitlik,
- havuz varlığı,
- kaplıca/spa varlığı,
- çocuk havuzu,
- aile odası,
- otopark,
- plaja veya merkeze yakınlık,
- kadınlara özel alan,
- kahvaltı dahil bilgisi,
- iptal şartları.

Evidence yoksa çıktı şu şekilde olmalıdır:

```yaml
confidence: low
evidence_required:
  - accommodation_price_verification
  - facility_verification
  - parking_verification
```

## 11. Confidence rules

```yaml
confidence_rules:
  high:
    condition: "Tesis bilgisi, lokasyon, fiyat bandı ve aile uygunluğu evidence ile desteklenir"
  medium:
    condition: "Tesis aileye uygun görünür ama fiyat veya bazı tesis bilgileri eksiktir"
  low:
    condition: "Temel tesis bilgileri eksiktir veya aile uygunluğu varsayıma dayanır"
```

Bu agent, evidence yokken kesin dil kullanamaz.

## 12. Failure modes

Beklenen failure mode'lar:

```yaml
failure_modes:
  missing_accommodation_candidates:
    action: "clarify_or_wait_for_candidate_generation"
  missing_budget:
    action: "return_budget_unknown_warning"
  missing_facility_data:
    action: "return_evidence_required"
  conflicting_facility_claims:
    action: "return_conflict_warning"
  child_unsuitable_facility:
    action: "return_reject_or_warn"
```

## 13. Clarification triggers

Kullanıcıdan açıklama istenmesi gereken durumlar:

- bütçe belirtilmemişse,
- konaklama istenip istenmediği belirsizse,
- otel mi, apart mı, kaplıca mı, yazlık mı tercih edildiği belirsizse,
- havuz/kaplıca beklentisi açık değilse,
- aynı bütçeyle hem merkezi hem geniş tesis beklentisi çelişiyorsa,
- mahremiyet beklentisinin konaklamaya da uygulanıp uygulanmayacağı belirsizse.

## 14. Fixture requirements

Minimum fixture seti:

```yaml
fixtures:
  - id: TM-ACCOM-001
    scenario: "2 çocuklu aile için havuzlu otel adayı"
  - id: TM-ACCOM-002
    scenario: "Bütçeyi aşan ama aileye çok uygun tesis"
  - id: TM-ACCOM-003
    scenario: "Kaplıca iddiası var ama evidence yok"
  - id: TM-ACCOM-004
    scenario: "Merkeze uzak tesis nedeniyle rota yükü artıyor"
  - id: TM-ACCOM-005
    scenario: "Otopark bilgisi eksik şehir merkezi oteli"
```

## 15. Evaluation rubric

Agent başarılı sayılırsa:

- kesin olmayan fiyatı kesin gibi sunmaz,
- tesis iddiaları için evidence ister,
- çocuklu aile açısından riskleri görünür yapar,
- bütçe aşımını uyarı veya clarification olarak taşır,
- havuz/kaplıca gibi beklentileri ayrı değerlendirir,
- rota yükü ile konaklama lokasyonunu ilişkilendirir,
- memory'ye yazmaz,
- rezervasyon veya satın alma yönlendirmesi yapmaz.

## 16. Example contract sketch

```yaml
accommodation_fit_result_v1:
  candidate_id: "hotel_candidate_001"
  fit_level: good
  family_fit_score_band: high
  child_fit_notes:
    - "2 yaş çocuk için öğle dinlenmesine uygun görünüyor"
    - "6 yaş çocuk için havuz/oyun alanı bilgisi doğrulanmalı"
  rest_fit_notes:
    - "Öğle molası için merkeze yakınlık avantaj olabilir"
  facility_fit_notes:
    - "Havuz bilgisi evidence gerektiriyor"
  parking_location_notes:
    - "Otopark bilgisi eksik"
  budget_fit: near_limit
  evidence_required:
    - facility_verification
    - price_verification
    - parking_verification
  warnings:
    - "Fiyat ve tesis bilgisi doğrulanmadan kesin öneri yapılmamalı"
  rejection_reasons: []
  confidence: medium
```

## 17. Open design questions

- Konaklama adaylarında fiyat bandı kaç kategoriye ayrılmalı?
- Kaplıca/spa beklentisi aile uygunluğunda ayrı bir yüksek ağırlık mı taşımalı?
- Muhafazakâr/mahremiyet hassasiyeti konaklama facility contract'ında nasıl temsil edilmeli?
- Otopark eksikliği hangi şehirlerde hard constraint'e dönüşmeli?
- Çocuk dostu tesis iddiası için minimum evidence seviyesi ne olmalı?

## Current status

```yaml
agent_specification_state: drafted
agent_id: accommodation_fit_agent
next_agent_spec: activity-fit-agent.md
implementation_allowed: false
```
