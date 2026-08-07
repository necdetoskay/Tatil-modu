# 10 — Regression and Golden Baseline Policy

**Doküman türü:** regression ve golden baseline policy design  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Purpose

Bu dosya, Tatil Modu fixture ve evaluation tasarımında golden scenario davranışlarının zamanla bozulmaması için kullanılacak regression ve baseline politikasını tanımlar.

Bu dosya test runner değildir.

Bu dosya CI workflow, snapshot test, otomasyon script'i veya runtime evaluator implementation içermez.

Amaç şudur:

```text
Bir agent, contract, prompt veya orchestration tasarımı değiştiğinde hangi golden davranışların bozulmuş sayılacağı önceden tanımlı olmalıdır.
```

## Ana karar

```yaml
policy_id: regression_and_golden_baseline_policy
policy_state: drafted
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
source_of_truth: docs/13-fixtures-and-evaluation/10-regression-and-golden-baseline-policy.md
related_artifacts:
  - 02-golden-scenario-catalog.md
  - 03-family-travel-fixture-pack.md
  - 04-constraint-violation-fixture-pack.md
  - 05-evidence-gap-fixture-pack.md
  - 06-privacy-sensitive-beach-fixture-pack.md
  - 07-route-logistics-fixture-pack.md
  - 08-day-plan-coherence-fixture-pack.md
  - 09-final-response-quality-rubric.md
```

## Baseline nedir?

Golden baseline, belirli bir fixture için kabul edilen doğru davranışın tasarım seviyesindeki referansıdır.

Baseline şunları içerir:

```yaml
baseline_components:
  - fixture_id
  - related_golden_scenario
  - expected_contract_behavior
  - expected_blockers
  - expected_warnings
  - expected_evidence_gaps
  - expected_final_response_properties
  - forbidden_outputs
  - rubric_thresholds
```

Baseline, tam metin cevabın birebir aynı kalması anlamına gelmez.

Baseline, korunması gereken davranışsal ve semantik kalite sınırıdır.

## Regression nedir?

Regression, daha önce kabul edilen bir fixture davranışının sonraki tasarım veya prompt değişiklikleriyle bozulmasıdır.

```yaml
regression_types:
  - hard_constraint_regression
  - evidence_disclosure_regression
  - family_suitability_regression
  - route_logistics_regression
  - privacy_requirement_regression
  - day_plan_coherence_regression
  - final_response_quality_regression
  - contract_shape_regression
```

## Kritik regression sınıfları

Aşağıdaki regression türleri yüksek öncelikli kabul edilir:

```yaml
critical_regressions:
  hard_constraint_ignored:
    severity: critical
    allowed: false
  unverified_claim_presented_as_fact:
    severity: critical
    allowed: false
  women_only_beach_requirement_hidden:
    severity: critical
    allowed: false
  child_ages_ignored:
    severity: critical
    allowed: false
  toddler_rest_block_removed:
    severity: critical
    allowed: false
  blocker_missing_from_final_response:
    severity: critical
    allowed: false
```

## Non-critical regression sınıfları

Aşağıdaki regression türleri doğrudan kritik olmayabilir; fakat takip edilmelidir:

```yaml
non_critical_regressions:
  wording_quality_decreased:
    severity: warning
  alternatives_less_clear:
    severity: warning
  budget_explanation_less_helpful:
    severity: warning
  route_warning_less_prominent:
    severity: warning
  next_steps_less_actionable:
    severity: warning
```

## Golden scenario koruma kuralları

```yaml
golden_scenario_protection_rules:
  GS-001:
    must_preserve:
      - kocaeli_origin
      - children_age_2_and_6
      - low_fatigue_planning
      - daily_alternatives
  GS-002:
    must_preserve:
      - women_only_beach_required_when_sea_recommended
      - privacy_evidence_gap_visible
      - non_sea_fallback_when_needed
  GS-003:
    must_preserve:
      - five_day_structure
      - alternatives_per_day
      - lunch_rest_compatibility
  GS-004:
    must_preserve:
      - budget_uncertainty_disclosure
      - own_car_context
      - child_fatigue_risk
  GS-005:
    must_preserve:
      - morning_anchor_activity
      - light_afternoon_options
      - post_activity_fatigue_considered
  GS-006:
    must_preserve:
      - rainy_day_indoor_fallback
      - weather_uncertainty_disclosure
  GS-007:
    must_preserve:
      - excessive_drive_warning
      - toddler_rest_need
  GS-008:
    must_preserve:
      - missing_date_and_budget_as_clarification_or_assumption
  GS-009:
    must_preserve:
      - unverified_price_and_hours_not_as_fact
  GS-010:
    must_preserve:
      - hard_constraint_beats_soft_preference
```

## Baseline update policy

Golden baseline güncellenebilir; fakat yalnızca açık gerekçe ile.

```yaml
baseline_update_requires:
  - reason_for_change
  - affected_fixture_ids
  - affected_golden_scenarios
  - old_expected_behavior_summary
  - new_expected_behavior_summary
  - risk_assessment
  - reviewer_decision
```

Aşağıdaki gerekçeler baseline güncellemesi için geçerli olabilir:

```yaml
valid_baseline_update_reasons:
  - product_requirement_changed
  - agent_contract_boundary_changed
  - fixture_was_ambiguous
  - rubric_threshold_was_incomplete
  - safety_or_privacy_rule_strengthened
  - evidence_policy_refined
```

Aşağıdaki gerekçeler tek başına geçerli değildir:

```yaml
invalid_baseline_update_reasons:
  - model_output_changed
  - prompt_output_sounds_better
  - implementation_is_easier
  - fewer_tokens_preferred_without_quality_review
  - tool_cannot_currently_verify_the_claim
```

## Regression acceptance policy

```yaml
acceptance_policy:
  critical_regression_allowed: false
  hard_constraint_regression_allowed: false
  evidence_fact_regression_allowed: false
  privacy_requirement_regression_allowed: false
  child_safety_or_fatigue_regression_allowed: false
  warning_level_regression_allowed_with_review: true
```

Bir critical regression varsa ilgili değişiklik kabul edilmiş sayılmaz.

## Baseline granularity

Baseline'lar üç seviyede tutulmalıdır:

```yaml
baseline_levels:
  contract_level:
    purpose: "Contract shape ve required field davranışı korunur"
  scenario_level:
    purpose: "Golden scenario için temel davranış korunur"
  final_response_level:
    purpose: "Kullanıcıya görünen cevapta blocker, warning ve uncertainty görünür kalır"
```

## Drift policy

Model veya prompt çıktısı birebir aynı olmayabilir.

Kabul edilebilir drift:

```yaml
allowed_drift:
  - wording_changes
  - option_order_changes_when_quality_same
  - more_helpful_explanation_without_constraint_loss
  - clearer_warning_language
  - better_grouping_of_alternatives
```

Kabul edilemez drift:

```yaml
forbidden_drift:
  - hard_constraint_removed
  - evidence_gap_hidden
  - blocker_softened_into_optional_note
  - child_age_context_removed
  - privacy_requirement_removed
  - exact_live_claim_added_without_evidence
  - daily_alternatives_removed
```

## Review checklist

Her baseline değişikliği şu sorularla gözden geçirilmelidir:

```yaml
review_questions:
  - Hard constraint davranışı değişti mi?
  - Evidence gap görünürlüğü azaldı mı?
  - Çocuk yaşı ve dinlenme ihtiyacı korunuyor mu?
  - Kadınlar plajı / mahremiyet şartı doğru taşınıyor mu?
  - Final cevapta blocker ve uncertainty görünür mü?
  - Alternatif sayısı ve gün akışı beklentisi korunuyor mu?
  - Değişiklik sadece yazım iyileştirmesi mi yoksa davranış değişikliği mi?
```

## Reporting policy

Regression raporu tasarım seviyesinde şu alanları taşımalıdır:

```yaml
regression_report_fields:
  - regression_id
  - detected_in_fixture
  - related_golden_scenario
  - regression_type
  - severity
  - expected_behavior
  - observed_behavior_summary
  - affected_contracts
  - affected_agents
  - decision
  - required_follow_up
```

## Exit criteria

Bu policy tamamlanmış sayılmak için şunları sağlamalıdır:

```yaml
exit_criteria:
  - critical_regression_classes_defined: true
  - baseline_update_policy_defined: true
  - allowed_and_forbidden_drift_defined: true
  - golden_scenario_protection_rules_defined: true
  - regression_report_fields_defined: true
  - implementation_still_blocked: true
```

## Current status

```yaml
policy_state: drafted
next_artifact: 11-evaluation-completion-checklist.md
implementation_allowed: false
prototype_allowed: false
test_runner_code_allowed: false
```
