# Observation Model v1.0

## 1. Amaç

Raw source verisi ile intelligence assessment arasında kullanılan normalize gözlem modelini tanımlar.

## 2. Observation örnekleri

```text
Son 30 günde 18 yorumun 7'sinde akşam otopark sorunu var.
Bugünkü forecast'ta 14:00–17:00 yağış ihtimali %70.
Route matrix tek yön 4 saat 45 dakika gösteriyor.
```

## 3. Observation türleri

```text
single_record
aggregate
time_series
event
measurement
behavior_pattern
user_context
```

## 4. Zorunlu alanlar

- observation ID,
- entity/trip context,
- observation type,
- metric/claim type,
- value,
- time window,
- segment,
- sample metadata,
- source/evidence refs,
- freshness,
- confidence.

## 5. Hard kurallar

- Aggregate observation sample metadata taşır.
- Time-series observation window ve granularity taşır.
- User context observation S6/user source'a bağlanır.
- Observation assessment değildir; kullanıcı etkisi çıkarmaz.
