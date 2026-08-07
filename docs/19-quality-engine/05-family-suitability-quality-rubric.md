# 05 — Family Suitability Quality Rubric

**Doküman türü:** family suitability quality rubric  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu dosya, Tatil Modu planlarının çocuklu aile için ne kadar uygun olduğunu değerlendiren kalite rubriğini tanımlar.

Özellikle 2 ve 6 yaş çocuklu aile bağlamı, plan kalitesinde ayrı bir boyut değil, temel review gate'idir.

## Rubric boyutları

```yaml
family_suitability_rubric_dimensions:
  toddler_fit:
    focus: "2 yaş çocuk için tempo, uyku, bekleme süresi ve güvenlik"
  older_child_fit:
    focus: "6 yaş çocuk için ilgi, aktivite çeşitliliği ve sıkılma riski"
  parent_burden:
    focus: "ebeveynin taşıma, park, yemek, dinlenme ve kriz yönetimi yükü"
  fatigue_control:
    focus: "günlük rota ve aktivite yoğunluğu"
  midday_rest_preservation:
    focus: "öğle dinlenmesi ve otel/konaklama molası"
  fallback_readiness:
    focus: "hava, yorgunluk veya çocuk uyumu bozulursa alternatif var mı?"
```

## Score bandları

```yaml
score_bands:
  excellent:
    criteria:
      - "2 yaş ve 6 yaş ihtiyaçları ayrı ayrı düşünülmüş"
      - "öğle dinlenmesi korunmuş"
      - "alternatifler düşük yorgunluk içeriyor"
      - "ebeveyn yükü görünür şekilde azaltılmış"
  good:
    criteria:
      - "ana aile ihtiyaçları korunmuş"
      - "küçük belirsizlikler kullanıcıya uyarı olarak taşınmış"
  acceptable_with_warnings:
    criteria:
      - "plan uygulanabilir ama yorgunluk veya bekleme riski var"
      - "uyarı ve fallback gerekiyor"
  weak:
    criteria:
      - "çocuk yaşları yeterince ayrı ele alınmamış"
      - "dinlenme veya tempo zayıf"
  failing:
    criteria:
      - "2 yaş çocukla açıkça uygunsuz yoğunluk"
      - "öğle dinlenmesi ihtiyacı yok sayılmış"
      - "aile güvenliği veya ciddi yorgunluk riski uyarısız"
```

## Blocker örnekleri

```yaml
family_blockers:
  toddler_rest_ignored:
    condition: "2 yaş çocuk ve yoğun tam gün plan, dinlenme yok"
    decision: blocker_or_needs_revision
  excessive_route_for_children:
    condition: "çok uzun sürüş + yoğun aktivite + fallback yok"
    decision: needs_revision
  unsafe_activity_fit:
    condition: "yaşa uygun olmayan aktivite kesin öneriliyor"
    decision: blocker
```

## İyi cevap sinyalleri

```yaml
good_signals:
  - "sabah/öğle/öğleden sonra/akşam blokları çocuk temposuna uygun"
  - "öğle sonrası hafif seçenekler var"
  - "park, yemek, tuvalet, bekleme ve pusetsiz/pusetli erişim riski düşünülmüş"
  - "yağmur veya yorgunluk fallback'i var"
```

## Kapanış

Bu rubric, aile uygunluğunu kalite değerlendirmesinin merkezine koyar; runtime scoring implementation değildir.
