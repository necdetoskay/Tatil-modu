# Contract Completion Checklist

**Doküman türü:** canonical contract completion checklist  
**Durum:** tamamlandı  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu doküman, `docs/12-contracts/` altındaki ilk-phase contract tasarım setinin tamamlanma durumunu kontrol eder.

Bu checklist runtime implementation, schema code veya validator tasarımı değildir.

Bu dokümanın amacı şudur:

```text
Contract tasarım seti, agent specification setinden gelen handoff ihtiyaçlarını kodlamaya geçmeden önce yeterince açık tanımlıyor mu?
```

## Ana karar

```yaml
contract_completion_checklist_state: completed
contract_design_first_phase: completed
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
schema_code_allowed: false
next_design_stage_required: true
```

## Kapsam kontrolü

| Alan | Dosya | Durum |
|---|---|---|
| Travel request canonical handoff | `travel-request-contract.md` | completed |
| Constraint and policy classification | `constraint-policy-contract.md` | completed |
| Family suitability output | `family-suitability-contract.md` | completed |
| Destination candidate output | `destination-candidate-contract.md` | completed |
| Route and logistics output | `route-logistics-contract.md` | completed |
| Accommodation fit output | `accommodation-fit-contract.md` | completed |
| Activity fit output | `activity-fit-contract.md` | completed |
| Day plan draft output | `day-plan-contract.md` | completed |
| Verification evidence report | `verification-evidence-contract.md` | completed |
| Final response output | `final-response-contract.md` | completed |
| Common evidence envelope | `common-evidence-envelope.md` | completed |
| Common error envelope | `common-error-envelope.md` | completed |

## Zorunlu contract ilkeleri

Aşağıdaki ilkeler tüm contract seti için tamamlanmış kabul edilir:

```yaml
versioned_contracts_required: true
producer_consumer_defined: true
required_optional_forbidden_fields_defined: true
evidence_fields_required_for_claims: true
confidence_fields_required: true
validation_status_required: true
hard_constraint_soft_preference_separation_required: true
privacy_sensitive_claims_visible: true
unverified_claim_as_fact_forbidden: true
runtime_implementation_forbidden: true
schema_code_forbidden: true
```

## Evidence ve doğrulama kontrolü

Aşağıdaki claim türleri için evidence ihtiyacı contract setinde açıkça taşınır:

```yaml
evidence_required_for:
  - opening_hours
  - ticket_price
  - accommodation_price
  - live_availability
  - parking_availability
  - drive_time
  - traffic_risk
  - weather
  - women_only_beach_status
  - facility_features
  - official_rules
  - age_restrictions
  - distance_or_radius_claim
```

## Hard blocker kontrolü

Aşağıdaki durumlar contract setinde görünür blocker veya error olarak taşınmalıdır:

```yaml
hard_blocker_visibility_required_for:
  - hard_constraint_violation
  - privacy_requirement_unverified_for_sea_plan
  - missing_required_family_profile
  - impossible_date_or_duration
  - unsupported_radius_exception_without_reason
  - evidence_gap_for_final_critical_claim
  - agent_scope_violation
```

## Final response güvenliği

Final kullanıcı cevabı için aşağıdaki kurallar tamamlanmış kabul edilir:

```yaml
final_response_rules:
  unverified_claim_as_fact: forbidden
  hard_blocker_hidden_from_user: forbidden
  internal_trace_leaked_to_user: forbidden
  hidden_chain_of_thought_leaked: forbidden
  alternatives_required_when_plan_present: true
  assumptions_visible_when_used: true
  evidence_gaps_visible_when_material: true
```

## Kodlamaya geçiş kararı

Bu contract setinin tamamlanması kodlamaya otomatik geçiş izni vermez.

```yaml
implementation_gate_after_contracts: closed
reason: "Fixture, evaluation, tool capability, memory/privacy ve UI/UX flow tasarımları tamamlanmadan kodlamaya geçilmez."
```

## Bir sonraki tasarım aşaması

Contract setinden sonra önerilen sıradaki alan:

```text
docs/13-fixtures-and-evaluation/
```

Bu alan şunları tasarlamalıdır:

```yaml
next_stage_scope:
  - golden travel request fixtures
  - hard constraint violation fixtures
  - women only beach privacy fixtures
  - family fatigue and rest fixtures
  - route logistics uncertainty fixtures
  - evidence gap fixtures
  - final response quality fixtures
  - regression acceptance criteria
```

## Tamamlanma kararı

```yaml
contract_design_state: first_phase_completed
completed_contracts_count: 13
next_stage: docs/13-fixtures-and-evaluation/
implementation_allowed: false
prototype_allowed: false
schema_code_allowed: false
```

## Açık tasarım notları

Bu aşamada açık kalan konular kodlama görevi değildir.

Açık konular bir sonraki tasarım aşamalarında ele alınmalıdır:

1. Fixture setlerinin örnek input/output detayları.
2. Evaluation skor kartlarının kabul eşikleri.
3. Tool capability mapping ve source trust sınıfları.
4. Memory disclosure paketlerinin fixture etkisi.
5. UI/UX akışında evidence ve belirsizlik gösterimi.
