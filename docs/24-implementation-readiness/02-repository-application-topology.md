# Repository and Application Topology

## Hedef
Tek repo içinde headless core, test harness ve gelecekteki UI'yi birbirinden gevşek bağlı tutmak.

## Önerilen topology
```text
/apps
  /api              # optional thin HTTP boundary, UI değildir
  /cli              # manual headless runs / developer inspection
/packages
  /contracts        # schemas, envelopes, validation
  /domain           # pure value objects / domain rules
  /policy           # deterministic hard/soft constraint engine
  /capabilities     # capability contracts + gateway
  /providers-mock   # deterministic fixture-backed providers
  /memory           # memory interfaces + test implementation
  /agents           # individual agent implementations
  /orchestrator     # workflow/state/routing coordination
  /verification     # evidence/freshness/conflict processing
  /quality          # quality rules/report assembly
  /observability    # telemetry interfaces and test sinks
  /prompts          # runtime prompt composition, versioned
  /test-fixtures    # canonical executable fixtures
  /test-harness     # suite runner, evaluators, reports
  /shared           # only truly generic primitives
/docs
```

## Boundary kuralları
- `contracts` en alt bağımlılık katmanıdır; üst business paketlerine bağımlı olmaz.
- `domain` provider veya agent bilmez.
- `policy` tool/provider çağırmaz.
- `agents` doğrudan provider import etmez; capability interfaces kullanır.
- `agents` birbirini import/call etmez.
- `orchestrator` agentları interface/registry üzerinden çağırır.
- `test-harness` bütün katmanları compose edebilir; production kodu test harness'e bağımlı olmaz.
- `/apps/cli` yalnız headless giriş noktasıdır ve business logic içermez.

## Neden monorepo?
Contract değişikliği, fixture, agent ve test güncellemelerinin tek PR içinde atomik incelenebilmesini sağlar. İlk fazda mikroservis ayrımı gereksiz operasyonel karmaşıklık oluşturur.

## Gelecekte UI
UI açılırsa ayrı `/apps/web` eklenir. Headless core paketleri UI'ye bağımlı hale getirilmez.
