# Family Suitability Agent Specification

**Doküman türü:** canonical agent specification  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Family Suitability Agent, yapılandırılmış seyahat isteği ve constraint/policy sınıflandırmasını kullanarak aday rota, aktivite, konaklama veya günlük plan parçalarının aile profiline uygunluğunu değerlendirir.

Bu agent özellikle çocuk yaşları, yorgunluk, öğle dinlenmesi, güvenlik, erişilebilirlik, tuvalet/bez/ara verme ihtiyacı, kapalı alan ihtiyacı ve ebeveyn yükü açısından uygunluk kararı üretir.

```yaml
agent_id: family_suitability_agent
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
calls_tools: false
calls_other_agents: false
writes_canonical_memory: false
produces_final_user_response: false
```

## 2. Non-goals

Family Suitability Agent şunları yapmaz:

- yeni destinasyon adayı bulmaz,
- gerçek trafik veya hava durumu sorgulamaz,
- çalışma saati veya fiyat doğrulamaz,
- otel önerisi üretmez,
- günlük plan oluşturmaz,
- final kullanıcı cevabı yazmaz,
- memory'ye yazmaz,
- hard constraint sınıflandırmasını değiştirmez.

Bu agent, kendisine verilen adayların aileye uygunluk riskini değerlendirir.

## 3. Inputs

Beklenen input paketleri:

```yaml
inputs:
  normalized_travel_request: TravelRequestNormalizedV1
  constraint_policy_result: ConstraintPolicyResultV1
  family_context:
    adults_count: number
    children:
      - age: number
        age_group: toddler | preschool | school_age | unknown
    known_needs:
      - midday_rest
      - low_fatigue
      - stroller_friendly
      - toilet_access
      - short_walks
  candidate_items:
    - candidate_id: string
      candidate_type: destination | route | activity | accommodation | day_block
      name: string
      estimated_duration_minutes: number | unknown
      estimated_walking_level: low | medium | high | unknown
      indoor_outdoor: indoor | outdoor | mixed | unknown
      rest_opportunity: good | limited | none | unknown
      child_facility_signals: list
```

## 4. Outputs

Agent şu çıktıyı üretir:

```yaml
output:
  family_suitability_result:
    candidate_id: string
    suitability_level: suitable | suitable_with_cautions | unsuitable | needs_more_info
    fatigue_risk: low | medium | high | unknown
    toddler_fit: good | caution | poor | unknown
    child_age_6_fit: good | caution | poor | unknown
    rest_fit: good | caution | poor | unknown
    parent_burden: low | medium | high | unknown
    safety_notes: list
    required_adjustments: list
    rejection_reasons: list
    clarification_needed: list
    confidence: high | medium | low
```

## 5. Required context

Gerekli context:

- çocuk yaşları,
- yetişkin sayısı,
- seyahat süresi,
- gün içi tempo beklentisi,
- öğle dinlenmesi gerekliliği,
- aday aktivite/rota/konaklama bilgisi,
- hard constraint listesi,
- mevcut belirsizlikler.

## 6. Forbidden context

Bu agent'a verilmemesi gereken bilgiler:

- provider API key,
- kullanıcıya ait gereksiz kişisel veri,
- ödeme bilgisi,
- booking hesabı,
- konum geçmişi,
- özel sağlık detayı,
- çocuk isimleri.

Çocuk yaş bilgisi yeterlidir; çocukların kimlik bilgileri gerekli değildir.

## 7. Dependencies

Bu agent aşağıdaki tasarım artifact'larına bağımlıdır:

```yaml
dependencies:
  upstream_agents:
    - trip_intake_agent
    - constraint_policy_agent
  downstream_agents:
    - destination_candidate_agent
    - route_logistics_agent
    - accommodation_fit_agent
    - activity_fit_agent
    - day_plan_composer_agent
  required_contracts:
    - TravelRequestNormalizedV1
    - ConstraintPolicyResultV1
    - FamilySuitabilityResultV1
```

## 8. Handoff rules

- Family Suitability Agent yalnızca structured input alır.
- Serbest kullanıcı metnini yeniden yorumlamaz.
- Constraint & Policy Agent tarafından hard olarak işaretlenen kuralı soft'a düşüremez.
- Uygunluk seviyesi düşükse rejection veya caution gerekçesi üretir.
- Bilgi eksikse tahmin yapabilir ama confidence düşük olmalıdır.
- Kesin bilgi yoksa `needs_more_info` dönebilir.

## 9. Hard constraints

Aşağıdaki durumlar hard fail adayıdır:

| Durum | Karar |
|---|---|
| 2 yaş çocuk için çok uzun yürüme + dinlenme yok | unsuitable |
| öğle dinlenmesi zorunlu ama gün blokları aralıksız | unsuitable |
| güvenlik riski yüksek aktivite | unsuitable |
| çocuk yaşına açıkça uygun olmayan aktivite | unsuitable |
| yüksek yorgunluk + kısa tatil + alternatif yok | suitable_with_cautions veya unsuitable |
| kadınlar plajı şartı varken deniz aktivitesi genel plajda | Constraint & Policy Agent kararına göre hard fail |

## 10. Evidence requirements

Family Suitability Agent çoğunlukla doğrudan tool çağırmaz. Ancak verdiği kararların evidence ihtiyacı olabilir.

Evidence ihtiyaçları şunlardır:

```yaml
evidence_needs:
  - child_age_suitability_source
  - walking_distance_or_effort_estimate
  - rest_facility_signal
  - indoor_outdoor_signal
  - toilet_or_family_facility_signal
  - safety_or_accessibility_signal
```

Tool gerektiren evidence talepleri downstream Verification & Evidence Agent veya Capability Platform üzerinden tasarlanacaktır.

## 11. Confidence rules

Confidence yüksek olabilir:

- adayın çocuk uygunluğu açıkça biliniyorsa,
- yürüme ve süre bilgisi netse,
- dinlenme veya tesis bilgisi netse,
- aile profili açıkça verilmişse.

Confidence düşük olmalıdır:

- aday hakkında tesis bilgisi yoksa,
- süre/yürüme bilgisi tahminse,
- çocuk yaşları belirsizse,
- aktivite tipi net değilse,
- mevsim/hava etkisi önemli ama bilinmiyorsa.

## 12. Failure modes

| Failure mode | Beklenen davranış |
|---|---|
| Çocuk yaşları yok | clarification_needed üret |
| Aday aktivite tipi belirsiz | needs_more_info üret |
| Süre/yürüme bilgisi yok | caution ve low confidence üret |
| Hard constraint ile çelişki var | hard constraint kararına dokunmadan uyarı üret |
| Uygunluk kararı kanıtsız kesinleşiyor | confidence düşür |

## 13. Clarification triggers

Şu durumlarda kullanıcıdan veya upstream agent'tan açıklama gerekir:

- çocuk yaşları yoksa,
- bebek arabası gerekiyor mu bilinmiyorsa,
- öğle uykusu/dinlenme zorunlu mu bilinmiyorsa,
- çok yoğun plan kabul edilebilir mi bilinmiyorsa,
- aile açık hava mı kapalı alan mı tercih ediyor belirsizse,
- sağlık/erişilebilirlik hassasiyeti ima ediliyor ama açık değilse.

## 14. Fixture requirements

Minimum fixture seti:

```yaml
fixtures:
  - id: TM-FAMILY-001
    name: "2 ve 6 yaş çocuklu aile için düşük tempolu plan"
  - id: TM-FAMILY-002
    name: "2 yaş çocukla uzun yürüyüş içeren aktivite reddi"
  - id: TM-FAMILY-003
    name: "Öğle dinlenmesi olmayan yoğun gün uyarısı"
  - id: TM-FAMILY-004
    name: "Kapalı alan alternatifi gerektiren sıcak hava senaryosu"
  - id: TM-FAMILY-005
    name: "Çocuk tesis bilgisi belirsiz aday için low confidence"
```

## 15. Evaluation rubric

Başarılı sayılması için:

- 2 yaş ve 6 yaş ihtiyaçlarını ayrı ayrı değerlendirir,
- yorgunluk riskini görünür yapar,
- öğle dinlenmesini dikkate alır,
- aileye uygun olmayan adayları gerekçeli işaretler,
- hard constraint ihlalini score ile telafi etmez,
- eksik bilgide kesin hüküm vermez,
- final cevap üretmez.

## 16. Example contract sketch

```yaml
family_suitability_result:
  candidate_id: "activity_bursa_zoo"
  suitability_level: suitable_with_cautions
  fatigue_risk: medium
  toddler_fit: caution
  child_age_6_fit: good
  rest_fit: caution
  parent_burden: medium
  safety_notes:
    - "2 yaş çocuk için uzun yürüyüş yorucu olabilir."
  required_adjustments:
    - "Ziyaret sabah yapılmalı."
    - "Öğle sonrası dinlenme bloğu eklenmeli."
  rejection_reasons: []
  clarification_needed: []
  confidence: medium
```

## 17. Open design questions

- Yürüme zorluğu ölçümü nasıl standardize edilecek?
- 2 yaş çocuk için maksimum kesintisiz aktivite süresi ne olmalı?
- 6 yaş çocuk için eğitim/eğlence dengesi nasıl puanlanacak?
- Aile uygunluğu score mu yoksa karar sınıfı mı olmalı?
- Parent burden nasıl ölçülecek?
- Weather ve indoor/outdoor uygunluğu hangi agent tarafından kesinleştirilecek?

## 18. Next agent

```yaml
next_agent_spec: destination-candidate-agent.md
```
