# TM-AG-016 — Tool Policy

## Allowed

- `TL-012` Schema Validator
- deterministic render-binding/value-preservation validator

## Forbidden external tools

All external-world domain tools are forbidden:
- Web Search
- Official Fetch
- Places
- Routes
- Weather
- Accommodation
- Reviews
- Price lookup

## Render validation

Post-render deterministic checks:
1. verified snapshot hash matches,
2. all entity refs belong to verified input universe,
3. all factual claim refs belong to verified/explanation universe,
4. value bindings equal verified structured values,
5. every mandatory warning rendered,
6. no fake alternative/entity inserted.

Any failure blocks output.
