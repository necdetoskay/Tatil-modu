# Destination Discovery Agent — Candidate Elimination Algorithm

## 1. Amaç

Adayların LLM yorumuyla keyfî biçimde elenmesini önlemek ve eleme nedenlerini standartlaştırmak.

## 2. Aşamalar

```text
Seed candidate set
      ↓
Identity validation
      ↓
Scope validation
      ↓
Hard constraint validation
      ↓
Basic feasibility validation
      ↓
Data sufficiency validation
      ↓
Scoring eligibility
      ↓
Shortlist eligibility
```

## 3. Eleme kodları

| Kod | Açıklama | Kritik |
|---|---|---|
| `UNRESOLVED_LOCATION` | Yer kimliği doğrulanamadı | Evet |
| `OUTSIDE_ALLOWED_SCOPE` | Ülke/bölge kapsamı dışında | Evet |
| `EXCLUDED_BY_USER` | Kullanıcı açıkça hariç tuttu | Evet |
| `HARD_CONSTRAINT_FAILED` | Zorunlu koşul sağlanmıyor | Evet |
| `TRAVEL_BURDEN_UNACCEPTABLE` | Süreye göre uygulanamaz yol yükü | Koşullu |
| `SEASON_MISMATCH` | Talep edilen deneyim tarih için uygun değil | Koşullu |
| `INSUFFICIENT_SOURCE_DATA` | Minimum kaynak şartı sağlanmadı | Evet |
| `DUPLICATE_CANDIDATE` | Aynı adayın tekrarı | Evet |
| `LOW_SCORE` | Minimum shortlist skoru altında | Hayır |
| `LOW_CONFIDENCE` | Güven eşiği altında | Hayır |

## 4. Hard ve soft eleme

### Hard elimination

Aday tamamen çıkarılır:

- kapsam dışında,
- kullanıcı hariç tutmuş,
- konum doğrulanamıyor,
- hard constraint kesin ihlal,
- duplicate,
- kritik kaynak yok.

### Soft elimination

Aday `rejectedCandidates` veya `alternatives` alanında tutulabilir:

- düşük skor,
- düşük confidence,
- yol yükü yüksek ama kullanıcı tercihiyle mümkün,
- sezon uyumu zayıf fakat tamamen imkânsız değil.

## 5. Yol yükü kararı

Yol yükü tek başına mutlak eleme değildir.

Hard elimination için aşağıdakiler birlikte aranır:

- kısa tatil,
- uzun tek yön süre,
- transfer karmaşıklığı,
- kullanıcı özel olarak uzun yol istemiyor,
- daha uygulanabilir alternatif mevcut.

## 6. Kaynak yeterliliği

Her aday için minimum:

- doğrulanmış coğrafi kimlik,
- ulaşım veya mesafe kaydı,
- destinasyon uygunluğu için en az bir güvenilir kaynak.

Eksikse:

```text
rejectionCode = INSUFFICIENT_SOURCE_DATA
```

Fixture mode'da bu veriler mock source record ile sağlanabilir.

## 7. Duplicate tespiti

Aynı aday şu alanlarla normalize edilir:

```text
country + province + district/subregion + canonicalName
```

Aynı yerin farklı yazımları tek adayda birleşir.

## 8. Eleme çıktısı

Her elenen aday şu alanları taşımalıdır:

```json
{
  "candidateId": "string",
  "name": "string",
  "rejectionCode": "HARD_CONSTRAINT_FAILED",
  "severity": "hard",
  "reason": "Kadınlara özel plaj hard constraint'i doğrulanamadı.",
  "sourceRefs": ["src-1"],
  "reconsiderable": false
}
```

## 9. Sessiz eleme yasağı

Aday üretildiği hâlde shortlist'e alınmıyorsa eleme nedeni kayıt altına alınmalıdır.

## 10. Regression koruması

Bir prompt/model değişikliği:

- daha önce elenen hard constraint adayını shortlist'e alırsa,
- aynı adayı iki kez üretirse,
- kullanıcı hariç tutulan destinasyonu geri getirirse

regression testi başarısız olmalıdır.
