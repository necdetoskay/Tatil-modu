# TM-AG-004 — Source Policy

## Source priority

### Tier 1 — primary authority

- museum/attraction/facility official site,
- municipality/governorate/ministry/national park official source,
- official tariff/notice/schedule.

Use for:
- closures,
- age/safety rules,
- official opening schedule,
- women-only beach status,
- accessibility rules/features when stated,
- entrance fee/ticket rules.

### Tier 2 — structured provider

Use for:
- stable place identity,
- coordinates/address/category,
- business status,
- structured opening-hours signal,
- aggregate rating/count,
- parking/accessibility structured fields,
- price level/range when available.

Tier 2 is valuable but does not automatically override a current Tier 1 source.

### Tier 3 — reviews/community

Place Agent may only consume aggregate/review-availability signals. Semantic pattern extraction belongs to TM-AG-012.

### Tier 4 — general web

Discovery only or low-confidence contextual lead. Critical operational/eligibility fact cannot be finalized from Tier 4 alone.

## Claim-specific policy

| Claim | Preferred source |
|---|---|
| Stable identity/location | Tier 2 + official cross-reference where useful |
| Business status | current Tier 2, official source if conflict/critical |
| Opening hours | current official schedule; current structured hours as secondary/backup |
| Entrance fee | official tariff/site, then controlled fee provider |
| Age restriction | official source required for hard eligibility |
| Women-only beach status | current high-trust/official source required |
| Parking options | structured/official signal; never availability guarantee |
| Accessibility hard requirement | official/structured evidence sufficient to specific claim; unknown otherwise |
| Rating/count | structured provider |

## Conflict resolution

1. Compare claim type and effective/retrieval dates.
2. Prefer current Tier 1 direct claim over lower-tier claim.
3. Do not silently merge incompatible opening hours/status.
4. Emit `CONFLICTING` + evidence refs when unresolved.
5. Hard constraint cannot become satisfied from unresolved conflict.

## Freshness

Time-sensitive claims must carry retrieval time and freshness state.

Especially:
- opening hours,
- closure status,
- price,
- women-only beach operating status,
- seasonal access/rules.

Stale critical evidence → `NEEDS_VERIFICATION` or rejection depending on risk.
