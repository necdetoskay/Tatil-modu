# UI Contract Traceability

| UI surface | Canonical source | Required representation | Safety rule |
|---|---|---|---|
| Constraint summary | Constraint Policy output | Olmazsa olmazlar, güçlü/esnek tercihler, varsayımlar | Hard constraint sessizce gevşetilemez |
| Plan overview | `final_response.plan_overview` | Süre, stil, deniz/mahremiyet durumu | UI yeni özet hesabı yapmaz |
| Daily cards | `final_response.daily_plan_cards` | Tema, sabah, öğle/dinlenme, öğleden sonra, akşam | Dinlenme gerçek plan öğesidir |
| Alternatives | `daily_plan_cards[].alternatives` | En az iki anlamlı seçenek ve trade-off açıklaması | Ranking yeniden üretilmez |
| Disclosures | `verification_disclosures` | Verified/unverified/stale/blocked + mesaj + evidence refs | Kaynaksız verified gösterilemez |
| Blockers | `upstream_hard_blockers`, `final_response.hard_blockers` | Açık blocker ve recovery action | Blocker gizlenemez |
| Confidence | `confidence_summary` | Overall confidence ve nedenleri | UI confidence üretemez |
| User actions | `user_action_checklist`, revision contract | Yapılacaklar ve revision scope | Orchestrator routing UI’a ait değildir |
| Errors | Common Error Envelope | Severity, user message, recovery action | Hard blocker user-visible olmalı |

## Forbidden UI ownership

`candidate_generation`, `constraint_classification`, `ranking`, `verification`, `confidence_generation`, `quality_score`, `orchestration_routing`, `memory_write`.
