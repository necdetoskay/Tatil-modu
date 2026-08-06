# TI-001 — Travel Intelligence Architecture

## 1. Amaç

Travel Intelligence, doğrulanmış veri ve evidence kayıtlarını kullanıcı profiline göre anlamlandıran ortak karar zekâsı katmanıdır.

Bu katman doğrudan web araştırması yapmaz. Capability Platform ve Data Source & Trust Architecture tarafından hazırlanmış kanıtları tüketir.

## 2. Ana akış

```text
Source / Provider Data
        ↓
Capability Platform
        ↓
Source Trace + Authority + Freshness
        ↓
Evidence Strength + Conflict Resolution + Fusion
        ↓
Travel Intelligence Modules
        ↓
User-Specific Assessments
        ↓
Recommendation Intelligence
        ↓
Explanation Intelligence
        ↓
Agent / Orchestrator / Final Plan
```

## 3. Travel Intelligence'ın sorumlulukları

- ortak claim ve observation modellerini kullanmak,
- entity ve kullanıcı bağlamını birlikte değerlendirmek,
- domain-specific intelligence üretmek,
- risk, uygunluk, trend ve kullanıcı etkisi çıkarmak,
- recommendation için yapılandırılmış assessment sağlamak,
- explanation payload üretmek,
- confidence ve lineage zincirini korumak.

## 4. Yapmadığı işler

- provider seçmez,
- raw web scraping yapmaz,
- source authority hesaplamasını yeniden yapmaz,
- cache veya retry yönetmez,
- rezervasyon yapmaz,
- nihai günlük rotayı tek başına oluşturmaz,
- kaynaksız claim üretmez.

## 5. Ortak intelligence pipeline

```text
Input validation
      ↓
Claim/observation normalization
      ↓
Entity and user context binding
      ↓
Domain rule evaluation
      ↓
Risk / opportunity extraction
      ↓
Trend and segment evaluation
      ↓
Assessment scoring
      ↓
Confidence calculation
      ↓
Recommendation signals
      ↓
Explanation payload
```

## 6. Intelligence modülleri

### Review Intelligence

Yorumlardan aspect, claim, trend, repeated issue ve segment evidence üretir.

### Place Intelligence

Bir yerin işlevi, ziyaret değeri, süre ihtiyacı, çocuk uygunluğu ve operasyonel özelliklerini değerlendirir.

### Crowd Intelligence

Yoğunluk, sıra, zaman dilimi ve dönemsel kalabalık riskini değerlendirir.

### Weather Intelligence

Forecast veya climate evidence'in plan aktivitelerine etkisini hesaplar.

### Child & Family Intelligence

Çocuk yaşları, uyku/dinlenme, bebek arabası, tuvalet, mola ve aktivite süresini değerlendirir.

### Food Intelligence

Yerel lezzet, hijyen, bekleme, çocuk uygunluğu, fiyat/değer ve diyet ihtiyaçlarını değerlendirir.

### Budget Intelligence

Toplam bütçe, component cost, contingency ve value-for-money sinyallerini değerlendirir.

### Safety Intelligence

Operasyonel, çevresel ve kullanıcı bağlamlı riskleri değerlendirir.

### Parking Intelligence

Otopark varlığı, ücret, kapasite, yoğunluk ve yürüme etkisini değerlendirir.

### Accessibility Intelligence

Fiziksel erişim, step-free, asansör, eğim, bebek arabası ve mobilite desteğini değerlendirir.

### Route Intelligence

Seyahat yükü, geçiş mantığı, gün içi tempo ve enerji maliyetini değerlendirir.

### Recommendation Intelligence

Modül assessment'larını kullanıcı tercihlerine göre birleştirir.

### Explanation Intelligence

Önerinin nedenini, kanıtını, sınırlılıklarını ve risklerini kullanıcıya açıklar.

## 7. Modül sözleşmesi

Her intelligence modülü şu ortak contract'ı uygular:

```text
IntelligenceInput
→ IntelligenceAssessment
```

Zorunlu alanlar:

- module ID/version,
- entity refs,
- user/trip context,
- claim refs,
- observation refs,
- evidence refs,
- policy version,
- assessment,
- risk/opportunity,
- confidence,
- explanation,
- lineage refs.

## 8. Ortak assessment boyutları

```text
suitability
risk
opportunity
relevance
effort
comfort
costImpact
timeImpact
confidence
```

Her modül yalnız kendisi için anlamlı olan alanları kullanır.

## 9. Kullanıcı bağlamı

Travel Intelligence kullanıcı profiline göre çalışır.

Örnek:

```text
Asansör yok
```

tek başına genel bir fact'tir.

```text
2 yaş çocuk + bebek arabası + üçüncü kat
```

bağlamında:

```text
mobility burden = high
```

assessment'ına dönüşür.

## 10. Claim ve observation ayrımı

Claim:

```text
Otopark ücretsiz.
```

Observation:

```text
Son 30 gündeki 18 yorumun 7'sinde akşam kapasite sorunu bildirildi.
```

Assessment:

```text
Özel araçlı aile için akşam girişinde otopark riski orta-yüksek.
```

Recommendation signal:

```text
Geç check-in planında alternatif otopark doğrula.
```

## 11. Risk modeli

Her risk:

- probability,
- impact,
- exposure,
- user sensitivity,
- mitigability

boyutlarını taşıyabilir.

Başlangıç:

```text
riskScore =
  probability
× impact
× exposure
× userSensitivity
× (1 - mitigability)
```

## 12. Opportunity modeli

Pozitif kullanıcı değeri:

- preference match,
- uniqueness,
- convenience,
- family value,
- experience quality,
- cost efficiency

ile değerlendirilebilir.

## 13. Modüller arası bağımlılık

Modüller birbirinin raw çıktısını doğrudan değiştirmez.

Örnek:

```text
Review Intelligence
→ parking experience evidence

Parking Intelligence
→ parking user impact assessment

Recommendation Intelligence
→ final recommendation signal
```

## 14. Orchestrator ilişkisi

Orchestrator:

- hangi modülün çalışacağını belirler,
- gerekli evidence paketlerini sağlar,
- deadline ve maliyet sınırı uygular,
- modül sonuçlarını Recommendation Intelligence'a taşır.

Orchestrator assessment içeriğini kendisi uydurmaz.

## 15. Agent ilişkisi

Agentlar Travel Intelligence çıktısını tüketir.

Örnek:

- Accommodation Agent: konaklama assessment'ları,
- Route Agent: route/time/child/crowd assessment'ları,
- Final Composer: explanation payload.

## 16. Confidence

Travel Intelligence confidence şu faktörlerden türetilir:

- evidence confidence,
- evidence coverage,
- conflict state,
- user-context completeness,
- policy determinism,
- module quality score,
- assumption penalty.

## 17. Explainability

Her assessment en az şunları açıklayabilmelidir:

```text
Ne değerlendirildi?
Hangi kullanıcı bağlamına göre?
Hangi kanıtlar kullanıldı?
Sonuç nedir?
Hangi risk veya fırsat var?
Hangi sınırlılıklar mevcut?
Ne yapılabilir?
```

## 18. Extensibility

Yeni intelligence modülü yalnız şu şartlarla eklenir:

- bağımsız domain kuralları varsa,
- ayrı test ve kalite metriği gerektiriyorsa,
- birden fazla agent/workflow tarafından kullanılabiliyorsa,
- ortak claim/observation contract'ını kullanabiliyorsa.

## 19. Yaşam döngüsü

```text
proposed
specified
fixture-tested
integrated
approved
deprecated
disabled
```

## 20. İlk geliştirme sırası

1. Review Intelligence
2. Child & Family Intelligence
3. Parking Intelligence
4. Crowd Intelligence
5. Weather Intelligence
6. Place Intelligence
7. Food Intelligence
8. Route Intelligence
9. Budget Intelligence
10. Recommendation Intelligence
11. Explanation Intelligence
