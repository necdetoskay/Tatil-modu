# 10 — Human Review Handoff Policy

**Doküman türü:** human review handoff policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu dosya, Quality Engine değerlendirmesi sonucunda hangi durumların insan incelemesine veya kullanıcıya görünür dikkat notuna devredileceğini tanımlar.

Bu dosya gerçek human-in-the-loop sistemi veya review queue implementation değildir.

## Human review gerektiren durumlar

```yaml
human_review_triggers:
  unresolved_hard_constraint_conflict:
    example: "kullanıcı isteği kendi içinde çelişkili"
  privacy_sensitive_uncertainty:
    example: "kadınlar plajı şartı aktif ama güvenilir kaynak doğrulaması bulunamıyor"
  high_cost_or_booking_risk:
    example: "yüksek bütçeli konaklama önerisi availability/fiyat belirsiz"
  legal_or_official_rule_uncertainty:
    example: "resmi kural veya tesis politikası belirsiz"
  repeated_quality_failure:
    example: "retry/fallback sonrası aynı blocker devam ediyor"
  user_profile_conflict:
    example: "memory ile yeni istek çelişiyor"
```

## Handoff severity

```yaml
handoff_severity:
  informational:
    meaning: "kullanıcıya sadece kontrol notu gerekir"
  review_recommended:
    meaning: "plan verilebilir ama kritik seçimden önce insan/kullanıcı kontrolü önerilir"
  review_required:
    meaning: "kesin plan veya iddia için insan/kullanıcı doğrulaması gerekir"
  blocked_until_resolved:
    meaning: "bu haliyle final response güvenli değildir"
```

## Kullanıcıya görünürlük

```yaml
user_visibility_rules:
  hidden_internal_review_reason: forbidden_for_user_relevant_risk
  visible_evidence_gap: required_when_affecting_decision
  visible_privacy_uncertainty: required
  visible_cost_uncertainty: required_when_budget_sensitive
  visible_route_uncertainty: required_when_plan_depends_on_it
```

## Handoff output alanları

```yaml
handoff_output:
  handoff_id: string
  trigger_type: enum
  severity: enum
  user_visible_summary: string
  internal_review_note: string
  required_resolution: string
  final_response_allowed: boolean
```

## Örnek

```yaml
example:
  trigger: privacy_sensitive_uncertainty
  condition: "deniz planı öneriliyor, kadınlar plajı şartı aktif, verification missing"
  severity: blocked_until_resolved
  required_resolution: "privacy uygunluğu doğrulanmalı veya deniz alternatifi kesin öneri olmaktan çıkarılmalı"
```

## Kapanış

Bu policy, hangi kalite risklerinin insan/kullanıcı kontrolüne devredileceğini tanımlar; review queue veya workflow implementation değildir.
