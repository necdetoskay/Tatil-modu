# Source Authority Model v1.0

## 1. Amaç

Bir kaynağın belirli bir claim türü üzerinde ne kadar yetkili olduğunu ölçmek.

Authority genel bir kaynak puanı değildir.

Bir belediye sayfası:

- şehir içi ulaşım duyurusu için yüksek authority,
- otelin oda temizliği için düşük authority

taşıyabilir.

## 2. Authority boyutları

```text
ownership
legal_mandate
operational_control
direct_observation
domain_expertise
identity_verification
claim_specificity
```

## 3. Authority score

Başlangıç modeli:

```text
authorityScore =
  ownership            × 0.25
+ legalMandate         × 0.20
+ operationalControl   × 0.20
+ directObservation    × 0.15
+ domainExpertise      × 0.10
+ identityVerification × 0.05
+ claimSpecificity     × 0.05
```

Skor `0–1` aralığındadır.

## 4. Claim-specific authority

Authority her bilgi türü için ayrı hesaplanır.

Örnek:

### Otel resmî sitesi

| Claim | Authority |
|---|---:|
| Check-in saati | 0.95 |
| Oda tipi | 0.95 |
| Otopark varlığı | 0.90 |
| Otoparkın yoğunlukta yeterli olması | 0.35 |
| Temizlik kalitesi | 0.30 |
| Personel güler yüzü | 0.20 |

### Doğrulanmış konaklama yorumları

| Claim | Authority |
|---|---:|
| Temizlik deneyimi | 0.85 |
| Gürültü | 0.85 |
| Gerçek otopark deneyimi | 0.80 |
| Resmî check-in politikası | 0.35 |
| Gelecek tarihte müsaitlik | 0.10 |

## 5. Authority sınıfları

| Sınıf | Aralık | Anlam |
|---|---:|---|
| A | 0.90–1.00 | doğrudan yetkili |
| B | 0.75–0.89 | güçlü ve ilgili |
| C | 0.55–0.74 | destekleyici |
| D | 0.30–0.54 | zayıf |
| E | 0.00–0.29 | yalnız keşif veya bağlam |

## 6. Kaynak rolü ve authority

### Authoritative

Claim üzerinde yüksek ownership, mandate veya control.

### Experiential

Kullanım deneyimini doğrudan gözlemlemiş kaynak.

### Corroborating

Başka bir kaynağı destekler fakat tek başına belirleyici değildir.

### Discovery-only

Yeni bilgi veya kaynak keşfetmek için kullanılır.

## 7. Authority ≠ Truth

Yüksek authority otomatik doğruluk değildir.

Örneğin:

- resmî sayfa güncel olmayabilir,
- provider yanlış entity eşleştirmiş olabilir,
- yorumcu gerçekten kalmış olsa bile subjektif olabilir.

Authority, freshness ve evidence strength ayrı hesaplanır.

## 8. Deneyim claim'leri

Aşağıdaki claim türlerinde kullanıcı deneyimi authority'si yükselir:

```text
cleanliness_experience
noise_experience
staff_behavior
parking_experience
queue_experience
child_friendliness_experience
accessibility_experience
value_for_money
crowding
```

## 9. Resmî claim'ler

Aşağıdaki claim türlerinde resmî/veri sahibi authority'si yükselir:

```text
opening_hours
admission_fee
official_policy
availability
reservation_condition
address
contact
event_schedule
legal_restriction
```

## 10. Segment authority

Bir deneyim kaynağının authority'si kullanıcı segmentine göre değişebilir.

Örnek:

```text
2 yaş çocuklu aile yorumu
→ çocuklu aile uygunluğu için yüksek ilişki

tek başına iş seyahati yorumu
→ çocuklu aile uygunluğu için düşük ilişki
```

Bu boyut authority değil relevance modifier olarak uygulanır.

## 11. Manipülasyon ve çıkar çatışması

Authority cezası uygulanabilecek durumlar:

- sponsorlu içerik,
- işletme tarafından sağlanan testimonial,
- açıklanmamış ticari ilişki,
- sahte yorum şüphesi,
- toplu kopya içerik,
- kimliği doğrulanamayan kaynak.

## 12. Authority değerlendirme çıktısı

```json
{
  "sourceId": "src-1",
  "claimType": "parking_experience",
  "authorityScore": 0.82,
  "authorityClass": "B",
  "role": "experiential",
  "factors": {
    "ownership": 0.0,
    "legalMandate": 0.0,
    "operationalControl": 0.0,
    "directObservation": 1.0,
    "domainExpertise": 0.4,
    "identityVerification": 0.8,
    "claimSpecificity": 1.0
  },
  "penalties": [],
  "policyVersion": "1.0.0"
}
```

## 13. Hard kurallar

- Genel yıldız puanı claim-specific authority yerine kullanılamaz.
- Resmî pazarlama metni deneyim kanıtı sayılamaz.
- Tek anonim yorum kritik deneyim claim'inde yüksek authority alamaz.
- Provider adı tek başına authority belirlemez.
- Authority skoru kaynağın scope'u dışındaki claim'e taşınamaz.
