# 10 — Evaluation, Fixtures and Regression

> AI agent systems should be evaluated with repeatable fixtures, explicit gates and regression checks, not only by reading whether one answer sounds good.

## Canonical principle

A system is not ready because it produced one convincing response.

A system is ready when it repeatedly satisfies:

```text
contract validity
+ safety and policy gates
+ hard constraint compliance
+ evidence and verification requirements
+ domain quality rubrics
+ coherence and usability checks
+ cost / latency / runtime limits
+ regression stability
```

Evaluation must be layered. A lower-level score cannot compensate for a higher-level gate failure.

For example:

- a beautiful answer cannot pass if it violates a hard constraint,
- a cheap run cannot pass if evidence is missing,
- a fast response cannot pass if the output contract is invalid,
- a high domain score cannot pass if a safety gate fails.

## Why fixture-first evaluation matters

Agentic systems are hard to test if every run depends on live tools, changing websites, unstable prices or model randomness.

Fixture-first evaluation makes the system testable before production:

- inputs are controlled,
- tool outputs are mocked or recorded,
- expected constraints are explicit,
- outputs are contract-validated,
- regressions become visible,
- agent changes can be compared safely.

## Evaluation layers

The canonical gate order is:

| Order | Gate | Purpose | Can be compensated? |
|---|---|---|---|
| 1 | Safety / policy gate | Prevent unsafe, forbidden or disallowed behavior | No |
| 2 | Contract validation | Ensure output shape is parseable and versioned | No |
| 3 | Hard constraint compliance | Ensure mandatory constraints are respected | No |
| 4 | Evidence and verification quality | Ensure claims are supported and freshness is known | Usually no |
| 5 | Domain quality rubric | Score usefulness, quality and domain fit | Yes, within allowed candidates |
| 6 | Plan coherence / usability | Check consistency, sequencing and human usability | Yes, within allowed candidates |
| 7 | Runtime quality | Measure latency, cost, retries and error behavior | Yes, unless threshold is blocking |
| 8 | Regression | Ensure known scenarios do not degrade | Depends on severity |

## Fixture types

| Fixture type | Purpose |
|---|---|
| Input fixture | Stable user request and context |
| Memory fixture | Stable scoped user or organization memory |
| Tool fixture | Mocked external tool response |
| Evidence fixture | Stable source/evidence bundle |
| Contract fixture | Expected input/output schema example |
| Golden scenario | End-to-end reference case with expected qualities |
| Failure fixture | Known bad input, missing data or contradiction |
| Regression fixture | Previously passing case that must keep passing |

## Minimum fixture structure

A reusable fixture should include:

```yaml
fixture_id: string
fixture_type: input | memory | tool | evidence | golden | failure | regression
version: string
scenario_name: string
purpose: string
input_context: object
mocked_capabilities: object[]
expected_contract: string
expected_gates:
  safety_policy: pass | fail
  contract_validation: pass | fail
  hard_constraints: pass | fail
  evidence_quality: pass | warning | fail
  domain_quality_min_score: number
  coherence_min_score: number
known_risks: string[]
review_notes: string[]
```

## Golden scenarios

A golden scenario is not just a sample prompt.

It must define:

- the user request,
- relevant context,
- hard constraints,
- soft preferences,
- tool/mock data,
- expected decision behavior,
- expected warnings,
- expected rejection cases,
- minimum quality thresholds.

Golden scenarios should be small enough to debug but realistic enough to catch architectural errors.

## Contract validation

Every agent and planner output must be checked for:

- schema version,
- required fields,
- allowed enum values,
- no generic ambiguous `status` fields when domain-specific fields are required,
- evidence references where required,
- confidence fields where required,
- error code format where applicable,
- lifecycle field compatibility.

Contract validation should happen before domain quality scoring.

## Hard constraint testing

Hard constraint tests should include both passing and failing candidates.

The evaluator should verify that:

- hard constraints are represented explicitly,
- violating candidates are rejected before ranking,
- rejection reason is preserved,
- rejected candidates are not reintroduced later,
- soft preferences are not accidentally promoted to hard constraints,
- hard constraints are not downgraded to preferences.

## Evidence testing

Evidence tests should verify:

- every factual claim that requires evidence has evidence,
- evidence has source metadata,
- freshness and retrieved time are present where needed,
- verification status is explicit,
- conflicts are surfaced,
- stale evidence produces warning or rejection according to policy,
- final answers do not hide uncertainty.

## Regression testing

Regression testing protects previous decisions from accidental degradation.

A regression case should be added when:

- a bug is found,
- a planning failure occurs,
- a hard constraint is violated,
- a tool failure caused wrong behavior,
- a prompt change fixes a specific issue,
- a new architectural rule is introduced.

Regression tests should compare behavior at the level of contracts and gates, not exact wording unless wording is the contract.

## Evaluation output

Evaluation should produce a structured report:

```yaml
evaluation_run_id: string
scenario_id: string
system_version: string
model_config: object
fixture_versions: string[]
overall_result: pass | warning | fail | blocked
gate_results:
  safety_policy: pass | fail
  contract_validation: pass | fail
  hard_constraints: pass | fail
  evidence_quality: pass | warning | fail
  domain_quality: pass | warning | fail
  coherence_usability: pass | warning | fail
  runtime_quality: pass | warning | fail
  regression: pass | warning | fail
failures: object[]
warnings: object[]
recommendations: string[]
```

## Agent behavior rules

Agents should:

- emit structured outputs that can be evaluated,
- include evidence and confidence references when required,
- preserve explicit uncertainty,
- expose constraint handling decisions,
- avoid hiding failures in fluent prose,
- support fixture mode.

Agents should not:

- assume live tools are always available,
- pass evaluation only by producing persuasive text,
- silently ignore missing evidence,
- treat evaluator feedback as user-facing truth without validation.

## Orchestrator behavior rules

The Orchestrator should:

- select which fixtures are used in test mode,
- run gates in canonical order,
- prevent lower-level scores from overriding higher-level failures,
- collect agent outputs and evaluation results,
- produce audit records,
- route failed gates to retry, fallback, clarification or rejection.

## Evaluator behavior rules

Evaluators should:

- use explicit rubrics,
- separate pass/fail gates from quality scores,
- explain failures with stable codes or categories,
- be reproducible where possible,
- avoid relying only on model-as-judge prose,
- support both automated checks and human review.

## Tatil Modu reference example

A Tatil Modu golden scenario can represent:

```text
Family trip planning from Kocaeli.
2 adults, children ages 6 and 2.
3-day Bursa or Balikesir trip.
Midday rest required.
Women-only beach must be evaluated if sea is suggested.
Traffic and parking realism must be considered.
Budget should be controlled.
```

Evaluation should check:

- child age constraints are respected,
- midday rest is not skipped,
- sea suggestions include privacy-sensitive alternatives where required,
- closed or stale POI information is not presented as certain,
- hard constraints are filtered before ranking,
- alternatives are practical rather than merely attractive,
- final plan explains trade-offs and uncertainty.

## Checklist

Before an agentic system is implementation-ready:

- [ ] Golden scenarios are defined.
- [ ] Fixture mode exists.
- [ ] Tool mocks are available.
- [ ] Contract validation runs before quality scoring.
- [ ] Safety and hard constraint gates are non-compensable.
- [ ] Evidence quality is checked.
- [ ] Domain quality rubrics are explicit.
- [ ] Regression cases are tracked.
- [ ] Evaluation reports are structured.
- [ ] Failures produce actionable categories.
