# Primary / Fallback Routing Policy

## Amaç
Bir model başarısız olduğunda kontrollü recovery sağlamak; daha güçlü modele geçerken sistem davranışını veya hard constraint'leri değiştirmemek.

## Routing ladder
```text
primary profile
→ same-profile retry (yalnız transient/format issue)
→ same-tier alternate profile
→ higher-tier escalation if allowed
→ deterministic degraded/failure outcome
```

## Retry sınıfları
Retry yalnız şu durumlarda anlamlıdır:
- transient provider error
- timeout
- malformed structured output
- temporary rate limit

Aynı semantic hatayı tekrar tekrar çalıştırmak retry nedeni değildir.

## Fallback rules
1. Fallback aynı agent contract'ını üretir.
2. Fallback capability access'i genişletemez.
3. Fallback memory scope'u genişletemez.
4. Fallback hard constraint'i yumuşatamaz.
5. Fallback sonucu trace'te görünür olmalıdır.
6. Fallback model sonucu yeniden contract/policy/evidence gate'lerinden geçer.

## Maximum attempts
Agent bazında finite attempt budget tanımlanır. Önerilen başlangıç:
```yaml
primary_attempts: 1
format_retry: 1
alternate_same_tier: 1
higher_tier_escalation: 1
```
Gerçek limit benchmark sonrası optimize edilir.

## Fail-safe
Tüm modeller başarısızsa sistem uydurma cevap üretmez. Explicit `degraded`, `needs_clarification` veya `failed` state döner.
