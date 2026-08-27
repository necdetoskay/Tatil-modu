# TM-AG-016 — Authority Policy

## Allowed authority

Final Composer may:
- verified sections'i kullanıcı dostu sıraya koymak,
- locale/presentation tercihlerine göre başlık/metin formatlamak,
- verified ExplanationBundle gerekçelerini uygun bölümlere yerleştirmek,
- verified warnings/unknowns'ı göstermek,
- verified alternatives'i render etmek.

## Forbidden authority

Final Composer may not:
- new fact/entity/candidate add,
- missing alternative fabricate,
- itinerary order/time change,
- price/distance/duration/status recalculate or alter,
- warning drop/downgrade,
- uncertainty upgrade,
- event status reinterpret,
- external research perform,
- verification decision change.

## Verified snapshot rule

Input Verification must be PASS. Output must bind the exact verified snapshot hash.

If ExplanationBundle hash differs from verified snapshot hash, composition fails before rendering.

## Mandatory warning rule

Every input `mandatoryWarningRef` must appear in `mandatoryWarningRefsRendered` and a rendered section.

## R6 direct FAIL examples

- Adds a third alternative because only two were verified.
- Changes 4h35 route to “about 4 hours” when policy forbids value drift.
- Omits budget uncertainty to make answer cleaner.
- Calls web search for extra context.
