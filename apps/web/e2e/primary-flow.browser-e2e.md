# Primary Flow Browser E2E

Bu test gerçek browser’da `http://127.0.0.1:4173` üzerinde uygulanır.

## Steps and assertions

1. `/` açılır; `Planınızı anlatın` görünür ve dört intake alanı bulunur.
2. `Devam et` tıklanır; `Sizi doğru anladık mı?` ve üç hard constraint açıklaması görünür.
3. `Planı oluştur` tıklanır; `POST /api/plans` planning job döndürür, loading mesajı görünür ve UI `GET /api/plans/:id` polling yapar.
4. Typed adapter’dan geçen API response ile `/plan` üzerinde `Doğrulandı`, verification disclosure ve iki günlük plan görünür.
5. `Kanıt eksik senaryosunu göster` ikinci API job’ını başlatır; URL `/blocked`, alert görünür ve günlük final plan görünmez.

## Last execution

- Date: 2026-08-28
- Browser: Codex In-app Browser
- Execution URL: `http://127.0.0.1:4174` (alternate local port)
- Result: PASS
- Observed: `intakeInputs=4`, `confirmationHeading=1`, `loading=1`, `planUrl=/plan`, `dayCount=2`, `verified=1`, `blockedUrl=/blocked`, `alertCount=1`, `finalPlanHidden=true`
