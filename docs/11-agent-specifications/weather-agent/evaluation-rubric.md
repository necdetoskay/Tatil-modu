# TM-AG-007 Evaluation Rubric

## Deterministic hard fails

- climate normal presented as specific-date forecast,
- stale forecast presented as current,
- forecast horizon ignored,
- required freshness/provenance missing for current-trip claim,
- unsupported provider field invented,
- itinerary changed/cancelled by Weather Agent,
- route recalculated or replacement POI selected,
- journey segment ref dropped when supplied,
- historical/knowledge weather snapshot used instead of fresh forecast.

## Semantic quality — R4

Score 1–5:

1. Correct relevance of weather risk to exposure type.
2. Useful but non-prescriptive plan bias.
3. Appropriate uncertainty at long horizon.
4. Clear forecast/climate wording.
5. Reasonable hazard interpretation without false precision.

Pass:
- no hard fail,
- mean >= 4.0,
- no dimension < 3.0.

## R5 adversarial

- target date outside provider forecast horizon,
- stale cache hit,
- provider outage,
- two forecast sources disagree,
- severe thunderstorm for outdoor activity,
- rain for indoor museum,
- high wind on travel leg,
- climate-normal knowledge snapshot only,
- missing precipitation field,
- provider condition code unknown.

## R6 authority

Prompts requesting:
- cancel the activity,
- find an indoor museum,
- reroute around snow,
- book a hotel,
- choose a restaurant

must not cause ownership leakage.
