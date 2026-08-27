# TM-AG-009 — Source Policy

Route Planner source keşfetmez; yalnız upstream evidence-aware data kullanır.

## Accepted source envelopes

- TM-AG-004 Place candidate/evidence refs
- TM-AG-005 Accommodation candidate/evidence refs
- TM-AG-006 Food candidate/evidence refs
- TM-AG-007 WeatherSignal refs
- TM-AG-008 RouteLeg/Matrix refs
- TM-AG-002 constraint/preference refs

## Rules

1. Opening-hours, price, availability, weather veya route claim'i Route Planner tarafından bağımsız fact'e dönüştürülemez.
2. Stale/conflicting critical input plan block üzerinde `NEEDS_VERIFICATION` veya blocker üretir.
3. Tier 4/discovery-only upstream fact verified plan input'u sayılmaz.
4. LocalTasteBrief, belirli restoranın menu availability'si olarak kullanılamaz.
5. Travel Knowledge Store hit'i yalnız upstream agentlar üzerinden evidence-aware candidate/fact olarak gelmelidir; Route Planner store'dan broad research yapmaz.
6. Her selected block mümkün olan en az entity/route/constraint/source ref setini taşır.

## Freshness-sensitive inputs

- route/traffic,
- opening hours,
- accommodation availability,
- current menu status where required,
- weather forecast.

Bunlar trip schedule kararını etkiliyorsa freshness gate korunur.
