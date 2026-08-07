# Correlation, Trace and Execution Context

## Amaç
Bir kullanıcı isteğinin E2E yaşam döngüsünü agent, platform, tool ve engine sınırlarından geçerken tek zincir halinde izleyebilmek için gerekli kimlik ve context modelini tanımlar.

## Canonical context
```yaml
execution_context:
  correlation_id: required
  workflow_id: required
  execution_id: required
  stage_id: optional
  handoff_id: optional
  parent_span_ref: optional
  agent_or_component_id: required
  artifact_refs: []
  decision_refs: []
  retry_attempt: 0
  environment_class: design|test|production
```

## Kimliklerin amacı
- `correlation_id`: kullanıcı isteği / planlama oturumunun uçtan uca bağı.
- `workflow_id`: seçilen canonical workflow instance'ı.
- `execution_id`: belirli orchestration çalıştırması.
- `stage_id`: tek workflow stage çalıştırması.
- `handoff_id`: producer-consumer geçişi.
- `parent_span_ref`: nested execution ilişkisi.

## Kurallar
1. Correlation ID workflow boyunca değişmez.
2. Retry yeni stage execution oluşturabilir ama ana correlation bağını korur.
3. Parallel branch'ler ortak correlation taşır, ayrı stage/span kimliği kullanır.
4. Final response trace edilebilir artifact ve decision referanslarına bağlanabilir olmalıdır.
5. Kullanıcı PII'si correlation kimliği olarak kullanılamaz.
6. Trace context domain payload değildir; yalnız koordinasyon ve gözlemlenebilirlik metadata'sıdır.
