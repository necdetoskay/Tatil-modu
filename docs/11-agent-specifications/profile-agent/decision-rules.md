# TM-AG-001 — Decision Rules

## PR-001 — Explicit fact preservation

Current user request içindeki açık değer aynen korunur; semantik olarak eşdeğer normalization dışında değiştirilmez.

## PR-002 — No guessing

Eksik yetişkin sayısı, çocuk yaşı, origin, destination veya transport tahmin edilmez. Alan null/unknown bırakılır ve `unknownFields` içine eklenir.

## PR-003 — Current request precedence

Current explicit fact ile daha eski conversation/memory fact çelişirse current explicit fact profile değerinde kullanılır; conflict ayrıca kaydedilir.

## PR-004 — Party derivation

`totalTravelers`, adults ve child count ikisi de biliniyorsa deterministic olarak türetilebilir. Bu derivation `NORMALIZATION` evidence taşır.

## PR-005 — Child ages

Açıkça verilen çocuk yaşları olduğu gibi korunur. Bir yaşın hangi çocuğa ait olduğu bilinmiyorsa yeni kimlik/isim uydurulmaz.

## PR-006 — Transport normalization

Açık ifadeler şu enum'a normalize edilir:

```text
kendi aracımızla / arabayla / otomobille → own_car
otobüs/tren/toplu taşıma → public_transport
uçakla → flight
verilmedi/belirsiz → unknown
```

Birden fazla çelişkili mode varsa `unknown` + conflict üretilir; seçim yapılmaz.

## PR-007 — Origin/destination literal fidelity

Yer adı açıkça verilmişse kanonik geocoding yapılmadan kullanıcının verdiği anlam korunur. Profile Agent geocoding yapamaz.

## PR-008 — No preference/policy leakage

“çocuk dostu”, “kadınlar plajı”, “bütçe”, “öğle uykusu” gibi bilgiler Profile output içinde preference/constraint olarak sınıflandırılmaz. Bu bilgiler upstream `TripRequest` içinde kalır ve TM-AG-002 tarafından işlenir.

## PR-009 — Conflict visibility

Çelişki sessizce çözülmez. En az bir `conflicts[]` kaydı ve ilgili evidence refs gerekir.

## PR-010 — Context minimization

Yalnız input contract içindeki disclosure edilmiş context kullanılır. Model/runtime daha geniş konuşma geçmişine erişse bile harness bunu context scope violation sayar.

## PR-011 — Evidence completeness

Her non-null origin/destination/transport/adults/child-age fact evidence ile izlenebilir olmalıdır.

## PR-012 — Privacy minimization

Profil görevine gerekmeyen kişisel/hassas detaylar output'a taşınmaz.

## PR-013 — No external research

Profile extraction dış dünya araştırması gerektirmez. External tool invocation her durumda authority violation'dır.

## PR-014 — Output-only domain

Agent yalnız `TravelerProfile.v1` üretir. Öneri, açıklama, plan veya kullanıcıya hitap eden serbest metin output contract dışıdır.
