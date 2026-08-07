# Tatil Modu — Optimization Platform Teknik Tasarımı

**Doküman türü:** Platform teknik tasarımı
**Teknik kod adı:** `optimization_platform`
**Sürüm:** 1.0 Taslak
**Mimari katman:** Üst karar ve optimizasyon
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Optimization Platform, farklı plan adaylarını çok amaçlı hedefler altında karşılaştırır ve tek bir metrik yerine dengeli, açıklanabilir ve uygulanabilir seçenekler üretir.

Temel soru:

> Güvenlik, aile memnuniyeti, zaman, enerji, bütçe ve risk birlikte değerlendirildiğinde en iyi plan hangisidir?

## 2. Optimize Edilen Hedefler

- aile toplam memnuniyeti
- minimum bireysel memnuniyet
- güvenlik
- zaman verimliliği
- araç/yürüme yorgunluğu
- bütçe uyumu
- deneyim çeşitliliği
- dinlenme dengesi
- operasyonel dayanıklılık
- kanıt ve doğrulama kalitesi

## 3. Hard Constraint ve Objective Ayrımı

Hard constraint'ler optimizasyona girmez; ihlal eden adaylar önce elenir.

Objective'ler ise kalan adayların karşılaştırılmasında kullanılır.

## 4. Çok Amaçlı Optimizasyon

Platform tek bir ağırlıklı toplamla sınırlı değildir.

Desteklenen yaklaşımlar:

- weighted scoring
- lexicographic priority
- constraint programming
- Pareto frontier
- scenario comparison
- regret minimization

## 5. Pareto-Optimal Planlar

Bir plan başka bir plana tüm hedeflerde üstün değilse Pareto adayı olabilir.

Örnek kümeler:

- daha ekonomik
- daha dinlendirici
- daha yüksek deneyim
- daha düşük risk
- daha kısa yol

## 6. Hedef Ağırlıkları

```json
{
  "objective_weights": {
    "family_satisfaction": 0.25,
    "safety": 0.20,
    "budget_fit": 0.15,
    "energy_balance": 0.12,
    "travel_efficiency": 0.10,
    "rest_balance": 0.08,
    "diversity": 0.05,
    "operational_robustness": 0.05
  }
}
```

Güvenlik gibi bazı hedefler ayrıca minimum eşik taşır.

## 7. Aile Adaleti

Platform yalnızca ortalamayı yükseltmez.

Kontroller:

- minimum bireysel memnuniyet,
- ardışık düşük uyumlu aktiviteler,
- çocuk temel ihtiyaçları,
- yetişkin dinlenme dengesi,
- aynı bireyin sürekli baskın olması.

## 8. Trade-off Açıklaması

Örnek:

```json
{
  "tradeoff": {
    "plan_a": "Daha ekonomik",
    "plan_b": "Daha yüksek aile memnuniyeti",
    "cost_difference": 1200,
    "satisfaction_difference": 0.11,
    "explanation": "Plan B, termal oteli ve öğle dinlenmesini koruduğu için daha pahalı ancak daha dengeli."
  }
}
```

## 9. Girdi Modeli

```json
{
  "task_id": "tsk_opt_001",
  "candidate_plans": [],
  "constraint_package": {},
  "preference_package": {},
  "family_satisfaction_context": {},
  "budget_context": {},
  "risk_context": {},
  "verification_context": {},
  "objective_weights": {}
}
```

## 10. Plan Aday Modeli

```json
{
  "plan_id": "plan_001",
  "metrics": {
    "family_satisfaction": 0.91,
    "minimum_member_satisfaction": 0.72,
    "budget_fit": 0.86,
    "energy_balance": 0.90,
    "travel_efficiency": 0.82,
    "operational_robustness": 0.88
  },
  "hard_constraint_compliant": true,
  "confidence": 0.87
}
```

## 11. Çıktılar

```json
{
  "task_id": "tsk_opt_001",
  "platform": "optimization_platform",
  "status": "completed",
  "selected_plan": {},
  "pareto_frontier": [],
  "tradeoff_options": [],
  "rejected_plans": [],
  "sensitivity_analysis": {},
  "explanation": {},
  "confidence": 0.89,
  "schema_version": "1.0"
}
```

## 12. Sensitivity Analysis

Ağırlıklar küçük değiştiğinde plan sonucu dramatik değişiyorsa kullanıcıya bildirilir.

Örnek:

- bütçe ağırlığı %10 artarsa Plan B seçiliyor,
- dinlenme ağırlığı %10 artarsa Plan C seçiliyor.

## 13. Robustness

Platform yalnızca bugünkü en iyi planı değil, küçük değişikliklerde bozulmayan planı da tercih edebilir.

Sinyaller:

- hava değişimi
- trafik
- tesis kapanışı
- fiyat sapması
- aile yorgunluğu

## 14. Explainability

Her seçimin açıklaması şunları içerir:

- hangi hedeflerde güçlü,
- hangi hedeflerde zayıf,
- neden diğer adaylardan üstün,
- hangi trade-off kabul edildi,
- hangi hard constraint'ler belirleyici oldu.

## 15. Yapmayacağı İşler

- hard constraint'i ağırlıkla telafi etmez,
- güvenlik riskini düşük maliyet için kabul etmez,
- düşük güvenli planı kesin kazanan ilan etmez,
- kullanıcı tercih ağırlıklarını sessizce değiştirmez,
- tek bir puanı nihai gerçek gibi sunmaz.

## 16. Hata Modeli

- `OPTIMIZATION_INPUT_INVALID`
- `NO_FEASIBLE_PLAN`
- `OBJECTIVE_CONFLICT`
- `WEIGHT_CONFIGURATION_INVALID`
- `PARETO_SET_EMPTY`
- `SENSITIVITY_UNSTABLE`
- `LOW_CONFIDENCE_OPTIMUM`

## 17. Testler

- bütçe/memnuniyet trade-off'u
- güvenlik önceliği
- hard constraint ihlali
- Pareto frontier
- bireysel adalet
- ağırlık duyarlılığı
- düşük güvenli plan
- hava değişiminde robustness

## 18. Kabul Kriterleri

- Hard constraint ihlal eden aday elenmeli.
- Birden fazla hedef birlikte optimize edilmeli.
- Pareto-optimal alternatifler üretilebilmeli.
- Trade-off açıklanabilir olmalı.
- Family fairness korunmalı.
- Sensitivity analysis yapılabilmeli.
- Düşük güvenli optimum işaretlenmeli.
- Mock plan adaylarıyla bağımsız test edilebilmeli.
