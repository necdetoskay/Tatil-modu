# Cost, Token and Latency Observability

## Amaç
Model, capability, tool ve workflow maliyetlerinin hangi işlem ve stage tarafından üretildiğini ölçülebilir hale getirir. Bu belge provider fiyatlandırma veya billing implementation değildir.

## Ölçüm boyutları
```yaml
cost_latency_signals:
  - model_input_tokens
  - model_output_tokens
  - model_call_duration_ms
  - capability_call_duration_ms
  - capability_call_cost_estimate
  - workflow_cost_estimate
  - stage_cost_estimate
  - retry_cost_estimate
  - fallback_cost_estimate
```

## Attribution zinciri
Her maliyet mümkün olduğunca şu bağa sahip olmalıdır:
```text
correlation_id
→ workflow_id
→ stage_id
→ component/capability
→ invocation
→ cost/token/latency record
```

## Tasarım kuralları
1. Workflow toplam maliyeti stage maliyetlerinden izlenebilir olmalıdır.
2. Retry ve fallback maliyeti normal first-pass maliyetinden ayrılmalıdır.
3. Provider-specific fiyat detayı canonical domain contract'a yazılmaz; cost adapter/veri kaynağından gelir.
4. Estimated ve billed/confirmed cost aynı şey değildir; durum açıkça işaretlenmelidir.
5. Token sayısı tek başına verimlilik veya kalite ölçüsü değildir.
6. Latency için total duration yanında kritik stage katkısı görülebilmelidir.
7. Cost label'ları kullanıcı veya hassas tercih içermemelidir.

## Kullanım
Bu model ileride model optimizasyonu, pahalı workflow tespiti, gereksiz retry analizi ve kalite/maliyet dengesi değerlendirmesinde kullanılabilir.
