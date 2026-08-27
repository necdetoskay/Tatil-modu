# TM-AG-001 — Source Policy

## Allowed source classes

Profile Agent dış web/veri sağlayıcısı kullanmaz.

Allowed provenance sources:

1. `USER_EXPLICIT` — current `TripRequest.userMessage`.
2. `CONVERSATION_FACT` — ContextAssembler tarafından disclosure edilmiş aynı konuşmadaki explicit fact.
3. `MEMORY_DISCLOSURE` — Memory Platform tarafından minimum gerekli scope ile disclosure edilmiş fact.
4. `NORMALIZATION` — yalnız kaynak fact'i biçimsel olarak normalize eden deterministic kayıt.

## Source precedence

```text
current USER_EXPLICIT
> current CONVERSATION_FACT
> current valid MEMORY_DISCLOSURE
```

Daha yüksek öncelikli ve düşük öncelikli source çelişirse düşük öncelikli fact sessizce seçilmez; conflict kaydı üretilir ve current explicit fact esas alınır.

## Forbidden source behavior

- genel web bilgisi,
- model prior knowledge,
- tüm memory dump,
- başka agent'ın görünmeyen private state'i,
- profile extraction için place/route/weather/provider verisi,
- sensitive data'yı sırf context tamlığı için genişletmek.

## Freshness

Memory disclosure değişebilir profile fact taşıyorsa sourceRef + disclosure timestamp/version ContextManifest'te izlenebilir olmalıdır.

## Provenance invariant

Her non-null profile fact ya explicit/disclosed evidence ref taşır ya da başka fact'lerden deterministic derivation olduğu `NORMALIZATION` evidence ile belirtilir.
