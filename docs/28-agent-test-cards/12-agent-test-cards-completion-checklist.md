# Agent Test Cards Completion Checklist

## Agent coverage
- [x] Trip Intake Test Card
- [x] Constraint & Policy Test Card
- [x] Family Suitability Test Card
- [x] Destination Candidate Test Card
- [x] Route & Logistics Test Card
- [x] Accommodation Fit Test Card
- [x] Activity Fit Test Card
- [x] Day Plan Composer Test Card
- [x] Verification & Evidence Test Card
- [x] Final Response Composer Test Card

## Required dimensions
- [x] P0/P1/P2 expectations
- [x] happy-path fixtures
- [x] missing/ambiguity cases
- [x] conflict/edge cases
- [x] capability failure cases where applicable
- [x] memory/privacy cases where applicable
- [x] adversarial/regression cases
- [x] forbidden behavior assertions
- [x] deterministic test mode
- [x] real model benchmark expectations
- [x] exit gate

## Cross-layer checks
- [x] Hard constraint enforcement remains Policy Engine ownership.
- [x] Capability authorization remains capability platform ownership.
- [x] Canonical memory write remains Memory Platform ownership.
- [x] Agent-to-agent direct calling remains forbidden.
- [x] Verification status cannot be overridden by prose/quality score.
- [x] Final composer cannot create new facts.
- [x] P0 requirements have primary test owners.

## Completion decision
```yaml
agent_test_card_design: first_phase_completed
all_10_agents_covered: true
cross_agent_coverage_matrix: complete
L3_execution_status: not_started
implementation_required_before_execution: true
ui_development_allowed: false
```

Bu checklist testlerin PASS olduğunu değil, her agent'ın hangi sınavdan geçeceğinin canonical olarak tanımlandığını gösterir.
