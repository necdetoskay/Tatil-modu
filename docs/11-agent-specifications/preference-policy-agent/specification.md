# TM-AG-002 — Preference & Policy Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-002 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
| Tarih | 2026-08-27 |

## 1. Purpose

Preference & Policy Agent, `TravelerProfile` ve `TripRequest` içindeki açık kullanıcı isteklerini yapılandırılmış `PreferenceSet`, `ConstraintSet` ve gerektiğinde `ExceptionPolicySet` haline getirir.

```text
classify preference → classify constraint → preserve condition → detect conflict/exception → emit policy package
```

Bu agent plan üretmez ve aday araştırmaz.

## 2. Non-goals

Agent:

- destinasyon/POI/otel/restoran bulmaz,
- route veya bütçe hesaplamaz,
- canlı web/provider çağırmaz,
- kullanıcı adına yeni tercih icat etmez,
- hard constraint'i soft preference'a düşürmez,
- hassas tercihten din/kimlik/profil çıkarımı yapmaz,
- memory'ye doğrudan yazmaz,
- final kullanıcı cevabı üretmez.

## 3. Inputs

- `TripRequest` içindeki user message ve açık preference cümleleri,
- `TravelerProfile`,
- izinli conversation facts,
- kanonik constraint taxonomy/policy kuralları,
- `policyVersion`,
- opsiyonel `contextManifestId`.

## 4. Outputs

Ana çıktılar:

- `PreferenceSet` — soft/informational tercihleri taşır.
- `ConstraintSet` — yalnız `HARD` ve `CONDITIONAL_HARD` kuralları taşır.
- `ExceptionPolicySet` — açık kullanıcı izniyle bir soft target'ın hangi şartlarda aşılabileceğini taşır.
- `conflicts[]`
- `clarificationRequired[]`

Constraint minimum shape:

```yaml
constraintId: string
kind: HARD | CONDITIONAL_HARD
condition: object|null
subject: string
operator: string
value: any
sourceRefs: []
confidence: 0..1
evidenceRequired: boolean
```

Exception policy minimum shape:

```yaml
exceptionId: string
targetKey: string
mode: ALLOW_IF_EXCEPTIONAL_VALUE | ALLOW_WITH_USER_APPROVAL | ALLOW_WITH_JUSTIFICATION
trigger: string
requiresUserApproval: boolean
sourceRefs: []
```

## 5. Required context

- kullanıcının açık seyahat talebi,
- TM-AG-001 `TravelerProfile`,
- kanonik hard/soft taxonomy,
- privacy-sensitive preference handling rule set,
- product policy version.

## 6. Forbidden context

- full memory dump,
- canlı place/weather/route/booking sonuçları,
- provider credential'ları,
- gereksiz kişisel/hassas profil detayları,
- başka agentların hidden reasoning'i.

## 7. Dependencies

- TM-AG-001 Profile Agent output,
- Travel Orchestrator/Gateway,
- `TL-012` Schema Validator,
- `TL-013` Rule Engine,
- canonical agent contract catalog,
- harness context manifest.

## 8. Handoff rules

Çıktı Orchestrator'a döner. Orchestrator yalnız gerekli constraint/preference/exception alanlarını downstream agentlara disclosure olarak iletir.

Raw user message her downstream agent'a otomatik olarak geçirilmez.

## 9. Hard constraints

Hard constraint, ihlal edildiğinde adayın kabul edilemeyeceği veya açık kullanıcı onayı/clarification gerektiren kuraldır.

İlk kanonik hard sınıfları:

- `budget_max`
- `transport_mode_required`
- `accessibility_requirement`
- `midday_rest_required`
- `max_daily_drive`
- `max_distance_boundary`
- açık “mutlaka / zorunlu / olmazsa olmaz / istemiyorum” ifadelerinden türeyen kurallar.

Çocuk yaşı tek başına yeni bir hard preference üretmez; downstream eligibility değerlendirmesi için factual context'tir.

## 10. Conditional hard constraints

Bazı kurallar yalnız koşul gerçekleştiğinde hard olur.

```yaml
constraintId: women_only_beach_when_beach
kind: CONDITIONAL_HARD
condition:
  field: activity.type
  operator: equals
  value: beach
subject: place.womenOnlyStatus
operator: equals
value: true
```

“Deniz önerilecekse kadınlar plajı mutlaka olmalı” cümlesi **deniz zorunluluğu değildir**. Yalnız `activity.type == beach` olduğunda kadınlar plajı şartını aktif eder.

## 11. Soft preferences

Soft preference plan kalitesini etkiler ancak tek başına adayı otomatik reddetmez.

Örnekler:

- kolay otopark,
- düşük yorgunluk,
- kısa yürüyüş,
- çocuk oyun alanı,
- sakin ortam,
- akşam erken dönüş,
- alternatifli günlük plan,
- havuz/hamam tercihi.

## 12. Exception policies

Kullanıcı bir hedefi tercih edip açıkça istisna tanımlarsa bu kural hard constraint'e çevrilmez.

Örnek:

> “Tercihen 150 km içinde olsun ama gerçekten çok iyi bir yerse biraz aşabiliriz.”

Beklenen model:

- soft preference: `preferred_distance_150km`
- exception policy: `ALLOW_IF_EXCEPTIONAL_VALUE`
- **hard `max_distance_boundary` oluşturulmaz.**

Exception policy, downstream agent'a sınırı keyfî aşma yetkisi vermez; exception trigger ve gerekçe trace edilmelidir.

## 13. Constraint strength rules

1. Açık negatif yasak → `HARD` exclusion.
2. Açık zorunluluk → `HARD` veya koşulluysa `CONDITIONAL_HARD`.
3. Açık tercih → `SOFT`.
4. Esnek hedef + açık istisna → `SOFT + ExceptionPolicy`.
5. Belirsiz ifade → clarification; sessiz hard/soft tahmini yok.

## 14. Evidence requirements

Bu agent dış dünya evidence'ı toplamaz.

Her preference/constraint/exception provenance taşır:

- `USER_EXPLICIT`
- `CONVERSATION_FACT`
- `PROFILE_DERIVED`
- `PRODUCT_POLICY`

Dış dünya doğrulaması gerektiren constraint için `evidenceRequired=true` işaretlenir; doğrulama başka agent/capability işidir.

## 15. Privacy-sensitive handling

- yalnız görev için gerekli semantic constraint tutulur,
- hassas kimlik çıkarımına dönüştürülmez,
- canonical memory write yapılmaz,
- downstream disclosure minimum alanla sınırlıdır.

## 16. Conflict rules

Çelişkili explicit statement'lar sessizce çözülmez. Yalnız kullanıcının daha yeni açık ifadesi eski tercihi açıkça değiştirdiğinde `LATEST_EXPLICIT_WINS` uygulanabilir; aksi halde clarification gerekir.

## 17. Confidence rules

- açık user statement: yüksek,
- aynı conversation'dan açık fact: orta-yüksek,
- profile'dan güvenli factual türetim: orta,
- yorum gerektiren/belirsiz ifade: düşük.

Hard constraint confidence düşükse downstream'de “karşılandı” sayılamaz.

## 18. Failure modes

- `HARD_TO_SOFT_DOWNGRADE`
- `SOFT_TO_HARD_INVENTION`
- `CONDITION_DROPPED`
- `EXCEPTION_DROPPED`
- `PRIVACY_OVERINFERENCE`
- `PLANNING_LEAKAGE`
- `TOOL_SCOPE_VIOLATION`
- `CONFLICT_SILENTLY_RESOLVED`
- `MISSING_PROVENANCE`

## 19. Clarification triggers

- constraint strength belirsiz,
- açık statement'lar çelişkili,
- sayı sınırının hard mı esnek mi olduğu anlaşılamıyor,
- condition scope belirsiz,
- exception trigger belirsiz.

## 20. Fixture coverage

Golden pack:

- 14 davranış fixture'ı,
- 6 authority testi,
- 4 context lifecycle testi,
- 3 provenance testi.

Kaynak: `tests/fixture-pack.v1.json`.

## 21. Evaluation rubric

Hard fail:

- hard→soft downgrade,
- soft→hard invention,
- condition veya explicit exception'ın kaybolması,
- privacy over-inference,
- dış tool çağrısı,
- planning entity üretimi,
- provenance eksikliği.

## 22. Contract sketch

```yaml
agentId: TM-AG-002
inputContract: preference-policy-input.v1
outputContract: preference-policy-output.v1
allowedTools:
  - TL-012
  - TL-013
externalToolAccess: false
writesCanonicalMemory: false
producesFinalUserResponse: false
```

## 23. Open design questions

- Product-level default travel radius ayrıca bir policy katmanında mı tutulmalı?
- Hard total budget ile category budget çelişkisi için hangi resolution kuralı kullanılmalı?

## 24. Current status

```yaml
agent_spec_status: canonical_v1
input_schema: complete
output_schema: complete
authority_policy: complete
tool_policy: complete
source_policy: complete
decision_rules: complete
handoff_contracts: complete
evaluation_rubric: complete
fixture_pack: complete
implementation_allowed: false
prototype_allowed: false
next_agent: TM-AG-003
```
