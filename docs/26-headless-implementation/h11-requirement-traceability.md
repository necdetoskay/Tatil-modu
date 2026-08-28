# H11 Requirement Traceability

Bu kayıt H11 kabul komutunun L0–L7 kapsamını canonical owner, fixture, test ve assertion zinciriyle bağlar.

| Gate | Owner / source | Fixture or registry | Executable evidence |
|---|---|---|---|
| L0 | `packages/contracts`, `packages/test-harness` | 17 canonical contract bundles | `m1-json-schema-compile`, `m1-contract-loader`, full suite |
| L1 | `packages/policy` | policy/domain fixtures | `packages/policy/**/*.test.ts`, `m1-deterministic-r1` |
| L2 | `packages/capabilities`, `packages/memory`, mock providers | capability and memory fixtures | `packages/capabilities/**/*.test.ts`, `packages/memory/**/*.test.ts`, full suite |
| L3 | `packages/agents`, `packages/test-harness/registry/r2-case-depth.v1.json` | 17 registered components, minimum 10 cases each | `m1-r2-*-depth.contract.test.ts` and recorded replay tests |
| L4 | `packages/orchestrator` | HS-001 orchestration input | `m1-r2-orchestrator-*`, `headless-runtime.e2e.test.ts` |
| L5 | `packages/verification`, `packages/quality` | verified snapshot and blocker fixtures | `verification-evidence`, `m1-verified-state-gate`, `final-response`, runtime negative cases |
| L6 | `packages/orchestrator`, `apps/cli` | HS-001 deterministic fixture | `headless-runtime.e2e.test.ts`, `pnpm headless:run -- --fixture HS-001` |
| L7 | test harness contract and adversarial suites | tamper, blocker, invalid-state and replay cases | `m1-failure-attribution-rive`, `m1-r2-*`, runtime negative cases |

## Acceptance execution

The canonical command is:

```text
pnpm h11:acceptance
```

It runs status synchronization, typecheck, package-boundary checks, the complete deterministic suite and the HS-001 runtime fixture. It writes `H11-validation-record.md` with the commit SHA, environment, CI run link when available, individual command results and the gate decision.

H11 PASS does not authorize UI implementation. It only opens the separate UI Readiness Review.
