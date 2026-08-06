# Capability Specification — climate.normals

## Kimlik

| Alan | Değer |
|---|---|
| Capability ID | `climate.normals` |
| Tool Class | `TL-007` |
| Version | `1.0.0` |
| Freshness | slow |
| Cost Class | low |
| Privacy Class | public |
| Source Trace | required |

## Amaç

Yakın dönem hava tahmini bulunmayan ileri tarihler için uzun dönem iklim ortalamalarını ve mevsimsel beklentileri sağlamak.

## Girdi

- canonical location,
- hedef ay veya tarih aralığı,
- reference period tercihi,
- istenen iklim alanları,
- granularity.

## Çıktı

- reference period,
- sıcaklık aralığı,
- yağış normali,
- rüzgâr,
- deniz suyu sıcaklığı varsa,
- güneşlenme,
- olağandışı hava risk notları,
- source trace.

## Kurallar

- tahmin dili kullanılamaz,
- tek gün kesinliği üretilemez,
- reference period zorunludur,
- provider verisi farklı dönemlerden geliyorsa açıkça belirtilir,
- eksik alanlar null olur,
- climate normal sonucu `weather.forecast` yerine geçirilmez.

## Quality metrics

- reference period completeness,
- source authority,
- geographic resolution,
- field coverage,
- data age,
- anomaly note availability.

## Kritik hatalar

- climate normal'i forecast olarak sunma,
- reference period eksikliği,
- yanlış coğrafi eşleşme,
- source trace eksikliği.
