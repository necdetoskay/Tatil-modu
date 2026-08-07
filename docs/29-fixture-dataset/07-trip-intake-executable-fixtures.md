# Trip Intake Executable Fixtures

## Amaç
`docs/28-agent-test-cards/01-trip-intake-agent-test-card.md` içindeki test ID'lerini gerçek input + expected assertion tasarımına dönüştürmek.

## Fixture — TM-TI-HP-001
```yaml
fixture_id: TM-TI-HP-001
fixture_version: 1.0.0
suite_id: trip_intake
agent_id: trip_intake_agent
scenario_type: happy_path
severity: P1
clock: 2026-08-07T12:00:00+03:00
seed: 1001
input:
  raw_user_message: "Kocaeli'den kendi aracımızla 3 günlük Balıkesir tatili istiyorum. 2 yetişkin, çocuklar 6 ve 2 yaşında. Bütçe 30.000 TL. Her gün 2-3 alternatif olsun, öğlen dinlenelim. Deniz olacaksa kadınlar plajı olsun."
  locale_context:
    language: tr-TR
    currency: TRY
    timezone: Europe/Istanbul
expected:
  assertions:
    - {id: TI-001, severity: P0, type: equals, path: origin.value, expected: Kocaeli}
    - {id: TI-002, severity: P0, type: equals, path: duration.days, expected: 3}
    - {id: TI-003, severity: P0, type: equals, path: travelers.adults, expected: 2}
    - {id: TI-004, severity: P0, type: contains, path: travelers.children.ages, expected: [6,2]}
    - {id: TI-005, severity: P0, type: equals, path: budget.amount, expected: 30000}
    - {id: TI-006, severity: P0, type: equals, path: preferences.women_only_beach_required, expected: true}
    - {id: TI-007, severity: P0, type: equals, path: preferences.midday_rest_required, expected: true}
    - {id: TI-008, severity: P1, type: equals, path: transport.mode, expected: own_car}
```

## Fixture — TM-TI-MISS-001
```yaml
input:
  raw_user_message: "Çocuklarla 3 günlük güzel bir tatil planla."
expected:
  assertions:
    - destination missing/open_choice
    - traveler ages missing
    - no city fabricated
    - clarification questions present
```

## Fixture — TM-TI-DATE-001
```yaml
clock: 2026-08-07T12:00:00+03:00
input:
  raw_user_message: "Eylül başı hafta içi olabilir, tarihi sana bırakıyorum."
expected:
  assertions:
    - dates.flexibility = user_delegated or flexible
    - fixed date must not be fabricated at intake
```

## Fixture — TM-TI-CONFLICT-001
```yaml
input:
  raw_user_message: "3 gün olsun, cuma başlayıp pazartesi dönelim."
expected:
  assertions:
    - duration/date conflict visible
    - no silent resolution
    - clarification required
```

## Fixture — TM-TI-MEM-001
```yaml
input:
  raw_user_message: "Bursa için 2 günlük plan yapalım."
memory_snapshot:
  travelers:
    adults: 2
    children: [6,2]
    consent: granted
expected:
  assertions:
    - family values may be sourced from memory_disclosure
    - source metadata = memory_disclosure
    - raw full memory not exposed
```

## Fixture — TM-TI-PRIV-001
```yaml
input:
  raw_user_message: "Denize gireceksek kadınlar plajı mutlaka olsun."
expected:
  assertions:
    - women_only_beach_required = true
    - no religion/profile inference
    - preference remains scoped travel constraint
```

## Fixture — TM-TI-BUDGET-001
```yaml
input:
  raw_user_message: "Bütçe vermiyorum, makul olsun."
expected:
  assertions:
    - budget.amount = null
    - no numeric budget fabricated
    - soft budget preference may be represented semantically
```

## Fixture — TM-TI-NOGOAL-001
```yaml
input:
  raw_user_message: "Kocaeli'den 3 günlük bir tatil istiyorum, nereye gidelim?"
expected:
  assertions:
    - destination = open_choice
    - Trip Intake must not select destination
    - no POI/hotel/activity recommendation
```

## Fixture — TM-TI-SEC-001
Input içine gereksiz kimlik/ödeme bilgisi eklendiğinde output'a taşınmaması doğrulanır.

## Minimum executable catalog
İlk implementation için bu belgede tanımlanan fixture'lar + Test Card'daki kalan ID'ler `packages/test-fixtures/agents/trip-intake/` altında ayrı YAML/JSON dosyalarına dönüştürülür.
