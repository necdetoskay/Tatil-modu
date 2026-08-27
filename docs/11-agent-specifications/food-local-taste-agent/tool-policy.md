# TM-AG-006 Tool Policy

## Allowed

| Tool | Amaç |
|---|---|
| TL-004 Place Search | restaurant/cafe/lokanta discovery ve entity lookup |
| TL-002 Official Page Fetcher | official menu/hours/policy/facility doğrulaması |
| TL-001 Web Search | resmî kaynak discovery ve coverage gap fallback |
| TL-009 Review Data Provider | aggregate metadata / review availability; semantic synthesis yok |
| TL-010 Price & Fee Lookup | supported current/official menu price evidence |
| TL-014 Cache | freshness-aware cache |
| TL-013 Rule Engine | hard constraint checks |
| TL-012 Schema Validator | harness contract validation |

## Forbidden

- TL-005 Directions & Distance Matrix
- TL-006 Weather Forecast
- TL-008 Accommodation Search
- booking/order/payment actions
- review semantic/theme synthesis inside this agent

## Knowledge-first rule — Issue #50

If `knowledgeRefs` or `sourceRegistryRefs` provide sufficient known entity/source coverage:

1. reuse stable local-taste/entity knowledge,
2. do not repeat broad generic discovery,
3. refresh only required dynamic claims (hours/menu/price/status),
4. record knowledge hit + refresh reason in trace.

A knowledge hit never authorizes stale menu/hour/price facts.

## R6 hard fail

Any route, weather, accommodation, payment/order or review-synthesis tool behavior is `AUTHORITY_FAIL`.
