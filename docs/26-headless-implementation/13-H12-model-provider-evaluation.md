# H12 — Model & Provider Evaluation

**Durum:** planned  
**Gate:** L8 benchmark  
**Not a replacement for:** L0–L7

## Amaç
Deterministic headless çekirdek kanıtlandıktan sonra gerçek LLM ve live/evaluation provider seçeneklerini aynı canonical fixture setinde karşılaştırmak.

## Evaluation dimensions
- P0 pass rate
- P1 pass rate
- quality score distribution
- evidence discipline
- structured-output validity
- latency p50/p95
- token usage
- estimated cost
- retry rate
- provider failure rate
- consistency across repeated runs

## Model run protocol
Aynı model/scenario birden fazla kez çalıştırılır. Tek başarılı cevap model acceptance için yeterli değildir.

Örnek sonuç:
```yaml
model: candidate-A
runs: 50
p0_failures: 0
contract_valid_rate: 1.0
quality_mean: 0.91
latency_p95_ms: 4200
cost_mean: recorded
```

## Provider evaluation
Live provider adapter yalnız evaluation mode'da açılır ve capability interface'i bypass edemez.

## Safety rule
Gerçek model/provider başarısızlığı deterministic policy gate'ini değiştiremez. Model hard constraint ihlali üretirse policy bunu reddetmelidir.

## Comparison output
Her candidate için machine-readable benchmark artifact ve insan okunabilir decision report üretilir.

## Selection rule
En yüksek genel puan otomatik seçim değildir. P0 başarısızlığı olan model/provider production candidate olamaz.

## Definition of Done
```yaml
benchmark_reproducible: true
cost_latency_recorded: true
p0_comparison_available: true
quality_comparison_available: true
provider_selection_evidence_available: true
```

H12 UI unlock için L0–L7'nin yerine geçmez; model/provider seçim kararını destekler.
