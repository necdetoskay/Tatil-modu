# 02 — Quality Dimension Taxonomy

**Doküman türü:** quality dimension taxonomy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu dosya, Tatil Modu planlarının hangi kalite boyutlarıyla değerlendirileceğini tanımlar.

Quality dimension, tek başına skor değildir.

Her dimension şu çıktıları üretebilir:

```yaml
dimension_outputs:
  - score_band
  - blocker
  - warning
  - evidence_gap
  - confidence_impact
  - revision_recommendation
```

## Ana kalite boyutları

```yaml
quality_dimensions:
  hard_constraint_compliance:
    purpose: "kullanıcının değiştirilemez kısıtları korunuyor mu?"
    can_block_final_response: true
  evidence_integrity:
    purpose: "değişken bilgiler kanıt ve confidence ile taşınıyor mu?"
    can_block_final_response: true
  family_suitability:
    purpose: "plan çocuk yaşları, dinlenme ve ebeveyn yükü açısından uygun mu?"
    can_block_final_response: true
  privacy_sensitivity:
    purpose: "mahremiyet ve kadınlar plajı şartı görünür ve güvenli yönetiliyor mu?"
    can_block_final_response: true
  logistics_realism:
    purpose: "rota, mesafe, trafik, park ve mola beklentisi gerçekçi mi?"
    can_block_final_response: conditional
  day_plan_coherence:
    purpose: "gün blokları, alternatifler ve tempo tutarlı mı?"
    can_block_final_response: conditional
  budget_clarity:
    purpose: "bütçe iddiaları dürüst, aralıklı ve kanıtlı mı?"
    can_block_final_response: conditional
  final_response_usability:
    purpose: "cevap kullanıcı için anlaşılır, uygulanabilir ve dürüst mü?"
    can_block_final_response: conditional
  regression_safety:
    purpose: "golden scenario davranışı bozulmuş mu?"
    can_block_final_response: true
```

## Boyut önceliği

Quality dimension önceliği policy hiyerarşisine bağlıdır:

```text
hard_constraint_compliance > evidence_integrity > privacy_sensitivity > family_suitability > logistics_realism > day_plan_coherence > budget_clarity > final_response_usability
```

Final response çok güzel yazılmış olsa bile üst seviye boyutta blocker varsa geçemez.

## Score bandları

```yaml
score_bands:
  excellent:
    meaning: "beklenen kaliteyi açıkça karşılar"
  good:
    meaning: "kullanılabilir, küçük uyarılar olabilir"
  acceptable_with_warnings:
    meaning: "kullanılabilir fakat kullanıcıya görünür uyarı gerekir"
  weak:
    meaning: "revizyon önerilir"
  failing:
    meaning: "blocker veya ciddi kalite ihlali vardır"
```

## Dimension örnekleri

```yaml
example_dimension_findings:
  evidence_integrity:
    failing_example: "otel fiyatı kesin yazılmış ama source/evidence yok"
  family_suitability:
    failing_example: "2 yaş çocukla öğle dinlenmesi olmadan yoğun plan"
  privacy_sensitivity:
    failing_example: "deniz önerisi var ama kadınlar plajı şartı hiç görünmüyor"
  logistics_realism:
    warning_example: "150 km dışı öneri var ama istisna gerekçesi zayıf"
```

## Kapanış

Bu taxonomy, Quality Engine'in hangi lenslerle değerlendirme yapacağını kanonik hale getirir; runtime scoring implementation değildir.
