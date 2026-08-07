# H2 — Deterministic Policy Core

**Durum:** planned  
**Requires:** H1/L0 PASS  
**Primary gate:** L1 Domain / Policy  
**P0 tolerance:** 0

## Amaç
Hard constraint, soft preference, precedence, blocker ve eligibility kararlarını LLM'den bağımsız deterministic bir çekirdekte uygulamak.

## Temel ilke
```text
LLM proposes; policy decides.
```
Hiçbir agent veya model hard constraint'i override edemez.

## Scope
- constraint normalization
- hard vs soft classification
- precedence resolution
- eligibility gates
- rejection reason codes
- blocker aggregation
- radius rules
- family/age policy primitives
- rest/load constraints
- budget policy primitives
- evidence-required policy markers
- explicit conditional rules

## Örnek canonical behavior
Deniz aktivitesi öneriliyorsa ve kullanıcı kadınlar plajını hard constraint yaptıysa uygun evidence bulunmadan normal plaj önerisi geçerli alternatife dönüşemez.

## Evaluation result
Policy her karar için açıklanabilir sonuç üretir:
```yaml
status: eligible | ineligible | conditional | needs_evidence
reason_codes: []
violated_hard_constraints: []
soft_preference_penalties: []
required_evidence: []
```

## Test strategy
- table-driven unit tests
- boundary-value tests
- precedence conflicts
- multiple simultaneous constraints
- property/invariant tests
- mutation-oriented negative cases

## P0 invariants
1. Hard constraint skorla telafi edilemez.
2. Missing evidence required by a hard rule PASS üretemez.
3. Soft preference hard constraint'e dönüşemez.
4. Explicit user hard constraint default preference'i ezer.
5. Rejected candidate final eligible set'e giremez.
6. Policy sonucu aynı inputta deterministic olmalıdır.

## Required fixture families
- radius exact boundary / just outside
- budget exact / over budget
- child age boundaries
- rest required/missing
- women-only beach required / verified / unknown / false
- conflicting preferences
- multiple blockers

## Definition of Done
```yaml
L1: PASS
p0_failures: 0
deterministic_repeatability: 100%
hard_constraint_bypass: 0
reason_code_coverage: complete
```

## Out of scope
Candidate research, web/API calls, ranking prose, LLM judgment ve UI.
