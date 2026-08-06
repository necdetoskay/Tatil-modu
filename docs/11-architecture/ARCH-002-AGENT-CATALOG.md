# Agent Catalog — Tatil-Plan v1.0

| Alan | Değer |
|---|---|
| Document ID | ARCH-002 |
| Sürüm | 1.0 |
| Durum | Taslak (Review) |
| EOS Sürümü | EOS v1.0 |
| Bağımlılıklar | PRD-001 |
| Son Güncelleme | 2026-08-06 |

---

## 1. Felsefe: 10 Agent, 1 Orchestrator

Oturumunuzda 20 ayrı agent önerisi yapılmıştu. Analizimize göre, **7-10 ana uzmanlık alanı** daha sağlıklıdır. Neden?

1. **Koordinasyon overhead'i azalır** — 20 agent arasında handoff için 380 ilişki var; 10 agent için 90.
2. **Test edilebilirlik artar** — Her agent için 12 test × 10 = 120 test; 120 × 20 = 2400 test.
3. **Her agent daha geniş sorumluluk alanına sahip olur** — Uzmanlık derinliği artar.

Daha sonra ihtiyaç duyduğumuzda, büyük agentları **alt uzmanlıklara** (sub-agent) böleriz.

---

## 2. Agent Haritası (v1.0)

| No | Agent ID | Sorumluluk | Girdi | Çıktı | Confidence Hedefi |
|----|----------|------------|-------|-------|-------------------|
| 01 | `orchestrator` | Görev dağıtımı, sonuç birleştirme, çatışma çözümü | TripProfile, tüm agent çıktıları | Final Plan | ≥ 0.85 |
| 02 | `trip-profile` | Kullanıcı profilini yapılandırma | Doğal dil, form | TripProfile | ≥ 0.80 |
| 03 | `destination-research` | Destinasyon keşfi, alternatif analizi | TripProfile | Destinations | ≥ 0.80 |
| 04 | `place-experience` | Aktiviteler, plajlar, müzeler, doğa | TripProfile + Destination | Places | ≥ 0.75 |
| 05 | `accommodation` | Otel/apartman araştırması | TripProfile + Destination | Hotels | ≥ 0.80 |
| 06 | `food-culture` | Yemek, restoran, yöresel lezzet | TripProfile + Destination | Restaurants | ≥ 0.75 |
| 07 | `review-intelligence` | Yorum analizi, trend tespiti | Place/Hotel/Restaurant ID'leri | ReviewSummary | ≥ 0.85 |
| 08 | `route-scheduler` | Günlük rota, zaman çizelgesi, sürüş süresi | TripProfile + Places + Hotels + Weather | DailyPlan | ≥ 0.80 |
| 09 | `budget-constraint` | Bütçe doğrulama, maliyet tahmini | TripProfile + Plan | BudgetReport | ≥ 0.90 |
| 10 | `quality-reviewer` | Plan kalitesi kontrolü, constraint validation | Final Plan + TripProfile | ReviewReport | ≥ 0.85 |

---

## 3. Dependency Graph

```
                    [Trip Profile Agent]
                          │
        ┌────────────┬────┼────────────┬────────────┐
        │            │    │            │            │
        ▼            ▼    ▼            ▼            ▼
 Destination    Place/Exp  Accommo-   Food/Culture   (parallel)
 Research       rience     dation
        │            │    │            │
        └────────────┼────┼────────────┘
                     │
                     ▼
              [Review Intelligence]
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
 Weather (data)   Route/Sched   Budget/Const
                     │            │
                     ▼            ▼
                   [Quality Reviewer]
                     │
                     ▼
              [Orchestrator]
                     │
                     ▼
              [Final Plan]
```

---

## 4. İletişim Protokolü

### 4.1. Synchronous vs Asynchronous

- **Synchronous**: Kritik path — Trip Profile → Destination → Accommodation → Route. Ardışık çalışırlar.
- **Asynchronous**: Paralel — Destination, Place/Experience, Food/Culture aynı anda çalışır.
- **Event-driven**: Weather → Route Planner (weather değiştiğinde route yeniden planlanır).

### 4.2. Handoff Contract Örneği

```
Trip Profile Agent
    ↓ TripProfile (JSON Schema)
Destination Research Agent
    ↓ Destinations (JSON Schema)
Accommodation Agent
    ↓ Hotels (JSON Schema)
Route Scheduler Agent
    ↓ DailyPlan (JSON Schema)
```

Her bir contract, `tests/schemas/` klasöründe JSON Schema olarak tanımlanır.

---

## 5. Agent Specification Template (ARCH-001)

Her agent şu 16 başlıkla tanımlanır:

| # | Başlık | Açıklama |
|---|--------|----------|
| 1 | Kimlik ve Amaç | Agent ID, versiyon, tek-satır tanım |
| 2 | Sorumluluk Sınırı | Ne yapar, ne yapmaz (✅/❌ listesi) |
| 3 | Tetiklenme Koşulları | Hangi event'ler agentı başlatır? |
| 4 | Girdi / Çıktı Sözleşmesi | JSON Schema linki |
| 5 | Kullanılan Veri Kaynakları | Resmî siteler, harita, yorum platformu, hava durumu |
| 6 | Kullanılan Tool'lar | API, web arama, geocoding, yönlendirme |
| 7 | Sistem Promptu | Composable katmanlar (5 katman) |
| 8 | Alt Görev Akışı | Sub-task workflow diagramı |
| 9 | Karar Algoritması ve Puanlama | Rule engine, scoring model |
| 10 | Diğer Agentlarla İletişim | Hangi agent'dan input, hangi agent'a output |
| 11 | Hata Yönetimi ve Yedek Stratejileri | Retry, timeout, failover |
| 12 | Cache ve Maliyet Optimizasyonu | Cache süresi, maliyet tahmini |
| 13 | Güven Puanı (Confidence) | Confidence nasıl hesaplanır? |
| 14 | Test Senaryoları | Fixture listesi + expected results |
| 15 | Başarı Metrikleri | Schema score, rule compliance, scenario pass rate |
| 16 | Loglama ve Gözlemlenebilirlik | Event logları, monitoring |

---

## 6. Agent Geliştirme Sırası

1. **Trip Profile Agent** (AGENT-002) — ✅ Tamamlandı
2. **Destination Research Agent** — Sıradaki
3. **Place & Experience Agent** — Sıradaki
4. **Accommodation Agent** — Sonra
5. **Food & Culture Agent** — Sonra
6. **Review Intelligence Agent** — Sonra
7. **Route & Schedule Optimizer** — Sonra
8. **Budget & Constraint Evaluator** — Sonra
9. **Quality Reviewer** — Sonra
10. **Orchestrator** — En son (hepsi tamamlandıktan sonra)

> Orchestrator, hiçbir agentın iç detaylarını bilmediği için **en son** geliştirilmelidir. Diğer agentların contract'ları netleştiğinde geliştirilir.
