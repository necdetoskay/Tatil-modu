# TM-AG-003 — Evaluation Rubric

## Gate order

1. R0 Contract
2. R1 Deterministic rules
3. R2 Fixture replay
4. R3 Tool integration
5. R4 Semantic research quality
6. R5 Adversarial source/conflict cases
7. R6 Authority
8. R7 Live region research
9. R8 Regression

## Hard fail

- POI/hotel/restaurant listesi üretmek,
- driving duration/distance claim'i üretmek,
- Climate Normal'i forecast olarak sunmak,
- Tier 4-only evidence ile verified fact,
- exceptional candidate policy'siz,
- stale kritik evidence ile verified status,
- forbidden tool call,
- provenance eksikliği.

## Scoring

| Alan | Ağırlık |
|---|---:|
| Contract/schema | 15% |
| Source trust/freshness | 20% |
| Region discovery relevance | 20% |
| Constraint/exception handling | 15% |
| Evidence/provenance | 15% |
| Authority compliance | 10% |
| Cost/latency | 5% |

Hard fail genel skordan bağımsız FAIL üretir.

## Semantic reviewer

Yalnız region-level aday çeşitliliği, rationale kalitesi ve theme relevance için kullanılır. Resmî fact doğruluğu LLM judge'a bırakılmaz.

## R3/R7 live requirements

- fixture'dan ayrı yürütülür,
- tool trace zorunlu,
- source tier/freshness kayıt edilir,
- live sonuç golden exact-match beklemez; invariant/rubric ile değerlendirilir.
