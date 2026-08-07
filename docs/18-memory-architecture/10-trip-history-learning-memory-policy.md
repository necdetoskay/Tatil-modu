# 10 — Trip History and Learning Memory Policy

**Doküman türü:** trip history and learning memory policy design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu belge, Tatil Modu'nun geçmiş tatil planlarından, kullanıcının beğenilerinden ve plan sonrası sinyallerden nasıl öğrenebileceğini tasarım seviyesinde tanımlar.

## Ana karar

```yaml
trip_history_learning_memory_policy_state: drafted
trip_history_memory_allowed: conditional
learning_memory_cannot_override_current_request: true
implementation_allowed: false
```

## Trip history memory nedir?

Trip history memory, önceki planlama deneyimlerinden gelen özet sinyaldir.

```yaml
trip_history_memory_examples:
  liked_bursa_zoo:
    type: activity_positive_signal
  prefers_light_afternoon_after_morning_activity:
    type: planning_rhythm_signal
  avoids_high_fatigue_days_with_toddler:
    type: family_planning_signal
  liked_thermal_family_hotel:
    type: accommodation_preference_signal
```

## Ne öğrenilebilir?

```yaml
learnable_signals:
  activity_likes:
    examples: zoo, science_center, nature_walk
  pacing_preferences:
    examples: morning_activity_lunch_rest_light_afternoon
  accommodation_preferences:
    examples: family_pool, spa, thermal, parking
  route_tolerance:
    examples: avoid_long_single_day_drive
  fallback_preferences:
    examples: indoor_on_rainy_day
```

## Ne öğrenilemez?

```yaml
not_learnable_as_memory:
  current_price: true
  hotel_availability_snapshot: true
  weather_snapshot: true
  exact_opening_hours_snapshot: true
  one_time_unconfirmed_sensitive_inference: true
  agent_internal_reasoning: true
```

## Learning strength

```yaml
learning_strength:
  explicit_feedback:
    strength: high
  repeated_selection:
    strength: medium_high
  single_positive_reaction:
    strength: medium
  inferred_from_silence:
    strength: very_low
```

## Current request priority

Geçmiş memory, mevcut kullanıcı isteğini ezemez.

Örnek:

```text
Geçmişte hayvanat bahçesi sevildi diye her plana zoo eklenmez.
Yeni istekte kaplıca/deniz odaklı plan isteniyorsa geçmiş zoo sinyali sadece alternatif üretiminde kullanılabilir.
```

## Disclosure kuralı

Trip history memory planı etkiliyorsa final response bunu hafifçe görünür kılabilir.

```text
Daha önce sabah yoğun aktivite sonrası hafif öğleden sonra yaklaşımını sevdiğiniz için bu tempoyu korudum.
```

## Kapanış kararı

Trip history memory, kişiselleştirme sinyalidir; current request, hard constraints ve evidence policy üzerinde üstünlük kuramaz.
