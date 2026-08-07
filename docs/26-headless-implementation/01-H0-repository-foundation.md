# H0 — Repository Foundation Execution Plan

**Durum:** code complete, execution validation pending  
**UI:** locked  
**Sonraki sprint:** H1 ancak H0 execution PASS sonrası açılır.

## Amaç
Headless Tatil Modu çekirdeğinin bütün sonraki sprintleri için tekrar edilebilir, sınırları denetlenebilir ve CI tarafından doğrulanabilir repository temelini kurmak.

## Scope
- pnpm workspace
- Node 24 baseline
- strict TypeScript
- project references
- Vitest deterministic test baseline
- package skeletons
- dependency boundary guard
- headless CLI skeleton
- repository invariant tests
- GitHub Actions headless gate

## Zorunlu package seti
```text
apps/cli
packages/contracts
packages/domain
packages/policy
packages/capabilities
packages/providers-mock
packages/memory
packages/agents
packages/orchestrator
packages/verification
packages/quality
packages/observability
packages/test-fixtures
packages/test-harness
```

`apps/web` H11 UI unlock kararına kadar yasaktır.

## Architecture invariants
1. Agent provider adapter import edemez.
2. Agent başka agent'ı doğrudan çağıramaz.
3. Domain ve contracts üst katmanlara bağımlı olamaz.
4. Policy deterministic core olarak agent/LLM bağımlılığı alamaz.
5. CLI yalnız headless composition root rolündedir.
6. Test harness production davranışını değiştiremez.

## H0 test matrix
| ID | Severity | Test | Beklenen |
|---|---|---|---|
| H0-001 | P0 | required root configs exist | PASS |
| H0-002 | P0 | required packages exist | PASS |
| H0-003 | P0 | `apps/web` absent | PASS |
| H0-004 | P0 | forbidden dependency scan | 0 violation |
| H0-005 | P1 | strict TS project graph | PASS |
| H0-006 | P1 | Vitest boot | PASS |
| H0-007 | P1 | CLI skeleton starts | PASS |
| H0-008 | P1 | CI invokes canonical H0 command | PASS |

## Canonical command
```text
pnpm test:h0
```

Bu komut typecheck + boundary + tests zincirini çalıştırır.

## Exit gate
```yaml
required:
  install: pass
  typecheck: pass
  boundaries: pass
  tests: pass
  p0_failures: 0
  execution_evidence: present
forbidden:
  manual_waiver: true
  skip_tests: true
  ui_creation: true
```

## Evidence record
Execution sonucu tarih, commit SHA, Node/pnpm sürümü ve test özetiyle `H0-validation-record.md` benzeri immutable bir kayıt olarak saklanmalıdır.
