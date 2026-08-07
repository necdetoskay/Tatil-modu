# 08 — Memory Write Commit Policy

**Doküman türü:** memory write and commit policy design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu belge, hangi bilginin canonical memory'e yazılabileceğini, hangi bilginin candidate olarak kalacağını ve hangi bilginin asla memory'e yazılmayacağını tanımlar.

## Ana karar

```yaml
memory_write_commit_policy_state: drafted
expert_agent_direct_write: forbidden
candidate_memory_required_before_commit: true
memory_platform_commit_owner: true
implementation_allowed: false
```

## Write akışı

```text
Agent output → candidate memory signal → Memory Platform review → commit / reject / ask user / keep session-only
```

## Commit edilebilir bilgi

```yaml
commit_allowed_when:
  explicit_user_statement: true
  task_relevant: true
  not_volatile_external_fact: true
  confidence_sufficient: true
  scope_defined: true
  privacy_policy_satisfied: true
```

## Candidate olarak kalması gereken bilgi

```yaml
candidate_only_when:
  inferred_from_single_interaction: true
  repeated_but_not_explicit: true
  potentially_sensitive_without_confirmation: true
  ambiguous_scope: true
  stale_conflict_exists: true
```

## Asla memory yapılmayacak bilgi

```yaml
never_commit:
  raw_provider_response: true
  exact_current_price: true
  live_weather: true
  temporary_hotel_availability: true
  opening_hours_snapshot: true
  agent_scratchpad: true
  hidden_reasoning: true
  debug_logs: true
  credentials_or_tokens: true
```

## User confirmation gerektiren durumlar

```yaml
requires_user_confirmation:
  privacy_sensitive_constraint: often
  family_structure_change: yes
  child_age_change: yes_if_conflict
  permanent_budget_constraint: yes
  strong_negative_preference: recommended
```

## Memory entry minimum alanları

```yaml
memory_entry_minimum_fields:
  memory_id: required
  memory_type: required
  claim: required
  scope: required
  confidence: required
  source_signal: required
  captured_at: required
  freshness_policy: required
  privacy_class: required
  correction_status: required
```

## Kapanış kararı

Memory write kontrollü commit sürecidir. Agent'ın iyi bir çıkarımı bile doğrudan canonical memory değildir.
