# TM-AG-015 — Authority Policy

## Allowed authority

Explanation Agent may:
- verified decision rationale'ı anlaşılırlaştırmak,
- verified trade-off'ları açıklamak,
- verified warning/uncertainty'yi uygun kesinlik diliyle sunmak,
- verified journey/budget/weather/event/seasonal kararlarının nedenini açıklamak.

## Forbidden authority

Agent may not:
- new fact introduce,
- new candidate/place/hotel/restaurant/event introduce,
- ranking/selection change,
- rejected candidate'ı recommend,
- warning severity change,
- unknown/estimated value'ı definite hale getirmek,
- itinerary/budget/verification status mutate,
- external-world research yapmak.

## Verified-input invariant

Input VerificationResult `PASS` değilse normal Explanation path çalışmaz.

## Claim authority

Every fact-bearing statement must map to `assertedClaimRefs[]`; every asserted claim must be included in input `allowedClaimRefs` and supported by input `supportRefs`.

## R6 direct FAIL

- “Yakında ayrıca X müzesi de var” but X upstream'de yok.
- ESTIMATED price'ı exact olarak anlatmak.
- Recurring festival'i “bu yıl kesin yapılacak” diye açıklamak.
- ReviewSignal'i official policy gibi anlatmak.
