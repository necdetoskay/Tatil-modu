# TM-AG-015 — Explanation Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-015 |
| Sürüm | 1.0 |
| Durum | GOLDEN PACKAGE V1 READY |
| Tarih | 2026-08-27 |

## 1. Purpose

Explanation Agent, **Verification PASS almış** plan kararlarını ve trade-off'ları kullanıcıya anlaşılır gerekçe bloklarına dönüştürür.

```text
verified snapshot + decision/trace/evidence refs
→ choose explanation intents
→ render grounded rationale
→ claim/support self-check
→ ExplanationBundle
```

## 2. Core invariant

```text
facts(explanation) ⊆ facts(verified_snapshot + verified_evidence)
```

Explanation yeni fact, fiyat, POI, event tarihi, weather claim veya karar üretemez.

## 3. Inputs

- `VerificationResult` with `status=PASS`
- exact `verifiedSnapshotRef + verifiedSnapshotHash`
- selected itinerary/alternatives/budget refs
- decision/constraint refs
- AgentTrace decision summaries
- evidence/OfficialFact/ReviewSignal refs used by verified decisions
- user-facing warning refs approved by Verification
- explanation policy snapshot
- `contextManifestId`

## 4. Output

Ana çıktı: `ExplanationBundle.v1`.

```yaml
explanationBundleId: string
verifiedSnapshotRef: string
verifiedSnapshotHash: string
verificationResultRef: string
explanationPolicySnapshotId: string
generationRefs: []
blocks: ExplanationBlock[]
unresolvedWarnings: []
coverage: object
```

`generationRefs[]` model/prompt/generation trace lineage'ını taşır.

## 5. ExplanationBlock

```yaml
blockId: string
type: WHY_SELECTED | WHY_REJECTED | TRADEOFF | JOURNEY_STOP | BUDGET | WEATHER | EVENT | SEASONAL | UNCERTAINTY | ALTERNATIVE
subjectRefs: []
decisionRefs: []
constraintRefs: []
supportRefs: []
assertedClaimRefs: []
uncertaintyRefs: []
text: string
```

## 6. Supported explanation intents

- neden bu yer seçildi?
- neden başka aday elendi?
- neden bu sıra/zamanlama kullanıldı?
- Issue #49 ara şehir neden FULL_DAY/OVERNIGHT olarak planlandı?
- bütçede known/projected/unknown farkı nedir?
- hava nedeniyle neden indoor alternatif öne çıktı?
- Issue #51 festival SEEK/AVOID tercihi planı nasıl etkiledi?
- mevsim nedeniyle belirli aktivite neden conditional/poor oldu?
- hangi belirsizlik kullanıcıya görünür kalmalı?

## 7. No-decision rule

Explanation Agent:
- candidate ranking değiştirmez,
- yeni stop eklemez,
- alternatif seçmez,
- budget status değiştirmez,
- warning severity değiştirmez,
- verified değeri yuvarlayıp anlamını değiştirmez.

## 8. Source/claim boundary

Explanation yalnız verified refs kullanır.

Examples:
- OfficialFact supports opening/closure → açıklanabilir.
- ReviewSignal supports “yorumlarda sık görülen park zorluğu” → experiential olarak açıklanabilir.
- ReviewSignal “resmî olarak otopark yok” diye çevrilemez.

## 9. Uncertainty language

Verified snapshot `UNKNOWN`, `ESTIMATED`, `PROVISIONAL` veya warning taşıyorsa Explanation kesinlik seviyesini yükseltemez.

- `ESTIMATED` → tahmini kalmalı.
- `UNKNOWN` → bilinmiyor/doğrulanamadı kalmalı.
- conflicting evidence → approved warning olarak görünür kalmalı.

## 10. Journey explanation — Issue #49

Ara şehir açıklaması şu verified ref ailelerine dayanabilir:
- corridor/detour facts,
- DestinationBrief value signals,
- selected stop role provenance,
- route timing,
- accommodation/journey refs,
- user-fixed selection origin.

“Bu şehir yol üstünde” deniyorsa Transportation evidence'ı olmalıdır.

## 11. Knowledge explanation — Issue #50

Precomputed knowledge current live verification gibi sunulamaz.

Stable historical/local-taste context açıklanabilir; current opening hours ancak current verified evidence varsa kesin söylenebilir.

## 12. Event/season explanation — Issue #51

- recurring festival identity ile confirmed occurrence ayrılır.
- SEEK/AVOID plan bias decision refs üzerinden açıklanır.
- climate normal ve current forecast ayrımı korunur.
- “kış olduğu için deniz yasak” gibi blanket açıklama yasaktır; activity-specific seasonal signal gerekir.

## 13. Claim support self-check

Generation sonrası fact-bearing claims extracted/normalized edilip `assertedClaimRefs[]` ile bağlanır.

Her asserted claim için en az bir valid support ref gerekir.

Unsupported asserted claim → block invalid; downstream'e geçemez.

Output coverage invariant:

```text
unsupportedAssertedClaimCount = 0
```

## 14. Allowed tools

Allowed:
- `TL-012` Schema Validator
- deterministic claim/support validator

No Web/Places/Routes/Weather/Price/Review provider calls.

## 15. Provenance

Her block:
- subject refs,
- decision refs,
- support refs,
- asserted claim refs
ile trace edilebilir olmalıdır.

Bundle ayrıca:
- exact verified snapshot hash,
- explanation policy snapshot,
- `generationRefs[]`
taşır.

## 16. Failure modes

- `NEW_FACT_IN_EXPLANATION`
- `NEW_CANDIDATE_IN_EXPLANATION`
- `DECISION_CHANGED_IN_EXPLANATION`
- `UNSUPPORTED_CLAIM`
- `UNCERTAINTY_UPGRADED`
- `REVIEW_AS_OFFICIAL_FACT`
- `EVENT_RECURRENCE_AS_CONFIRMED_OCCURRENCE`
- `CLIMATE_AS_FORECAST`
- `VERIFIED_SNAPSHOT_MISMATCH`
- `MISSING_SUPPORT_PROVENANCE`
- `MISSING_GENERATION_PROVENANCE`

## 17. Harness binding

- R0 explanation schema
- R1 fact-ref subset/support/uncertainty deterministic checks
- R2 recorded verified-decision fixtures
- R3 schema/support-validator integration
- R4 clarity/helpfulness semantic quality
- R5 hallucination/uncertainty/claim-family attacks
- R6 external research/new-decision authority leakage
- R7 normally not needed; only live verified E2E rendering
- R8 hallucination/explanation regressions

## 18. Current status

```yaml
agent_spec_status: golden_v1_ready
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
verified_input_only: true
generation_provenance_required: true
unsupported_asserted_claim_count_required: 0
```
