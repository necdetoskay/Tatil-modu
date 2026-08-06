# ADR-0002 — 10 Agent Mimarisi (20 Agent'den tasarruf)

| Alan | Değer |
|---|---|
| Tür | Process ADR |
| Durum | Accepted |
| Tarih | 2026-08-06 |
| Karar Sahibi | Project Team |
| İlgili Doküman | ARCH-002 |

## Bağlam

Oturumda 20 ayrı agent önerisi yapılmıştı (User Profile, Destination Discovery, Weather, Budget, Transportation, Route Planner, Hotel Research, Restaurant Research, Attraction, Review Intelligence, Hidden Gem, Safety, Event, Child Friendly, Accessibility, Daily Planner, Experience, Memory, Report Generator, Orchestrator).

## Karar

10 domain agent + 1 Orchestrator ile başlanacaktır.

## Gerekçe

1. **Koordinasyon karmaşıklığı**: 20 agent → (20×19)/2 = 190 handoff ilişkisi. 10 agent → 90.
2. **Test yükü**: 15 test × 20 agent = 3000 test. 15 × 10 = 150.
3. **Sorumluluk büyüklüğü**: Her agent daha geniş sorumluluk alanına sahip olur, uzmanlık derinliği artar.
4. **Orchestrator karmaşıklığı**: 20 agentı yönetmek çok karmaşık. 10 daha yönetilebilir.

## Değerlendirilen Seçenekler

### A. 20 ayrı agent (orijinal öneri)

**Eleyildi.** Aşırı granularite, test ve koordinasyon overhead'i.

### B. 10 domain agent + 1 Orchestrator (seçildi)

**Kabul edildi.** Uzmanlık derinliği korunur, koordinasyon basitleşir.

### C. 5 mega-agent

**Eleyildi.** Tekrarlanabilirlik ve bağımsız test edilebilirlik kaybolur.

## Sonuçlar

### Olumlu

- Agent sayısı yarıya iner (~50% azalma)
- Test sayısı kontrollü kalır
- Orchestrator daha az komponent yönetir

### Olumsuz

- Bazı agent'lar daha karmaşık specification gerektirir
- Belki daha sonra sub-agent'lara bölünmesi gerekebilir

## Değiştirme Koşulu

Agent sayısı illa da büyüdüğünde (ör: Review Intelligence içinde 5 sub-agent), yeni ADR ile yeniden değerlendirilir.
