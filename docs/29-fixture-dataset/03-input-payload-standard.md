# Input Payload Standard

## Amaç
Agent ve E2E fixture inputlarının aynı disiplinle hazırlanmasını sağlamak.

## Shape
```yaml
input_payload:
  raw_user_message: optional
  conversation_context: optional
  locale_context:
    language: tr-TR
    currency: TRY
    timezone: Europe/Istanbul
  current_date_context: optional
  upstream_contracts: {}
  orchestration_context: optional
```

## Source fidelity
Her kritik alanın kaynağı korunmalıdır:
```yaml
field:
  value: ...
  source: user_explicit|conversation_context|memory_disclosure|derived|missing
```

## Negative fixture rule
Invalid fixture bilinçli olarak hangi alanı bozduğunu metadata'da belirtir:
```yaml
mutation:
  target: budget.currency
  type: missing_required_field
```

## Agent isolation
Individual-agent fixture başka agent çalıştırılmasını gerektirmez. Upstream agent output gerekiyorsa hazır contract payload olarak verilir.

## Raw text rule
Raw user message yalnız intake gibi gerçekten gerektiren agent'lara verilir. Downstream agent fixture'larında canonical upstream contract tercih edilir.

## Locale/date
Göreli tarih içeren her fixture fixed `current_date_context` taşır. Locale farklılığı test ediliyorsa açıkça taglenir.
