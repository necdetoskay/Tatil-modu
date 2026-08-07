# 04 — Hard Failure and Blocker Policy

**Doküman türü:** hard failure and blocker policy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu dosya, Quality Engine'in hangi durumları doğrudan hard failure veya blocker olarak sınıflandıracağını tanımlar.

Hard failure, kalite puanı ile telafi edilemeyen kritik ihlaldir.

## Hard failure tanımı

```yaml
hard_failure:
  definition: "final response veya planın bu haliyle kullanıcıya güvenli/uygun şekilde sunulamayacağı kritik ihlal"
  can_be_compensated_by_score: false
  requires_user_visible_disclosure: true
```

## Blocker sınıfları

```yaml
blocker_classes:
  hard_constraint_violation:
    examples:
      - "kadınlar plajı şartı varken deniz önerisi mahremiyet doğrulaması olmadan kesin sunuluyor"
      - "2 yaş çocukla öğle dinlenmesi açıkça istenmişken hiç dinlenme yok"
  evidence_integrity_failure:
    examples:
      - "fiyat kesin yazılmış ama evidence yok"
      - "açılış saati kesin yazılmış ama verification_status missing"
  privacy_sensitive_failure:
    examples:
      - "mahremiyet şartı final response'ta görünmez hale geliyor"
      - "privacy-sensitive bilgi düşük güvenle hard karşılandı deniyor"
  unsafe_family_plan:
    examples:
      - "çok küçük çocukla aşırı yoğun/uzun rota uyarısız öneriliyor"
  contract_invalidity:
    examples:
      - "required field eksik ama plan kesinleştiriliyor"
  policy_precedence_failure:
    examples:
      - "soft preference hard constraint'i override ediyor"
```

## Blocker karar çıktısı

```yaml
blocker_output_fields:
  blocker_id: string
  blocker_type: enum
  affected_artifact: string
  affected_claim_id: string_or_null
  severity: hard_blocker
  user_visible_summary: string
  required_revision: string
  final_response_allowed: false
```

## Warning ile farkı

```yaml
warning:
  meaning: "plan verilebilir ama kullanıcıya görünür uyarı gerekir"
  final_response_allowed: conditional

blocker:
  meaning: "bu haliyle final response verilemez veya kesin iddia geri çekilmelidir"
  final_response_allowed: false
```

## Örnek kararlar

```yaml
examples:
  unverified_price:
    claim: "Otel gecelik 3500 TL"
    evidence_status: missing
    decision: blocker_if_presented_as_fact
    allowed_revision: "fiyat doğrulanmalı veya aralık/uyarı olarak sunulmalı"
  women_only_beach_missing:
    claim: "deniz planı uygundur"
    requirement: "kadınlar plajı şartı aktif"
    verification_status: missing
    decision: hard_blocker
  toddler_rest_missing:
    claim: "tam gün yoğun gezi"
    family_context: "2 yaş çocuk"
    midday_rest: missing
    decision: blocker_or_needs_revision
```

## Kapanış

Bu policy, Quality Engine'in hangi durumlarda planı veya final cevabı durduracağını tanımlar; runtime blocker evaluator değildir.
