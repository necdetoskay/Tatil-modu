# TM-AG-011 — Public Authority Intelligence Agent Specification

| Alan | Değer |
|---|---|
| Agent ID | TM-AG-011 |
| Sürüm | 1.0 |
| Durum | CANONICAL SPEC |
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
- source health/coverage gap sinyali.

Yapmaz:
- POI/otel/restoran ranking,
- review analizi,
- kullanıcı deneyimi claim'ini resmî fact'e dönüştürme,
- itinerary yazma/değiştirme,
- resmî evidence yokken VERIFIED üretme,
- final kullanıcı cevabı yazma.

## 3. Inputs

- claim identity/ref
- subject/entity/location ref
- claim type
- asserted/expected value veya doğrulanacak soru
- applicable date/time/effective window
- required authority/freshness policy
- optional known `TrustedSourceRegistryEntry[]` (Issue #50)
- current date/time
- `contextManifestId`

## 4. Output

Ana çıktı: `OfficialFact.v1`.

```yaml
officialFactId: string
claimRef: string
subjectRef: string
claimType: string
status: VERIFIED | CONTRADICTED | UNKNOWN
resolvedValue: any|null
verificationScope: object
sourceLookupPath: REGISTRY_HIT | REGISTRY_REFRESH | GENERIC_DISCOVERY
primarySourceRefs: []
evidence: []
conflicts: []
freshnessStatus: CURRENT | STALE | UNKNOWN
confidence: 0..1
```

## 5. Status semantics

### VERIFIED
Güncel/yeterince fresh, claim-scope ile doğrudan ilgili ve gerekli authority eşiğini karşılayan source evidence claim'i destekler.

### CONTRADICTED
Aynı scope/date için yeterli authority/freshness'e sahip primary evidence claim'i açıkça çürütür.

### UNKNOWN
Aşağıdakilerden biri:
- uygun resmî kaynak yok,
- kaynak stale,
- scope/date uyumsuz,
- resmî kaynaklar unresolved conflict içinde,
- yalnız discovery/secondary evidence var,
- claim source tarafından açıkça cevaplanmıyor.

`UNKNOWN` failure değildir; doğru epistemik sonuç olabilir.

## 6. Claim-specific authority

`docs/05-data-sources/authority-model.md` kullanılır.

Authority genel source puanı değildir. Her evidence:
- claim type,
- ownership/mandate/control ilişkisi,
- authority score/class,
- source role
ile değerlendirilir.

Örnek:
- müzenin resmî sayfası opening-hours için yüksek authority,
- aynı sayfanın “ziyaretçi deneyimi çok iyi” claim'i için düşük authority.

## 7. Trusted Source Registry — Issue #50

İlk lookup sırası:

```text
known healthy entity/province source registry
→ known source fetch/refresh
→ coverage gap varsa official source discovery
→ generic web discovery only as source-finding fallback
```

Registry hit varsa gereksiz broad search yapılmaz.

Registry kaydı evidence değildir; kaynağa giden güvenilir lookup yoludur. Claim yine current evidence ile doğrulanır.

## 8. Allowed tools

- `TL-001` Web Search — official source discovery only.
- `TL-002` Official Page Fetcher — primary verification.
- `TL-010` Price & Fee Lookup — official/current tariff/fee when applicable.
- `TL-014` Cache — freshness-aware source snapshots.
- `TL-012` Schema Validator harness katmanında.

## 9. Forbidden tools / ownership

- `TL-004` Place Search — candidate discovery değil.
- `TL-005` Directions — route authority değil.
- `TL-006` Weather — weather authority değil.
- `TL-008` Accommodation Search — live availability değil.
- `TL-009` Review Data Provider — experiential analysis değil.

## 10. Source policy

Primary target sources:
- ministry/public authority,
- municipality/governorate,
- museum/park/site official operator,
- venue/property official policy/tariff page,
- data owner's official API/page.

Tier 4 yalnız source discovery için kullanılabilir; critical OfficialFact'i tek başına doğrulayamaz.

## 11. Freshness/effective date

Evidence en az:
- retrievedAt,
- published/effective date if available,
- expiry/validity if known,
- freshness status

taşır.

Date-sensitive claim'lerde regular/general page special-date fact'in yerine geçemez.

## 12. Conflict handling

İki resmî kaynak çelişirse:
- claim-specific authority,
- effective date,
- direct operational ownership,
- specificity
karşılaştırılır.

Güvenli resolution yoksa `UNKNOWN` + conflict record.

Eski kaynak sessizce yeni kaynağa veya yeni kaynak sessizce eski kaynağa override edilmez; provenance korunur.

## 13. Evidence model

```yaml
OfficialEvidence:
  evidenceId: string
  sourceRef: string
  sourceTier: 1 | 2 | 3 | 4
  sourceRole: AUTHORITATIVE | CORROBORATING | DISCOVERY_ONLY
  claimType: string
  authorityScore: 0..1
  authorityClass: A | B | C | D | E
  retrievedAt: datetime
  effectiveFrom: datetime|null
  effectiveUntil: datetime|null
  freshnessStatus: CURRENT | STALE | UNKNOWN
  supports: SUPPORTS | CONTRADICTS | PARTIAL | NOT_RELEVANT
```

## 14. Source health feedback — Issue #50

Agent source registry'ye doğrudan durable write yapmaz; şu feedback'i Orchestrator/background subsystem'e döndürebilir:
- source healthy,
- redirected/replaced,
- dead,
- scope mismatch,
- new authoritative source discovered.

Durable Source Registry advancement ayrı verification/gate sonrası yapılır.

## 15. High-risk verification examples

- museum/site opening hours,
- admission fee,
- official closure/maintenance,
- women-only beach official status/rule where available,
- reservation requirement,
- legal/safety restriction,
- accessibility rule/facility when hard constraint,
- official event/season schedule.

## 16. Authority boundary with Review Intelligence

OfficialFact ve ReviewSignal birbirini override etmez; farklı claim aileleridir.

```text
official parking exists → TM-AG-011
parking is often full → TM-AG-012 experiential signal
```

## 17. Handoff

- TM-AG-004/005/006: requested critical fact verification via Orchestrator.
- TM-AG-014 Verification: OfficialFact + evidence/conflicts.
- TM-BG-001/TM-SR-001 backlog: source health/discovery feedback.

## 18. Failure modes

- `UNSUPPORTED_VERIFIED`
- `TIER4_AS_OFFICIAL_FACT`
- `STALE_SOURCE_AS_CURRENT`
- `SCOPE_MISMATCH`
- `DATE_WINDOW_IGNORED`
- `OFFICIAL_CONFLICT_HIDDEN`
- `AUTHORITY_NOT_CLAIM_SPECIFIC`
- `REVIEW_AS_OFFICIAL_EVIDENCE`
- `SOURCE_REGISTRY_AS_FACT`
- `PLANNING_LEAKAGE`
- `MISSING_PROVENANCE`

## 19. Harness binding

- R0 OfficialFact schema
- R1 status/authority/freshness/conflict rules
- R2 recorded official-source fixtures
- R3 official fetch/fee adapter integration
- R4 claim interpretation semantic quality
- R5 stale/dead/conflicting/ambiguous/no-source cases
- R6 place/review/route/planning authority leakage
- R7 controlled live official verification
- R8 regressions

## 20. Current status

```yaml
agent_spec_status: canonical_v1
implementation_allowed: false
prototype_allowed: false
schemas: pending
policies: pending
fixtures: pending
knowledge_issue_50_source_registry_required: true
```
