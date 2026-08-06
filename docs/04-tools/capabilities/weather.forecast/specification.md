# Capability Specification — weather.forecast

## Kimlik

| Alan | Değer |
|---|---|
| Capability ID | `weather.forecast` |
| Tool Class | `TL-006` |
| Version | `1.0.0` |
| Freshness | fast |
| Cost Class | low |
| Privacy Class | public |
| Source Trace | required |

## Amaç

Belirli konum ve yakın tarih aralığı için güncel hava tahmini sağlamak.

## Girdi

- location,
- start time/date,
- forecast horizon,
- granularity,
- requested fields.

## Çıktı

- generated time,
- forecast items,
- temperature,
- precipitation,
- wind,
- condition,
- provider confidence when available,
- source trace.

## Kurallar

- climate normals forecast yerine kullanılamaz,
- forecast generatedAt zorunludur,
- horizon provider limitini aşarsa partial veya failed,
- geçmiş tarih tahmin olarak dönemez,
- eksik alan null olur, uydurulmaz.

## Quality metrics

- forecast age,
- horizon coverage,
- missing field ratio,
- provider confidence availability,
- source freshness.
