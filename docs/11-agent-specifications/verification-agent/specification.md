# TM-AG-014 — Verification Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-014 |
| Sürüm | 1.0 |
| Durum | GOLDEN PACKAGE V1 READY |
| Tarih | 2026-08-27 |

## 1. Purpose

Verification Agent, itinerary ve seçili upstream çıktılar üzerinde **schema + authority + hard constraint + time/route + evidence/freshness + budget + provenance** kalite kapılarını çalıştırır.

```text
candidate final pipeline snapshot
→ deterministic gates first
→ narrow semantic gates only where necessary
→ classify findings
→ PASS | REPAIR | FAIL
→ VerificationResult
```

Verification Agent plan üretmez; planın kabul edilip edilemeyeceğine karar verir.

## 2. Status semantics

### PASS
- blocking gate failure yok,
- hard constraint violation yok,
- gerekli kritik evidence/freshness yeterli,
- itinerary deterministic feasibility geçerli,
- authority/provenance ihlali yok.

### REPAIR
- plan hedefli olarak onarılabilir,
- failure target/dependency refs ile lokalize edilebilir,
- actionable `repairTargets[]` üretilebilir.

### FAIL
- structural/authority/schema/provenance integrity problemi güvenli targeted repair'e indirgenemiyor,
- current snapshot ilerlememelidir.

## 3. Inputs

- itinerary snapshot
- selected candidate eligibility refs
- routes
- WeatherSignalSet
- BudgetLedger
- OfficialFact set
- ReviewSignalSet where used
- constraints/policy snapshots
- optional AdaptiveRepairResult
- AgentTrace + ToolCall traces
- evidence refs
- Issue #51 EventOccurrence / EventImpact / SeasonalSuitability refs where used
- `contextManifestId`

## 4. Output

Ana çıktı: `VerificationResult.v1`.

```yaml
verificationRunId: string
verifiedSnapshotRef: string
verifiedSnapshotHash: string
policySnapshotRefs: []
evaluatorRefs: []
status: PASS | REPAIR | FAIL
gates: VerificationGateResult[]
blockingFindings: []
nonBlockingFindings: []
repairTargets: []
evidenceCoverage: object
authoritySummary: object
provenanceSummary: object
requiredRechecks: []
confidence: 0..1
```

`policySnapshotRefs` exact verification/rule/policy context'ini, `evaluatorRefs` ise G10 semantic evaluation kullanıldıysa evaluator/model/prompt lineage'ını taşır.

## 5. Gate order

```text
G0 schema/contracts
G1 snapshot/context/provenance integrity
G2 authority/tool-policy integrity
G3 hard constraints / eligibility
G4 itinerary time graph / block overlap
G5 route/travel feasibility
G6 operational facts + freshness
G7 weather/event/seasonal consistency
G8 budget ledger / hard budget
G9 evidence coverage/conflicts
G10 semantic quality checks
```

G10 hiçbir G0–G9 blocking failure'ını override edemez.

## 6. Gate result

```yaml
gateId: string
gateFamily: string
method: DETERMINISTIC | SEMANTIC | READONLY_RECHECK
status: PASS | FAIL | REPAIR | SKIP
severity: BLOCKING | NON_BLOCKING
subjectRefs: []
ruleRefs: []
evidenceRefs: []
findingCodes: []
```

## 7. Schema/handoff integrity

- all required schemas valid,
- schema versions/snapshot refs traceable,
- no broken critical cross-object refs,
- repaired snapshot AdaptiveRepairResult lineage taşımalı.

Critical schema-invalid handoff cannot PASS.

## 8. Authority integrity

Examples:
- Profile web searched → blocking authority finding.
- Orchestrator directly called Places/Routes/Weather → blocking authority finding.
- Final Composer added new place → FAIL.
- Adaptive changed unrelated day without proof → blocking finding.

Authority violation semantic quality değildir.

## 9. Hard constraints

Applicable HARD / CONDITIONAL_HARD constraint violation → PASS impossible.

Hard-critical claim unresolved ise optimistic PASS yasaktır; REPAIR/recheck veya FAIL gerekir.

## 10. Time/route feasibility

Deterministic:
- block overlap,
- transition + buffer,
- opening window,
- check-in/out,
- final arrival deadline,
- journey order,
- user-fixed stop preservation,
- route provenance.

Straight-line distance route-duration evidence değildir.

## 11. Evidence/freshness

Current critical facts matching evidence/freshness ister:
- opening hours,
- event occurrence/status,
- weather,
- accommodation availability/price when asserted,
- seasonal closure,
- route/traffic,
- women-only beach status when conditional hard rule applies.

Issue #50 precomputed knowledge current-critical gate'i otomatik geçirmez.

## 12. Official vs experiential

```text
OfficialFact → operational/policy fact
ReviewSignal → experiential pattern
```

ReviewSignal required OfficialFact gate'ini karşılayamaz.

## 13. Issue #49 multi-city checks

- every JourneySegment route ref exists,
- overnight stay valid where required,
- stop role/time/day relation coherent,
- user-fixed provenance preserved,
- final-arrival deadline satisfied,
- route chain feasible.

## 14. Issue #51 seasonal/event checks

- recurring event knowledge != exact-year occurrence,
- exact event block adequate current occurrence evidence ister,
- cancelled event active kalamaz,
- seasonal closure ignore edilemez,
- climate normal exact forecast değildir,
- SEEK/AVOID event policy data material ise tutarlı uygulanmalı.

## 15. Budget checks

- arithmetic reproducible,
- UNKNOWN != 0,
- duplicate dedupeKey double-count yok,
- hard over-budget cannot PASS,
- critical unknown exposure policy'ye göre PASS'i engeller,
- mixed currency conversion evidence ister.

## 16. Adaptive repair checks

AdaptiveRepairResult varsa:
- patch justified scope içinde,
- `triggerResolutions[]` complete,
- preservation hashes equal,
- scope escalation justified,
- mandatory rechecks complete,
- repaired fragment shared route-planner feasibility kurallarını geçer.

Adaptive `REPAIRED` tek başına state advancement değildir.

## 17. Evidence coverage

Coverage claim-family bazında deterministic hesaplanır:

```yaml
criticalClaimsTotal: integer
criticalClaimsVerified: integer
criticalClaimsUnknown: integer
criticalClaimsConflicting: integer
officialCoverage: 0..1
routeCoverage: 0..1
weatherCoverage: 0..1
priceCoverage: 0..1
provenanceCoverage: 0..1
```

## 18. Repair target

```yaml
repairTargetId: string
reasonCode: string
targetRefs: []
dependencyRefs: []
requiredOwner: string
requiredEvidenceTypes: []
severity: BLOCKING | NON_BLOCKING
```

Verification repair yapmaz; target üretir.

## 19. Reverification policy

Base pass external-world domain search yapmaz.

```text
Verification requiredRecheck
→ Orchestrator
→ owning specialist
→ refreshed evidence
→ new Verification run
```

Controlled direct read-only recheck yalnız explicit policy/mode ile tek existing claim scope'unda kullanılabilir; discovery/ranking yasaktır.

## 20. Allowed tools

Primary:
- `TL-012` Schema Validator
- `TL-013` Rule Engine
- `TL-011` Calculator

Optional controlled read-only existing-claim recheck only.

## 21. Forbidden behavior

- candidate generation,
- itinerary mutation,
- hard constraint relaxation,
- final prose,
- semantic override of deterministic fail,
- confidence replacing evidence,
- unsupported PASS.

## 22. Semantic evaluator provenance

G10 kullanılırsa `evaluatorRefs[]` empty olamaz. Model/prompt/rubric version lineage harness trace ile yeniden üretilebilir olmalıdır.

G10 SKIP ise evaluatorRefs boş olabilir.

## 23. Failure modes

- `HARD_VIOLATION_FALSE_PASS`
- `SCHEMA_INVALID_FALSE_PASS`
- `AUTHORITY_VIOLATION_IGNORED`
- `STALE_CRITICAL_FACT_FALSE_PASS`
- `REVIEW_AS_OFFICIAL_EVIDENCE`
- `CLIMATE_AS_FORECAST`
- `EVENT_MEMORY_AS_OCCURRENCE`
- `ROUTE_EVIDENCE_MISSING`
- `BUDGET_UNKNOWN_AS_ZERO`
- `ADAPTIVE_OVER_REPAIR_ACCEPTED`
- `SEMANTIC_OVERRIDE_OF_DETERMINISTIC_FAIL`
- `REPAIR_TARGET_NOT_ACTIONABLE`
- `MISSING_VERIFICATION_PROVENANCE`
- `MISSING_EVALUATOR_LINEAGE`

## 24. Harness binding

- R0 VerificationResult schema
- R1 all deterministic gates
- R2 recorded full-pipeline fixtures
- R3 schema/rule/calculator/recheck integration
- R4 limited semantic gate quality
- R5 conflicting/stale/missing/authority/provenance adversarial cases
- R6 reviewer authority leakage/new-candidate generation
- R7 controlled live final verification
- R8 false-pass/false-repair regressions

## 25. Current status

```yaml
agent_spec_status: golden_v1_ready
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
journey_issue_49_required: true
knowledge_issue_50_freshness_required: true
event_season_issue_51_required: true
verification_policy_lineage_required: true
semantic_evaluator_lineage_required_when_used: true
```
