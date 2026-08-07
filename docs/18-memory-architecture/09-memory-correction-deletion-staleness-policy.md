# 09 — Memory Correction, Deletion and Staleness Policy

**Doküman türü:** memory correction/deletion/staleness policy design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu belge, yanlış, eski, çelişkili veya kullanıcı tarafından düzeltilen memory bilgisinin nasıl ele alınacağını tanımlar.

## Ana karar

```yaml
memory_correction_deletion_staleness_policy_state: drafted
user_correction_highest_priority: true
stale_memory_cannot_drive_hard_decision_without_check: true
implementation_allowed: false
```

## Correction policy

Kullanıcı mevcut memory ile çelişen açık bir ifade verirse kullanıcı ifadesi önceliklidir.

```yaml
correction_priority:
  explicit_user_correction: highest
  recent_user_statement: high
  old_memory: lower
  inferred_memory: lowest
```

## Correction örneği

```text
Eski memory: Çocuk yaşı 2 ve 6.
Yeni kullanıcı ifadesi: Artık çocuklar 3 ve 7 yaşında.
Karar: Eski child_age memory stale/corrected olarak işaretlenir; yeni bilgi candidate/commit sürecine alınır.
```

## Deletion policy

Kullanıcı bir bilginin kullanılmamasını isterse memory sistemi bunu silme veya devre dışı bırakma adayı olarak ele almalıdır.

```yaml
deletion_policy:
  explicit_delete_request: must_respect
  stop_using_preference: deactivate_or_scope_out
  remove_sensitive_memory: high_priority
  audit_without_content_possible: design_level_only
```

## Staleness policy

Bazı memory türleri zamanla eskir.

```yaml
staleness_examples:
  child_age:
    stale_risk: time_based
    action: derive_age_or_ask_when_needed
  budget_preference:
    stale_risk: medium
    action: treat_as_hint_not_constraint
  origin_city:
    stale_risk: low_to_medium
    action: use_with_disclosure_if_relevant
  privacy_constraint:
    stale_risk: low
    action: preserve_but_scope_check
```

## Conflict handling

```yaml
conflict_handling:
  old_memory_vs_new_user_statement: prefer_new_user_statement
  two_memory_items_conflict: flag_conflict
  conflict_affects_hard_constraint: ask_or_disclose_uncertainty
  conflict_affects_soft_preference: lower_confidence
```

## Final response etkisi

Stale veya conflict memory final cevaba kesin bilgi olarak taşınmaz.

```text
Daha önceki aile bilgisi eski olabilir; bu nedenle planı çocuk yaşına hassas noktalarda temkinli hazırladım.
```

## Yasaklar

```yaml
forbidden_behavior:
  stale_memory_as_current_fact: forbidden
  ignore_user_correction: forbidden
  keep_using_deleted_sensitive_memory: forbidden
  hide_memory_conflict_from_final_when_it_affects_plan: forbidden
```

## Kapanış kararı

Memory doğruluğu statik değildir. Düzeltme, silme ve staleness sinyalleri memory architecture içinde birinci sınıf kavramdır.
