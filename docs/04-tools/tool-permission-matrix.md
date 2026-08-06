# Tool Permission Matrix

## 1. Amaç

Her agentın hangi tool capability'lerini hangi koşullarda kullanabileceğini merkezi olarak tanımlamak.

## 2. Politika modeli

```text
Agent
  × Tool Capability
  × Execution Mode
  × Data Classification
  × User Consent
  × Cost Limit
```

## 3. Karar durumları

```text
allow
allow_with_constraints
deny
require_orchestrator_approval
require_user_consent
```

## 4. Başlangıç matrisi

| Agent | Web Search | Geocoding | Directions | Weather | Accommodation | Reviews | Calculator | Rule Engine |
|---|---|---|---|---|---|---|---|---|
| AG-001 Trip Profile | Deny | Deny | Deny | Deny | Deny | Deny | Allow | Allow |
| AG-002 Destination Discovery | Allow | Allow | Allow | Allow | Deny | Conditional | Allow | Allow |
| AG-003 Places & Experiences | Allow | Allow | Allow | Conditional | Deny | Allow | Allow | Allow |
| AG-004 Accommodation | Allow | Allow | Conditional | Deny | Allow | Allow | Allow | Allow |
| AG-005 Food & Local Taste | Allow | Allow | Conditional | Deny | Deny | Allow | Allow | Allow |
| AG-006 Review Intelligence | Conditional | Deny | Deny | Deny | Deny | Allow | Allow | Allow |
| AG-007 Weather Context | Deny | Conditional | Deny | Allow | Deny | Deny | Allow | Allow |
| AG-008 Route & Schedule | Deny | Conditional | Allow | Consume | Deny | Consume | Allow | Allow |
| AG-009 Budget & Constraint | Deny | Deny | Consume | Consume | Consume | Consume | Allow | Allow |
| AG-010 Quality Reviewer | Conditional | Conditional | Conditional | Conditional | Conditional | Conditional | Allow | Allow |
| AG-011 Final Plan Composer | Deny | Deny | Deny | Deny | Deny | Deny | Allow | Deny |
| AG-012 Orchestrator | Gateway control | Gateway control | Gateway control | Gateway control | Gateway control | Gateway control | Allow | Allow |

`Consume`, başka agentın doğrulanmış handoff çıktısını kullanmak anlamına gelir.

## 5. AG-001 özel kuralı

Trip Profile Agent dış tool kullanmaz. Calculator ve Rule Engine yalnız deterministik doğrulama için kullanılabilir.

## 6. Consent gerektiren çağrılar

- hassas konum,
- kişisel takvim,
- kullanıcı hesabına bağlı rezervasyon verisi,
- kişiselleştirilmiş geçmiş,
- üçüncü taraf profile bağlanan veri.

## 7. Policy evaluation

Tool Gateway çağrıdan önce:

- agent ID,
- capability,
- execution mode,
- consent scope,
- cost budget,
- data classification

kontrol eder.

## 8. Testler

- deny çağrı provider'a ulaşmaz,
- consent eksik çağrı engellenir,
- conditional policy constraint uygular,
- AG-001 dış çağrı yapamaz,
- Orchestrator bypass yapamaz; yalnız policy yönetir.
