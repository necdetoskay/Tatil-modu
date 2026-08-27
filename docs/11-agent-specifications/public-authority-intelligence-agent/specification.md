# TM-AG-011 — Public Authority Intelligence Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-011 |
| Sürüm | 1.0 |
| Durum | CANONICAL / GOLDEN PACKAGE |
| Tarih | 2026-08-27 |

## 1. Purpose

Public Authority Intelligence Agent, kritik bir claim'i resmî/birincil kaynaklara karşı doğrular ve `OfficialFact` üretir.

```text
claim + subject + date/scope
→ trusted source registry lookup
→ official source fetch/discovery if needed
→ claim-specific authority + freshness evaluation
→ VERIFIED | CONTRADICTED | UNKNOWN
→ OfficialFact
```

## 2. Boundary

Yapar:
- resmî kaynak bulma/doğrulama,
- claim-specific authority değerlendirmesi,
- opening hours, admission fee, official policy, closure, reservation condition, accessibility rule vb. primary-source verification,
- kaynak conflict/freshness görünürlüğü,
- Issue #50 Trusted Travel Source Registry reuse,
- ordered lookup provenance,
- source health/coverage gap feedback.

Yapmaz:
- POI/otel/restoran ranking,
- review analizi,
- kullanıcı deneyimi claim'ini resmî fact'e dönüştürme,
- itinerary yazma/değiştirme,
- evidence yokken VERIFIED üretme,
- source registry'ye doğrudan durable write,
- final kullanıcı cevabı yazma.

## 3. Inputs

- claim identity/ref
- subject/entity/location ref
- claim type
- asserted/expected value veya doğrulanacak soru
- effective date/time window
- verification policy
- authority/source policy snapshot IDs
- optional `TrustedSourceRegistryEntry[]`
- current datetime
- `contextManifestId`

## 4. Output — OfficialFact

```yaml
officialFactId: string
claimRef: string
subjectRef: string
claimType: string
status: VERIFIED | CONTRADICTED | UNKNOWN
resolvedValue: any|null
verificationScope: object
sourceLookupPath: REGISTRY_HIT | REGISTRY_REFRESH | GENERIC_DISCOVERY
sourceLookupTrace: []
sourceRegistryRefs: []
primarySourceRefs: []
evidence: []
conflicts: []
sourceFeedback: []
freshnessStatus: CURRENT | STALE | UNKNOWN
confidence: 0..1
```

## 5. Status semantics

### VERIFIED
Scope/date ile doğrudan eşleşen, gerekli claim-specific authority/freshness eşiğini geçen authoritative evidence claim'i destekler.

### CONTRADICTED
Aynı scope/date için yeterli authoritative evidence asserted claim'i açıkça çürütür.

### UNKNOWN
Uygun evidence yok, stale, scope mismatch, partial, discovery-only veya unresolved official conflict vardır.

`UNKNOWN` doğru ve güvenli bir sonuçtur; false anlamına gelmez.

## 6. Claim-specific authority

`docs/05-data-sources/authority-model.md` kanoniktir.

Authority source genelinde değil claim bazında değerlendirilir.

Örnek:
- museum operator → opening_hours için yüksek authority,
- aynı source → visitor parking fullness experience için düşük authority.

## 7. Trusted Source Registry — Issue #50

Lookup sırası:

```text
known healthy source registry
→ cache/fetch known official source
→ coverage/source health gap varsa official discovery
→ generic web only to find a better source
```

Registry kaydı fact evidence değildir.

## 8. Ordered lookup provenance

`sourceLookupTrace[]` her adımı sırayla kaydeder:
- REGISTRY_LOOKUP,
- CACHE_LOOKUP,
- OFFICIAL_FETCH,
- GENERIC_DISCOVERY,
- FEE_LOOKUP.

Her adım outcome/reason/source refs taşır. Böylece registry-first/no-unnecessary-search policy replay edilebilir.

## 9. Allowed tools

- `TL-001` Web Search — official source discovery only
- `TL-002` Official Page Fetcher
- `TL-010` Price & Fee Lookup
- `TL-012` Schema Validator
- `TL-014` Cache

Forbidden: Places, Routes, Weather, Accommodation, Review provider.

## 10. Source/freshness policy

Primary target:
- ministry/public authority,
- municipality/governorate,
- official museum/park/site/operator,
- official property/venue policy/tariff,
- data-owner API/page.

Tier 4 critical OfficialFact'i tek başına doğrulayamaz.

Date-sensitive claim için effective date/window ve special overrides kontrol edilir.

## 11. Conflict handling

Resolution sinyalleri:
- claim-specific authority,
- operational ownership/legal mandate,
- effective date,
- specificity,
- exact subject/scope.

Güvenli winner yoksa `UNKNOWN + unresolved conflict`.

## 12. Evidence model

Evidence:
- source ref/registry ref,
- source tier/role,
- claim type,
- authority score/class,
- retrieved/effective dates,
- freshness,
- SUPPORTS/CONTRADICTS/PARTIAL/NOT_RELEVANT.

VERIFIED/CONTRADICTED evidence'sız üretilemez.

## 13. Source health feedback

Agent durable registry mutation yapmaz; yalnız candidate feedback üretir:
- HEALTHY,
- DEGRADED,
- DEAD,
- REPLACED,
- SCOPE_MISMATCH,
- NEW_SOURCE_DISCOVERED.

Background subsystem ayrı gate sonrası state ilerletir.

## 14. Official vs experiential boundary

```text
official parking exists → TM-AG-011
parking often full → TM-AG-012
```

Bu iki claim ailesi birbirini override etmez.

## 15. Failure modes

- `UNSUPPORTED_VERIFIED`
- `TIER4_AS_OFFICIAL_FACT`
- `STALE_SOURCE_AS_CURRENT`
- `SCOPE_MISMATCH`
- `DATE_WINDOW_IGNORED`
- `OFFICIAL_CONFLICT_HIDDEN`
- `AUTHORITY_NOT_CLAIM_SPECIFIC`
- `REVIEW_AS_OFFICIAL_EVIDENCE`
- `SOURCE_REGISTRY_AS_FACT`
- `LOOKUP_TRACE_DROPPED`
- `PLANNING_LEAKAGE`
- `MISSING_PROVENANCE`

## 16. Harness binding

- R0 OfficialFact schema
- R1 PA-001..PA-018
- R2 recorded official-source fixtures
- R3 official fetch/fee integration
- R4 claim/source semantic quality
- R5 stale/dead/conflict/no-source cases
- R6 place/review/route/planning leakage
- R7 controlled live official verification
- R8 regressions

## 17. Golden coverage

```yaml
behavior_cases: 16
authority_cases: 6
tool_policy_cases: 6
context_lifecycle_cases: 4
provenance_cases: 7
knowledge_issue_50_cases: 4
```

Fixture-driven contract gap:
- single `sourceLookupPath` fallback sequence'i yeterince açıklamıyordu → ordered `sourceLookupTrace[]` eklendi.

## 18. Current status

```yaml
agent_spec_status: golden_v1
implementation_allowed: false
prototype_allowed: false
schemas: completed
policies: completed
fixtures: completed
knowledge_issue_50_source_registry_required: true
next_agent_package: TM-AG-012
```
