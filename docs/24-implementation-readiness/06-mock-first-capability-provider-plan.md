# Mock-First Capability and Provider Plan

## Amaç
Headless core'un gerçek provider değişkenliğinden bağımsız, deterministic ve ucuz biçimde geliştirilmesini sağlamak.

## Provider katmanları
```text
Capability Contract
  ↓
Capability Gateway
  ↓
Provider Adapter Interface
  ├─ deterministic mock adapter
  ├─ recorded/replay adapter (future)
  └─ live adapter (later gate)
```

## İlk mock capability seti
- destination_search
- activity_search
- accommodation_search
- route_matrix
- parking_info
- opening_hours
- price_estimate
- weather_snapshot
- beach_privacy_classification evidence source
- public_authority_lookup

## Mock veri kuralları
1. Aynı fixture input her zaman aynı output'u verir.
2. Evidence metadata zorunludur.
3. Fresh/stale/conflicting/not_found varyantları bulunur.
4. Timeout, rate-limit, malformed response ve provider unavailable hata fixture'ları bulunur.
5. Mock sonuçlar 'gerçek güncel veri' olarak işaretlenmez.
6. Capability sonucu provider-specific alan sızdırmaz.

## Fault injection
Test harness kontrollü olarak şunları üretebilmelidir:
```yaml
faults:
  - timeout
  - unavailable
  - stale
  - conflict
  - incomplete
  - malformed
  - permission_denied
  - rate_limited
```

## Live provider unlock
Live adapter yalnız:
- capability contract stabil,
- mock suite PASS,
- error mapping PASS,
- evidence/freshness semantics PASS,
- secrets baseline hazır,
- provider-specific evaluation planı hazır
olduğunda eklenir.

## Anti-corruption boundary
Provider API response'u doğrudan agent'a verilmez. Adapter canonical capability response'a dönüştürür. Böylece provider değişimi agent contract'ını etkilemez.
