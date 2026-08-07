# Gate Coordination Model

## Amaç
Orchestrator gate kararlarını üretmez; canonical Decision Policy Engine ve Quality Engine sonuçlarını doğru yerde uygular.

## Gate sırası
```text
Intake completeness
→ hard constraint eligibility
→ contract validity
→ evidence / verification readiness
→ candidate eligibility
→ plan composition readiness
→ budget / constraint validation
→ quality review
→ finalization
```

## Precedence
1. Safety / hard constraint blocker
2. Privacy-sensitive hard requirement
3. Contract validity
4. Verification-required evidence gap
5. Budget hard limit
6. Quality blocker
7. Soft preference / optimization
8. Presentation preference

Alt seviyedeki olumlu skor üst seviyedeki blocker'ı geçersiz kılamaz.

## Gate sonucu
```yaml
gate_result:
  status: pass|conditional_pass|revise|block
  reason_codes: []
  required_actions: []
  evidence_refs: []
  decision_ref: required
```

`conditional_pass` final cevapta gerekli disclosure kaybolmadan taşınmalıdır.

## Örnek
Kadınlar plajı hard requirement ise yalnız 'plaj var' bilgisi pass değildir. İlgili privacy/use-condition iddiası gereken doğrulama seviyesinde kanıtlanmamışsa candidate plan içinde kesin uygun olarak işaretlenemez.
