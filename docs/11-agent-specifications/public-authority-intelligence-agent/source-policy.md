# TM-AG-011 — Source Policy

## Source order

1. claim-capable healthy `TrustedSourceRegistryEntry` (Issue #50),
2. direct official/entity/authority source,
3. official structured/data-owner source,
4. corroborating secondary source,
5. generic web only for discovery.

## Claim-specific authority

Authority source genelinde değil claim bazında değerlendirilir.

Örnek:
- official operator → opening hours / official rule için authoritative,
- user review → queue/crowding experience için experiential ama OfficialFact için authoritative değil.

## Freshness

Date-sensitive claim için:
- effective date/window,
- retrievedAt,
- source status,
- special-date overrides
kontrol edilir.

General/regular schedule special closure gününü override edemez.

## Conflicts

Resolution sinyalleri:
- operational ownership,
- legal mandate,
- source specificity,
- later/effective date,
- direct claim match.

Safe winner yoksa status `UNKNOWN`.

## Registry rule

Registry source identity/health/claim-capability hafızasıdır; claim truth store değildir.
