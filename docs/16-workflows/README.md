# Workflow Kataloğu

| Alan | Değer |
|---|---|
| Document ID | WORKFLOW-000 |
| Sürüm | 0.1 (Plan) |
| Durum | Planlandı |
| EOS Sürümü | EOS v1.0 |
| Son Güncelleme | 2026-08-06 |

## Amaç

Agentlar arası iş akışlarını (workflow) ve Orchestrator'ın karar mantığını tanımlar.

## Workflow'lar

| ID | Workflow | Açıklama | Agent'lar |
|----|----------|----------|-----------|
| WF-01 | Trip Profile Creation | Kullanıcı girdi → TripProfile | trip-profile-agent |
| WF-02 | Parallel Research | Destination, Place, Food paralel araştırma | destination, place, food |
| WF-03 | Sequential Planning | Accommodation → Review → Budget | accommodation, review, budget |
| WF-04 | Route Building | Places + Hotels + Weather → Daily Plan | route-scheduler, weather |
| WF-05 | Quality Review | Final plan kontrolü | quality-reviewer |
| WF-06 | Dynamic Replan | Yağmur/hava değiştiğinde | weather → route → experience |
| WF-07 | Orchestrator Final | Tüm sonuçları birleştirme | orchestrator |

## Orchestrator Kararları

1. Trip Profile Agent → `confidence ≥ 0.80` ve `conflictFlags` boş? → Diğer agentları devreye al.
2. Tüm agent çıktıları toplandıktan sonra → Route Scheduler'ı çalıştır.
3. Route + Budget + Review → Quality Reviewer.
4. Quality Reviewer skor ≥ 0.80? → Final plan. < 0.80 → yeniden planla (retry loop).

## İlgili Dokümanlar

- [System Overview](../01-architecture/system-overview.md) — 3 katmanlı mimari
- [Agent Catalog](../02-agents/agent-catalog.md)
