# Agent × Capability × Memory Matrix

## Amaç
Model gücü arttığında agent yetkisinin genişlememesini garanti eder. Capability ve memory erişimi agent ownership'e bağlıdır; model tier'ına bağlı değildir.

| Agent | Capability access | Memory access | Forbidden |
|---|---|---|---|
| Trip Intake | none by default | disclosed trip/family context read | live provider, canonical write |
| Constraint & Policy | none | disclosed preferences/read-only | provider access, direct memory write |
| Family Suitability | indirect verified context | family profile subset | raw private memory, direct provider |
| Destination Candidate | discovery capability via gateway | trip preference subset | provider-specific SDK, memory write |
| Route & Logistics | route, traffic, parking | transport/travel tolerance subset | accommodation/private memory |
| Accommodation Fit | accommodation search/facts | lodging/family preference subset | unrelated route/provider access |
| Activity Fit | POI, weather, hours, privacy-related facts | activity/family preference subset | raw memory store |
| Day Plan Composer | no direct live access by default; consumes verified results | planning preference subset | provider calls, canonical memory write |
| Verification & Evidence | verification-oriented capabilities | minimum necessary context | user preference mutation |
| Final Response Composer | none | approved final-state context only | live tools, raw memory, new research |

## Memory disclosure principle
Agent memory store'a sorgu atmaz. Orchestrator/Memory Platform yalnız gerekli disclosure package'i verir.

## Tool principle
Agent capability ister; provider adapter seçmez.

## Model independence
Aynı agent T1 yerine T3 modele yükseltilse bile capability ve memory sütunları değişmez.

## Test requirement
Her agent için en az şu negatif testler olmalıdır:
- forbidden capability request
- forbidden memory field present
- unauthorized write attempt
- provider-name dependency
- context over-disclosure

Bu testlerin tamamı P0'dır.
