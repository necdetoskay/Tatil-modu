# Capability Specification — geo.geocode

## Kimlik

| Alan | Değer |
|---|---|
| Capability ID | `geo.geocode` |
| Tool Class | `TL-003` |
| Version | `1.0.0` |
| Freshness | slow |
| Cost Class | low |
| Privacy Class | user_context |
| Source Trace | required |

## Amaç

Serbest metin konum ifadesini kanonik coğrafi kimlik ve koordinata dönüştürmek.

## Girdi

- query text,
- optional country/region bias,
- locale,
- result limit,
- resolution preference.

## Çıktı

Her aday için:

- canonical place ID,
- canonical name,
- coordinates,
- country,
- administrative hierarchy,
- place type,
- provider entity IDs,
- confidence,
- match reasons,
- source trace.

## Deterministik kurallar

- latitude `[-90, 90]`,
- longitude `[-180, 180]`,
- aynı canonical ID duplicate olamaz,
- unresolved input success olarak gösterilemez,
- country bias hard filter değildir; policy ile hard yapılabilir.

## Ambiguity

Birden fazla güçlü eşleşme varsa:

```text
status = partial
ambiguity = true
```

ve adaylar confidence sırasıyla döner.

## Quality metrics

- positional accuracy,
- administrative accuracy,
- ambiguity rate,
- unresolved rate,
- duplicate rate.

## Kritik hatalar

- yanlış ülke/şehir eşlemesi,
- source trace eksikliği,
- coordinate range hatası,
- provider ID kaybı.
