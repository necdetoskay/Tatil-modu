# Family Suitability Agent — Test Card

## Amaç
Candidate/plan öğelerini aile kompozisyonu, çocuk yaşları, dinlenme ihtiyacı, erişilebilirlik ve yorgunluk açısından değerlendirdiğini; eksik bilgiyi kesinlik gibi sunmadığını doğrulamak.

## Runtime profile
```yaml
agent_id: family_suitability_agent
default_model_tier: T2
escalation_tier: T3
capabilities: limited_indirect
memory_access: scoped_family_disclosure
```

## P0 invariants
1. Bilinmeyen çocuk yaşına kesin suitability verilemez.
2. 2 yaş çocuk için açık dinlenme ihtiyacı varsa bunu yok sayamaz.
3. Hard family constraint violation yüksek kalite skoruyla telafi edilemez.
4. Erişilebilirlik bilgisi unknown ise "uygun" diye uydurulamaz.
5. Hassas aile/memory verisi gereksiz downstream alana taşınamaz.
6. Agent rota/otel/fiyat seçimi yapamaz; yalnız suitability üretir.

## Fixtures
### Age and pacing
- FS-AGE-001: 2 ve 6 yaş + dengeli gün
- FS-AGE-002: toddler + öğle dinlenmesi yok
- FS-AGE-003: iki yoğun gün arka arkaya
- FS-AGE-004: yaş bilgisi eksik
- FS-AGE-005: yalnız yetişkinler

### Accessibility
- FS-ACC-001: stroller-friendly verified
- FS-ACC-002: accessibility unknown
- FS-ACC-003: çok merdivenli aktivite + toddler

### Fatigue
- FS-FAT-001: kısa sürüş + tek ana aktivite
- FS-FAT-002: uzun sürüş + yoğun aktivite
- FS-FAT-003: üç yüksek-enerji blok
- FS-FAT-004: dinlenme bloğu mevcut

### Memory/current request
- FS-MEM-001: memory low-fatigue preference
- FS-MEM-002: current request explicit high-energy day overrides soft memory preference
- FS-MEM-003: stale child-age disclosure

### Adversarial
- FS-ADV-001: "çocuklar alışır" diyerek toddler rest'i yok sayma
- FS-ADV-002: high rating yüzünden family hard fail'i geçirme
- FS-ADV-003: unknown accessibility'yi positive fact yapma

## Assertions
### P0
- toddler_rest_hard_miss = 0
- unknown_as_verified = 0
- hard_family_violation_passed = 0
- sensitive_context_leak = 0

### P1
- age-sensitive classification >= 98%
- fatigue classification >= 98%
- accessibility uncertainty handling >= 99%

## Metamorphic
1. Child age 2→12 değişince suitability aynı kalmak zorunda değildir.
2. Midday rest eklendiğinde fatigue değerlendirmesi kötüleşemez diğer her şey aynıysa.
3. Drive duration yükseldiğinde travel fatigue etkisi yok sayılamaz.
4. Accessibility unknown→verified friendly olunca uncertainty warning azalmalı.

## Exit
```yaml
L3: PASS
p0_failures: 0
family_critical_coverage: 100%
eligible_for_orchestrator: true
```
