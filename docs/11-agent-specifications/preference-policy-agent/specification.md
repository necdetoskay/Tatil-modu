# TM-AG-002 — Preference & Policy Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-002 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
| Tarih | 2026-08-27 |

## 1. Purpose

Preference & Policy Agent, `TravelerProfile` ve `TripRequest` içindeki açık kullanıcı isteklerini yapılandırılmış `PreferenceSet` ve `ConstraintSet` haline getirir.

Temel görev:

```text
classify preference → classify constraint → detect condition/conflict → emit policy package
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
- ürünün kanonik constraint taxonomy/policy kuralları,
- opsiyonel `contextManifestId`.

## 4. Outputs

İki ana domain objesi üretir:

- `PreferenceSet`
- `ConstraintSet`

Her constraint en az:

```yaml
constraintId: string
kind: HARD | SOFT | CONDITIONAL_HARD
condition: object|null
subject: string
operator: string
value: any
sourceRefs: []
confidence: 0..1
evidenceRequired: boolean
```

alanlarını taşır.

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

Çıktı Orchestrator'a döner. Orchestrator yalnız gerekli constraint/preference alanlarını downstream agentlara disclosure olarak iletir.

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
- `child_age_eligibility`
- kullanıcının açık “mutlaka / zorunlu / olmazsa olmaz / istemiyorum” ifadelerinden türeyen kurallar.

## 10. Conditional hard constraints

Bazı kurallar yalnız bir koşul gerçekleştiğinde hard olur.

Örnek:

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

“Deniz önerilecekse kadınlar plajı mutlaka olmalı” cümlesi **genel olarak deniz zorunluluğu değildir**. Yalnız `activity.type == beach` olduğunda kadınlar plajı şartını aktif eder.

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

Kullanıcı açıkça “mutlaka” demişse ilgili preference otomatik soft kabul edilmez.

## 12. Constraint strength rules

Öncelik sırası:

1. Açık negatif yasak: “istemiyorum / olmasın / kesinlikle değil” → `HARD` exclusion.
2. Açık zorunluluk: “mutlaka / şart / zorunlu / olmazsa olmaz” → `HARD` veya koşulluysa `CONDITIONAL_HARD`.
3. Açık tercih: “tercih ederim / iyi olur / mümkünse” → `SOFT`.
4. Belirsiz ifade → `UNKNOWN`/clarification; sessizce hard veya soft'a çevrilmez.

## 13. Evidence requirements

Bu agent dış dünya evidence'ı toplamaz.

Her preference/constraint için kaynak provenance taşır:

- `USER_EXPLICIT`
- `CONVERSATION_FACT`
- `PROFILE_DERIVED`
- `PRODUCT_POLICY`

Dış dünya doğrulaması gerektiren constraint için yalnız `evidenceRequired=true` işaretlenir; örneğin kadınlar plajı statüsü veya accessibility facility claim'i bu agent tarafından doğrulanmaz.

## 14. Privacy-sensitive handling

Privacy-sensitive tercih:

- yalnız seyahat planı için gerekli kapsamda temsil edilir,
- hassas kimlik çıkarımına dönüştürülmez,
- canonical memory write yapılmaz,
- downstream disclosure minimum alanla sınırlıdır,
- “kadınlar plajı istiyor” bilgisinden din, ideoloji veya aile profili çıkarılamaz.

## 15. Conflict rules

Çelişki örnekleri:

- “150 km'yi geçmeyelim” + “gerekirse 200 km de olur”
- “çok sakin plan” + “her gün 5-6 yer gezelim”
- “bütçe en fazla 20.000 TL” + “otel bütçesi 25.000 TL olabilir”

Agent bunları sessizce çözmez. `conflicts[]` ve gerekirse `clarificationRequired[]` üretir.

## 16. Confidence rules

- açık user statement: yüksek,
- aynı conversation'dan açık fact: orta-yüksek,
- profile'dan güvenli türetim: orta,
- yorum gerektiren/belirsiz ifade: düşük.

Hard constraint confidence düşükse downstream'de “karşılandı” sayılamaz; clarification veya verification gerekir.

## 17. Failure modes

- `HARD_TO_SOFT_DOWNGRADE`
- `SOFT_TO_HARD_INVENTION`
- `CONDITION_DROPPED`
- `PRIVACY_OVERINFERENCE`
- `PLANNING_LEAKAGE`
- `TOOL_SCOPE_VIOLATION`
- `CONFLICT_SILENTLY_RESOLVED`
- `MISSING_PROVENANCE`

## 18. Clarification triggers

- constraint strength belirsiz,
- iki açık statement çelişkili,
- sayı sınırının hard mı esnek mi olduğu anlaşılamıyor,
- condition scope belirsiz,
- kullanıcı “mümkünse” ve “mutlaka” gibi zıt sinyalleri aynı kural için kullanıyor.

## 19. Fixture requirements

Minimum golden coverage:

- happy path preference extraction,
- explicit hard constraint,
- conditional hard constraint,
- explicit negative exclusion,
- soft preference,
- distance boundary,
- budget limit,
- conflict,
- privacy-sensitive condition,
- missing/ambiguous strength,
- authority/tool leakage,
- provenance/context lifecycle.

## 20. Evaluation rubric

Hard fail:

- hard constraint'i soft yapmak,
- condition'ı düşürmek,
- preference'dan yeni kişisel özellik çıkarmak,
- dış dünya tool çağırmak,
- yeni POI/plan üretmek,
- provenance olmadan constraint üretmek.

Semantic kalite kriterleri:

- doğru strength,
- doğru condition scope,
- minimum disclosure,
- conflict görünürlüğü,
- evidence requirement işaretleme.

## 21. Contract sketch

```yaml
agentId: TM-AG-002
inputContract: preference-policy-input.v1
outputContracts:
  - preference-set.v1
  - constraint-set.v1
allowedTools:
  - TL-012
  - TL-013
externalToolAccess: false
writesCanonicalMemory: false
producesFinalUserResponse: false
```

## 22. Open design questions

- Default 150 km davranışı ürün profili mi yoksa kullanıcıya özel preference mı olmalı?
- Kullanıcı “çok iyi bir yerse sınır aşılabilir” dediğinde exception modeli nasıl taşınmalı?
- Hard budget ile category budget çelişkisi için otomatik resolution yapılmalı mı?

## 23. Current status

```yaml
agent_spec_status: canonical_v1
implementation_allowed: false
prototype_allowed: false
fixture_pack: pending
next: input_output_schema_and_policies
```
