# TM-AG-002 — Decision Rules

| Rule ID | Kural |
|---|---|
| PP-001 | `mutlaka`, `zorunlu`, `şart`, `olmazsa olmaz` → açık scope içinde HARD/CONDITIONAL_HARD. |
| PP-002 | `istemiyorum`, `olmasın`, `kesinlikle değil` → HARD exclusion. |
| PP-003 | `tercih ederim`, `iyi olur`, `mümkünse` → SOFT; başka açık hard sinyal yoksa. |
| PP-004 | Koşullu cümlede condition korunur; condition düşürülemez. Bu kural HARD kadar SOFT preference için de geçerlidir. |
| PP-005 | “Deniz önerilecekse kadınlar plajı mutlaka olmalı” → `CONDITIONAL_HARD(activity.type==beach)`, deniz zorunluluğu üretmez. |
| PP-006 | Sayısal maksimum `en fazla/max/geçmesin` ile verilmişse HARD upper bound. |
| PP-007 | “tercihen X ama çok iyi ise aşılabilir” → soft target + explicit exception policy; hard max olarak modellenmez. |
| PP-008 | Bütçe açık üst sınırı HARD; bütçe yoksa constraint uydurulmaz. |
| PP-009 | Çocuk yaşları tek başına aktivite yasağı üretmez; yalnız downstream eligibility evaluation context'i sağlar. |
| PP-010 | TM-AG-001 profilindeki fact'lerden kullanıcı preference icat edilmez. |
| PP-011 | Çelişkili explicit statement'lar sessiz çözülmez; yalnız açık latest-user override semantiği varsa `LATEST_EXPLICIT_WINS`, aksi halde clarification. |
| PP-012 | Privacy-sensitive preference identity inference'a dönüştürülemez. |
| PP-013 | Dış dünya doğrulaması gerektiren kural `evidenceRequired=true`; agent doğrulama yapmaz. |
| PP-014 | Planning entity üretilemez. |
| PP-015 | External tool çağrısı yapılamaz. |
| PP-016 | Her classification sourceRef taşır. |
| PP-017 | Product policy kullanıcı açık tercihine ters düşerse kullanıcı statement'ı önceliklidir; güvenlik/kanuni policy ayrı blocker olarak görünür. |
| PP-018 | Belirsiz strength → clarification; sessiz hard/soft tahmini yok. |

## Deterministic assertions

- `CONDITIONAL_HARD => condition != null`
- conditional SOFT statement → emitted preference keeps `condition != null`
- `HARD => sourceRefs.length >= 1`
- `preferences[*].strength != HARD`
- `constraints[*].kind ∈ {HARD, CONDITIONAL_HARD}`
- planning output keys forbidden
- external tool calls = 0
