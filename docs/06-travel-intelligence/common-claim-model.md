# Common Claim Model v1.0

## 1. Amaç

Travel Intelligence modüllerinin aynı dili kullanmasını sağlayan ortak claim sözleşmesini tanımlar.

## 2. Claim

Claim, bir entity veya durum hakkında doğrulanabilir ya da değerlendirilebilir önermedir.

Örnek:

```text
parking_policy = free
noise_experience = high_at_night
child_friendliness = moderate
```

## 3. Claim alanları

```text
claimId
entityId
claimType
claimScope
value
valueType
unit
timeWindow
segment
observationType
sourceRefs
evidenceRefs
conflictRefs
confidence
status
```

## 4. Claim türleri

```text
fact
experience
risk
opportunity
trend
constraint
preference_match
recommendation_signal
```

## 5. Observation type

```text
observed
aggregated
derived
inferred
user_provided
```

## 6. Status

```text
supported
partially_supported
mixed
unresolved
insufficient
rejected
```

## 7. Hard kurallar

- Her claim entity veya trip context'e bağlıdır.
- Derived/inferred claim source/evidence refs taşır.
- Fact ve experience aynı claimType altında eritilmez.
- Segment ve time window kaybolmaz.
- Confidence kaynaksız LLM beyanı olamaz.
