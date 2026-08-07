# Tatil Modu — Runtime Platform Teknik Tasarımı

**Doküman türü:** Platform teknik tasarımı
**Teknik kod adı:** `runtime_platform`
**Sürüm:** 1.0 Taslak
**Mimari katman:** Görev yürütme ve kaynak yönetimi
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Runtime Platform, ACP görevlerinin güvenli, izlenebilir, iptal edilebilir ve hata toleranslı şekilde çalıştırılmasını sağlar.

## 2. Bileşenler

- Task Dispatcher
- Queue Manager
- Worker Pool
- Scheduler
- Dependency Resolver
- Retry Engine
- Timeout Manager
- Cancellation Manager
- Circuit Breaker Manager
- Backpressure Controller
- Resource Quota Manager
- Workflow State Store
- Dead Letter Queue
- Graceful Shutdown Controller
- Runtime Health Service

## 3. Görev Yürütme Akışı

```text
ACP task request
  ↓
validate
  ↓
authorize
  ↓
enqueue
  ↓
assign worker
  ↓
execute agent
  ↓
persist state
  ↓
emit telemetry
  ↓
complete / retry / fail
```

## 4. Queue Türleri

- critical
- interactive
- standard
- background
- evaluation
- dead-letter

Kritik canlı yeniden planlama görevleri normal araştırma görevlerinden önceliklidir.

## 5. Worker Pool

Worker sınıfları:

- lightweight
- planner
- verifier
- tool-heavy
- evaluation
- offline

Her worker yalnızca izinli agent sınıflarını çalıştırabilir.

## 6. Görev Durumu

```json
{
  "task_id": "tsk_001",
  "state": "running",
  "attempt": 1,
  "worker_id": "wrk_004",
  "lease_expires_at": "2026-08-06T18:00:30Z",
  "checkpoint_ref": "state://tsk_001/3"
}
```

## 7. Lease ve Duplicate Önleme

Worker görev üzerinde kısa ömürlü lease alır.

Lease kaybolursa görev tekrar atanabilir. Yazma işlemleri idempotency key ile korunur.

## 8. Parallel Execution

DAG bağımsız düğümleri paralel çalıştırılır.

Runtime:

- dependency tamamlanmasını,
- concurrency limitini,
- provider quota'yı,
- toplam maliyet limitini

gözetir.

## 9. Retry Engine

Retry kararı:

- hata kategorisi,
- attempt sayısı,
- deadline,
- provider health,
- task priority

ile verilir.

## 10. Timeout

Timeout seviyeleri:

- model call
- tool call
- agent task
- workflow phase
- full request

Alt timeout üst deadline'ı aşamaz.

## 11. Cancellation

Kapsamlar:

- message
- task
- phase
- workflow
- trip session

İptal sonrası yeni external call başlatılmaz.

## 12. Circuit Breaker

Circuit breaker:

- adapter,
- provider,
- agent version,
- platform service

seviyesinde uygulanabilir.

## 13. Backpressure

Sistem kapasitesi aşılırsa:

- düşük öncelikli görev geciktirilir,
- concurrency azaltılır,
- yeni evaluation işleri durdurulur,
- kullanıcı görevleri korunur,
- açık uyarı üretilir.

## 14. Resource Quotas

- token budget
- model call count
- tool call count
- memory
- CPU
- wall time
- cost
- concurrency

görev ve trip seviyesinde sınırlandırılabilir.

## 15. Workflow State Store

Kalıcı olarak:

- DAG state
- completed tasks
- retries
- checkpoints
- approvals
- cancellation
- final status

saklanır.

## 16. Dead Letter Queue

Aşağıdaki görevler DLQ'ya gider:

- retry limiti dolan
- poison message
- şema uyumsuzluğu
- kalıcı permission sorunu
- bilinmeyen agent version
- checkpoint restore hatası

## 17. Graceful Shutdown

Shutdown sırasında:

- yeni görev kabul edilmez,
- çalışan görevler tamamlanır veya checkpoint edilir,
- lease bırakılır,
- telemetry flush edilir,
- state store senkronize edilir.

## 18. Health Endpoints

- `/healthz`
- `/readyz`
- `/livez`

Hazır olma kontrolü queue, state store, vault ve kritik gatewayleri içerir.

## 19. Runtime Modları

- development
- test
- production
- air-gap
- degraded
- maintenance

## 20. Air-Gap Runtime

- local queue
- local workers
- offline adapters
- local model gateway
- local telemetry
- dosya tabanlı sync
- dış bağımlılık olmadan çalışma

## 21. Hata Kodları

- `RUNTIME_QUEUE_UNAVAILABLE`
- `RUNTIME_WORKER_UNAVAILABLE`
- `RUNTIME_TASK_LEASE_LOST`
- `RUNTIME_DEADLINE_EXCEEDED`
- `RUNTIME_CANCELLED`
- `RUNTIME_RETRY_EXHAUSTED`
- `RUNTIME_BACKPRESSURE`
- `RUNTIME_QUOTA_EXCEEDED`
- `RUNTIME_CHECKPOINT_FAILED`
- `RUNTIME_DLQ_WRITE_FAILED`

## 22. Testler

- paralel DAG
- dependency failure
- lease kaybı
- duplicate delivery
- cancellation
- retry
- circuit breaker
- backpressure
- graceful shutdown
- checkpoint recovery
- air-gap mode

## 23. Kabul Kriterleri

- Görevler kalıcı state ile yönetilmeli.
- Duplicate delivery idempotent olmalı.
- Cancellation ve timeout desteklenmeli.
- Retry yalnızca uygun hatalarda çalışmalı.
- Backpressure kullanıcı görevlerini korumalı.
- Worker crash sonrası görev kurtarılabilmeli.
- Air-gap runtime desteklenmeli.
