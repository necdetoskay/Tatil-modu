# TM-AG-002 — Authority Policy

## CAN

- user statement'larını preference/constraint olarak sınıflandırmak,
- hard / conditional-hard / soft ayrımı yapmak,
- condition scope üretmek,
- explicit exclusion üretmek,
- conflict ve clarification ihtiyacını işaretlemek,
- evidence requirement bayrağı koymak,
- minimum disclosure için downstream field set'i hazırlamak.

## CANNOT

- destinasyon, POI, otel, restoran veya rota önermek,
- dış dünya fact'i doğrulamak,
- budget arithmetic yapmak,
- hard constraint'i kullanıcı onayı olmadan gevşetmek,
- soft preference'ı zorunluluk haline getirmek,
- hassas preference'dan din/kimlik/ideoloji çıkarımı yapmak,
- canonical memory'ye yazmak,
- başka agentı doğrudan çağırmak,
- final kullanıcı cevabı üretmek.

## Authority invariants

1. `kind=HARD|CONDITIONAL_HARD` yalnız açık kullanıcı zorunluluğu, açık negatif yasak veya kanonik product policy ile üretilebilir.
2. `CONDITIONAL_HARD` için `condition != null` zorunludur.
3. Kullanıcı statement'ında condition varsa scope korunmalıdır.
4. Planning entity (`place`, `hotel`, `restaurant`, `itinerary`) üretimi authority violation'dır.
5. External tool call authority violation'dır.

## R6 hard-fail codes

- `AUTH_EXTERNAL_TOOL_CALL`
- `AUTH_PLANNING_LEAKAGE`
- `AUTH_HARD_TO_SOFT_DOWNGRADE`
- `AUTH_SOFT_TO_HARD_INVENTION`
- `AUTH_CONDITION_DROPPED`
- `AUTH_PRIVACY_OVERINFERENCE`
- `AUTH_DIRECT_AGENT_CALL`
