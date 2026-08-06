# Conflict Resolution Model v1.0

## 1. Amaç

Birden fazla kaynağın aynı entity ve claim hakkında farklı sonuçlar üretmesi durumunda:

- gerçek çelişkiyi,
- kapsam farkını,
- zaman farkını,
- segment farkını,
- policy/deneyim farkını,
- veri kalitesi farkını

ayırt etmek ve çözüm davranışını deterministik hale getirmek.

## 2. Temel ilke

Farklı değerler her zaman çelişki değildir.

Örnek:

```text
Resmî bilgi: Otopark var.
Yorum kanıtı: Akşamları yer bulunmuyor.
```

Bunlar farklı claim'lerdir:

```text
parking_availability
parking_capacity_experience
```

Dolayısıyla tek bir `conflict` olarak değerlendirilmemelidir.

## 3. Conflict sınıfları

### C1 — True contradiction

Aynı entity, aynı claim, aynı zaman aralığı ve aynı kapsam için uyumsuz değerler.

Örnek:

```text
Kaynak A: Otopark ücretsiz.
Kaynak B: Otopark ücretli.
```

### C2 — Temporal conflict

Bilgiler farklı zamanlara aittir.

Örnek:

```text
2025: giriş ücretsiz
2026: giriş ücretli
```

### C3 — Scope conflict

Claim kapsamı farklıdır.

Örnek:

```text
Otopark var.
Otopark misafirler için ücretli.
```

### C4 — Segment conflict

Farklı kullanıcı segmentleri farklı deneyim yaşıyor.

Örnek:

```text
Çiftler sessiz buluyor.
Çocuklu aileler gürültülü buluyor.
```

### C5 — Policy vs experience divergence

Resmî politika ile gerçek kullanım deneyimi farklıdır.

Örnek:

```text
Resmî politika: Erken check-in mümkün.
Deneyim: Çoğu kullanıcı odasını geç teslim almış.
```

### C6 — Identity conflict

Kaynaklar aslında farklı entity'lere aittir.

Örnek:

```text
Aynı isimli iki farklı restoran.
```

### C7 — Measurement conflict

Farklı ölçüm yöntemi veya ölçek kullanılmıştır.

Örnek:

```text
4.5/5
9.1/10
```

### C8 — Data quality conflict

Bir kaynak eksik, stale, parse hatalı veya düşük güvenlidir.

## 4. Conflict detection anahtarı

İki claim karşılaştırılmadan önce şu alanlar normalize edilir:

```text
canonicalEntityId
claimType
claimScope
timeWindow
segment
unit
valueType
sourceRole
```

Bu alanlardan biri uyumsuzsa true contradiction kararı verilmez.

## 5. Conflict severity

| Seviye | Anlam |
|---|---|
| `none` | conflict yok |
| `informational` | farklı bağlam |
| `low` | küçük fark |
| `medium` | karar etkilenebilir |
| `high` | öneri güveni ciddi etkilenir |
| `critical` | güvenli karar üretilemez |

## 6. Resolution stratejileri

```text
prefer_authoritative
prefer_fresher
prefer_direct_observation
prefer_higher_evidence_strength
segment_split
time_split
scope_split
normalize_units
cross_check_required
manual_review
preserve_unresolved
```

## 7. Başlangıç çözüm sırası

1. Entity identity doğrula.
2. Claim type eşleşmesini doğrula.
3. Scope farkını ayır.
4. Time window farkını ayır.
5. Segment farkını ayır.
6. Unit/value normalization yap.
7. Authority karşılaştır.
8. Freshness karşılaştır.
9. Evidence strength karşılaştır.
10. Gerekirse cross-check çağır.
11. Çözülemezse unresolved olarak koru.

## 8. Authority-first kullanılacak claim'ler

Aşağıdaki claim'lerde authoritative ve güncel kaynak önceliklidir:

```text
opening_hours
admission_fee
official_policy
availability
reservation_condition
address
event_schedule
legal_restriction
```

## 9. Experience-first kullanılacak claim'ler

Aşağıdaki claim'lerde güçlü deneyim evidence'i daha değerlidir:

```text
cleanliness_experience
noise_experience
parking_capacity_experience
staff_behavior
queue_experience
child_friendliness_experience
accessibility_experience
value_for_money
crowding
```

## 10. Cross-check tetikleyicileri

Cross-check zorunlu veya güçlü biçimde önerilir:

- yüksek/critical severity,
- fiyat veya müsaitlik farkı,
- çalışma saati farkı,
- çocuk politikası farkı,
- güvenlik veya erişilebilirlik claim'i,
- güçlü authority kaynakları arasında çelişki,
- strong evidence kümeleri arasında zıt sonuç.

## 11. Resmî bilgi ve deneyim ayrımı

Resmî claim:

```text
parking_policy = free
```

Deneyim claim:

```text
parking_capacity_experience = insufficient_evening
```

Aynı output içinde ayrı alanlarda tutulur.

## 12. Temporal conflict

Yeni bilgi eskiyi otomatik silmez.

Örnek:

```text
2025 policy
2026 policy
```

Nihai current fact için yeni bilgi kullanılır; eski bilgi historical lineage olarak korunur.

## 13. Segment split

Farklı segmentler için ayrı assessment üretilebilir.

```text
family_noise_assessment
couple_noise_assessment
business_noise_assessment
```

Tek ortalama ile segment farkı gizlenmez.

## 14. Unresolved conflict

Çözüm üretilemezse:

```text
resolutionStatus = unresolved
```

ve şu davranış uygulanır:

- confidence düşür,
- kritik öneride kullanma,
- kullanıcıya veya quality reviewer'a taşı,
- source refs koru,
- cross-check ihtiyacını kaydet.

## 15. Conflict penalty

Nihai evidence/trust hesabına başlangıç cezaları:

| Severity | Ceza |
|---|---:|
| informational | 0.00 |
| low | 0.03 |
| medium | 0.08 |
| high | 0.15 |
| critical | hard gate veya 0.25 |

## 16. Conflict resolution çıktısı

```json
{
  "conflictId": "conf-001",
  "entityId": "hotel-001",
  "claimType": "parking_policy",
  "conflictClass": "C1",
  "severity": "high",
  "claims": ["claim-1", "claim-2"],
  "resolutionStatus": "resolved",
  "strategy": "prefer_authoritative",
  "selectedClaimRef": "claim-1",
  "preservedClaimRefs": ["claim-1", "claim-2"],
  "reasonCodes": ["HIGHER_AUTHORITY", "FRESHER_SOURCE"],
  "confidenceImpact": -0.10,
  "crossCheckRequired": false,
  "policyVersion": "1.0.0"
}
```

## 17. Hard kurallar

- Farklı claim type'lar true conflict sayılmaz.
- Farklı zaman pencereleri tek current value içinde eritilmez.
- Segment farkı ortalama ile gizlenmez.
- Critical unresolved conflict'te kesin öneri üretilemez.
- Kaybeden claim silinmez; lineage içinde korunur.
- Yalnız yüksek yıldız puanı conflict çözemez.
