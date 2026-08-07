# Tatil Modu — Budget Intelligence Agent Teknik Tasarımı

**Doküman türü:** Agent teknik tasarımı
**Agent adı:** Budget Intelligence Agent
**Teknik kod adı:** `budget_intelligence_agent`
**Sürüm:** 1.0 Taslak
**Mimari katman:** Planlama ve karar
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Budget Intelligence Agent, seyahat planının tahmini ve gerçekleşen maliyetlerini yönetir; görünür ve gizli giderleri toplar, bütçe risklerini hesaplar ve planın ekonomik olarak uygulanabilir olup olmadığını değerlendirir.

Temel soru:

> Bu plan, kullanıcının gerçek bütçe sınırları içinde sürdürülebilir mi?

## 2. Bütçe Katmanları

Bütçe tek bir sayı değildir.

```json
{
  "budget_policy": {
    "ideal_budget": 30000,
    "flexible_budget": 33000,
    "hard_limit": 35000,
    "currency": "TRY"
  }
}
```

### Ideal Budget
Kullanıcının hedeflediği tutar.

### Flexible Budget
Küçük sapmaların kabul edilebildiği sınır.

### Hard Limit
Aşılmaması gereken kesin sınır.

## 3. Bütçe Grafı

```text
Toplam Bütçe
├── Konaklama
├── Ulaşım
├── Aktiviteler
├── Yeme İçme
├── Otopark
├── Otoyol / Feribot
├── Termal / Havuz
├── Ek Hizmetler
├── Beklenmeyen Gider
└── Rezerv
```

## 4. Sorumluluklar

Budget Intelligence Agent:

- tahmini maliyetleri toplar,
- gizli maliyetleri belirler,
- fiyat güven seviyesini hesaplar,
- bütçe aralığı üretir,
- soft ve hard sınırları uygular,
- fırsat ve tasarruf seçeneklerini değerlendirir,
- canlı gerçekleşen harcamaları işler,
- kalan bütçeyi günceller,
- bütçe aşımı riskini tahmin eder,
- plan alternatifleri arasında maliyet/değer karşılaştırması yapar,
- Optimization Platform'a bütçe hedefleri sağlar.

## 5. Yapmayacağı İşler

Agent:

- tek başına aktivite veya otel seçmez,
- kullanıcı onayı olmadan hard limiti değiştirmez,
- doğrulanmamış fiyatı kesin sunmaz,
- gizli maliyetleri yok saymaz,
- ödeme veya rezervasyon yapmaz,
- bütçe uğruna güvenlik veya hard constraint ihlal etmez.

## 6. Girdi Modeli

```json
{
  "task_id": "tsk_budget_001",
  "trip_context": {},
  "budget_policy": {},
  "hotel_plan": {},
  "activity_plan": {},
  "route_plan": {},
  "food_plan": {},
  "pricing_evidence": [],
  "realized_expenses": [],
  "currency": "TRY"
}
```

## 7. Maliyet Kaydı

```json
{
  "cost_id": "cost_001",
  "category": "hotel",
  "description": "1 gece aile odası",
  "amount": 9000,
  "currency": "TRY",
  "cost_type": "fixed",
  "confidence": 0.95,
  "source": "official_booking",
  "valid_for_date": "2026-09-08",
  "included_items": ["breakfast"],
  "excluded_items": ["parking"],
  "hidden_cost_risk": "medium"
}
```

## 8. Maliyet Türleri

- `fixed`
- `estimated`
- `variable`
- `optional`
- `conditional`
- `hidden`
- `refundable`
- `non_refundable`

## 9. Hidden Cost Engine

Kontrol edilen olası ek maliyetler:

- otopark
- otoyol
- feribot
- çocuk bileti
- kahvaltı farkı
- termal kullanım
- havuz erişimi
- havlu/dolap
- zorunlu ek yatak
- şehir vergisi
- rezervasyon hizmet bedeli
- geç çıkış
- yakıt sapması

## 10. Budget Confidence

Her maliyet kalemi güven aralığı taşır.

Örnek:

```json
{
  "estimate": {
    "expected": 27800,
    "low": 26900,
    "high": 29600,
    "confidence": 0.82
  }
}
```

## 11. Risk Reserve

Beklenmeyen gider payı plan türüne göre hesaplanır.

Örnek başlangıç değerleri:

- günübirlik gezi: %5
- şehir tatili: %8
- çok duraklı gezi: %10
- hava/ulaşım riski yüksek gezi: %12–15

## 12. Opportunity Engine

Agent şu fırsatları arar:

- aile bileti
- kombine bilet
- ücretsiz belediye etkinliği
- ücretsiz otopark
- kahvaltı dahil paket
- erken rezervasyon
- çocuk ücretsiz politikası
- müze kart avantajı
- rota üzerinde daha ekonomik yemek alternatifi

## 13. Budget Trade-off Engine

Bütçe aşılırsa şu sırayla çözüm aranır:

1. aynı deneyimi daha düşük maliyetle sağlamak,
2. gizli maliyeti azaltmak,
3. düşük değerli ücretli aktiviteyi ücretsiz alternatifle değiştirmek,
4. otel sınıfını değil, gereksiz ek hizmeti azaltmak,
5. yüksek Family Satisfaction üreten unsurları korumak.

## 14. Experience per Lira

```text
EPL = Experience Score / Total Cost
```

Bu metrik tek başına karar vermez; fiyat/değer karşılaştırmasına yardımcı olur.

## 15. Live Budget

Gezi başladıktan sonra:

```json
{
  "live_budget": {
    "planned_total": 27800,
    "realized_total": 16400,
    "remaining_planned": 11400,
    "remaining_hard_limit": 18600,
    "risk_status": "low"
  }
}
```

## 16. Bütçe Durumları

- `under_ideal`
- `within_ideal`
- `within_flexible`
- `near_hard_limit`
- `over_hard_limit`
- `unknown`

## 17. Çıktı Modeli

```json
{
  "task_id": "tsk_budget_001",
  "agent": "budget_intelligence_agent",
  "status": "completed",
  "budget_summary": {},
  "cost_breakdown": [],
  "hidden_costs": [],
  "opportunities": [],
  "tradeoff_options": [],
  "risk_reserve": {},
  "live_budget": {},
  "warnings": [],
  "confidence": 0.86,
  "schema_version": "1.0"
}
```

## 18. Hata Modeli

- `BUDGET_INPUT_INVALID`
- `PRICE_UNVERIFIED`
- `CURRENCY_MISMATCH`
- `HIDDEN_COST_UNKNOWN`
- `HARD_LIMIT_EXCEEDED`
- `BUDGET_RANGE_TOO_WIDE`
- `REALIZED_EXPENSE_CONFLICT`
- `OPPORTUNITY_EXPIRED`

## 19. Testler

- ideal/flexible/hard bütçe
- gizli otopark maliyeti
- çocuk bileti
- termal kullanım farkı
- fiyat aralığı
- canlı bütçe güncellemesi
- ücretsiz alternatif
- hard limit aşımı
- yüksek mutluluk/düşük maliyet trade-off'u

## 20. Kabul Kriterleri

- Tek bir kesin toplam yerine aralık üretilebilmeli.
- Her maliyet kaynak ve güven taşımalı.
- Gizli maliyetler ayrı gösterilmeli.
- Hard limit sessizce aşılamamalı.
- Budget trade-off seçenekleri açıklanabilir olmalı.
- Canlı gerçekleşen harcamalar desteklenmeli.
- EPL yalnızca yardımcı metrik olarak kullanılmalı.
