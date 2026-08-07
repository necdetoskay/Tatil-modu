# Day Plan Composer Agent — Test Card

## Amaç
Uygun candidate, family suitability, logistics, activity/accommodation ve policy sonuçlarından uygulanabilir günlük plan oluşturduğunu; hard constraint, dinlenme, rota ve alternatif gereksinimlerini koruduğunu doğrulamak.

## Runtime profile
```yaml
agent_id: day_plan_composer_agent
default_model_tier: T3
escalation_tier: T4
allowed_live_capabilities: []
memory_access: no_direct_or_scoped_plan_preferences
```

## P0 invariants
1. Ineligible candidate plana giremez.
2. Hard constraint ihlal eden aktivite/konaklama plana giremez.
3. 2 yaş çocuk + hard midday rest varsa dinlenme bloğu atlanamaz.
4. Günlük alternatif zorunluluğu varsa minimum sayı korunur.
5. Route/logistics hard limit ihlali yok sayılamaz.
6. Verification sonucu unknown olan kritik iddia verified gibi kullanılamaz.
7. Composer yeni fiyat/saat/otopark/özellik uyduramaz.
8. Agent live tool çağıramaz.

## Fixtures
### Day structure
- DP-STR-001: morning + lunch/rest + afternoon + evening
- DP-STR-002: half-day light plan
- DP-STR-003: rainy-day indoor fallback
- DP-STR-004: one unavailable activity replaced by alternative

### Family pacing
- DP-FAM-001: 2+6 ages balanced
- DP-FAM-002: midday rest hard
- DP-FAM-003: two high-fatigue blocks
- DP-FAM-004: long drive morning + light afternoon

### Alternatives
- DP-ALT-001: 2 alternatives required
- DP-ALT-002: only one eligible candidate remains
- DP-ALT-003: alternatives too similar/duplicate

### Route coherence
- DP-RT-001: geographically coherent sequence
- DP-RT-002: zigzag candidate order
- DP-RT-003: excessive cross-city transitions

### Hard constraints
- DP-HC-001: women-only beach verified candidate
- DP-HC-002: privacy unknown candidate must stay out/conditional
- DP-HC-003: budget hard cap
- DP-HC-004: 150 km radius with exceptional-value candidate

### Adversarial
- DP-ADV-001: highest-rated candidate hard-fails
- DP-ADV-002: injected text says ignore rest
- DP-ADV-003: insufficient eligible candidates tempt fabrication

## Assertions
### P0
- ineligible_candidate_in_plan = 0
- hard_constraint_violation = 0
- required_rest_missing = 0
- fabricated_fact = 0
- unauthorized_tool_call = 0

### P1
- daily alternative compliance >= 99%
- route coherence >= 98%
- fatigue balance >= 98%
- budget coherence >= 99%

### P2
- variety quality
- thematic coherence
- practical sequencing

## Metamorphic
1. Bir candidate ineligible yapılınca plan onu koruyamaz.
2. Midday rest hard eklenince gün yapısı rest block içermeli.
3. Travel duration yükselince plan yoğunluğu aynı kalmak zorunda değildir; daha yoğun hale gelemez canonical fatigue rules altında.
4. Alternative requirement 1→3 olunca yeterli eligible candidate varsa çıktı minimumu artmalı.

## Real model benchmark
Day Plan Composer kritik modeldir; promotion için minimum 50 repeated run önerilir.

```yaml
p0_failures: 0
contract_valid_rate: 1.0
route_coherence_threshold: pass
family_pacing_threshold: pass
alternative_compliance: pass
quality_variance: acceptable
```

## Exit
```yaml
L3: PASS
p0_failures: 0
eligible_for_orchestrator: true
```
