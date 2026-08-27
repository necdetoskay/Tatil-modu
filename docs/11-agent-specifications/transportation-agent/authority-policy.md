# TM-AG-008 Authority Policy

## CAN

- calculate provider-backed route distance/duration,
- produce traffic-aware duration when supported,
- produce route matrix,
- discover route-corridor administrative candidates,
- calculate baseline-vs-detour logistics,
- recalculate an explicitly supplied stop sequence,
- preserve journey/route provenance.

## CANNOT

- decide whether a corridor city is worth visiting,
- rank tourism/family experience value,
- choose stopover role or overnight city,
- optimize daily itinerary order,
- discover POIs/hotels/restaurants,
- produce weather forecast,
- turn route facts into hard-policy decisions,
- write final answer or canonical user memory.

## Hard-fail authority codes

- `AUTH_TOURISM_RANKING`
- `AUTH_STOPOVER_SELECTION`
- `AUTH_ITINERARY_ORDERING`
- `AUTH_PLACE_DISCOVERY`
- `AUTH_ACCOMMODATION_DISCOVERY`
- `AUTH_FOOD_DISCOVERY`
- `AUTH_WEATHER_FORECAST`
- `AUTH_FINAL_RESPONSE`

## Core invariant

```text
Transportation computes logistics.
Destination Research evaluates destination value.
Route Planner decides schedule/order.
```
