# 10 — Pre-Code Freeze Checklist

**Doküman türü:** Tasarım kapanış checklist'i  
**Durum:** aktif tasarım kontrolü  
**Tarih:** 2026-08-07  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu belge, Tatil Modu için kodlamaya veya prototype uygulamasına geçmeden önce tamamlanması gereken son tasarım kontrol listesidir.

Bu checklist'in amacı kodlamayı başlatmak değildir.

Amaç, kodlama başlamadan önce eksik kalan tasarım artifact'larını görünür hale getirmek ve pre-code freeze kararını kontrollü hale getirmektir.

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
ui_implementation_allowed: false
provider_integration_allowed: false
current_gate: pre_code_freeze_review
```

Kodlama yalnızca bu checklist'teki gerekli artifact'lar tamamlandıktan, gözden geçirildikten ve ayrı bir design freeze kararı üretildikten sonra değerlendirilebilir.

## Freeze yaklaşımı

Pre-code freeze şu anlama gelir:

```text
Ürün ne yapacak belli.
Sistem hangi parçalardan oluşacak belli.
Agent'lar ne yapacak ve ne yapmayacak belli.
Contract ve schema sınırları belli.
Fixture ve evaluation tasarımı belli.
Tool/capability sınırları belli.
Memory/privacy sınırları belli.
UX akışı belli.
Koddan önce kalan borçlar görünür.
```

Pre-code freeze şu anlama gelmez:

```text
Kod yazmaya başladık.
Prototype başlattık.
Live provider bağladık.
UI geliştirdik.
Agent runtime kurduk.
Memory persist ettik.
```

## Gate 1 — Product and scope

Kontrol edilecek artifact'lar:

- ürün vizyonu,
- hedef kullanıcı,
- temel kullanım senaryosu,
- kapsam dışı alanlar,
- çocuklu aile odaklı planlama ilkeleri,
- düşük yorgunluk hedefi,
- alternatifli plan sunumu,
- kadınlar plajı / mahremiyet hassasiyeti yaklaşımı,
- trafik ve otopark dikkati,
- bütçe ve rota sınırları.

Karar:

```yaml
product_scope_ready_for_design_freeze: pending_review
```

## Gate 2 — System blueprint

Kontrol edilecek artifact'lar:

- sistem bileşenleri,
- orchestrator boundary,
- platform boundary,
- store boundary,
- agent boundary,
- tool gateway boundary,
- verification boundary,
- evaluation boundary,
- final response composition boundary.

Koddan önce cevaplanması gereken soru:

```text
Her sorumluluğun sahibi belli mi?
```

Karar:

```yaml
system_blueprint_ready_for_design_freeze: pending_review
```

## Gate 3 — Agent specifications

Kontrol edilecek artifact'lar:

- Trip Intake Agent spec,
- Constraint & Policy Agent spec,
- Family Suitability Agent spec,
- Destination Candidate Agent spec,
- Route & Logistics Agent spec,
- Accommodation Fit Agent spec,
- Activity Fit Agent spec,
- Day Plan Composer Agent spec,
- Verification & Evidence Agent spec,
- Final Response Composer Agent spec.

Her agent için zorunlu alanlar:

- purpose,
- scope,
- non-goals,
- ownership,
- upstream caller,
- downstream consumers,
- input contract,
- output contract,
- tool permissions,
- memory disclosure,
- evidence requirements,
- hard constraints,
- failure behavior,
- evaluation fixtures,
- observability events.

Karar:

```yaml
agent_specs_ready_for_design_freeze: not_ready
reason: "Agent spec dosyaları henüz tek tek üretilmedi."
```

## Gate 4 — Contracts and schemas

Kontrol edilecek artifact'lar:

- ACP envelope standard,
- agent request schema,
- agent response schema,
- error response schema,
- evidence envelope schema,
- verification result schema,
- confidence schema,
- constraint and policy result schema,
- candidate schema,
- lifecycle and status schema.

Koddan önce cevaplanması gereken soru:

```text
Agent çıktıları serbest metin değil, versioned contract olarak tanımlı mı?
```

Karar:

```yaml
contracts_ready_for_design_freeze: not_ready
reason: "Schema dosyaları henüz üretilmedi; yalnız workplan hazır."
```

## Gate 5 — Memory and privacy

Kontrol edilecek artifact'lar:

- canonical family memory boundary,
- session memory boundary,
- disclosure package standard,
- agent bazlı memory görünürlüğü,
- sensitive preference handling,
- memory update candidate standard,
- user consent flow,
- privacy redaction rules,
- memory audit event standard.

Zorunlu kural:

```text
Agent canonical memory'ye doğrudan erişemez.
Agent canonical memory'ye doğrudan yazamaz.
```

Karar:

```yaml
memory_privacy_ready_for_design_freeze: partial
reason: "Workplan hazır; somut disclosure schema ve privacy artifact'ları üretilecek."
```

## Gate 6 — Tools and capabilities

Kontrol edilecek artifact'lar:

- capability registry,
- capability request envelope,
- tool gateway boundary,
- provider adapter standard,
- mock provider strategy,
- freshness and cache policy,
- tool error mapping,
- tool evidence handoff,
- tool security policy.

Zorunlu kural:

```text
Agent provider çağırmaz.
Agent capability talep eder.
Tool Gateway provider adapter seçer.
Tool sonucu evidence envelope'a dönüşür.
```

Karar:

```yaml
tool_capability_ready_for_design_freeze: partial
reason: "Workplan hazır; registry ve mock provider artifact'ları üretilecek."
```

## Gate 7 — Evidence, verification and confidence

Kontrol edilecek artifact'lar:

- evidence envelope,
- source trust level,
- freshness policy,
- verification status,
- confidence vocabulary,
- conflict handling,
- stale data handling,
- unsupported claim handling,
- final response uncertainty rules.

Koddan önce cevaplanması gereken soru:

```text
Planın hangi parçası hangi kanıta dayanıyor izlenebilir mi?
```

Karar:

```yaml
evidence_verification_ready_for_design_freeze: not_ready
reason: "Evidence ve confidence schema dosyaları henüz üretilmedi."
```

## Gate 8 — Policy and hard constraints

Kontrol edilecek artifact'lar:

- hard constraint registry,
- constraint evaluation result schema,
- blocker reason standard,
- fallback policy,
- user-facing warning rules,
- child suitability rules,
- fatigue constraints,
- beach privacy suitability handling,
- safety and legal caution boundaries.

Zorunlu kural:

```text
Hard constraint skorla telafi edilemez.
```

Karar:

```yaml
policy_constraints_ready_for_design_freeze: partial
reason: "İlke net; registry ve result schema artifact'ları üretilecek."
```

## Gate 9 — Fixtures and evaluation

Kontrol edilecek artifact'lar:

- golden scenario list,
- fixture input package,
- fixture expected output package,
- mock provider data package,
- evaluation rubric,
- hard fail rules,
- regression policy,
- agent-level fixtures,
- orchestrator-level fixtures,
- final answer evaluation fixtures.

İlk golden scenario:

```yaml
golden_scenario_id: TM-GOLDEN-001
name: Kocaeli çıkışlı çocuklu aile kısa tatil planı
```

Karar:

```yaml
fixtures_evaluation_ready_for_design_freeze: partial
reason: "Golden scenario workplan hazır; fixture dosyaları henüz üretilmedi."
```

## Gate 10 — UI/UX flow

Kontrol edilecek artifact'lar:

- first request flow,
- missing information flow,
- constraint confirmation flow,
- plan preview flow,
- daily itinerary flow,
- alternative comparison flow,
- warning and uncertainty display,
- plan revision flow,
- evidence/source display,
- memory suggestion and consent flow.

Koddan önce cevaplanması gereken soru:

```text
Kullanıcı yalnızca sonucu değil, karar nedenlerini de anlayabiliyor mu?
```

Karar:

```yaml
ux_flow_ready_for_design_freeze: partial
reason: "Workplan hazır; somut UX flow artifact'ları üretilecek."
```

## Gate 11 — Observability and audit

Kontrol edilecek artifact'lar:

- run trace standard,
- step trace standard,
- agent event standard,
- tool event standard,
- memory disclosure event standard,
- policy gate event standard,
- error taxonomy mapping,
- redaction rules,
- audit event shape.

Koddan önce cevaplanması gereken soru:

```text
Hatalı bir plan neden üretildi, sonradan izlenebilir mi?
```

Karar:

```yaml
observability_audit_ready_for_design_freeze: not_ready
reason: "Observability ve audit artifact'ları ürün özelinde henüz tamamlanmadı."
```

## Gate 12 — Documentation source of truth

Kontrol edilecek artifact'lar:

- docs README source-of-truth map,
- architecture baseline links,
- generic handbook relationship,
- pre-implementation design package,
- future agent specification folder,
- future contract/schema folder,
- future fixture/evaluation folder.

Karar:

```yaml
documentation_source_of_truth_ready: partial
reason: "Ana harita var; yeni artifact klasörleri üretildikçe bağlanacak."
```

## Current freeze decision

Bu aşamadaki karar:

```yaml
pre_code_freeze_decision: not_ready
implementation_allowed: false
prototype_allowed: false
reason: "Pre-implementation workplan tamamlandı; ancak agent specs, schemas, fixtures, registry, disclosure packages ve UX artifacts henüz tek tek üretilmedi."
```

## Allowed next work

Bu checklist sonrası izin verilen işler:

- agent specification dosyalarını üretmek,
- contract/schema artifact'larını üretmek,
- fixture/golden scenario dosyalarını üretmek,
- capability registry ve mock provider artifact'larını üretmek,
- memory disclosure package artifact'larını üretmek,
- UX flow artifact'larını üretmek,
- observability/audit artifact'larını üretmek,
- pre-code freeze kararını tekrar değerlendirmek.

## Blocked work

Bu checklist sonrası hâlâ yasak olan işler:

- application coding,
- agent runtime implementation,
- frontend implementation,
- backend implementation,
- live provider integration,
- persistent memory implementation,
- automated test implementation,
- production deployment,
- booking/payment/availability integration.

## Next design stage

Bir sonraki aşama artık workplan yazmak değil, workplan'ların işaret ettiği gerçek artifact'ları üretmektir.

Önerilen sıradaki artifact seti:

```text
docs/11-agent-specifications/
├─ README.md
├─ trip-intake-agent.md
├─ constraint-policy-agent.md
└─ family-suitability-agent.md
```

İlk somut agent spec:

```text
docs/11-agent-specifications/trip-intake-agent.md
```

## Final checklist

Pre-code freeze için cevaplanması gereken son sorular:

- Ürün kapsamı net mi?
- Sistem blueprint'i eksiksiz mi?
- İlk-phase agent spec'leri yazıldı mı?
- Agent non-goal'ları açık mı?
- Contract/schema dosyaları üretildi mi?
- Evidence/confidence şemaları üretildi mi?
- Hard constraint registry hazır mı?
- Fixture paketleri hazır mı?
- Golden scenario beklenen çıktıları hazır mı?
- Capability registry hazır mı?
- Mock provider artifact'ları hazır mı?
- Memory disclosure package hazır mı?
- Privacy/onay kuralları hazır mı?
- UX flow artifact'ları hazır mı?
- Observability/audit artifact'ları hazır mı?
- Source-of-truth haritası güncel mi?
- Kod hâlâ kapalı mı?

Bu soruların tamamına evet demeden kodlama başlamaz.
