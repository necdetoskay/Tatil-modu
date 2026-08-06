# Karar Kaydı

| ID | Tarih | Karar | Durum | ADR |
|----|-------|-------|-------|-----|
| D-001 | 2026-08-06 | Mobil uygulama vitrin, agent sistem gerçek ürün. Kodlama öncesi 2-3 hafta mimari tasarım. | Onaylandı | GOV-001 |
| D-002 | 2026-08-06 | İlk detaylı agent olarak Orchestrator değil, Trip Profile Agent seçildi. | Onaylandı | — |
| D-003 | 2026-08-06 | 20 agent değil, 10 domain agent ile başlanacak. | Tartışma | — |
| D-004 | 2026-08-06 | Test standardı TST-001 dokümentasyonu önce, kod sonra. | Onaylandı | TST-001 |
| D-005 | 2026-08-06 | Prompt composable katmanlara ayrılacak (5 katman). | Onaylandı | — |
| D-006 | 2026-08-06 | Triple evaluation zorunlu: Schema + Rule + LLM Reviewer. | Onaylandı | TST-001 |
| D-007 | 2026-08-06 | Trip Profile Agent dış tool kullanmaz. Fixture-mode test uyumlu. | Onaylandı | AGENT-002 |
| D-008 | 2026-08-06 | LLM Reviewer için doğru cevabı metinle değil, kural tablosuyla kıyaslayacağız. | Onaylandı | TST-001 |
