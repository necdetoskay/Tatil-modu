# Tatil Modu — Agent Communication Protocol (ACP)

**Doküman türü:** Sistem iletişim protokolü
**Teknik kod adı:** `tatil_modu_acp`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Agent Communication Protocol, Tatil Modu içindeki bütün agent ve platformların hangi mesaj yapıları, yaşam döngüsü kuralları, hata kodları, sürümleme ilkeleri ve izlenebilirlik standartlarıyla haberleşeceğini tanımlar.

Bu protokolün amacı:

- agentlar arası gevşek bağlılık,
- air-gapped çalışma,
- şema doğrulama,
- güvenli veri paylaşımı,
- deterministik görev yaşam döngüsü,
- hataların izole edilmesi,
- yeniden deneme ve iptal,
- uçtan uca izlenebilirlik

sağlamaktır.

## 2. Temel İlkeler

- Agentlar birbirini doğrudan çağırmaz.
- Bütün mesajlar Orchestrator veya yetkili platform gateway üzerinden geçer.
- Serbest metin yerine sürümlü mesaj şemaları kullanılır.
- Her mesaj trace, task ve trip kimliği taşır.
- Her agent yalnızca izin verilen veri alanlarını görür.
- Her cevap confidence, warnings, unknowns ve evidence taşıyabilir.
- Şema dışı alanlar reddedilir veya quarantine edilir.
- Kritik veri kaynağı ve güncellik bilgisi olmadan kabul edilmez.

## 3. Mesaj Türleri

- `task_request`
- `task_response`
- `task_progress`
- `task_cancel`
- `task_retry`
- `task_error`
- `verification_request`
- `verification_response`
- `memory_read_request`
- `memory_write_candidate`
- `policy_evaluation_request`
- `policy_evaluation_response`
- `replan_event`
- `audit_event`

## 4. Ortak Mesaj Zarfı

```json
{
  "protocol": "tatil-modu-acp",
  "protocol_version": "1.0",
  "message_id": "msg_001",
  "message_type": "task_request",
  "request_id": "req_001",
  "trace_id": "trc_001",
  "trip_id": "trip_001",
  "task_id": "tsk_001",
  "parent_task_id": null,
  "source": "travel_orchestrator",
  "target": "hotel_discovery_ranking_agent",
  "created_at": "2026-08-06T18:00:00Z",
  "deadline_at": "2026-08-06T18:00:30Z",
  "priority": "normal",
  "locale": "tr-TR",
  "currency": "TRY",
  "payload_schema": "hotel.search.request.v1",
  "payload": {},
  "security_context": {},
  "observability": {}
}
```

## 5. Kimlikler

### request_id
Kullanıcının tek isteğini temsil eder.

### trace_id
Bütün alt görevleri birbirine bağlar.

### trip_id
Aynı seyahat planı veya canlı gezi oturumunu temsil eder.

### task_id
Tek bir agent görevini temsil eder.

### message_id
Tekil ACP mesajıdır.

### parent_task_id
Alt görevin hangi görevden türediğini gösterir.

## 6. Task Request

```json
{
  "task_type": "find_hotels",
  "input": {},
  "constraints": [],
  "preferences": [],
  "allowed_tools": [],
  "required_output_fields": [],
  "timeout_ms": 30000,
  "retry_policy": {
    "max_attempts": 2,
    "backoff": "exponential"
  }
}
```

## 7. Task Response

```json
{
  "status": "completed",
  "data": {},
  "confidence": 0.88,
  "warnings": [],
  "unknowns": [],
  "assumptions": [],
  "evidence": [],
  "metrics": {
    "duration_ms": 8200,
    "input_tokens": 2100,
    "output_tokens": 900,
    "tool_calls": 4,
    "estimated_cost": 0.03
  }
}
```

## 8. Durumlar

- `accepted`
- `running`
- `waiting_dependency`
- `partial`
- `completed`
- `needs_input`
- `blocked`
- `cancelled`
- `failed`
- `timed_out`

## 9. Görev Yaşam Döngüsü

```text
created
  ↓
accepted
  ↓
running
  ├── waiting_dependency
  ├── partial
  ├── retrying
  └── blocked
  ↓
completed / failed / cancelled / timed_out
```

## 10. Hata Mesajı

```json
{
  "error": {
    "code": "AGENT_TIMEOUT",
    "category": "transient",
    "severity": "recoverable",
    "message": "Agent zaman aşımına uğradı.",
    "retryable": true,
    "details": {},
    "impact": ["hotel_results_incomplete"]
  }
}
```

## 11. Hata Kategorileri

- `input`
- `schema`
- `permission`
- `transient`
- `dependency`
- `verification`
- `policy`
- `security`
- `resource`
- `internal`

## 12. Standart Hata Kodları

- `ACP_SCHEMA_INVALID`
- `ACP_VERSION_UNSUPPORTED`
- `TASK_INPUT_INVALID`
- `TASK_PERMISSION_DENIED`
- `TASK_DEPENDENCY_FAILED`
- `AGENT_TIMEOUT`
- `AGENT_FAILED`
- `TOOL_UNAVAILABLE`
- `RATE_LIMITED`
- `DATA_STALE`
- `CONSTRAINT_VIOLATION`
- `VERIFICATION_REQUIRED`
- `VERIFICATION_FAILED`
- `MEMORY_ACCESS_DENIED`
- `PROMPT_INJECTION_DETECTED`
- `CANCELLED_BY_USER`
- `NO_VALID_RESULT`

## 13. Retry Kuralları

Retry yapılabilir:

- geçici ağ hatası
- timeout
- rate limit
- geçici servis hatası

Retry yapılmaz:

- geçersiz şema
- izin reddi
- hard constraint ihlali
- kullanıcı iptali
- aynı deterministik hata

## 14. İptal

`task_cancel` mesajı:

```json
{
  "reason": "user_changed_destination",
  "cancel_scope": "task",
  "requested_by": "travel_orchestrator"
}
```

Agent iptal aldıktan sonra yeni tool çağrısı başlatamaz.

## 15. Idempotency

Yazma ve işlem mesajları `idempotency_key` taşımalıdır.

```json
{
  "idempotency_key": "trip_001-memory-candidate-003"
}
```

Aynı anahtarla gelen işlem ikinci kez uygulanmaz.

## 16. Sürümleme

### Protocol Version
ACP zarfının sürümüdür.

### Payload Schema Version
Agent görevine özel payload sürümüdür.

### Backward Compatibility
- minor sürümler geriye uyumlu olmalıdır,
- major sürüm değişikliğinde adapter gerekir,
- bilinmeyen major sürüm reddedilir.

## 17. Security Context

```json
{
  "actor": "travel_orchestrator",
  "purpose": "hotel_discovery",
  "data_scopes": [
    "trip.travelers.summary",
    "trip.accommodation.preferences"
  ],
  "tool_scopes": [
    "hotel_search_read"
  ],
  "sensitivity": "normal"
}
```

## 18. Disclosure Paketi

Agentlara bütün profil değil, görev için gerekli veri gönderilir.

ACP gateway:

- scope doğrular,
- gereksiz alanları çıkarır,
- hassas veriyi maskeler,
- audit kaydı üretir.

## 19. Evidence Taşıma

Her claim için Universal Evidence Model kullanılır.

```json
{
  "claim_key": "parking_available",
  "claim_value": true,
  "evidence_refs": ["ev_001"],
  "verification_status": "verified",
  "confidence": 0.93
}
```

## 20. Progress Mesajları

Uzun görevlerde:

```json
{
  "stage": "verifying_sources",
  "progress": 0.65,
  "partial_metrics": {
    "sources_checked": 8
  }
}
```

Progress mesajı nihai sonuç değildir.

## 21. Replan Event

```json
{
  "event_type": "WEATHER_CHANGED",
  "event_time": "2026-09-08T14:10:00+03:00",
  "affected_blocks": ["day_1_afternoon"],
  "context": {
    "rain_probability": 0.90
  }
}
```

## 22. Audit Event

```json
{
  "event_type": "decision_recorded",
  "decision_id": "dec_001",
  "source_agents": [
    "route_planner_agent",
    "weather_agent"
  ],
  "selected": "hotel_pool",
  "rejected": ["teleferik"],
  "reason_codes": [
    "heavy_rain",
    "family_fatigue"
  ]
}
```

## 23. Observability Alanları

```json
{
  "span_id": "span_001",
  "parent_span_id": null,
  "attempt": 1,
  "queue_wait_ms": 42,
  "execution_ms": 8200,
  "cache_hit": false,
  "model_id": "model_alias",
  "tool_call_count": 4
}
```

## 24. Air-Gapped Taşıma

ACP aşağıdaki taşıma katmanlarından bağımsız tasarlanır:

- in-process queue
- local message broker
- database outbox
- HTTP/gRPC
- workflow engine
- file-based offline queue

Air-gap ortamda dış servis çağrıları adapter üzerinden kontrollü yapılır veya mock/cached kaynaklar kullanılır.

## 25. Contract Testing

Her agent için:

- request şeması
- response şeması
- hata şeması
- version compatibility
- idempotency
- cancellation
- timeout
- permission scope

test edilir.

## 26. Kabul Kriterleri

- Bütün mesajlar ACP zarfı kullanmalı.
- Her mesaj trace/task/trip kimliği taşımalı.
- Şema ve sürüm doğrulaması yapılmalı.
- İzin ve disclosure kontrolü zorunlu olmalı.
- Retry ve cancellation deterministik olmalı.
- Evidence ve confidence taşınabilmeli.
- Hatalar standart kodlarla dönmeli.
- Taşıma katmanından bağımsız olmalı.
- Air-gap ortamda çalışabilmeli.
