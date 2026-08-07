# 28 — Agent Test Cards

**Doküman türü:** canonical per-agent executable test design catalog  
**Durum:** first phase in progress  
**UI:** locked

## Amaç
Her canonical agent için bağımsız çalıştırılabilir fixture, assertion, failure-mode, capability, memory ve model-evaluation beklentilerini tek bir Test Card altında tanımlamak.

Bu klasör `docs/11-agent-specifications/` davranış sözleşmelerini değiştirmez; onları test edilebilir hale getirir.

## Test Card zorunlulukları
Her agent kartı en az şunları içerir:
- test purpose
- dependencies under test
- forbidden dependencies
- happy-path fixtures
- missing/ambiguous fixtures
- edge/constraint fixtures
- capability failure fixtures
- memory/privacy fixtures
- adversarial/regression fixtures
- P0/P1/P2 assertions
- forbidden behaviors
- deterministic test mode
- real model benchmark mode
- exit gate

## Agent seti
| # | Agent | Test Card |
|---:|---|---|
| 1 | Trip Intake | `01-trip-intake-agent-test-card.md` |
| 2 | Constraint & Policy | `02-constraint-policy-agent-test-card.md` |
| 3 | Family Suitability | `03-family-suitability-agent-test-card.md` |
| 4 | Destination Candidate | `04-destination-candidate-agent-test-card.md` |
| 5 | Route & Logistics | `05-route-logistics-agent-test-card.md` |
| 6 | Accommodation Fit | `06-accommodation-fit-agent-test-card.md` |
| 7 | Activity Fit | `07-activity-fit-agent-test-card.md` |
| 8 | Day Plan Composer | `08-day-plan-composer-agent-test-card.md` |
| 9 | Verification & Evidence | `09-verification-evidence-agent-test-card.md` |
| 10 | Final Response Composer | `10-final-response-composer-agent-test-card.md` |
| 11 | Cross-Agent Coverage Matrix | `11-cross-agent-coverage-matrix.md` |
| 12 | Completion Checklist | `12-agent-test-cards-completion-checklist.md` |

## Gate
Hiçbir agent L3 PASS olmadan orchestrator integration'a alınamaz.
