# Conflict Resolution Test Standard

## 1. Genel testler

- en az iki claim,
- preserved refs tüm claim'leri içerir,
- selected claim yalnız resolved durumda zorunlu,
- critical unresolved conflict kesin öneriyi engeller,
- reason code stratejiyle uyumlu,
- confidence impact 0 veya negatiftir.

## 2. Kritik senaryolar

### CR-001 — Otopark policy farkı

Resmî site ücretsiz, booking provider ücretli.

Beklenen:

- C1,
- high,
- cross-check veya fresher/authoritative seçim,
- iki claim korunur.

### CR-002 — Otopark varlığı vs kapasite deneyimi

Beklenen:

- not_a_conflict,
- C5 veya scope split,
- iki ayrı claim olarak tutulur.

### CR-003 — Eski ve yeni giriş ücreti

Beklenen:

- C2,
- time_split,
- yeni current fact,
- eski historical.

### CR-004 — Aile ve çift gürültü deneyimi

Beklenen:

- C4,
- segment_split,
- tek ortalama yok.

### CR-005 — İki farklı aynı isimli restoran

Beklenen:

- C6,
- identity mismatch,
- merge yapılmaz.

### CR-006 — 4.5/5 ve 9.0/10

Beklenen:

- C7,
- normalize_units,
- conflict çözülür.

### CR-007 — İki strong evidence zıt

Beklenen:

- high veya critical,
- cross-check required,
- unresolved olabilir.

### CR-008 — Stale kaynak vs fresh source

Beklenen:

- C8,
- prefer_fresher,
- stale claim korunur ama seçilmez.

## 3. Hard başarısızlıklar

- farklı claim türlerini true contradiction sayma,
- segment farkını tek ortalamada eritme,
- old/current veriyi karıştırma,
- kaybeden claim'i lineage'dan silme,
- critical unresolved durumda kesin karar üretme,
- source refsiz resolution.
