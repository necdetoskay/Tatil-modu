# CI and Quality Gates

## Amaç
Headless core test zincirini geliştirici tercihinden çıkarıp merge kurallarına bağlamak.

## Önerilen CI sırası
```text
1. install / lockfile integrity
2. typecheck
3. lint / static rules
4. architecture import-boundary checks
5. L0 contract tests
6. L1 policy/domain tests
7. L2 capability/memory tests
8. L3 agent tests
9. L4 orchestrator tests
10. L5 verification/quality tests
11. L6 golden E2E
12. L7 regression/adversarial
13. coverage + traceability report
14. acceptance gate evaluation
```

## Merge blocker kuralları
- herhangi P0 failure → BLOCK
- contract/schema compatibility failure → BLOCK
- forbidden dependency/import → BLOCK
- golden critical scenario failure → BLOCK
- regression of hard constraint/privacy/evidence invariant → BLOCK
- required requirement→test trace missing → BLOCK

## P1/P2
P1 hedefi >=98% olsa da belirlenmiş blocker regression sıfırdır. P2 rubric threshold altında ise merge politikası ilgili feature/sprint acceptance'a göre block veya warning olabilir.

## Coverage
Statement coverage tek başına gate değildir. Zorunlu üç coverage görünümü:
```yaml
coverage:
  code_coverage: measured
  canonical_requirement_trace_coverage:
    P0: 100%
    P1: required_threshold
  golden_behavior_coverage: required
```

## CI hız stratejisi
PR sırasında cache/parallelization kullanılabilir fakat test sırası semantik gate bağımlılığını değiştirmez. P0 testler performans için atlanamaz.

## L8
Gerçek model/provider benchmark ayrı workflow olmalıdır. Maliyetli/nondeterministic testler deterministic merge suite'i kirletmez.
