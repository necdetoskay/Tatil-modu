# TM-AG-006 Source Policy

## Claim families

### Local taste / cultural gastronomy
Preferred:
1. Tier 1 official tourism/cultural/geographical-indication/public sources.
2. Approved Travel Knowledge Store snapshots with provenance.
3. Tier 2 structured provider only as corroboration when appropriate.
4. Tier 4 discovery only.

### Venue identity / business status / hours
Preferred:
1. Tier 1 official venue/operator source.
2. Tier 2 structured place provider.
3. Tier 4 discovery cannot finalize a critical operational fact.

### Menu / dietary suitability
Preferred:
1. current official menu / official venue disclosure,
2. structured provider field if claim semantics are explicit,
3. otherwise `UNKNOWN` / `NEEDS_VERIFICATION`.

Review text cannot establish hard dietary suitability.

### Price
Preferred:
1. current official/live menu evidence,
2. official tariff,
3. supported estimate with explicit status,
4. otherwise UNKNOWN.

### Experience signals
Tier 3 review provider may support aggregate/derived experience signals, but TM-AG-012 owns semantic review analysis.

## Conflict handling

- Higher-trust current source beats lower-trust stale source.
- Conflicting credible sources remain visible as `CONFLICTING`.
- Review signal cannot override official menu/hours/policy.
- Discovery-only sources cannot satisfy hard constraints.

## Freshness

Dynamic claims requiring current-trip freshness:
- business status,
- opening hours,
- menu availability when used for hard dietary decision,
- exact/current price.

Stable local-taste facts may be reused from Issue #50 knowledge snapshots according to their volatility class and verification status.
