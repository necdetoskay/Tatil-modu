# Recorded R2 artifacts

Bu dizindeki `*.execution.json` dosya adı geriye dönük uyumluluk için korunur. Dosyalar çalışan agent veya orchestrator'ın bu test sırasında ürettiği sonuçlar değildir; bağımsız hazırlanmış kanonik input/output örnekleridir.

Bu artifact'ların replay edilmesi şunları kanıtlar:

- input ve output schema uyumu,
- deterministic R1 oracle davranışı,
- fixture'a özel expectation sonucu,
- schema-valid negatif mutation'ın false-green üretmemesi.

Şunları kanıtlamaz:

- component runtime kodunun çağrıldığını,
- provider/tool entegrasyonunun çalıştığını,
- orchestrator'ın specialist zincirini yürüttüğünü,
- headless veya ürün E2E akışının tamamlandığını.

Gerçek component execution testi, `execute` callback'inde kaydedilmiş `canonicalOutput` döndürmek yerine component'ın production-facing executor'ını çağırmalıdır. Bu ayrım test adı ve durum kayıtlarında `recordedArtifactCoverage` ile ifade edilir.
