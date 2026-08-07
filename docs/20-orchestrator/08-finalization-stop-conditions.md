# Finalization & Stop Conditions

## Amaç
Bu belge bir workflow instance'ının ne zaman final cevaba geçebileceğini, ne zaman kontrollü biçimde duracağını ve terminal durumların anlamını tanımlar.

## Finalization gate
Final Composer'a route için asgari koşullar:

```yaml
finalization_requirements:
  intake_contract_valid: true
  unresolved_hard_constraint_blockers: 0
  required_policy_gates_passed: true
  required_verification_completed_or_explicitly_degraded: true
  plan_artifact_available: true
  quality_status: pass|pass_with_warnings
  mandatory_disclosures_preserved: true
  final_response_inputs_contract_valid: true
```

## Finalization yasakları
Aşağıdaki durumlarda normal `completed` finalization yapılamaz:
- unresolved safety veya hard constraint blocker
- privacy-sensitive hard requirement ihlali
- required contract invalidity
- unresolved verification conflict
- hard budget limit breach
- Quality Engine `block` sonucu
- mandatory disclosure kaybı

## Terminal durumlar
```yaml
terminal_states:
  completed:
    meaning: tüm zorunlu gate'ler geçti
  degraded:
    meaning: güvenli ve kullanılabilir sonuç var; belirsizlik veya evidence gap açıkça taşınıyor
  blocked:
    meaning: hard requirement veya gerekli input/evidence çözülmeden ilerlemek güvenli değil
  failed:
    meaning: orchestration kontrollü şekilde tamamlanamadı
```

## Stop conditions
Workflow aşağıdaki durumlarda yeni stage dispatch etmeyi bırakır:
1. terminal state atanmışsa,
2. hard blocker için çözüm yolu kalmamışsa,
3. retry/revision budget tükenmişse,
4. gerekli dependency güvenli biçimde üretilemiyorsa,
5. quality blocker bounded revision sonunda sürüyorsa,
6. kullanıcıdan yeni input olmadan devam etmek varsayım gerektiriyorsa ve bu varsayım hard requirement'ı etkiliyorsa.

## Degraded completion
Degraded sonuç başarısızlığı gizlemek değildir. Hangi bilginin eksik, stale, conditional veya doğrulanmamış olduğu final response'a disclosure olarak taşınmalıdır.

## Final Composer sınırı
Final Composer yalnız finalization gate tarafından izin verilen canonical artifact ve disclosure paketlerini kullanır. Orchestrator final kullanıcı metnini kendisi üretmez.
