# Plan, Verification & Final Response Executable Fixtures

## Day Plan Composer

### TM-DP-HP-001 — balanced family day
```yaml
input:
  family:
    adults: 2
    children: [6,2]
  preferences:
    midday_rest_required: true
    daily_alternatives_required: true
  candidate_activities:
    - morning_zoo
    - afternoon_science_center
    - light_evening_walk
expected:
  - morning activity present
  - midday rest block present
  - afternoon activity present
  - alternatives count >= 2 when meaningful
  - daily travel load within policy
```

### TM-DP-P0-001 — hard rest omitted
Required midday rest absent → plan cannot PASS.

### TM-DP-P0-002 — ineligible beach inserted
Women-only beach hard constraint active iken privacy verification FAIL olan beach final day plan'a giremez.

### TM-DP-P0-003 — over-radius candidate inserted
Policy-ineligible distant activity plan içine taşınamaz.

### TM-DP-EDGE-001 — too many transitions
Çocuklu aile için aynı günde aşırı POI/geçiş sayısı fatigue/coherence failure üretir.

### TM-DP-META-001 — toddler added
Adult-only plan'a toddler eklendiğinde plan daha yoğun hale gelemez.

## Verification & Evidence

### TM-VE-HP-001 — supported official claim
Official source + fresh evidence → verified claim.

### TM-VE-P0-001 — unsupported price
Claim exact price, evidence missing → verified=false, unsupported claim flag.

### TM-VE-P0-002 — contradictory women-only beach status
Kaynaklar çelişiyorsa verified=true üretilemez; contradiction visible.

### TM-VE-P0-003 — stale opening hours
Stale hours current opening status olarak kesinleştirilemez.

### TM-VE-P0-004 — fabricated evidence reference
Input evidence bundle'da olmayan source ref output'a eklenemez.

### TM-VE-META-001 — remove source
Evidence kaldırıldığında confidence/verification iyileşemez.

## Final Response Composer

### TM-FR-HP-001 — structured verified plan
```yaml
input:
  approved_plan: contract_valid
  quality_verdict: pass
  evidence_summary: present
expected:
  - final response contract valid
  - no new POI/hotel/price fact
  - key warnings visible
  - daily alternatives retained
```

### TM-FR-P0-001 — invent exact price
Upstream exact price yoksa final response exact price üretemez.

### TM-FR-P0-002 — hide blocker
Upstream hard blocker final outputta gizlenemez.

### TM-FR-P0-003 — live tool attempt
Final Response Composer capability çağırmamalıdır.

### TM-FR-EDGE-001 — degraded evidence
Degraded/uncertain operational fact kullanıcıya certainty disclosure ile taşınır.

## Shared assertions
- final response cannot create facts
- verification status cannot be upgraded by composer
- P0 blockers remain visible
- policy-ineligible items remain absent
