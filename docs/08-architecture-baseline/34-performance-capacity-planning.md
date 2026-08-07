# Tatil Modu — Performance & Capacity Planning

**Doküman türü:** Performans ve kapasite standardı
**Teknik kod adı:** `performance_capacity_planning`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Yüksek

## 1. Amaç

Sistemin hedef kullanıcı ve görev hacmini kabul edilebilir süre ve maliyetle karşılamasını sağlamak.

## 2. Kapasite Birimleri

- concurrent users
- trip requests/minute
- agent tasks/request
- model calls/request
- tool calls/request
- tokens/request
- queue depth
- worker concurrency
- database writes
- telemetry events
- storage growth

## 3. Başlangıç MVP Varsayımları

Örnek planlama girdileri:

- 10 eşzamanlı plan isteği
- istek başına 10–25 agent task
- istek başına 5–20 dış tool çağrısı
- p95 tam plan süresi < 60 sn
- p95 canlı replan < 10 sn

Bu rakamlar yük testiyle kalibre edilmelidir.

## 4. Kritik Yol

Planlama latency'sini belirleyen adımlar:

- dış veri erişimi
- verification
- hotel/activity discovery
- optimization
- model structured output repair

Paralelleştirilebilir görevler kritik yoldan çıkarılmalıdır.

## 5. Cache Stratejisi

Cache türleri:

- source registry
- POI knowledge
- official authority registry
- seasonal data
- weather
- traffic
- opening hours
- model deterministic extraction

Cache freshness ve evidence metadata taşır.

## 6. Worker Ölçekleme

Ölçekleme sinyalleri:

- queue depth
- oldest message age
- p95 latency
- worker utilization
- provider quota
- cost budget
- memory/CPU

## 7. Backpressure

Kapasite aşıldığında:

1. evaluation işleri durdurulur,
2. background refresh yavaşlatılır,
3. düşük öncelikli plan geciktirilir,
4. canlı trip replanning korunur,
5. kullanıcıya degraded mode bildirilir.

## 8. Model Routing

Göreve göre model alias:

- sınıflandırma → küçük/hızlı
- extraction → structured extractor
- planning → güçlü planner
- verification → verifier
- judge → eval-only

Her işi en pahalı model çalıştırmamalıdır.

## 9. Token Optimizasyonu

- disclosure minimization
- compact structured context
- cache summaries
- knowledge retrieval filtering
- prompt version cleanup
- output schema limits
- repeated context deduplication

## 10. Database Capacity

İzlenecekler:

- trip volume
- evidence growth
- audit growth
- telemetry growth
- index size
- query p95
- connection pool
- vacuum/maintenance

## 11. Load Test Senaryoları

- normal planning
- holiday traffic spike
- provider outage
- high retry storm
- live replan burst
- public authority mass refresh
- evaluation batch
- air-gap offline workload

## 12. Performans Bütçeleri

Her agent için:

- timeout
- max tool calls
- max tokens
- max cost
- p95 latency
- output size

tanımlanır.

## 13. Capacity Review

Aylık veya release öncesi:

- gerçek hacim
- büyüme
- SLO
- maliyet
- quota
- storage
- provider limits
- scaling threshold

incelenir.

## 14. Kabul Kriterleri

- Performans bütçeleri agent bazında tanımlı olmalı.
- Kritik yol ölçülmeli.
- Cache freshness ile birlikte kullanılmalı.
- Backpressure canlı gezi görevlerini korumalı.
- Load test senaryoları otomatik olmalı.
- Capacity review düzenli yapılmalı.
