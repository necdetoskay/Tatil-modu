# Evidence Strength Test Standard

## 1. Genel testler

- strength score `0–1`,
- confidence `0–1`,
- strength class skor aralığıyla uyumlu,
- unique sample raw count'u aşamaz,
- duplicate ratio sayılarla uyumlu,
- support + contradiction + neutral unique sample'ı aşamaz,
- verified ratio `0–1`,
- factor alanları tam.

## 2. Kritik senaryolar

### ES-001 — Tek anonim olumlu yorum

Beklenen:

- unique sample 1,
- low verification,
- strength `weak` veya `insufficient`,
- `strong` olamaz.

### ES-002 — 40 doğrulanmış aile yorumu

Beklenen:

- yüksek sample sufficiency,
- yüksek segment relevance,
- düşük duplicate,
- strength `strong` veya `very_strong`.

### ES-003 — 100 kayıt, %45 duplicate

Beklenen:

- duplicate penalty,
- unique sample raw count'tan belirgin düşük,
- strength düşer.

### ES-004 — Yüksek çelişki

Beklenen:

- contradiction penalty,
- support ratio düşer,
- strength `moderate` veya altı.

### ES-005 — Farklı segmentler

Beklenen:

- aile segmenti evidence'i çocuklu aile kullanıcıda yüksek relevance,
- business segment düşük relevance,
- ayrı assessment üretilebilir.

### ES-006 — Resmî observed fact

Beklenen:

- sample 1 olabilir,
- yüksek authority ve direct observation,
- cross-check varsa strong olabilir.

### ES-007 — Son dönem kalite düşüşü

Beklenen:

- current/previous window yeterli,
- effect size ve sample size kontrolü,
- küçük örneklemde trend claim üretilmez.

### ES-008 — Sponsorlu testimonial kümesi

Beklenen:

- manipulation penalty,
- independence düşük,
- strong olamaz.

## 3. Duplicate testleri

- aynı provider review ID,
- aynı normalized text hash,
- aynı author/date/rating kombinasyonu,
- syndication kaynağı

duplicate cluster davranışını tetikler.

## 4. Review kanıtı testleri

- verified flag provenance,
- language confidence,
- claim specificity,
- freshness weighting,
- segment distribution,
- license completeness.

## 5. Hard başarısızlıklar

- duplicate kayıtları bağımsız örneklem sayma,
- tek anonim yorumdan strong evidence üretme,
- verified status uydurma,
- yıldız ortalamasını claim-specific evidence yerine kullanma,
- resmî policy ile deneyim yorumlarını tek evidence score'a eritme,
- strength class/score uyumsuzluğu.
