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

## Önerilen developer commands
```text
pnpm install
pnpm test:fast
pnpm test:core
pnpm test:integration
pnpm test:golden
pnpm headless:run --fixture HS-001
pnpm headless:report --last
```

Komut adları implementation sırasında kesinleştirilebilir; davranış kontratı budur.

## Environment profilleri
### test
- yalnız mocks/test doubles
- sabit clock/seed destekli
- network disabled by default

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
