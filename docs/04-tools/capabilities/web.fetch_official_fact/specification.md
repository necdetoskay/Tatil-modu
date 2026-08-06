# Capability Specification — web.fetch_official_fact

## Kimlik

| Alan | Değer |
|---|---|
| Capability ID | `web.fetch_official_fact` |
| Tool Class | `TL-002` |
| Version | `1.0.0` |
| Freshness | medium |
| Cost Class | low |
| Privacy Class | public |
| Source Trace | required |

## Amaç

Resmî veya veri sahibine ait sayfadan belirli bir gerçek bilgiyi kanıt referansıyla çıkarmak.

## Girdi

- URL veya canonical entity,
- requested fact type,
- expected field/value type,
- locale,
- freshness requirement,
- extraction hints.

## Çıktı

- extracted value,
- value type,
- verification status,
- evidence fragment reference,
- page metadata,
- effective/retrieved time,
- source trace,
- conflicts/warnings.

## Fact türleri

Örnek:

- opening_hours,
- admission_fee,
- parking_policy,
- child_policy,
- accessibility,
- contact,
- seasonal_closure,
- facility_attribute,
- official_name,
- address.

## Kurallar

- kaynak resmî değilse `official` olarak işaretlenmez,
- değer sayfada doğrudan bulunmuyorsa inference olarak ayrılır,
- evidence fragment reference zorunludur,
- sayfa tarihi veya effective date varsa korunur,
- dinamik JS veya erişilemeyen içerik başarısızlık/partial üretir,
- tek sayfadaki pazarlama iddiası kullanıcı deneyimi kanıtı değildir.

## Quality metrics

- source authority,
- extraction accuracy,
- evidence completeness,
- freshness,
- change detection accuracy,
- conflict rate.

## Kritik hatalar

- resmî olmayan kaynağı resmî gösterme,
- evidence refsiz kesin fact,
- inferred değeri observed fact gibi gösterme,
- stale policy bilgisini fresh gösterme.
