# TM-AG-014 — Verification Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-014 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
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
- plan genel olarak onarılabilir,
- failure hedefli ref/dependency closure ile düzeltilebilir,
- `repairTargets[]` üretilebilir.

### FAIL
- structural/unsafe/irrecoverable veya authority-integrity problemi,
- planın mevcut snapshot'ı güvenle repair target'a indirgenemiyor,
- schema/provenance bütünlüğü ciddi biçimde kayıp,
- sistem planı kabul etmemelidir.

## 3. Inputs

- itinerary snapshot / DraftItinerary or repaired candidate
- selected Place/Accommodation/Food candidate refs and eligibility records
- TransportationResult / route facts
- WeatherSignalSet
- BudgetLedger
- OfficialFact set
- ReviewSignalSet where plan decisions use experiential signals
- current constraints/policy snapshots
- optional AdaptiveRepairResult
- AgentTrace + ToolCall traces
- evidence registry/package refs
- Issue #51 EventOccurrence / EventImpact / SeasonalSuitability refs where used
- `contextManifestId`

## 4. Output

Ana çıktı: `VerificationResult.v1`.

```yaml
verificationRunId: string
verifiedSnapshotRef: string
verifiedSnapshotHash: string
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

## 5. Gate order

Verification deterministic-before-LLM sırasını kullanır:

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
G10 semantic quality checks (only non-deterministic remainder)
```

Üst gate failure alt semantic score ile telafi edilemez.

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

## 7. Schema and handoff integrity

- all required schemas valid,
- schema versions/snapshot refs traceable,
- no downstream object references missing upstream refs,
- repaired snapshot must reference AdaptiveRepairResult if repair path used.

Schema-invalid critical handoff cannot PASS.

## 8. Authority integrity

Agent/tool authority traces are verified.

Examples:
- Profile web searched → authority FAIL.
- Orchestrator directly called Places/Routes/Weather → authority FAIL.
- Final Composer added new place → FAIL.
- Adaptive changed unrelated day without scope proof → FAIL/REPAIR depending integrity.

Authority violation is not a semantic quality issue.

## 9. Hard constraints

All applicable HARD / CONDITIONAL_HARD constraints must resolve to satisfied or safely blocked-before-final.

Hard violation in accepted itinerary → cannot PASS.

Unknown hard-critical claim generally produces REPAIR/recheck, not optimistic PASS.

## 10. Time/route feasibility

Deterministic checks:
- block overlap,
- route transition + buffer,
- opening/operation window fit,
- check-in/out,
- final arrival deadline,
- journey segment ordering,
- user-fixed stop preservation,
- route distance/duration provenance.

Straight-line distance cannot satisfy route-duration gate.

## 11. Evidence/freshness

Critical current facts require matching evidence family and freshness.

Examples:
- opening hours,
- event occurrence/status,
- current weather,
- live accommodation availability/price where asserted,
- official seasonal closure,
- route/traffic facts,
- women-only beach status where hard conditional rule applies.

Precomputed Issue #50 knowledge does not automatically satisfy current critical fact gates.

## 12. Official vs experiential claims

Verification keeps claim families separate:

```text
OfficialFact → operational/policy fact
ReviewSignal → experiential pattern
```

ReviewSignal cannot satisfy a required OfficialFact gate.

## 13. Issue #49 multi-city checks

For JourneyPlan:
- each JourneySegment route ref exists,
- overnight segment has valid stay where required,
- stop role/time/day relation coherent,
- user-fixed stop provenance preserved,
- final destination deadline satisfied,
- route sequence physically feasible.

## 14. Issue #51 seasonal/event checks

- recurring event knowledge != exact-year occurrence,
- exact event block requires adequate EventOccurrence/official evidence,
- cancelled event cannot remain active block,
- seasonal closure cannot be ignored,
- climate normal cannot be exact-day forecast,
- event AVOID/SEEK policy must be applied consistently where event data is material.

## 15. Budget checks

- BudgetLedger arithmetic reproducible,
- UNKNOWN != 0,
- duplicate dedupeKey not double-counted,
- hard over-budget cannot PASS,
- critical unknown exposure can block/provisionally prevent PASS according to policy,
- mixed currency requires conversion evidence.

## 16. Adaptive repair verification

If `AdaptiveRepairResult` exists:
- each patch inside justified impact scope,
- triggerResolutions complete,
- protected preservation proofs hash-equal,
- scope escalation justified,
- mandatory downstream rechecks completed,
- repaired fragment passes same TM-AG-009 feasibility invariants.

Repair candidate cannot advance merely because Adaptive Agent says `REPAIRED`.

## 17. Evidence coverage

Verification reports claim-family coverage, not just a single percent.

```yaml
evidenceCoverage:
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

A `REPAIR` finding must be actionable:

```yaml
repairTargetId: string
reasonCode: string
targetRefs: []
dependencyRefs: []
requiredOwner: TM-AG-013 | other-owner-via-orchestrator
requiredEvidenceTypes: []
severity: BLOCKING | NON_BLOCKING
```

Verification does not perform the repair.

## 19. Reverification policy

Base verification pass external-world search yapmaz.

Missing/conflicting critical facts için tercih edilen yol:

```text
Verification → requiredRecheck
→ Orchestrator routes to owning specialist
→ new evidence
→ Verification rerun
```

Explicit controlled mode'da narrow read-only recheck capability kullanılabilir; discovery/ranking/new candidate creation yasaktır.

## 20. Allowed tools

Primary:
- `TL-012` Schema Validator
- `TL-013` Rule Engine
- `TL-011` Calculator

Optional controlled read-only recheck:
- claim owner'a uygun mevcut read-only adapter; yalnız explicit missing/conflicting fact scope'unda.

## 21. Forbidden behavior

- new place/hotel/restaurant candidate generation,
- itinerary mutation,
- hard constraint relaxation,
- final prose response,
- semantic judge ile deterministic failure override,
- missing evidence'i confidence tahminiyle kapatma,
- unsupported PASS.

## 22. Semantic judgement boundary

LLM/semantic evaluation yalnız deterministik olmayan remainder için kullanılabilir:
- alternative meaningful diversity,
- pacing quality,
- explanation-level coherence gibi.

Semantic judgement hard gate'leri override edemez.

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

## 24. Harness binding

- R0 VerificationResult schema
- R1 all deterministic gates
- R2 recorded full-pipeline fixtures
- R3 schema/rule/calculator/recheck adapter integration
- R4 limited semantic gate quality
- R5 conflicting/stale/missing/authority/provenance adversarial cases
- R6 reviewer authority leakage/new-candidate generation
- R7 controlled live final verification
- R8 production false-pass/false-repair regressions

## 25. Current status

```yaml
agent_spec_status: canonical_v1
implementation_allowed: false
prototype_allowed: false
schemas: pending
policies: pending
fixtures: pending
journey_issue_49_required: true
knowledge_issue_50_freshness_required: true
event_season_issue_51_required: true
```
