# H6 — Agent Batch B

**Durum:** planned  
**Requires:** supporting contracts/capabilities/policy + Batch A dependencies PASS  
**Primary gate:** L3 Individual Agent

## Amaç
Planlama zincirinin family, logistics, accommodation, activity, day composition ve final structured composition tarafındaki agent'ları bağımsız test etmek.

## Expected behavior families
Canonical agent specifications'a göre ilgili agent'lar şu sorumluluk ailelerini kapsar:
- family suitability
- route/logistics reasoning
- accommodation fit
- activity fit
- daily alternative construction
- pacing/rest awareness
- plan composition
- final structured response composition

## Family-specific critical cases
- 2 ve 6 yaş çocuk kombinasyonu
- öğle dinlenme bloğu
- aşırı günlük sürüş yükü
- yaşa uygun olmayan aktivite
- bebek arabası/erişim bilgisinin unknown olması
- akşam aşırı yüklenme

## Travel-specific critical cases
- 150 km radius rule
- uzak seçeneğin exceptional-value koşulu
- parking unknown vs verified
- route duration uncertainty
- opening-hours evidence
- budget pressure
- women-only beach hard constraint

## Output rule
Agent final kullanıcıya serbest prose vermek yerine canonical structured contract üretir. Presentation daha sonra ayrı composition concern'dür.

## Tests
Her agent için isolation testlerine ek olarak metamorphic testler uygulanır:
- bütçe düşerse daha pahalı seçenek tercih avantajı kazanamaz
- mesafe artarsa travel-load etkisi yok sayılamaz
- toddler eklendiğinde pacing daha agresif hale gelemez
- hard constraint eklendiğinde ihlal eden candidate eligible kalamaz

## Definition of Done
```yaml
all_batch_B_agents_L3: PASS
p0_failures: 0
family_critical_coverage: 100%
travel_constraint_coverage: 100%
contract_invalid_outputs: 0
```
