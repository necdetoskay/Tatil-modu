# Intelligence Module Contract v1.0

## 1. Amaç

Tüm Travel Intelligence modüllerinin ortak input/output ve davranış kurallarını tanımlar.

## 2. Mantıksal arayüz

```text
assess(IntelligenceInput) -> IntelligenceAssessment
```

## 3. Input

```text
moduleContext
tripProfile
entityContext
claims
observations
evidence
policies
runtimeContext
```

## 4. Output

```text
module ID/version
assessment ID
entity/trip context
dimension scores
risks
opportunities
recommendation signals
confidence
explanation
lineage refs
warnings
```

## 5. Modül sorumlulukları

- yalnız kendi domain kurallarını uygulamak,
- kullanıcı bağlamını değerlendirmek,
- risk/fırsat üretmek,
- evidence refs korumak,
- deterministik kuralları policy version ile taşımak,
- explanation payload sağlamak.

## 6. Modülün yapmayacağı işler

- yeni raw source toplamak,
- provider çağırmak,
- başka modülün skorunu değiştirmek,
- nihai planı tek başına oluşturmak,
- conflict'i gizlemek,
- source refsiz assessment üretmek.

## 7. Ortak skorlar

Her modül ihtiyaç halinde:

```text
suitability
risk
opportunity
relevance
effort
comfort
costImpact
timeImpact
```

alanlarını `0–1` aralığında üretir.

## 8. Risk

Her risk:

```text
riskId
type
probability
impact
exposure
userSensitivity
mitigability
score
severity
evidenceRefs
mitigations
```

taşır.

## 9. Recommendation signal

Nihai recommendation değildir.

Örnek:

```text
prefer
avoid
schedule_earlier
verify_before_visit
add_buffer
offer_alternative
```

## 10. Confidence

Assessment confidence:

```text
evidence coverage
evidence confidence
context completeness
policy determinism
conflict penalty
assumption penalty
```

ile hesaplanır.
