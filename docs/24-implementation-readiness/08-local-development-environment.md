# Local Development Environment

## Hedef
UI olmadan geliştiricinin tek komutla headless core'u, mock provider'ları ve test suite'i çalıştırabilmesi.

## İlk faz bağımlılıkları
- Node.js LTS
- pnpm workspace
- TypeScript strict mode
- test runner
- schema validator
- optional lightweight local DB only when memory persistence testleri başlarsa

İlk vertical slice için Docker veya harici servis zorunlu dependency yapılmamalıdır. Deterministic suite mümkün olduğunca process-local çalışmalıdır.

## Developer commands

Bu komutlar root `package.json` içinde executable script olarak tanımlıdır:

```powershell
pnpm install --frozen-lockfile
pnpm test:fast
pnpm test:core
pnpm test:integration
pnpm test:golden
pnpm headless:run --fixture HS-001
pnpm test:h0
```

- `test:fast`: generated status, TypeScript ve package-boundary kontrolleri.
- `test:core`: contracts, policy, memory ve agent testleri.
- `test:integration`: capability, mock/provider adapter ve harness entegrasyon testleri.
- `test:golden`: canonical golden senaryo ile gerçek deterministic runtime E2E testi.
- `headless:run`: ağ kapalı fixture ile orchestrator zincirini çalıştırır; `HS-001` şu an desteklenen canonical CLI fixture kimliğidir.
- `test:h0`: bütün deterministik kalite kapısı.

Kalıcı run deposu henüz uygulanmadığı için bir “last report” komutu sunulmaz; CLI çalıştırması JSON sonucu doğrudan stdout'a yazar.

## Environment profilleri
### test
- yalnız mocks/test doubles
- sabit clock/seed destekli
- network disabled by default
- test dosyaları Windows process contention kaynaklı yalancı timeout'ları önlemek için sırayla çalışır

### dev-headless
- CLI/API boundary
- mock default
- explicit opt-in experimental provider mümkün ama test sonucu sayılmaz

### eval
- gerçek model/provider benchmark
- ayrı secrets
- maliyet limitleri
- run metadata zorunlu

## Determinism
Test ortamı şu girdileri kontrol edebilmelidir:
- clock
- timezone
- random seed
- provider fixture version
- model stub output
- memory initial state

## Local safety
Hiçbir developer komutu varsayılan olarak gerçek booking, ödeme, production data write veya production provider mutation yapamaz.
