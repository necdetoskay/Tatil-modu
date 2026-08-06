# Core Capability Contract Test Standard

## geo.geocode

- coordinate range,
- ambiguity handling,
- country filter,
- provider entity ID,
- duplicate canonical ID,
- unresolved input.

## directions.matrix

- matrix dimensions,
- unreachable item,
- traffic field support,
- distance/duration non-negative,
- item-level status,
- source trace.

## places.search

- duplicate canonical place,
- null rating semantics,
- operational status,
- category precision,
- provider IDs,
- pagination.

## weather.forecast

- generatedAt,
- horizon coverage,
- past date rejection,
- null missing fields,
- probability range,
- climate/forecast separation.

## Kritik kriterler

- schema validity %100,
- source trace required,
- provider-specific alan sızıntısı yok,
- fixture determinism %100,
- invalid data success olarak dönmez.
