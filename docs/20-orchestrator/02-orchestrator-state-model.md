# Orchestrator State Model

## Amaç
Orchestrator state, workflow boyunca sonuçların kaybolmadan, sahipliği karışmadan ve downstream'e kontrolsüz veri sızmadan taşındığı koordinasyon görünümüdür. Runtime DB schema değildir.

## Mantıksal state
```yaml
orchestration_state:
  execution:
    workflow_id: required
    correlation_id: required
    current_stage: required
    status: pending|running|blocked|degraded|completed|failed
  request:
    trip_profile_ref: optional
    constraints_ref: optional
  results:
    research_refs: []
    verified_evidence_refs: []
    candidate_refs: []
    plan_ref: optional
    budget_result_ref: optional
    quality_report_ref: optional
    final_response_ref: optional
  control:
    satisfied_prerequisites: []
    active_gates: []
    blockers: []
    warnings: []
    retry_counters: {}
    fallback_flags: []
  trace:
    decision_refs: []
    handoff_refs: []
    audit_event_refs: []
```

## State kuralları
1. State mümkün olduğunca artifact/ref taşır; başka platformların verisini sahiplenmez.
2. Her stage yalnız izin verilen state bölümünü okuyup yazar.
3. Contract-invalid sonuç `results` içine accepted artifact olarak yazılmaz.
4. Blocker silinmez; resolved/superseded durumu trace ile tutulur.
5. Evidence confidence ve freshness Orchestrator tarafından yeniden hesaplanmaz.
6. Retry counter stage + failure-class bazında tutulur.
7. Finalization yalnız terminal gate koşulları sağlandığında mümkündür.

## Terminal durumlar
- `completed`: finalization gate geçti.
- `degraded`: kullanılabilir sonuç var fakat açık eksik/uncertainty bulunuyor.
- `blocked`: kullanıcı girdisi, verification veya hard constraint nedeniyle ilerleme mümkün değil.
- `failed`: orchestration güvenli şekilde tamamlanamadı.
