# 07 — Plan Coherence Quality Rubric

**Doküman türü:** plan coherence quality rubric  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu dosya, Tatil Modu'nun günlük planlarının zaman, tempo, alternatifler, rota ve aile uyumu açısından tutarlı olup olmadığını değerlendiren rubriği tanımlar.

Plan coherence, yalnızca yerlerin iyi olması değildir.

İyi plan; gün akışı, yorgunluk, rota, yemek/dinlenme ve fallback seçeneklerini birlikte taşır.

## Coherence boyutları

```yaml
plan_coherence_dimensions:
  daily_block_structure:
    focus: "sabah, öğle dinlenmesi, öğleden sonra, akşam blokları var mı?"
  alternative_completeness:
    focus: "her gün 2-3 anlamlı alternatif var mı?"
  route_sequence_logic:
    focus: "aynı gün içindeki yerler makul sırada mı?"
  fatigue_distribution:
    focus: "yoğunluk günlere dengeli dağılmış mı?"
  weather_fallback:
    focus: "outdoor plan için indoor veya düşük riskli alternatif var mı?"
  privacy_alignment:
    focus: "deniz/plaj günü privacy şartıyla uyumlu mu?"
  family_rest_alignment:
    focus: "2 yaş çocuk için öğle ve hafif tempo korunuyor mu?"
```

## Score bandları

```yaml
score_bands:
  excellent:
    criteria:
      - "gün blokları net"
      - "alternatifler anlamlı ve farklı ihtiyaçlara hizmet ediyor"
      - "rota ve tempo aile için gerçekçi"
      - "fallback ve uyarılar görünür"
  good:
    criteria:
      - "plan uygulanabilir, küçük belirsizlikler var"
  acceptable_with_warnings:
    criteria:
      - "plan kullanılabilir ama tempo veya rota uyarısı gerekir"
  weak:
    criteria:
      - "alternatifler yüzeysel veya gün akışı zayıf"
  failing:
    criteria:
      - "öğle dinlenmesi yok"
      - "günler aşırı yoğun"
      - "alternatifler yok veya aynı şeyin tekrarı"
      - "rota gerçekçi değil"
```

## Coherence blocker örnekleri

```yaml
coherence_blockers:
  no_daily_alternatives:
    condition: "kullanıcı 2-3 alternatif istemiş ama tek seçenek verilmiş"
    decision: needs_revision
  missing_midday_rest:
    condition: "2 yaş çocuk bağlamında öğle dinlenmesi yok"
    decision: blocker_or_needs_revision
  unrealistic_day_route:
    condition: "aynı gün aşırı uzak ve yoğun aktiviteler kesin önerilmiş"
    decision: needs_revision
  privacy_misaligned_beach_day:
    condition: "plaj günü privacy şartıyla uyumsuz"
    decision: blocker
```

## İyi plan sinyalleri

```yaml
good_plan_signals:
  - "ana öneri + düşük yorgunluk alternatifi + kötü hava alternatifi"
  - "öğleden sonra hafif tempo"
  - "park ve trafik uyarıları"
  - "uzak öneri için güçlü istisna gerekçesi"
  - "çocuk yaşlarına göre aktivite uyumu"
```

## Kapanış

Bu rubric, planın uygulanabilirliğini ve iç tutarlılığını değerlendirir; route optimizer veya runtime planner değildir.
