# Tool / Capability → Data Source Architecture Handoff

## Amaç

Tamamlanan Capability Platform tasarımından sonraki Data Source & Trust Architecture aşamasına aktarılacak sorumlulukları tanımlar.

## Capability Platform'un cevapladığı sorular

- Agent hangi yeteneği ister?
- Çağrı hangi sözleşmeyi kullanır?
- Hangi provider teknik olarak destekler?
- Cache, retry, cost, permission ve trace nasıl uygulanır?
- Sonuç hangi kaynak metadata'sını taşır?

## Data Source Architecture'ın cevaplayacağı sorular

- Hangi bilgi türü için hangi kaynak tercih edilir?
- Kaynak otoritesi ve güncelliği nasıl puanlanır?
- Birden fazla kaynak nasıl birleştirilir?
- Çelişkiler nasıl çözülür?
- Yorum örneklemi ne zaman yeterlidir?
- Resmî iddia ile deneyim kanıtı nasıl ağırlıklandırılır?
- Kaynak kalitesi confidence'a nasıl yansır?
- Lisans ve kullanım amacı nasıl değerlendirilir?

## Mimari sınır

```text
Capability Platform:
veriyi nasıl elde eder, normalize eder ve taşır?

Data Source Architecture:
hangi veriye ne kadar güvenir ve nasıl birleştirir?
```

## Başlangıç girdileri

- `data-source-trust-policy.md`
- `source-trace-and-data-lineage-standard.md`
- `capability-registry.md`
- `provider-selection-policy.md`
- `capability-quality-score-standard.md`
- `reviews.collect`
- `web.fetch_official_fact`
- `accommodation.search`

## İlk çalışma sırası

1. Source taxonomy
2. Authority model
3. Freshness scoring
4. Evidence strength model
5. Conflict resolution
6. Multi-source fusion
7. Review evidence policy
8. Coverage and sufficiency
9. License/use policy
10. Data source test standard
