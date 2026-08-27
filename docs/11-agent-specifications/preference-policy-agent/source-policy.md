# TM-AG-002 — Source Policy

## Allowed source classes

1. `USER_EXPLICIT` — en yüksek öncelik.
2. `CONVERSATION_FACT` — yalnız açık ve ilgili konuşma fact'i.
3. `PROFILE_DERIVED` — TM-AG-001'den güvenli türetim.
4. `PRODUCT_POLICY` — sürümlü kanonik ürün politikası.

## Forbidden source classes

- genel web,
- place/review provider,
- weather/route/booking provider,
- full memory dump,
- hidden reasoning,
- model pretraining bilgisiyle kullanıcı preference tahmini.

## Precedence

```text
latest explicit user statement
> earlier explicit user statement
> approved conversation fact
> profile-derived safe fact
> product default policy
```

Ürün default'u açık kullanıcı statement'ını sessizce override edemez.

## Privacy-sensitive rule

Hassas preference yalnız görev için gerekli semantic constraint olarak tutulur. Örneğin `women_only_beach_when_beach=true`; bundan din, aile yapısı veya kimlik etiketi üretilemez.

## Provenance requirement

Her `Preference` ve `Constraint` en az bir `sourceRef` taşır. Kaynaksız classification `R0/R1 FAIL` olur.
