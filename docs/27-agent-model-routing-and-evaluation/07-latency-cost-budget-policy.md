# Latency and Cost Budget Policy

## Amaç
Model kalitesini korurken agent çağrılarının latency ve maliyetini ölçülebilir bütçeler içinde tutmak.

## İlkeler
1. P0 doğruluğu maliyet için feda edilmez.
2. Aynı kaliteyi daha düşük maliyet/latency ile veren model tercih edilir.
3. Güçlü model yalnız gerçekten zor tasklarda kullanılır.
4. Retry maliyeti routing kararına dahil edilir.
5. Cost/latency ölçümü agent bazında yapılır; yalnız toplam trip maliyeti izlemek yeterli değildir.

## Tier budget intent
```yaml
T1:
  latency: low
  cost: very_low
T2:
  latency: moderate
  cost: low_to_moderate
T3:
  latency: higher_allowed
  cost: moderate
T4:
  latency: exceptional
  cost: exceptional_but_bounded
```

Kesin TL/USD/token limitleri güncel provider fiyatları ve L8 benchmark sonrası doldurulur.

## Metrics
- p50/p95 latency
- successful-call cost
- total retry cost
- cost per accepted agent output
- cost per golden scenario
- escalation frequency
- T4 usage rate

## Budget violation
Model bütçeyi aşarsa otomatik olarak elenmez; kalite avantajı belgelenir. Ancak benzer kalite veren daha ucuz model varsa pahalı model default profile olamaz.

## System target
Sistemin amacı bütün agentlarda en ucuz modeli kullanmak değil, **P0=0 koşulunu koruyarak gereken yerde gereken kadar model harcamak**tır.
