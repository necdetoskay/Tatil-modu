# Destination Candidate Agent Specification

**Doküman türü:** canonical agent specification  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Destination Candidate Agent, normalize edilmiş seyahat isteği ve kısıt kararlarını kullanarak Tatil Modu için aday bölge/destinasyon havuzunu tasarlar.

Bu agent'ın görevi plan üretmek değildir.

Bu agent'ın görevi şudur:

```text
Hedef il, çıkış noktası, mesafe/radius, aile profili ve özel tercihleri dikkate alarak değerlendirilebilir destinasyon adaylarını sınıflandırmak.
```

## 2. Non-goals

Bu agent şunları yapmaz:

- günlük gezi planı üretmez,
- otel önermez,
- aktivite listesi üretmez,
- rota süresi hesaplamaz,
- trafik verisi çekmez,
- canlı provider çağırmaz,
- final kullanıcı cevabı yazmaz,
- hard constraint kararı vermez,
- aile uygunluğu puanı üretmez,
- canonical memory yazmaz.

## 3. Inputs

Beklenen inputlar:

```yaml
input_sources:
  - normalized_travel_request
  - constraint_policy_result
  - family_context_summary
  - destination_scope_rules
```

Örnek input alanları:

```yaml
origin:
  city: Kocaeli
  country: Türkiye

target:
  city_or_region: Balıkesir
  mode: user_requested

radius_rules:
  default_radius_km: 150
  allow_out_of_radius: conditional
  out_of_radius_reason_required: true

family:
  adults: 2
  children:
    - age: 6
    - age: 2

special_preferences:
  - women_only_beach_required_when_sea_recommended
  - low_fatigue
  - midday_rest_required
```

## 4. Outputs

Bu agent aşağıdaki yapıda aday destinasyon seti üretir:

```yaml
destination_candidate_result:
  candidate_groups:
    - group_id: primary_target_area
      description: "Kullanıcının doğrudan hedeflediği il/bölge"
      candidates: []
    - group_id: near_radius_area
      description: "Hedef çevresinde makul mesafe içindeki adaylar"
      candidates: []
    - group_id: exceptional_out_of_radius_area
      description: "Radius dışı ama çok güçlü gerekçe varsa değerlendirilecek adaylar"
      candidates: []
  excluded_regions: []
  open_questions: []
  confidence: medium
```

Her aday en az şu alanları taşımalıdır:

```yaml
destination_candidate:
  candidate_id: string
  name: string
  type: city | district | resort_area | nature_area | thermal_area | beach_area | mixed
  relation_to_target: primary | nearby | extended_radius | exceptional
  estimated_distance_bucket: unknown | under_50_km | 50_100_km | 100_150_km | over_150_km
  family_relevance_hypothesis: string
  likely_trip_role: base_stay | day_trip | half_day_stop | backup_option
  constraint_notes: []
  evidence_required_later: []
  exclusion_risk: low | medium | high
```

## 5. Required context

Bu agent'a verilebilecek context:

- çıkış şehri,
- hedef il/bölge,
- süre,
- aile profili özeti,
- çocuk yaşları,
- hard/soft constraint sınıflandırması,
- kullanıcının radius kuralı,
- "uzaktaki öneriler gerçekten çok iyi olmalı" gibi kullanıcı yönergeleri,
- mevsimsel/tarihsel bağlam sadece intake tarafından normalize edilmişse.

## 6. Forbidden context

Bu agent'a verilmemesi gereken context:

- provider API key,
- canlı harita/rota cevabı,
- otel fiyatı,
- kullanıcı özel kimlik bilgileri,
- geçmiş konuşma ham metni,
- canonical memory'nin tamamı,
- ödeme/rezervasyon bilgisi.

## 7. Dependencies

Bu agent şunlara bağımlıdır:

```yaml
depends_on:
  - trip-intake-agent
  - constraint-policy-agent
  - memory-disclosure-package
```

Bu agent şunlara bağımlı değildir:

```yaml
does_not_depend_on:
  - route-logistics-agent
  - accommodation-fit-agent
  - activity-fit-agent
  - live_maps_provider
  - live_booking_provider
```

## 8. Handoff rules

Bu agent'ın çıktısı şu agentlara/bileşenlere aktarılabilir:

```yaml
handoff_targets:
  - route-logistics-agent
  - accommodation-fit-agent
  - activity-fit-agent
  - verification-evidence-agent
```

Handoff kuralları:

- Candidate listesi kesin öneri değildir.
- Candidate listesi yalnızca değerlendirilecek alan havuzudur.
- Distance bucket yaklaşık/varsayımsal ise açıkça `unknown` veya bucket seviyesiyle işaretlenir.
- 150 km dışı adaylar mutlaka gerekçe taşır.
- Kadınlar plajı şartı olan deniz adayları daha sonraki verification/evidence aşamasına işaretlenir.

## 9. Hard constraints

Bu agent hard constraint uygulamaz; hard constraint adaylarını görünür taşır.

Örnek:

```yaml
constraint_notes:
  - constraint_id: women_only_beach_required_when_sea_recommended
    relevance: applies_if_candidate_is_beach_or_sea_trip
    action_required_later: verify_privacy_suitability
```

Bu agent şu kararı vermez:

```text
Bu destinasyon kesin uygundur.
```

Bunun yerine şöyle der:

```text
Bu destinasyon değerlendirmeye alınabilir; şu constraint'ler sonraki agentlarda doğrulanmalıdır.
```

## 10. Evidence requirements

Bu agent canlı evidence üretmez.

Fakat sonraki aşamalarda gerekli evidence ihtiyaçlarını işaretler:

```yaml
evidence_required_later:
  - route_distance
  - traffic_risk
  - parking_availability_hint
  - public_authority_rule_lookup
  - beach_privacy_suitability_check
  - accommodation_availability_check
  - poi_operational_hours
```

## 11. Confidence rules

Confidence şu şekilde yorumlanır:

```yaml
confidence:
  high: "Aday bölge kullanıcı hedefi ve radius mantığıyla açıkça uyumlu"
  medium: "Aday makul görünüyor ama rota/aktivite/evidence doğrulaması gerekli"
  low: "Aday yalnızca istisnai veya belirsiz gerekçeyle değerlendirilebilir"
```

Confidence final öneri güveni değildir.

Bu agent'ın confidence değeri sadece candidate selection confidence'tır.

## 12. Failure modes

Olası failure durumları:

```yaml
failure_modes:
  - missing_origin
  - missing_target_region
  - ambiguous_radius_rule
  - incompatible_target_and_duration
  - insufficient_context_for_out_of_radius_candidates
  - conflicting_privacy_or_sea_constraints
```

## 13. Clarification triggers

Şu durumlarda clarification gerekir:

- hedef il/bölge belirsizse,
- çıkış noktası yoksa,
- radius kuralı kullanıcı isteğiyle çelişiyorsa,
- kullanıcı hem çok düşük yorgunluk hem çok geniş gezi alanı istiyorsa,
- deniz tatili istenip kadınlar plajı şartı belirsiz bırakılmışsa,
- süre çok kısa ama aday alan çok genişse.

## 14. Fixture requirements

Bu agent için gerekli fixture örnekleri:

```yaml
fixtures:
  - fixture_id: TM-DEST-001
    name: Kocaeli origin Balıkesir 3 day target with 150 km radius
  - fixture_id: TM-DEST-002
    name: Single target city with nearby alternatives
  - fixture_id: TM-DEST-003
    name: Out of radius exceptional candidate requires justification
  - fixture_id: TM-DEST-004
    name: Sea destination with women-only beach requirement
  - fixture_id: TM-DEST-005
    name: Low fatigue family trip rejects overly broad candidate spread
```

## 15. Evaluation rubric

Başarı kriterleri:

```yaml
rubric:
  separates_primary_and_nearby_candidates: required
  marks_out_of_radius_candidates_as_exceptional: required
  does_not_generate_daily_plan: required
  does_not_call_live_tools: required
  carries_constraint_notes_forward: required
  marks_evidence_required_later: required
  avoids_unverified_claims: required
```

Hard fail örnekleri:

- 150 km dışı adayı gerekçesiz önermek,
- kadınlar plajı şartını görmezden gelmek,
- rota süresi hesapladığını iddia etmek,
- otel/aktivite final önerisi üretmek,
- canlı veri çektiğini iddia etmek,
- aile yorgunluğu etkisini hiç işaretlememek.

## 16. Example contract sketch

```yaml
agent_id: destination_candidate_agent
input:
  normalized_request_ref: travel_request_normalized_v1
  constraint_policy_ref: constraint_policy_result_v1
  family_context_ref: family_context_summary_v1
output:
  destination_candidate_result_v1:
    candidate_groups:
      - group_id: primary_target_area
        candidates:
          - candidate_id: dest_balikesir_core
            name: Balıkesir merkez / yakın çevre
            type: mixed
            relation_to_target: primary
            estimated_distance_bucket: unknown
            likely_trip_role: base_stay
            evidence_required_later:
              - route_distance
              - accommodation_availability_check
      - group_id: near_radius_area
        candidates:
          - candidate_id: dest_ayvalik
            name: Ayvalık
            type: beach_area
            relation_to_target: nearby
            estimated_distance_bucket: 100_150_km
            likely_trip_role: base_stay
            constraint_notes:
              - women_only_beach_required_when_sea_recommended
            evidence_required_later:
              - beach_privacy_suitability_check
              - parking_availability_hint
    confidence: medium
```

## 17. Open design questions

Açık sorular:

1. 150 km kuralı hedef il merkezinden mi, konaklama noktasından mı ölçülecek?
2. Kocaeli çıkışlı planlarda ilk gün yol yorgunluğu candidate selection içinde mi işaretlenmeli?
3. Radius dışı adaylar için minimum gerekçe eşiği nasıl tanımlanmalı?
4. Deniz adaylarında kadınlar plajı şartı sadece plaj günü varsa mı uygulanmalı?
5. Destination candidate ile activity candidate sınırı nasıl daha keskin ayrılmalı?

## Current status

```yaml
agent_specification_state: drafted
agent_id: destination_candidate_agent
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
calls_tools: false
calls_other_agents: false
writes_canonical_memory: false
produces_final_user_response: false
next_agent_spec: route-logistics-agent.md
```
