# Capability Specification — places.search

## Kimlik

| Alan | Değer |
|---|---|
| Capability ID | `places.search` |
| Tool Class | `TL-004` |
| Version | `1.0.0` |
| Freshness | medium |
| Cost Class | variable |
| Privacy Class | public |
| Source Trace | required |

## Amaç

Belirli coğrafya, kategori ve filtreler içinde kanonik yer veya işletme adayları bulmak.

## Girdi

- geographic scope,
- text/category query,
- filters,
- pagination/result limit,
- locale.

## Çıktı

Her yer için:

- canonical internal place ID,
- name,
- normalized categories,
- coordinates,
- address,
- provider entity IDs,
- rating/review count when available,
- attributes,
- source trace.

## Kurallar

- rating bilinmiyorsa 0 yazılmaz, null olur,
- provider rating scale normalize edilir fakat raw değer korunabilir,
- aynı canonical place duplicate döndürülemez,
- kapalı/kalıcı kapalı durumu ayrı alan taşır,
- yorum analizi burada yapılmaz.

## Quality metrics

- entity match accuracy,
- category precision,
- duplicate ratio,
- field coverage,
- attribute freshness.
