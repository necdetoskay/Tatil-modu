# 04 — Soft Preference Ranking Policy

**Doküman türü:** soft preference ranking policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Purpose

Bu belge, soft preference'ların adaylar ve plan alternatifleri arasında nasıl sıralama etkisi yapacağını tanımlar.

Soft preference ranking, yalnızca hard constraint gate ve gerekli verification kararlarından sonra çalışır.

## Ana karar

```yaml
soft_preference_ranking_policy_state: drafted
implementation_allowed: false
prototype_allowed: false
ranking_algorithm_code_allowed: false
runtime_policy_engine_allowed: false
source_of_truth: docs/17-decision-policy-engine/04-soft-preference-ranking-policy.md
```

## Soft preference tanımı

Soft preference, kullanıcının istediği fakat karşılanmadığında planı otomatik olarak geçersiz yapmayan tercihtir.

## Soft preference örnekleri

```yaml
soft_preferences:
  - havuzlu_otel
  - kaplıca_veya_spa
  - doğa_aktivitesi
  - az_yorucu_akşam_programı
  - çocuklara_uygun_müze
  - yakın_ama_çok_iyi_alternatif
  - otopark_kolaylığı
  - sakin_mekan
```

## Ranking ön koşulları

```yaml
ranking_preconditions:
  hard_constraint_gate_passed: required
  critical_evidence_gate_passed_or_disclosed: required
  family_suitability_not_blocking: required
  route_logistics_not_blocking: required
```

Soft preference ranking bu ön koşullar sağlanmadan çalışmaz.

## Ranking etkisi

Soft preference şu kararları etkileyebilir:

```yaml
can_affect:
  - candidate_order
  - primary_vs_alternative_selection
  - day_block_priority
  - fallback_order
  - explanation_emphasis
```

Soft preference şunları etkileyemez:

```yaml
cannot_affect:
  - hard_constraint_pass_fail
  - evidence_status
  - safety_gate
  - privacy_sensitive_gate
  - verified_vs_unverified_fact_status
```

## Weighting tasarımı

Bu aşamada gerçek skor algoritması yazılmaz.

Tasarım seviyesinde soft preference etkileri band olarak tanımlanır:

```yaml
soft_preference_weight_bands:
  strong_preference:
    effect: candidate_should_move_up_if_all_gates_pass
  normal_preference:
    effect: tie_breaker_or_minor_rank_boost
  weak_preference:
    effect: explanation_only_or_low_rank_signal
  inferred_preference:
    effect: never_blocking_low_confidence
```

## Family-aware ranking

Aile uygunluğu soft preference gibi ele alınamaz.

Örneğin 2 yaş çocukla öğle uykusu ihtiyacı ranking sinyali değil, uygunluk/gate girdisidir.

## Evidence-aware ranking

Doğrulanmamış bir soft preference claim'i candidate'i yukarı taşıyabilir; fakat kesin bilgi gibi sunulamaz.

Örnek:

```yaml
pool_claim_unverified:
  ranking_effect: weak_or_none
  final_response: disclose_verification_need
```

## Forbidden behavior

```yaml
forbidden:
  - soft_preference_overrides_hard_constraint
  - inferred_preference_treated_as_explicit_requirement
  - high_review_score_overrides_missing_evidence
  - nice_option_selected_as_primary_despite_blocker
  - ranking_score_hidden_from_final_disclosure_when_relevant
```
