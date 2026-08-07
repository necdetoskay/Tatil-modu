# 11 — Memory Evaluation and Regression Policy

**Doküman türü:** memory evaluation and regression policy design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu belge, memory architecture kararlarının fixture, regression ve kalite değerlendirme seviyesinde nasıl kontrol edileceğini tanımlar.

Bu belge test runner değildir.

## Ana karar

```yaml
memory_evaluation_regression_policy_state: drafted
test_runner_allowed: false
runtime_memory_eval_allowed: false
memory_regression_concepts_defined: true
implementation_allowed: false
```

## Memory regression nedir?

Memory regression, sistemin memory bilgisini yanlış, aşırı, eksik veya güvenliksiz kullanmasıdır.

## Kritik regression sınıfları

```yaml
critical_memory_regressions:
  hidden_memory_leak:
    description: final response gizli memory'i açıklamasız kullanır
  stale_memory_as_fact:
    description: eski memory güncel gerçek gibi kullanılır
  inferred_sensitive_memory_commit:
    description: hassas tercih çıkarımdan kalıcı memory yapılır
  soft_preference_as_hard_constraint:
    description: beğeni veya eğilim zorunlu kısıt yapılır
  agent_direct_memory_write:
    description: expert agent canonical memory'e doğrudan yazar
  excessive_disclosure:
    description: agent'a gereğinden fazla kişisel bilgi verilir
```

## Evaluation coverage

```yaml
memory_evaluation_coverage:
  memory_boundary: required
  family_profile_memory: required
  privacy_sensitive_memory: required
  disclosure_package: required
  memory_write_commit: required
  correction_and_staleness: required
  trip_history_learning: required
```

## Golden fixture beklentileri

Memory fixture'leri şu davranışları test etmelidir:

```text
Çocuk yaşını doğru plan bağlamına taşır.
Eski çocuk yaşı bilgisini güncel gibi kullanmaz.
Kadınlar plajı şartını sadece deniz/plaj bağlamında aktif eder.
Geçmiş beğeniyi current request üzerine zorla bindirmez.
Agent full profile yerine disclosure package kullanır.
Final response memory kullanımını gerektiğinde görünür açıklar.
```

## Allowed drift

```yaml
allowed_drift:
  wording_of_memory_disclosure: allowed
  preference_summary_style: allowed
  non_critical_memory_ordering: allowed
```

## Forbidden drift

```yaml
forbidden_drift:
  hide_privacy_sensitive_memory_use: forbidden
  use_stale_memory_as_fact: forbidden
  promote_preference_to_constraint_without_signal: forbidden
  expose_child_details_unnecessarily: forbidden
  bypass_memory_platform_ownership: forbidden
```

## Kapanış kararı

Memory evaluation, metin benzerliği değil; memory kullanımının güvenli, sınırlı, güncel ve açıklanabilir olup olmadığını kontrol eder.
