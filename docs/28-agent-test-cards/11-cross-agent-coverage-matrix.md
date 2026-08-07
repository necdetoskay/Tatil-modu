# Cross-Agent Coverage Matrix

## Amaç
Kritik requirement'ların hangi agent/test kartı tarafından doğrulandığını görünür kılmak ve coverage boşluklarını engellemek.

| Critical behavior | Primary owner/test | Supporting checks |
|---|---|---|
| explicit request extraction | Trip Intake | Contract L0 |
| missing field detection | Trip Intake | Orchestrator clarification |
| hard/soft classification | Constraint & Policy | Deterministic Policy L1 |
| hard constraint enforcement | Policy Engine | all downstream agent P0 assertions |
| family age suitability | Family Suitability | Day Plan Composer |
| toddler rest requirement | Family Suitability | Day Plan Composer / Golden E2E |
| destination radius | Destination Candidate | Route Logistics / Policy |
| route distance/time truth | Route Logistics | Verification |
| parking uncertainty | Route Logistics | Verification / Final Composer |
| accommodation budget | Accommodation Fit | Policy / Day Plan |
| accommodation availability truth | Accommodation Fit | Verification |
| activity age fit | Activity Fit | Family Suitability |
| opening hours truth | Activity Fit | Verification |
| weather dependency | Activity Fit | Day Plan Composer |
| women-only beach requirement | Activity Fit | Policy + Verification + Day Plan |
| evidence freshness | Verification & Evidence | Quality |
| contradictory evidence | Verification & Evidence | Quality |
| daily route coherence | Day Plan Composer | Quality / Golden E2E |
| daily alternatives | Day Plan Composer | Final Composer / Golden E2E |
| unsupported final fact prevention | Final Response Composer | Verification / Quality |
| blocker disclosure | Final Response Composer | Orchestrator / Quality |
| unauthorized tool access | every agent card | Capability boundary L2 |
| unauthorized memory access | every relevant agent card | Memory L2 |
| direct agent-to-agent call | every agent card | repository/import boundary + Orchestrator L4 |
| contract validity | every agent | Contracts L0 |
| model P0 eligibility | every LLM agent | L8 model benchmark |

## Critical multi-layer invariants
Bazı requirement'lar tek agent'a bırakılmaz çünkü farklı katmanlarda farklı sorumlulukları vardır.

### Women-only beach
```text
Trip Intake: requirement'ı kaybetme
Constraint Agent: hard/conditional hard olarak doğru taşı
Activity Fit: candidate attribute değerlendirme
Verification: claim'i doğrula
Policy Engine: eligibility enforce et
Day Plan: invalid candidate'i plana alma
Final Composer: uncertainty/blocker'ı doğru göster
```

### Toddler rest
```text
Trip Intake: explicit requirement'ı çıkar
Family Suitability: age/pacing etkisini değerlendir
Policy: hard ise enforce et
Day Plan: rest block yerleştir
Quality: missing rest'i reject/revise et
Final Composer: planı doğru göster
```

### Unverified price
```text
Capability: evidence envelope
Accommodation/Activity: fact uydurma
Verification: status belirle
Quality: unsupported fact'i yakala
Final Composer: tahmin/belirsizlik dilini koru
```

## Coverage rule
P0 requirement için:
```yaml
primary_test_owner_required: true
supporting_integration_test_required: true
golden_or_regression_coverage_required_when_user_visible: true
```

Bir requirement yalnız prompt instruction ile korunuyor fakat executable assertion'a sahip değilse coverage tamamlanmış sayılmaz.
