# Tatil Modu — AI Engineering & Evaluation Platform Teknik Tasarımı

**Doküman türü:** Platform teknik tasarımı
**Teknik kod adı:** `ai_engineering_evaluation_platform`
**Sürüm:** 1.0 Taslak
**Mimari katman:** Kalite, değerlendirme ve sürekli iyileştirme
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

AI Engineering & Evaluation Platform, Tatil Modu içindeki agent, platform, prompt, tool ve model değişikliklerinin kaliteyi gerçekten artırıp artırmadığını ölçer.

Temel soru:

> Yeni sürüm daha doğru, daha güvenli, daha hızlı ve daha ekonomik mi?

## 2. Platform Bileşenleri

- Evaluation Registry
- Golden Scenario Library
- Scenario Generator
- Simulation Platform
- Judge Framework
- Regression Platform
- Safety Evaluation Suite
- Cost & Latency Benchmark
- Experiment Platform
- Prompt Registry
- Agent Scorecard
- Release Gate Engine

## 3. Evaluation Registry

Her değerlendirme kaydı:

```json
{
  "evaluation_id": "eval_001",
  "scenario_id": "golden_bursa_v1",
  "target_type": "agent",
  "target_id": "route_planner_agent",
  "target_version": "1.0.0",
  "run_id": "run_001",
  "status": "completed",
  "scores": {},
  "cost": {},
  "latency": {},
  "failures": [],
  "created_at": "2026-08-06T18:00:00Z"
}
```

## 4. Golden Scenario Library

Golden senaryolar değişmeyen veya kontrollü sürümlenen referans testleridir.

İlk önerilen kütüphane:

- Golden Bursa Family Trip
- Rainy Sapanca
- Low Budget Eskişehir
- Accessible Family Trip
- Adult Couple Weekend
- Electric Vehicle Route
- Public Authority Closure
- Hotel Cancellation
- Budget Shock
- Child Fatigue Replan

## 5. Scenario Generator

Sentetik değişkenler:

- aile yapısı
- çocuk yaşları
- bütçe
- hava
- trafik
- yol kapanması
- otel iptali
- tesis kapanması
- park problemi
- çocuk yorgunluğu
- kullanıcı kural çakışması

Senaryo üretimi kontrollü seed ile tekrar edilebilir olmalıdır.

## 6. Simulation Platform

Gerçek işlem yapmadan şu servisler mock edilir:

- hava
- trafik
- otel fiyatı/müsaitlik
- kamu duyurusu
- POI verisi
- kullanıcı geri bildirimi
- rezervasyon durumu

## 7. Judge Framework

Çok katmanlı değerlendirme:

1. Deterministik kurallar
2. JSON Schema doğrulama
3. Domain-specific checker
4. LLM judge
5. İnsan review

Kritik güvenlik veya hard constraint değerlendirmeleri yalnızca LLM judge'a bırakılmaz.

## 8. Değerlendirme Boyutları

- doğruluk
- hard constraint uyumu
- kaynak kalitesi
- güncellik
- açıklanabilirlik
- aile uygunluğu
- fairness
- bütçe doğruluğu
- rota uygulanabilirliği
- alternatif plan kalitesi
- güvenlik
- maliyet
- latency

## 9. Agent Scorecard

Örnek:

```json
{
  "agent_id": "hotel_discovery_ranking_agent",
  "version": "1.2.0",
  "quality_score": 0.92,
  "constraint_compliance": 0.99,
  "evidence_quality": 0.90,
  "latency_p95_ms": 8200,
  "cost_per_run": 0.04,
  "regressions": 0
}
```

## 10. Regression Platform

Her değişiklikte:

- golden senaryolar
- son başarılı sürüm
- maliyet
- latency
- confidence calibration
- explanation quality

karşılaştırılır.

## 11. Cost & Latency Benchmark

İzlenecek metrikler:

- input/output token
- tool çağrısı
- cache hit
- agent süresi
- pipeline süresi
- model maliyeti
- scenario başına toplam maliyet
- p50/p95/p99 latency

## 12. Safety Evaluation Suite

- prompt injection
- sahte resmî kaynak
- memory yetki ihlali
- hassas veri sızıntısı
- hard constraint bypass
- tool scope escalation
- stale data kullanımı
- malicious user content
- agent-to-agent unauthorized call

## 13. Prompt Registry

Her prompt:

- prompt_id
- version
- checksum
- owner
- target agent
- linked eval set
- rollout status
- rollback target

taşır.

## 14. Experiment Platform

Desteklenen deneyler:

- prompt A/B
- model karşılaştırma
- scoring weight karşılaştırma
- tool adapter karşılaştırma
- cache politikası
- verification threshold
- optimization strategy

## 15. Release Gates

Bir sürüm yayımlanmadan önce:

- contract tests pass
- golden scenarios pass
- safety suite pass
- no critical regression
- cost within budget
- latency within SLO
- evidence coverage threshold
- explanation threshold

zorunlu olmalıdır.

## 16. Confidence Calibration

Agent confidence ile gerçek başarı karşılaştırılır.

Amaç:

- yüksek confidence / düşük doğruluk problemini tespit etmek,
- overly conservative agentları bulmak,
- calibration curve üretmek.

## 17. Human Review Queue

İnsan incelemesi gerekenler:

- kritik çelişki
- güvenlik başarısızlığı
- açıklanamaz plan seçimi
- golden scenario sapması
- model judge anlaşmazlığı
- yüksek maliyetli regresyon

## 18. Girdiler

```json
{
  "run_config": {},
  "scenario": {},
  "target_versions": {},
  "judge_config": {},
  "cost_budget": {},
  "latency_slo": {}
}
```

## 19. Çıktılar

```json
{
  "run_id": "run_001",
  "status": "completed",
  "scenario_results": [],
  "agent_scorecards": [],
  "regressions": [],
  "safety_findings": [],
  "cost_summary": {},
  "release_gate": {
    "passed": true,
    "reasons": []
  }
}
```

## 20. Hata Modeli

- `EVAL_SCENARIO_INVALID`
- `EVAL_TARGET_UNAVAILABLE`
- `JUDGE_DISAGREEMENT`
- `GOLDEN_EXPECTATION_MISSING`
- `COST_BUDGET_EXCEEDED`
- `LATENCY_SLO_FAILED`
- `SAFETY_GATE_FAILED`
- `REGRESSION_DETECTED`
- `PROMPT_VERSION_MISMATCH`

## 21. Kabul Kriterleri

- Agent bazlı scorecard üretilebilmeli.
- Golden ve sentetik senaryolar desteklenmeli.
- Deterministik ve LLM judge birlikte çalışmalı.
- Cost ve latency zorunlu metrik olmalı.
- Safety gate release'i bloklayabilmeli.
- Prompt/model değişiklikleri eval'e bağlanmalı.
- Confidence calibration ölçülebilmeli.
- Sonuçlar sürümler arasında karşılaştırılabilmeli.
