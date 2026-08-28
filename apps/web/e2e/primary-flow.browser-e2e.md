# Primary Flow Browser E2E

Bu test gerçek browser’da `http://127.0.0.1:4173` üzerinde uygulanır.

## Steps and assertions

1. `/` açılır; `Planınızı anlatın` görünür ve başlangıç noktası, hedef bölge, gün ve bütçe alanları bulunur.
2. `Devam et` tıklanır; `Sizi doğru anladık mı?` ve üç hard constraint açıklaması görünür.
3. `Planı oluştur` tıklanır; loading mesajı görünür, ardından URL `/plan` olur.
4. `/plan` üzerinde `Doğrulandı`, Yalova plan başlığı, verification disclosure ve iki günlük plan görünür.
5. `Kanıt eksik senaryosunu göster` tıklanır; URL `/blocked`, alert görünür ve günlük final plan görünmez.

## Last execution

- Date: 2026-08-28
- Browser: Codex In-app Browser
- Result: PASS
- Observed: `intakeHeading=1`, `confirmationHeading=1`, `planUrl=/plan`, `dayCount=2`, `verified=1`, `blockedUrl=/blocked`, `alertCount=1`, `finalPlanHidden=true`
