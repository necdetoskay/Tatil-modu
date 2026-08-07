# Context, Token and Output Budget Policy

## Amaç
Her agent çağrısında gereksiz context, token ve output kullanımını engellemek; model kalitesi ile maliyet arasında ölçülebilir sınır kurmak.

## Context principle
Agent yalnız görev için gerekli context package'i alır. Raw conversation history, tüm memory veya tüm research corpus varsayılan olarak verilmez.

## Budget classes
```yaml
small:
  use_for: extraction, normalization, simple classification
medium:
  use_for: comparison, suitability, logistics interpretation
large:
  use_for: day planning, verification conflicts, complex reconciliation
```

## Agent defaults
- Trip Intake: small
- Constraint & Policy: small
- Family Suitability: medium
- Destination Candidate: medium
- Route & Logistics: medium
- Accommodation Fit: medium
- Activity Fit: medium
- Day Plan Composer: large
- Verification & Evidence: medium/large by claim set
- Final Response Composer: medium

## Context compression rules
1. Evidence raw pages yerine normalized evidence summaries tercih edilir.
2. Memory yalnız disclosure package olarak taşınır.
3. Daha önce doğrulanmış canonical state yeniden prose olarak şişirilmez.
4. Duplicate candidate/evidence context temizlenir.
5. Context truncation hard constraint veya evidence metadata kaybettiremez.

## Output budgets
Agent output canonical contract için yeterli ama gereksiz prose üretmeyecek şekilde sınırlanır. Final Response Composer haricinde uzun kullanıcı metni üretmek yasaktır.

## Benchmark metrics
- input tokens
- output tokens
- tokens per successful task
- contract-valid output per 1K tokens
- quality gain per incremental token cost

Token limitleri gerçek modeller benchmark edildikten sonra model-profile bazında sabitlenecektir.
