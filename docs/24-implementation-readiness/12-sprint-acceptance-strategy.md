# Sprint and Acceptance Strategy

## Amaç
Her sprinti 'kod yazıldı' ile değil, test-gate ile kapatmak.

## Sprint yapısı
Her sprint bir veya daha fazla vertical behavior hedefler. Örnek:
```yaml
sprint_goal: "Trip intake + constraint normalization"
required_outputs:
  - implementation
  - fixtures
  - tests
  - traceability links
  - failure cases
  - documentation update
exit_gate:
  - relevant_L0_pass
  - relevant_L1_pass
  - p0_failures_0
```

## Önerilen ilk sprintler
### Sprint H0 — Repository Foundation
Workspace, package boundaries, test runner, typecheck, import guard, CLI skeleton.

### Sprint H1 — Contracts & Domain
Canonical schemas, validators, domain primitives, error/reason registry. Exit: L0 PASS.

### Sprint H2 — Policy Core
Hard/soft constraints, precedence, blockers. Exit: L1 PASS + P0=0.

### Sprint H3 — Capability + Mock Platform
Gateway, mock adapters, fault injection, evidence envelopes. Exit: capability L2 PASS.

### Sprint H4 — Memory Core
Disclosure/read/write-candidate/in-memory store, privacy/staleness/conflict. Exit: memory L2 PASS.

### Sprint H5 — Agent Batch A
Trip Intake + early candidate agents. Her agent L3 bağımsız PASS.

### Sprint H6 — Agent Batch B
Family/logistics/accommodation/activity/day-planner/final composer. L3 PASS.

### Sprint H7 — Orchestrator
State/routing/retry/fallback/finalization. L4 PASS.

### Sprint H8 — Verification + Quality
Verification and quality implementation. L5 PASS.

### Sprint H9 — Golden E2E
HS-001 ve canonical golden catalog executable. L6 PASS.

### Sprint H10 — Adversarial/Regression
Faults, privacy, evidence, constraint attacks. L7 PASS.

### Sprint H11 — Headless Acceptance
Coverage closure, traceability, repeated deterministic run, UI unlock decision.

### Sprint H12 — Model/Provider Evaluation
L8 benchmark; UI unlock'tan bağımsız olarak provider/model seçimini destekler.

## Acceptance rule
Bir sprintte feature code mevcut ama fixture/test eksikse sprint tamamlanmamıştır.

## No UI rule
H0–H11 tamamlanmadan `/apps/web` oluşturulmaz. Dokümantasyon amaçlı UX tasarımı kalabilir fakat implementation yoktur.
