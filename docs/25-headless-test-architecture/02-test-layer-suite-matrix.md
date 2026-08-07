# Test Layer and Suite Matrix

## Amaç
Her implementation katmanının hangi test seviyesinde, hangi bağımlılıklarla ve hangi failure sınıflarıyla doğrulanacağını tanımlar.

| Seviye | Katman | Ana amaç | Dış bağımlılık |
|---|---|---|---|
| L0 | Contracts / Schemas | shape, version, required fields, invalid payload rejection | yok |
| L1 | Domain / Policy | deterministic kurallar, precedence, hard constraint behavior | yok |
| L2 | Capability / Tool / Memory | adapter-independent gateway ve memory semantics | deterministic mock |
| L3 | Individual Agents | agent görev doğruluğu ve contract uyumu | mocked upstream/downstream |
| L4 | Orchestrator | routing, dependency, retry, fallback, stop conditions | mocked agents/capabilities |
| L5 | Verification / Quality | evidence, confidence, hard-fail, rubric behavior | deterministic fixtures |
| L6 | Golden E2E | bütün headless zincir | deterministic mock providers |
| L7 | Adversarial / Regression | failure resistance ve geçmiş davranış koruması | deterministic fixtures |
| L8 | Model / Provider Eval | gerçek model/provider davranışı, maliyet, latency | kontrollü live dependencies |

## Test izolasyonu
Bir seviye başarısız olduğunda hata mümkün olduğunca o seviyede teşhis edilebilir olmalıdır. Örneğin L3 Agent testi, gerçek Orchestrator veya gerçek provider hatası nedeniyle rastgele kırılmamalıdır.

## Gate sırası
L0–L7 blocking gate'lerdir. L8 UI Unlock için doğrudan zorunlu olmayabilir; ancak seçilecek production model/provider için ayrıca readiness gate olarak kullanılır. P0 ihlali hiçbir seviyede kabul edilmez.
