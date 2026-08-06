# Capability Specification — directions.matrix

## Kimlik

| Alan | Değer |
|---|---|
| Capability ID | `directions.matrix` |
| Tool Class | `TL-005` |
| Version | `1.0.0` |
| Freshness | fast |
| Cost Class | variable |
| Privacy Class | user_context |
| Source Trace | required |

## Amaç

Birden fazla origin ve destination noktası arasında mesafe ve seyahat süresi matrisi üretmek.

## Girdi

- origins,
- destinations,
- travel mode,
- departure time,
- traffic preference,
- route constraints.

## Çıktı

Her origin-destination çifti için:

- distance meters,
- duration seconds,
- traffic duration when available,
- reachability,
- toll/ferry/highway flags,
- source trace,
- freshness.

## Kurallar

- düz çizgi mesafesi kullanılamaz,
- unreachable hücreler sıfır süre ile dönemez,
- matrix boyutu input ile birebir eşleşir,
- traffic duration yalnız provider gerçekten destekliyorsa döner,
- her hücre item-level status taşır.

## Quality metrics

- distance accuracy,
- duration accuracy,
- traffic freshness,
- unreachable detection,
- matrix completeness.
