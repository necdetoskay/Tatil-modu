# TM-AG-001 — Profile Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-001 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
| Tarih | 2026-08-27 |

## 1. Purpose

Profile Agent, `TripRequest` ve izinli minimum kullanıcı bağlamındaki açık seyahat gerçeklerini yapılandırılmış `TravelerProfile` haline getirir.

Temel görev:

```text
extract → normalize → detect unknown/conflict → emit TravelerProfile
```

## 2. Non-goals

Profile Agent:

- preference/policy sınıflandırmaz,
- hard/soft constraint üretmez,
- POI/otel/restoran önermez,
- rota veya bütçe hesaplamaz,
- web/place/weather/accommodation/review tool çağırmaz,
- güncel dış dünya fact'i üretmez,
- memory'ye yazmaz,
- final kullanıcı cevabı oluşturmaz.

## 3. Inputs

Kanonik input: `ProfileAgentInput`.

Kaynaklar:

- `TripRequest.userMessage` zorunlu,
- aynı request/conversation için disclosure edilmiş `knownFacts` opsiyonel,
- minimum `memoryDisclosure` opsiyonel,
- `localeContext` opsiyonel.

## 4. Outputs

Kanonik output: `TravelerProfile`.

Profil aşağıdakileri taşıyabilir:

- yetişkin sayısı,
- çocuk yaşları,
- toplam kişi sayısı,
- ulaşım modu,
- çıkış noktası,
- hedef,
- unknown alanlar,
- conflict kayıtları,
- field-level evidence/source kayıtları,
- overall confidence.

## 5. Required context

- current user request,
- yalnız explicit conversation facts,
- görev için disclosure edilmiş minimum memory facts,
- locale bilgisi gerektiğinde.

## 6. Forbidden context

- tüm memory dump,
- gereksiz geçmiş konuşmalar,
- provider credentials,
- canlı place/weather/hotel/route data,
- ödeme/kimlik bilgileri,
- downstream agent private state.

## 7. Dependencies

- Travel Orchestrator / Harness caller,
- ContractLoader,
- ContextAssembler,
- Schema Validator,
- TraceRecorder.

Başka expert agent doğrudan çağrılamaz.

## 8. Handoff rules

Primary downstream: `TM-AG-002 Preference & Policy Agent`.

Handoff yalnız `TravelerProfile` + gerekli evidence refs üzerinden yapılır. Raw conversation history downstream'e otomatik aktarılmaz.

## 9. Hard constraints

- Explicit fact değiştirilmez.
- Unknown alan tahmin edilmez.
- Conflict sessizce çözülmez.
- Preference veya policy output'a sokulmaz.
- Forbidden tool çağrısı yapılamaz.
- Context scope dışı bilgi kullanılamaz.

## 10. Evidence requirements

Evidence dış web kaynağı değil, extraction provenance'ıdır.

Allowed evidence types:

```text
USER_EXPLICIT
CONVERSATION_FACT
MEMORY_DISCLOSURE
NORMALIZATION
```

Her non-null önemli alan en az bir evidence ref taşımalıdır.

## 11. Confidence rules

- `high`: kullanıcı current request içinde açık söyledi.
- `medium`: izinli conversation/memory disclosure içinde açık ama current request'te tekrar edilmedi.
- `low`: değer üretilmez; belirsizlik/çelişki işareti için kullanılır.

Overall confidence numeric `0..1` olur; downstream için fact confidence yerine geçmez.

## 12. Failure modes

| Kod | Açıklama |
|---|---|
| `PROFILE_INPUT_INVALID` | Input schema geçersiz |
| `PROFILE_CONFLICT` | Explicit bilgiler çelişkili |
| `PROFILE_UNKNOWN_REQUIRED_FACT` | Gerekli alan bilinmiyor |
| `PROFILE_CONTEXT_SCOPE_VIOLATION` | Forbidden context kullanımı |
| `PROFILE_AUTHORITY_VIOLATION` | Profil dışı karar/öneri |
| `PROFILE_TOOL_VIOLATION` | Forbidden external tool çağrısı |
| `PROFILE_OUTPUT_INVALID` | Output schema geçersiz |

## 13. Clarification triggers

Agent clarification ihtiyacını işaretleyebilir fakat doğrudan kullanıcı diyaloğunu yönetmez.

Trigger örnekleri:

- kişi sayısı ile sayılan kişiler çelişiyor,
- çocuk var fakat yaşları eksik ve downstream yaş bağımlı olacak,
- transport ifadesi birden fazla moda işaret ediyor.

## 14. Fixture requirements

M1 minimum:

- 10 fixture case,
- her deterministic rule için R1 assertion,
- en az 5 authority case,
- en az 4 context lifecycle case,
- en az 2 provenance completeness case.

Fixture pack: `tests/fixture-pack.v1.json`.

## 15. Evaluation rubric

Hard PASS koşulları:

- input/output schema valid,
- explicit facts korunmuş,
- unknown tahmin edilmemiş,
- conflict korunmuş,
- forbidden tool call = 0,
- policy/preference leakage = 0,
- evidence refs tamam,
- context manifest freeze korunmuş.

Semantic reviewer bu agent için opsiyoneldir; deterministic extraction oracle önceliklidir.

## 16. Example contract sketch

```yaml
agent_id: TM-AG-001
input: ProfileAgentInput.v1
output: TravelerProfile.v1
allowed_tools:
  - TL-012
external_domain_tools: forbidden
calls_other_agents: false
writes_durable_state: false
produces_final_response: false
primary_downstream: TM-AG-002
```

## 17. Open design questions

- Child age ay/yıl hassasiyeti v1'de gerekli mi?
- `totalTravelers` yalnız explicit mi, yoksa adults + children'dan deterministic derived olarak mı tutulmalı? v1 kararı: derived allowed.
- Origin/destination daha sonra ayrı TripContext objesine taşınmalı mı? v1'de TravelerProfile içinde tutulur.

## 18. Harness binding

Bu agent `TM-HAR-BSL-001` kurallarına tabidir:

- ContextManifest zorunlu,
- attempt context freeze zorunlu,
- R0/R1/R2/R6 M1 gate,
- harness-vs-model failure attribution zorunlu,
- system provenance zorunlu.
