# Constraint & Policy Agent Specification

**Agent ID:** `constraint_policy_agent`  
**Durum:** canonical pre-code specification  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Constraint & Policy Agent, Trip Intake Agent tarafından yapılandırılmış seyahat talebindeki kısıt, tercih, hassasiyet ve politika adaylarını sınıflandırır.

Bu agent'ın temel amacı şudur:

```text
Neyin asla ihlal edilemeyeceğini, neyin tercih olduğunu ve neyin kullanıcıya uyarı olarak taşınması gerektiğini ayırmak.
```

Bu agent plan üretmez.

Bu agent rota, otel, aktivite veya günlük program seçmez.

Bu agent yalnızca karar sürecinde kullanılacak constraint/policy zeminini hazırlar.

## 2. Non-goals

Constraint & Policy Agent şunları yapmaz:

- tatil destinasyonu seçmez,
- aktivite önermz,
- otel veya konaklama seçmez,
- rota hesaplamaz,
- fiyat doğrulamaz,
- canlı provider çağırmaz,
- kullanıcıya final cevap üretmez,
- canonical memory'ye yazmaz,
- başka agent çağırmaz,
- hard constraint'i skorla telafi etmez.

## 3. Inputs

Ana input Trip Intake Agent çıktısıdır.

Beklenen input sınıfları:

- structured travel request,
- detected family profile,
- origin / destination hints,
- date / duration hints,
- budget hints,
- child age hints,
- sea / beach hints,
- privacy / women-only beach hints,
- fatigue / rest hints,
- transport mode hints,
- accessibility or medical hints,
- uncertainty flags,
- clarification candidates.

## 4. Outputs

Agent çıktısı bir constraint and policy classification package olmalıdır.

Örnek çıktı sınıfları:

```yaml
constraint_policy_result:
  hard_constraints: []
  soft_preferences: []
  policy_warnings: []
  clarification_required: []
  rejected_interpretations: []
  confidence:
    overall: unknown
    by_constraint: []
```

## 5. Required context

Bu agent için gerekli context:

- Trip Intake Agent output,
- current product policy rules,
- hard constraint taxonomy,
- soft preference taxonomy,
- privacy-sensitive preference handling rules,
- child-safety planning principles,
- tool/capability workplan policy boundaries,
- memory disclosure package summary.

## 6. Forbidden context

Bu agent'a verilmemesi gereken context:

- raw canonical memory store,
- full user history,
- provider credentials,
- live tool results,
- booking availability,
- payment information,
- unrelated personal data,
- internal implementation details,
- UI component state.

## 7. Dependencies

Bu agent aşağıdaki tasarım artifact'larına bağlıdır:

- `docs/11-agent-specifications/trip-intake-agent.md`,
- `docs/09-pre-implementation-design/05-contract-schema-workplan.md`,
- `docs/09-pre-implementation-design/08-memory-and-privacy-workplan.md`,
- `docs/09-pre-implementation-design/09-ui-ux-flow-workplan.md`,
- `docs/08-architecture-baseline/evaluation-standards-hierarchy.md`,
- `ai-agent-architecture-handbook/09-policy-hard-constraints-and-safety.md`.

## 8. Handoff rules

Constraint & Policy Agent çıktısı Travel Orchestrator'a döner.

Agent başka agent'a doğrudan handoff yapmaz.

Travel Orchestrator bu çıktıyı şu agent'lara disclosure olarak verebilir:

- Family Suitability Agent,
- Destination Candidate Agent,
- Route & Logistics Agent,
- Accommodation Fit Agent,
- Activity Fit Agent,
- Day Plan Composer Agent,
- Final Response Composer Agent.

## 9. Hard constraints

Hard constraint, ihlal edildiğinde adayın elenmesine veya kullanıcıdan onay/clarification istenmesine neden olan kısıttır.

Tatil Modu için ilk hard constraint adayları:

| Constraint | Açıklama |
|---|---|
| child_age_safety | 2 ve 6 yaş çocuklara açıkça uygun olmayan plan önerilmez |
| midday_rest_required | Kullanıcı dinlenme ihtiyacı belirtmişse yoğun tam gün plan yapılmaz |
| women_only_beach_required_when_sea_recommended | Deniz önerilecekse kadınlar plajı koşulu dikkate alınır |
| max_distance_boundary | Belirlenen mesafe sınırı aşılırsa gerekçe ve kullanıcı onayı gerekir |
| budget_limit | Bütçe açıkça belirtilmişse bariz aşım önerilmez |
| transport_mode | Araç yoksa araç gerektiren plan doğrudan varsayılmaz |
| closed_or_unverified_authority_rule | Resmi kural doğrulanmadan kesin ifade kurulmaz |

## 10. Soft preferences

Soft preference, plan kalitesini etkiler ancak tek başına aday elemek zorunda değildir.

İlk soft preference adayları:

- düşük yorgunluk,
- kolay otopark,
- kısa yürüyüş,
- çocuk oyun alanı,
- öğle sonrası hafif aktivite,
- otel havuzu,
- hamam/kaplıca,
- hafta içi sakinlik,
- akşam çok geç dönmeme,
- alternatifli günlük plan.

## 11. Policy warnings

Policy warning, plan üretimi sırasında kullanıcıya açık taşınması gereken risk veya belirsizliktir.

Örnek policy warning sınıfları:

- opening_hours_unverified,
- price_unverified,
- weather_dependency,
- parking_uncertain,
- women_only_beach_status_unverified,
- child_suitability_uncertain,
- long_drive_fatigue_risk,
- seasonal_crowd_risk,
- official_rule_requires_verification.

## 12. Evidence requirements

Bu agent doğrudan evidence toplamaz.

Ancak hangi constraint için evidence gerektiğini işaretler.

Örnek:

```yaml
evidence_requirements:
  - constraint_id: women_only_beach_required_when_sea_recommended
    required_evidence_type: public_authority_or_official_facility_source
    reason: "Kadınlar plajı statüsü yanlış önerilirse kullanıcı beklentisi bozulur."
  - constraint_id: closed_or_unverified_authority_rule
    required_evidence_type: official_hours_or_recent_source
    reason: "Saat/kural kesin ifade edilmeden önce doğrulanmalıdır."
```

## 13. Confidence rules

Confidence üç seviyede taşınmalıdır:

```yaml
confidence:
  overall: high | medium | low
  by_constraint:
    - constraint_id: string
      confidence: high | medium | low
      reason: string
  unknowns: []
```

Confidence yüksek değilse final planda kesin ifade kullanılmamalıdır.

## 14. Failure modes

Beklenen failure mode'lar:

| Failure mode | Davranış |
|---|---|
| ambiguous_constraint | clarification_required listesine ekle |
| conflicting_preferences | conflict olarak işaretle |
| missing_child_age | child_safety confidence düşür |
| missing_budget | budget constraint oluşturma, sadece unknown olarak taşı |
| privacy_sensitive_unclear | memory'ye yazma, session-only kabul et |
| hard_soft_boundary_unclear | conservative şekilde hard candidate olarak işaretle ve review iste |

## 15. Clarification triggers

Kullanıcıdan clarification gerekebilecek durumlar:

- çocuk yaşları yoksa,
- tarih veya süre yoksa,
- bütçe kritik ama belirsizse,
- deniz isteniyor ama kadınlar plajı koşulu net değilse,
- 150 km sınırı mı yoksa esnek sınır mı belirsizse,
- dinlenme ihtiyacı açık değilse,
- araç kullanımı veya toplu taşıma net değilse,
- hassas tercih kalıcı mı session-only mı belirsizse.

## 16. Fixture requirements

İlk fixture setleri:

| Fixture ID | Amaç |
|---|---|
| TM-CONSTRAINT-001 | Kocaeli çıkışlı, 2 çocuklu, kadınlar plajı şartlı deniz planı |
| TM-CONSTRAINT-002 | Bütçe belirtilmiş ama tarih belirsiz aile planı |
| TM-CONSTRAINT-003 | 150 km üstü öneri için gerekçe ve onay ihtiyacı |
| TM-CONSTRAINT-004 | Öğle dinlenmesi zorunlu düşük yorgunluk planı |
| TM-CONSTRAINT-005 | Çelişkili istek: çok aktivite + düşük yorgunluk |

## 17. Evaluation rubric

Bu agent şu kriterlerle değerlendirilecektir:

| Kriter | Başarı koşulu |
|---|---|
| hard/soft ayrımı | Hard constraint'ler skora dönüştürülmez |
| privacy handling | Hassas tercihler kalıcı memory varsayılmaz |
| child safety | Çocuk yaşı bilinmiyorsa güven düşer veya clarification ister |
| evidence marking | Doğrulama gerektiren constraint'ler işaretlenir |
| conflict detection | Çelişkili istekler görünür hale getirilir |
| no planning | Agent plan, otel, rota veya aktivite üretmez |

## 18. Example contract sketch

```yaml
input:
  request_id: TM-REQ-001
  source_agent: trip_intake_agent
  structured_request:
    origin: Kocaeli
    duration_days: 3
    family:
      adults: 2
      children:
        - age: 6
        - age: 2
    preferences:
      sea_allowed: true
      women_only_beach_required: true
      low_fatigue: true
      midday_rest: true

output:
  agent_id: constraint_policy_agent
  hard_constraints:
    - id: child_age_safety
      status: active
      confidence: high
    - id: women_only_beach_required_when_sea_recommended
      status: active
      confidence: high
      evidence_required: true
  soft_preferences:
    - id: easy_parking
      confidence: medium
    - id: pool_or_hamam
      confidence: medium
  policy_warnings:
    - id: women_only_beach_status_unverified
      severity: high
  clarification_required: []
```

## 19. Open design questions

- Kadınlar plajı tercihi her zaman hard constraint mi olmalı, yoksa kullanıcı ifadesine göre session-level hard constraint mi olmalı?
- 150 km sınırı varsayılan hard limit mi, yoksa “çok iyi öneri varsa aşılabilir” soft boundary mi?
- Bütçe aşımı yüzde kaçtan sonra hard violation sayılmalı?
- Çocuk yaşları biliniyorsa child suitability agent'a hangi minimum disclosure verilmeli?
- Privacy-sensitive preference için memory update önerisi hangi UX adımında gösterilmeli?

## 20. Current status

```yaml
agent_specification_state: drafted
agent_id: constraint_policy_agent
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
calls_tools: false
calls_other_agents: false
writes_canonical_memory: false
produces_final_user_response: false
next_agent_spec: family-suitability-agent.md
```
