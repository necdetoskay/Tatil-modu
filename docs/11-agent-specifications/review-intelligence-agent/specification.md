# TM-AG-012 — Review Intelligence Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-012 |
| Sürüm | 1.0 |
| Durum | GOLDEN PACKAGE V1 READY |
| Tarih | 2026-08-27 |

## 1. Purpose

Review Intelligence Agent, normalize edilmiş kullanıcı yorumlarından tekrarlayan **deneyim sinyalleri** çıkarır ve `ReviewSignalSet` üretir.

```text
entity + review window
→ knowledge snapshot lookup
→ targeted review refresh if needed
→ dedupe/spam/quality hygiene
→ aggregate observations
→ theme/direction/prevalence/confidence
→ ReviewSignalSet
```

## 2. Boundary

Yapar:
- recurring review themes,
- olumlu/olumsuz/mixed deneyim sinyalleri,
- sample size/source coverage/freshness,
- parking/crowding/cleanliness/family-friendliness/walking burden/value/noise/queue/staff vb. experiential signal,
- Issue #50 ReviewInsightSnapshot reuse/refresh,
- review hygiene ve confidence calibration.

Yapmaz:
- tek review'u genel fact yapmak,
- resmî opening hours/price/policy üretmek,
- review sinyalini OfficialFact üzerine override etmek,
- POI/otel/restoran keşfetmek,
- itinerary değiştirmek,
- ham review metnini sınırsız kalıcı knowledge olarak yazmak,
- final kullanıcı cevabı yazmak.

## 3. Inputs

- stable `entityRef`
- entity type
- analysis window
- normalized review record set veya provider lookup scope
- optional `ReviewInsightSnapshot` (Issue #50)
- review quality policy snapshot
- source/license policy snapshot
- current datetime
- `contextManifestId`

## 4. Output

Ana çıktı: `ReviewSignalSet.v1`.

```yaml
entityRef: string
analysisWindow: object
snapshotMode: REUSED | REFRESHED | COMPUTED
inputSnapshotRef: string|null
snapshotLineage:
  baseSnapshotRef: string|null
  baseSnapshotWindow: object|null
  baseSample: object|null
  refreshContributions: []
sample:
  rawCount: integer
  validCount: integer
  duplicateRemoved: integer
  suspectedSpamRemoved: integer
  sourceCount: integer
signals: ReviewSignal[]
limitations: []
freshnessStatus: CURRENT | STALE | UNKNOWN
overallConfidence: 0..1
```

## 5. ReviewSignal

```yaml
reviewSignalId: string
theme: string
direction: POSITIVE | NEGATIVE | MIXED | NEUTRAL
mentionCount: integer
validSampleSize: integer
prevalence: 0..1
strength: 0..1
confidence: 0..1
confidenceBasis: object
observationRefs: []
sourceProviderRefs: []
window: object
freshnessStatus: CURRENT | STALE | UNKNOWN
limitations: []
```

## 6. Observation model

`docs/06-travel-intelligence/observation-model.md` kullanılır.

Review intelligence aggregate observation'dır:
- time window,
- sample metadata,
- source/evidence refs,
- freshness,
- confidence
zorunludur.

## 7. Single-review invariant

Tek review:
- discovery/observation olabilir,
- düşük confidence local signal olabilir,
- high-confidence recurring theme olamaz,
- official/current operational fact olamaz.

## 8. Sample/confidence semantics

Confidence yalnız sentiment/model güveni değildir.

Etkileyen sinyaller:
- valid sample size,
- duplicate/spam oranı,
- source coverage,
- recency/window relevance,
- theme prevalence,
- disagreement,
- segment relevance where explicitly available.

Küçük sample + yüksek prevalence otomatik high confidence değildir.

## 9. Review hygiene

Semantic analysis öncesi deterministic/structured hygiene:
- duplicate suppression,
- exact/near-copy grouping,
- provider spam/suspicion metadata varsa kullanma,
- unusable/empty record removal,
- entity identity match,
- analysis-window filtering.

Raw count ve valid count ayrı tutulur.

## 10. Theme taxonomy

İlk kanonik theme aileleri:
- `family_friendliness`
- `child_friendliness`
- `cleanliness`
- `parking_experience`
- `crowding`
- `queue_experience`
- `walking_burden`
- `accessibility_experience`
- `noise_experience`
- `staff_experience`
- `value_for_money`
- `food_experience`
- `room_experience`
- `location_experience`
- `other`

## 11. Official vs experiential boundary

```text
official parking exists → TM-AG-011 OfficialFact
reviews say parking often fills → TM-AG-012 ReviewSignal
```

ReviewSignal resmî fact'i çürütmez; farklı claim family'dir.

## 12. Allowed tools

- `TL-009` Review Data Provider — normalized reviews/review metadata.
- `TL-011` Calculator — prevalence/sample arithmetic.
- `TL-014` Cache — window/freshness-aware snapshots.
- `TL-012` Schema Validator harness katmanında.

Review hygiene deterministic preprocessor olarak değerlendirilir; LLM judge'a bırakılmaz.

## 13. Forbidden tools

- Web/Official Fetch for official facts,
- Place discovery,
- Routes/Weather,
- Accommodation search,
- Price lookup.

## 14. Issue #50 knowledge-first mode

Background curator `ReviewInsightSnapshot` üretebilir.

Runtime:

```text
snapshot scope/window/freshness sufficient
→ REUSED
else targeted missing-window/provider refresh
→ REFRESHED
```

Fresh snapshot varken broad historical review pull gereksizdir.

Precomputed snapshot current truth garantisi değildir; requested window/scope ile eşleşmelidir.

### Snapshot lineage invariant

`REUSED` ve `REFRESHED` output'lar provenance kaybetmez.

- `REUSED`: base snapshot ref + base window + base sample zorunlu olarak izlenebilir olmalıdır.
- `REFRESHED`: base snapshot provenance korunur ve yeni veri katkıları `refreshContributions[]` ile ayrı tutulur.
- `COMPUTED`: base snapshot null olabilir; current run sample/evidence output'ta bulunur.

Merged sample sayıları hangi snapshot ve hangi refresh contribution'larından geldiği açıklanamıyorsa FAIL.

## 15. Raw review retention policy

Provider ToS/licensing kuralları önceliklidir.

Default durable knowledge:
- derived signal,
- sample/window metadata,
- provider/evidence refs,
- confidence/limitations.

Raw review body ancak açık policy/lisans izin veriyorsa ve gerekli süre kadar tutulabilir; canonical knowledge olarak sınırsız kopyalanmaz.

## 16. Freshness

Review signals zamanla değişir.

Her signal analysis window ve freshness taşır. Eski snapshot güncel crowding/parking/service experience diye sunulamaz.

## 17. Handoff

- TM-AG-004 Place Intelligence → reviewAnalysisRef / practical signals.
- TM-AG-005 Accommodation → reviewAnalysisRef.
- TM-AG-006 Food → reviewAnalysisRef.
- TM-AG-014 Verification → sample/freshness/provenance-aware ReviewSignalSet.
- TM-BG-001 backlog → derived ReviewInsightSnapshot write candidate.

## 18. Failure modes

- `SINGLE_REVIEW_AS_FACT`
- `SMALL_SAMPLE_HIGH_CONFIDENCE`
- `DUPLICATE_INFLATION`
- `STALE_SNAPSHOT_AS_CURRENT`
- `RAW_REVIEW_DURABLE_COPY_VIOLATION`
- `OFFICIAL_FACT_OVERRIDE`
- `ENTITY_MISMATCH`
- `WINDOW_MISMATCH`
- `MISSING_SAMPLE_METADATA`
- `MISSING_SNAPSHOT_LINEAGE`
- `MISSING_PROVENANCE`
- `PLACE_DISCOVERY_LEAKAGE`

## 19. Harness binding

- R0 ReviewSignal schema
- R1 sample/prevalence/dedupe/confidence/snapshot-lineage rules
- R2 recorded review fixtures
- R3 review provider adapter integration
- R4 theme extraction semantic quality
- R5 small/biased/duplicate/stale/conflicting samples
- R6 official fact/place/planning authority leakage
- R7 controlled live review refresh
- R8 regressions

## 20. Current status

```yaml
agent_spec_status: golden_v1_ready
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
knowledge_issue_50_review_snapshot_required: true
snapshot_lineage_required: true
```
