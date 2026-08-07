# Observability Overview and Boundary

## Amaç
Observability katmanı, Tatil Modu içindeki agent, platform, engine, workflow ve orchestrator davranışlarının çalışırken anlaşılabilmesini sağlayacak sinyallerin tasarım sınırlarını tanımlar. Bu belge implementation değildir.

## Observability neyi cevaplar?
- Bir request nereden geçti?
- Hangi stage ne kadar sürdü?
- Hangi gate hangi nedenle pass/block/revise verdi?
- Hangi tool/model çağrısı maliyet veya hata üretti?
- Retry/fallback neden devreye girdi?
- Quality problemi hangi stage'e dayanıyor?
- Evidence/verification problemi nerede oluştu?

## Boundary
Observability operational insight üretir; domain kararı üretmez.

```text
Audit Logger = hesap verebilir karar kaydı
Observability = sistem davranışını operasyonel olarak görünür kılma
Quality Engine = çıktı kalitesini değerlendirme
Decision Policy Engine = karar/gate sonucu üretme
Orchestrator = süreci koordine etme
```

## Sahip olduğu tasarım alanları
- log/metric/trace semantic modeli
- correlation ve execution context
- operational event sınıfları
- latency, error, retry, fallback, cost sinyalleri
- gate/policy/quality outcome görünürlüğü
- evidence/verification operational sinyalleri
- privacy-safe telemetry ilkeleri
- dashboard ve alert görünümü tasarımı

## Sahip olmadığı alanlar
- provider/tool seçimi
- policy veya quality kararı üretmek
- audit kaydının canonical sahipliği
- production monitoring stack seçmek
- log storage veya retention implementation
- incident remediation automation

## Ana ilke
Observability, sistemde zaten var olan canonical karar ve artifact'ları görünür kılar; yeni gerçek üretmez ve ownership sınırlarını değiştirmez.
