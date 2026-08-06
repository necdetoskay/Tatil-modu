# Capability Quality Score Standard

## 1. Amaç

Capability ve provider sonuçlarının yalnız başarılı/başarısız değil, kalite açısından da ölçülmesini sağlamak.

## 2. Genel boyutlar

```text
contract_completeness
source_coverage
freshness
accuracy
consistency
latency
reliability
cost_efficiency
privacy_compliance
```

## 3. Quality score

Her capability kendi ağırlık profilini tanımlar.

Genel başlangıç modeli:

```text
contractCompleteness × 0.15
sourceCoverage       × 0.15
freshness            × 0.15
accuracy             × 0.20
consistency          × 0.10
reliability          × 0.10
latency              × 0.05
costEfficiency       × 0.05
privacyCompliance    × 0.05
```

## 4. Capability-specific örnekler

### directions.route

- route resolution,
- distance accuracy,
- duration accuracy,
- traffic age,
- unreachable detection.

### accommodation.search

- availability age,
- total price completeness,
- tax/fee clarity,
- room occupancy correctness,
- cancellation completeness.

### reviews.collect

- review coverage,
- recency,
- duplicate ratio,
- verified ratio,
- language accuracy,
- license completeness.

### web.fetch_official_fact

- authority,
- extraction accuracy,
- evidence completeness,
- freshness.

## 5. Hard kalite kapıları

Bazı eksikler toplam puanla telafi edilemez.

Örnek:

- source trace eksik,
- privacy violation,
- schema invalid,
- stale fiyatı fresh gösterme,
- lisans metadata eksik review verisi.

## 6. Quality result

```json
{
  "capabilityId": "accommodation.search",
  "providerId": "provider",
  "qualityScore": 0.89,
  "dimensions": {},
  "hardGatePassed": true,
  "warnings": [],
  "policyVersion": "1.0.0"
}
```

## 7. Kullanım

Quality score:

- provider selection,
- fallback kararı,
- confidence hesabı,
- live benchmark,
- provider migration,
- SLA izleme

için kullanılabilir.

## 8. Testler

- ağırlık toplamı,
- hard gate,
- capability-specific metric,
- stale penalty,
- privacy fail,
- provider comparison,
- quality regression.
