# Golden E2E Scenario Suite

## Amaç
Kullanıcı isteğinden final structured output'a kadar bütün headless zincirin deterministic mock-backed senaryolarla çalıştığını doğrulamak.

## Zorunlu golden senaryolar
- Kocaeli çıkışlı çocuklu aile kısa tatil planı,
- kadınlar plajı şartlı deniz önerisi,
- tek hedef ilde 5 günlük alternatifli plan,
- Balıkesir 3 günlük bütçeli aile tatili,
- Bursa hayvanat bahçesi sabah + öğleden sonra seçenekleri,
- yağmurlu gün indoor fallback,
- toddler ile aşırı sürüş yükü,
- eksik tarih/bütçe,
- doğrulanmamış fiyat/saat,
- hard constraint vs soft preference çatışması.

## Her E2E senaryoda doğrulanacaklar
```yaml
required_assertions:
  - normalized_request_valid
  - hard_constraints_preserved
  - evidence_lineage_valid
  - orchestrator_terminal_state_valid
  - family_suitability_pass_or_expected_block
  - daily_alternatives_present_when_required
  - fatigue_and_rest_rules_respected
  - unsupported_claims_not_presented_as_fact
  - quality_gate_pass_or_expected_failure
  - final_output_contract_valid
```

## Golden baseline
Golden baseline tam metin snapshot olmak zorunda değildir. Structured invariant + selected stable fields + rubric result birlikte baseline oluşturur.

## Gate
```yaml
suite: L6_golden_e2e
p0_pass_rate: 100%
required_golden_scenarios_pass: 100%
ui_unlock_blocking: true
```
