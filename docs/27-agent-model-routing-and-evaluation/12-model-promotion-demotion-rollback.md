# Model Promotion, Demotion and Rollback Policy

## Amaç
Model veya prompt değişikliklerinin kontrollü biçimde production routing'e alınmasını ve regresyonda hızlı geri dönüşü sağlamak.

## Promotion prerequisites
Bir model profile primary/fallback routing'e ancak:
- ilgili agent benchmark suite tamamlandıysa,
- promotion repeated-run protokolü geçtiyse,
- P0=0 ise,
- contract-valid ve P1 threshold'ları geçtiyse,
- maliyet/latency ölçüldüyse,
- mevcut profile karşı comparative report varsa
promote edilebilir.

## Canary yaklaşımı
Live kullanım açıldığında yeni profile doğrudan `%100` verilmez. Evaluation/canary oranları production readiness aşamasında ayrıca belirlenir.

## Demotion triggers
- yeni P0 regression
- contract-valid rate düşüşü
- hallucinated/fabricated evidence
- latency/cost ciddi bozulması
- provider reliability düşüşü
- prompt/model version drift
- safety/privacy regression

## Rollback
Son bilinen approved model+prompt profile immutable version ile saklanır. Rollback routing config değişimi ile mümkün olmalı; agent code değişimi gerektirmemelidir.

## Version identity
```yaml
model_profile_id:
  provider
  model_name
  model_version_or_snapshot
  prompt_version
  inference_config_version
  routing_policy_version
```

## Re-evaluation triggers
- yeni model çıkışı
- provider/model version değişimi
- prompt major değişikliği
- capability contract değişikliği
- agent contract major/minor behavior change
- golden/regression suite genişlemesi

## Kural
'Yeni model daha yeni/güçlü' promotion gerekçesi değildir; canonical benchmark evidence gerekir.
