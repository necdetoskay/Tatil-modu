# 06 — Evidence Quality Rubric

**Doküman türü:** evidence quality rubric  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu dosya, Tatil Modu planlarında kullanılan iddiaların evidence, confidence, freshness ve source visibility açısından nasıl değerlendirileceğini tanımlar.

Evidence quality, final cevabın dürüstlüğünü belirleyen ana kalite boyutudur.

## Evidence kalite boyutları

```yaml
evidence_quality_dimensions:
  evidence_presence:
    focus: "claim için evidence var mı?"
  source_trust:
    focus: "kaynak resmi, structured provider, review signal veya zayıf kaynak mı?"
  freshness_fit:
    focus: "claim türüne göre bilgi yeterince güncel mi?"
  confidence_alignment:
    focus: "confidence seviyesi final anlatıdaki kesinlik ile uyumlu mu?"
  user_visibility:
    focus: "belirsizlik kullanıcıya görünür mü?"
  claim_specificity:
    focus: "kesin iddia mı, aralık mı, uyarılı öneri mi?"
```

## Claim türü hassasiyeti

```yaml
high_sensitivity_claims:
  - price
  - availability
  - opening_hours
  - weather
  - traffic
  - parking
  - women_only_beach_or_privacy
  - age_restriction
  - official_rule
```

Bu claim türlerinde evidence eksikliği daha ağır değerlendirilir.

## Score bandları

```yaml
score_bands:
  excellent:
    criteria:
      - "claim evidence envelope ile bağlı"
      - "source trust ve freshness uygun"
      - "confidence anlatı ile tutarlı"
      - "belirsizlik gerekirse kullanıcıya görünür"
  good:
    criteria:
      - "evidence yeterli fakat küçük freshness veya source açıklığı eksikleri var"
  acceptable_with_warnings:
    criteria:
      - "claim kullanılabilir ama kesinlik düşürülmeli"
  weak:
    criteria:
      - "evidence zayıf veya source belirsiz"
  failing:
    criteria:
      - "kanıtsız kesin iddia"
      - "düşük güvenli privacy claim hard karşılandı gibi sunuluyor"
```

## Blocker kuralları

```yaml
evidence_blockers:
  exact_price_without_evidence:
    decision: blocker_if_presented_as_fact
  opening_hours_without_evidence:
    decision: blocker_if_presented_as_fact
  women_only_beach_without_verification:
    decision: hard_blocker_when_requirement_active
  weather_without_freshness:
    decision: warning_or_blocker_depending_on_plan_dependency
  parking_without_evidence:
    decision: warning_if_noncritical_blocker_if_plan_depends_on_it
```

## Quality revision önerileri

```yaml
revision_patterns:
  downgrade_certainty:
    example: "Kesin fiyat yerine doğrulanması gereken fiyat bilgisi olarak yaz"
  add_disclosure:
    example: "Açılış saati için ziyaret öncesi kontrol uyarısı ekle"
  require_verification:
    example: "Kadınlar plajı şartı için verified source bekle"
  remove_claim:
    example: "Kanıtsız otopark garantisi final cevaptan çıkar"
```

## Kapanış

Evidence Quality Rubric, iddiaların ne kadar güvenle final cevaba taşınabileceğini tanımlar; live verification veya runtime evaluator değildir.
