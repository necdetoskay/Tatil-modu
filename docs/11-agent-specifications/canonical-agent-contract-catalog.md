# Tatil Modu — Canonical Agent Contract Catalog

| Alan | Değer |
|---|---|
| Document ID | TM-AG-CATALOG-001 |
| Sürüm | **1.1** |
| Durum | **CANONICAL / RECONCILED WITH 17 GOLDEN PACKAGES** |
| Son güncelleme | 2026-08-27 |
| Source of truth | `docs/11-agent-specifications/canonical-agent-contract-catalog.md` |
| Package status | `docs/11-agent-specifications/README.md` |
| Harness baseline | `docs/15-harness-and-orchestration/02-agent-contract-harness-baseline.md` |
| Tool kataloğu | `docs/04-tools/tool-catalog.md` |
| Kaynak güven politikası | `docs/01-architecture/data-source-trust-policy.md` |

## 1. Amaç

Bu belge Tatil Modu uygulamasındaki **16 specialist agent + Travel Orchestrator** setinin kanonik ownership ve üst-seviye davranış sözleşmesini tanımlar.

Her agent için burada sabitlenenler:
- görev/sorumluluk sınırı,
- ana input/output domain objeleri,
- tool sınıfları,
- source/authority envelope,
- yasak davranışlar,
- temel invariant ve PASS/FAIL oracle'ları.

Field-level schema, detailed rule, fixture, context ve provenance sözleşmeleri ilgili golden package altında kanoniktir.

## 2. Source-of-truth hiyerarşisi

```text
1. canonical-agent-contract-catalog.md
   → agent seti + ownership + high-level authority

2. <agent>/input.schema.json + output.schema.json
   → field-level data contract

3. <agent>/authority/tool/source/decision/handoff policies
   → operational envelope

4. <agent>/tests/fixture-pack.v1.json
   → replayable behavioral oracle

5. README.md
   → package completion/readiness state
```

Eski first-phase tekil `.md` spec'ler tarihsel referanstır; ownership kaynağı değildir.

Bazı golden `specification.md` dosyalarının eski `Current status` bloklarında `pending` ifadesi kalmış olabilir. **Package completion state için yalnız README kanoniktir**; bu lokal metadata runtime/implementation readiness kararı vermez.

## 3. Ana mimari ilkeler

1. **Contract before code.**
2. **Structured/versioned handoff.**
3. **Tool-first current facts.**
4. **Authority envelope.**
5. **Deterministic before LLM.**
6. **No silent degradation.**
7. **No invented facts.**
8. **Targeted repair.**
9. **Evidence/provenance required.**
10. **Context lifecycle is first-class.**
11. **Harness quality is evaluated separately from model quality.**
12. **Orchestrator coordinates; specialists decide.**
13. **Verified state only.** Durable canonical trip state Verification PASS olmadan ilerlemez.
14. **Knowledge-first does not mean freshness bypass.**
15. **Recurring knowledge is not exact occurrence.**

## 4. Ortak domain objeleri

### 4.1 Core request/policy

| Obje | Amaç |
|---|---|
| `TripRequest` | Kullanıcının ham seyahat isteği |
| `TravelerProfile` | Yolcu/yaş/ulaşım bağlamı |
| `PreferenceSet` | Soft tercihlerin normalize hali |
| `ConstraintSet` | HARD/SOFT/CONDITIONAL_HARD kısıtlar |
| `ExceptionPolicySet` | Soft hedeflerden kontrollü sapma koşulları |
| `PreferencePolicyOutput` | TM-AG-002 üst-seviye handoff'u |

### 4.2 Destination/place/stay/food

| Obje | Amaç |
|---|---|
| `DestinationBrief` / `DestinationBriefSet` | Bölge/şehir travel intelligence |
| `PlaceCandidate` / `PlaceCandidateSet` | POI/aktivite adayları + eligibility |
| `AccommodationCandidate` / `AccommodationCandidateSet` | Konaklama adayı + query/price/availability provenance |
| `FoodCandidate` | İşletme bazlı yemek adayı |
| `LocalTasteBrief` | Bölgesel/yöresel gastronomi bilgisi; venue current-menu fact değildir |
| `FoodAndLocalTasteResult` | TM-AG-006 üst-seviye output |

### 4.3 Weather/transport/journey

| Obje | Amaç |
|---|---|
| `WeatherSignal` / `WeatherSignalSet` | FORECAST veya CLIMATE_NORMAL kaynaklı risk/suitability sinyali |
| `RouteLeg` / `RouteMatrix` | Provider-backed ulaşım gerçeği |
| `CorridorCityCandidate` | Route corridor lojistik adayı; tourism value değildir |
| `TransportationResult` | Route legs/matrix/corridor output |
| `JourneyPlan` | Issue #49 çok şehirli yolculuk planı |
| `JourneySegment` | Şehirlerarası segment + stop role + selection provenance |
| `DailyPlan` | Bir günlük gerçek zaman çizelgesi |
| `DraftItinerary` | JourneyPlan + DailyPlan + alternatives/rejections/verification needs |

### 4.4 Budget/evidence/intelligence

| Obje | Amaç |
|---|---|
| `BudgetLedger` | known/projected/unknown maliyet ve limit değerlendirmesi |
| `OfficialFact` | `VERIFIED|CONTRADICTED|UNKNOWN` claim-specific resmî doğrulama |
| `ReviewSignal` | Aggregate experiential theme |
| `ReviewSignalSet` | Sample/window/snapshot lineage taşıyan review intelligence output |
| `Evidence` | Source/provenance kaydı |
| `AgentTrace` / `DecisionTrace` / `ToolCallTrace` | Sistem-level observable provenance; hidden CoT değildir |

### 4.5 Repair/verification/rendering

| Obje | Amaç |
|---|---|
| `AdaptiveRepairResult` | Targeted repair impact/patch/preservation/trigger resolution |
| `VerificationResult` | Gated `PASS|REPAIR|FAIL` |
| `ExplanationBundle` | Verified fact subsetinden grounded rationale |
| `FinalTravelPlan` | Verified yapıların kullanıcıya render edilmiş hali |
| `OrchestrationResult` | Graph/node/handoff/retry/repair/state-gate workflow trace |

### 4.6 Issue #50 background knowledge

Bunlar runtime specialist ownership setinin dışında ayrı background subsystem tarafından üretilebilir/korunabilir:

| Obje | Amaç |
|---|---|
| `TrustedSourceRegistryEntry` | Bir il/entity/claim ailesi için güvenilir lookup yolu |
| `ReviewInsightSnapshot` | Derived review signal snapshot |
| `LocalProductKnowledge` | Şehirle özdeş ürün/eşya/alışveriş bilgisi |
| `TravelKnowledgeRecord` | Volatility/freshness/evidence-aware kalıcı travel knowledge |
| `KnowledgeCoverageState` | İl/alan bazında coverage ve refresh önceliği |

Background knowledge current dynamic fact yerine geçmez.

### 4.7 Issue #51 event/season

| Obje | Amaç |
|---|---|
| `RecurringEventKnowledge` | Festival/etkinliğin kalıcı kimliği ve tipik takvimi |
| `EventOccurrence` | Belirli yıl/tarih için confirmed/cancelled/postponed occurrence |
| `SeasonalSuitabilitySignal` | Activity-specific mevsim uygunluğu |
| `EventImpactSignal` | Crowd/traffic/parking/accommodation ve SEEK/AVOID plan bias |

`RecurringEventKnowledge != EventOccurrence`.

## 5. Shared semantic states

### 5.1 Monetary status

```text
LIVE
OFFICIAL
ESTIMATED
UNKNOWN
```

`UNKNOWN != 0`.

### 5.2 Verification

```text
PASS
REPAIR
FAIL
```

### 5.3 Official fact

```text
VERIFIED
CONTRADICTED
UNKNOWN
```

`UNKNOWN` epistemik olarak geçerli sonuçtur.

### 5.4 Journey stop role — Issue #49

```text
PASS_THROUGH
SHORT_STOP
HALF_DAY
FULL_DAY
OVERNIGHT_ONLY
OVERNIGHT_AND_DAY
MULTI_DAY
FINAL_DESTINATION
```

### 5.5 Event preference — Issue #51

```text
SEEK
AVOID
NEUTRAL
UNKNOWN
```

## 6. Evidence/source trust

Kaynak tiers:
- Tier 1 primary/official/data-owner
- Tier 2 authorized structured provider
- Tier 3 experiential/review platform
- Tier 4 discovery/general web

Critical current facts Tier 4 ile kesinleştirilemez.

Authority **claim-specific**tir; provider genel ünü claim authority yerine geçmez.

Evidence en az source identity, retrievedAt, claim/scope, freshness ve confidence/authority ilişkisi taşımalıdır.

## 7. Tool sınıfları

- `TL-001` Web Search
- `TL-002` Official Page Fetcher
- `TL-003` Geocoding
- `TL-004` Place Search
- `TL-005` Directions & Distance Matrix
- `TL-006` Weather Forecast
- `TL-007` Climate Normals
- `TL-008` Accommodation Search
- `TL-009` Review Data Provider
- `TL-010` Price & Fee Lookup
- `TL-011` Calculator
- `TL-012` Schema Validator
- `TL-013` Rule Engine
- `TL-014` Cache

Concrete provider seçimi adapter kararıdır; agent contract değildir. Weather provider henüz sabitlenmemiştir.

## 8. Kanonik agent seti

### TM-AG-001 — Profile Agent

**Mission:** TripRequest → `TravelerProfile`.  
**Allowed tools:** TL-012 yalnız validation.  
**Authority:** explicit kullanıcı/profile fact extraction/normalization.  
**Forbidden:** external research, preference/policy üretimi, POI/otel/route önerisi.  
**Invariant:** unknown stays unknown.

### TM-AG-002 — Preference & Policy Agent

**Mission:** TripRequest + profile → `PreferencePolicyOutput` (`PreferenceSet + ConstraintSet + ExceptionPolicySet`).  
**Allowed tools:** TL-012, TL-013.  
**Authority:** hard/soft/conditional policy classification.  
**Forbidden:** discovery ve hard→soft downgrade.  
**Key:** kadınlar plajı gibi koşullu zorunluluklar `CONDITIONAL_HARD`; “tercihen 150 km, çok iyiyse aşılabilir” soft + ExceptionPolicy'dir. Issue #51 event/crowd preference burada normalize edilir.

### TM-AG-003 — Destination Research Agent

**Mission:** city/region-level intelligence → `DestinationBriefSet`.  
**Allowed tools:** TL-001, TL-002, TL-003, TL-007, TL-014.  
**Authority:** region discovery/value/season context.  
**Forbidden:** POI discovery, route duration, daily itinerary.  
**Issue #49:** corridor city tourism value burada; corridor relation TM-AG-008'de.  
**Issue #50/#51:** knowledge/event/season context current-fact bypass edemez.

### TM-AG-004 — Place Intelligence Agent

**Mission:** place discovery/enrichment → `PlaceCandidateSet`.  
**Allowed tools:** TL-004, TL-002, TL-001, TL-003, TL-010, TL-014.  
**Authority:** stable identity, operational fields, hard eligibility, family-fit signal.  
**Forbidden:** route scheduling/reservation.  
**Invariant:** hard eligibility family-fit/rating'den önce.

### TM-AG-005 — Accommodation Agent

**Mission:** date/occupancy/location-aware stay candidates → `AccommodationCandidateSet`.  
**Allowed tools:** TL-008, TL-004, TL-002, TL-009, TL-011, TL-014.  
**Authority:** stay discovery/ranking.  
**Forbidden:** fake live availability/price, booking/payment.  
**Invariant:** live price binds exact query signature. Issue #49 `journeySegmentRef` korunur.

### TM-AG-006 — Food & Local Taste Agent

**Mission:** venue food candidates + regional gastronomy knowledge → `FoodAndLocalTasteResult`.  
**Allowed tools:** TL-004, TL-002, TL-001, TL-009, TL-010, TL-014.  
**Authority:** FoodCandidate eligibility/ranking + LocalTasteBrief.  
**Forbidden:** route mutation; regional taste knowledge'dan venue current-menu fact çıkarımı.  
**Issue #50:** yöresel lezzet background knowledge kullanılabilir, dynamic venue claims refresh ister.

### TM-AG-007 — Weather Agent

**Mission:** `WeatherSignalSet`.  
**Allowed tools:** TL-006, TL-007, TL-014.  
**Authority:** weather/climate risk/plan-bias signal.  
**Forbidden:** itinerary mutation.  
**Invariant:** `FORECAST != CLIMATE_NORMAL`; provider horizon adapter metadata'sından gelir.

### TM-AG-008 — Transportation Agent

**Mission:** `TransportationResult` = route facts/matrix + Issue #49 corridor logistics.  
**Allowed tools:** TL-005, TL-003, TL-014.  
**Authority:** route distance/duration/traffic/corridor relation/detour.  
**Forbidden:** stop tourism value veya day scheduling.  
**Invariant:** straight-line distance route duration değildir.

### TM-AG-009 — Route Planner Agent

**Mission:** verified candidates/facts → `DraftItinerary` (`JourneyPlan + DailyPlan`).  
**Allowed tools:** TL-005, TL-011, TL-012, TL-013, TL-014.  
**Authority:** timing/order/stop role scheduling and feasible alternatives.  
**Forbidden:** new POI discovery, hard constraint as score, total budget ownership.  
**Invariant:** hard feasibility before semantic optimization; user-fixed selection origin preserved.

### TM-AG-010 — Budget Agent

**Mission:** selected itinerary costs → `BudgetLedger`.  
**Allowed tools:** TL-010, TL-011, TL-012, TL-013, TL-014.  
**Authority:** deterministic ledger/budget status.  
**Forbidden:** alternative place/route selection.  
**Invariants:** `UNKNOWN != 0`; dedupe; mixed currency needs evidence; critical unknown exposure explicit.  
**Issue #50:** `SHOPPING` category supports local-product plans, but product knowledge is not current price.

### TM-AG-011 — Public Authority Intelligence Agent

**Mission:** claim-specific official verification → `OfficialFact`.  
**Allowed tools:** TL-001, TL-002, TL-010, TL-014; TL-012 harness validation.  
**Authority:** `VERIFIED|CONTRADICTED|UNKNOWN`.  
**Forbidden:** review experience/ranking/planning.  
**Issue #50:** Trusted Source Registry first; registry entry is lookup metadata, not fact evidence.  
**Issue #51:** exact occurrence/seasonal closure/status verification.

### TM-AG-012 — Review Intelligence Agent

**Mission:** normalized reviews → `ReviewSignalSet`.  
**Allowed tools:** TL-009, TL-011, TL-014; TL-012 harness validation.  
**Authority:** aggregate experiential themes/prevalence/confidence.  
**Forbidden:** official fact.  
**Invariant:** single review high-confidence general fact olamaz; dedupe/spam hygiene deterministic.  
**Issue #50:** snapshot lineage + targeted refresh; raw review retention license-aware.

### TM-AG-013 — Adaptive Itinerary Agent

**Mission:** verified change → `AdaptiveRepairResult`.  
**Allowed tools:** TL-004, TL-005, TL-006, TL-010, TL-011, TL-012, TL-013, TL-014 only within repair scope.  
**Authority:** targeted affected-scope mutation.  
**Forbidden:** default full regeneration, user-fixed silent deletion, hard relaxation.  
**Invariant:** impact scope + patch + preservation proof + trigger resolution + mandatory Verification recheck.  
**Issue #49/#50/#51:** segment-aware repair, knowledge-first replacement, event/weather/season targeted triggers.

### TM-AG-014 — Verification Agent

**Mission:** candidate snapshot → `VerificationResult`.  
**Primary tools:** TL-012, TL-013, TL-011; narrow owner-aligned read-only recheck only by explicit policy.  
**Authority:** G0–G10 gates and actionable `PASS|REPAIR|FAIL`.  
**Forbidden:** new candidate or itinerary mutation.  
**Invariant:** zero blocking findings for PASS; deterministic failures semantic judge ile override edilemez; verified snapshot hash bound.

### TM-AG-015 — Explanation Agent

**Mission:** Verification PASS snapshot → `ExplanationBundle`.  
**Allowed tools:** TL-012 / deterministic claim-support validator only.  
**Authority:** grounded rationale rendering.  
**Forbidden:** new fact/decision/candidate.  
**Invariant:** `facts(explanation) ⊆ verified facts`; uncertainty cannot increase; generation/model/prompt lineage retained.

### TM-AG-016 — Final Composer Agent

**Mission:** verified structures + ExplanationBundle → `FinalTravelPlan`.  
**Allowed tools:** TL-012 / deterministic render-binding validator only.  
**Authority:** presentation.  
**Forbidden:** research/planning/new alternatives/value changes/warning suppression.  
**Invariant:** unsupported entity/claim, changed verified value, missing mandatory warning counts all zero.

## 9. TM-ORCH-001 — Travel Orchestrator

**Mission:** TripRequest/workflow state → `OrchestrationResult`.  
**Direct tools:** TL-012 and TL-014 orchestration metadata only.  
**Authority:** registry resolution, capability graph, node selection, context/handoff validation, bounded retry/repair, quota guard, failure routing, VerifiedStateGate.  
**Forbidden:** all specialist domain decisions and direct domain tools.  
**Invariant:** `Orchestrator → Specialist → ToolGateway → Tool`; every graph mutation revisioned; every node attempt context/contract-bound; Verification PASS + matching snapshot required for durable state commit.  
**Harness provenance:** `harnessPolicySnapshotId` required.  
**Handoff provenance:** producer/consumer agent + object type/version/hash required.

## 10. Authority matrix

| Component | Research | Domain decision | Itinerary mutation | Final prose |
|---|---:|---:|---:|---:|
| Profile | No | Profile | No | No |
| Preference & Policy | No | Constraint | No | No |
| Destination Research | Yes | Region | No | No |
| Place Intelligence | Yes | Place eligibility | No | No |
| Accommodation | Yes | Stay candidate | No | No |
| Food & Local Taste | Yes | Food/taste | No | No |
| Weather | Yes | Weather signal | No | No |
| Transportation | Yes | Route fact | No | No |
| Route Planner | Limited | Time/order | Draft plan | No |
| Budget | Limited | Budget | No | No |
| Public Authority | Yes | OfficialFact | No | No |
| Review Intelligence | Yes | ReviewSignal | No | No |
| Adaptive Itinerary | Scope-limited | Repair | **Targeted** | No |
| Verification | Recheck-limited | PASS/REPAIR/FAIL | No | No |
| Explanation | No | No | No | Explanation only |
| Final Composer | No | No | No | Yes |
| Orchestrator | **No domain research** | Workflow only | Routing only | No |

## 11. Runtime execution graph

Base path:

```text
TripRequest
→ TM-AG-001 Profile
→ TM-AG-002 Preference & Policy
→ TM-AG-003 Destination Research
→ parallel/conditional TM-AG-004 / 005 / 006 / 007 / 011 / 012
→ TM-AG-008 Transportation
→ TM-AG-009 Route Planner
→ TM-AG-010 Budget
→ TM-AG-014 Verification
   ├─ REPAIR → owner rechecks → TM-AG-013 → affected rechecks → TM-AG-014
   ├─ FAIL   → BLOCK/FAIL workflow
   └─ PASS   → TM-AG-015 → TM-AG-016
```

Issue #49 corridor enrichment, Issue #50 knowledge routing ve Issue #51 event/season capabilities conditional graph revisions/node selections olarak TM-ORCH-001 tarafından aktive edilir.

## 12. Issue #49 canonical journey ownership

```text
TM-AG-008  → corridor logistics / detour facts
TM-AG-003  → corridor-city tourism value
User/TM-AG-002 → stop preferences/constraints
TM-AG-004/005/006 → selected-stop enrichment
TM-AG-008  → selected sequence route recalculation
TM-AG-009  → stop role + JourneyPlan/DailyPlan scheduling
TM-AG-013  → targeted journey repair
TM-AG-014  → journey verification
```

No single agent owns all multi-city logic.

## 13. Issue #50 canonical knowledge ownership

Background subsystem proposal remains separate runtime lifecycle:
- `TM-BG-001 Background Travel Knowledge Curator`
- `TM-KS-001 Travel Knowledge Store`
- `TM-SR-001 Trusted Travel Source Registry`
- `TM-KQ-001 Knowledge Quality/Coverage Scheduler`

These are backlog subsystem IDs, **not additional runtime TM-AG specialist agents yet**.

Knowledge may precompute stable/yavaş değişen:
- historical/cultural places,
- local tastes,
- local products,
- trusted sources,
- recurring review patterns,
- recurring event identity/typical season.

Runtime critical V2/V3 facts retain owner verification/freshness gates.

## 14. Issue #51 event/season ownership

```text
TM-AG-002 → SEEK/AVOID/NEUTRAL + crowd/season preference
TM-AG-003/004 → seasonal destination/place suitability context
TM-AG-007 → climate/forecast weather distinction
TM-AG-011 → exact event occurrence/official seasonal status
TM-AG-012 → experiential crowd/queue/parking patterns
TM-AG-008 → current route/traffic logistics
TM-AG-009 → date-aware event/season scheduling
TM-AG-013 → cancellation/postponement/crowd targeted repair
TM-AG-014 → recurring-vs-occurrence and seasonal consistency gate
```

Yeni `Event Intelligence Agent` ancak ayrı contract/tool/lifecycle ihtiyacı kanıtlanırsa eklenir.

## 15. Common RIVE/harness ladder

| Seviye | Amaç |
|---|---|
| R0 | Contract/schema/registry |
| R1 | Deterministic invariants |
| R2 | Fixture/replay |
| R3 | Tool adapter integration |
| R4 | Semantic quality |
| R5 | Adversarial/missing/conflicting/stale |
| R6 | Authority/tool/context leakage |
| R7 | Controlled live |
| R8 | Regression |

Semantic evaluator hiçbir R0/R1/R6 hard failure'ı override edemez.

## 16. System provenance

Every run/attempt must be traceable to:
- agent ID + contract version/hash,
- ContextManifest ref/hash,
- model/prompt/runtime refs where applicable,
- tool calls/evidence refs,
- policy/evaluator refs,
- upstream/downstream object refs/hashes,
- graph revision/retry/repair lineage,
- verification/state-commit refs.

Hidden chain-of-thought is not required or stored; DecisionTrace contains observable input refs, applied rule refs, selections/rejections and reason codes.

## 17. Legacy reconciliation

Historical first-phase files remain for design history:

| Önceki spec | Current ownership |
|---|---|
| `trip-intake-agent.md` | TM-AG-001 |
| `constraint-policy-agent.md` | TM-AG-002 |
| `family-suitability-agent.md` | TM-AG-001 + 002 + 004 |
| `destination-candidate-agent.md` | TM-AG-003 |
| `route-logistics-agent.md` | TM-AG-008 + 009 |
| `accommodation-fit-agent.md` | TM-AG-005 |
| `activity-fit-agent.md` | TM-AG-004 |
| `day-plan-composer-agent.md` | TM-AG-009 + 013 |
| `verification-evidence-agent.md` | TM-AG-011 + 014 |
| `final-response-composer-agent.md` | TM-AG-015 + 016 |

Conflict halinde v1.1 catalog + golden packages kazanır.

## 18. New-agent gate

Yeni agent ancak:
- bağımsız ownership,
- ayrı structured contract,
- ayrı tool/authority lifecycle,
- bağımsız fixture suite,
- ayrı quality/confidence semantics
kanıtlanırsa eklenebilir.

Background worker veya capability her zaman runtime specialist agent olmak zorunda değildir.

## 19. Current freeze state

```yaml
catalog_version: 1.1
canonical_agent_count: 16
canonical_orchestrator_count: 1
golden_packages_ready: 17/17
journey_issue_49_integrated: true
knowledge_issue_50_integrated_as_backlog_subsystem_contract_input: true
event_season_issue_51_integrated_as_backlog_capability_input: true
cross_contract_reconciliation: PASS
m1_harness_entry_allowed: true
runtime_implementation_allowed: false
```
