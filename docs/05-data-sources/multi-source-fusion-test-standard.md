# Multi-source Fusion Test Standard

## 1. Genel testler

- sourceRefs boş değil,
- fusion confidence ve quality `0–1`,
- unresolved critical conflict resolved olamaz,
- selectedValue yalnız uygun status'te bulunur,
- hard-expired item fusion'a girmez,
- candidate support share toplamı tolerans içinde 1'e yaklaşır.

## 2. Kritik senaryolar

### MF-001 — Resmî otopark fact + deneyim kapasite sorunu

Beklenen:

- officialFact ve experienceAssessment ayrı,
- status resolved_with_caveats,
- userImpact medium/high risk olabilir.

### MF-002 — Üç provider aynı çalışma saatini destekliyor

Beklenen:

- resolved,
- yüksek confidence,
- source diversity bonus.

### MF-003 — Tek dominant review provider

Beklenen:

- dominant source penalty,
- confidence azalır,
- evidence yine kullanılabilir.

### MF-004 — Fiyat kaynakları farklı offer bağlamında

Beklenen:

- tek fiyata eritilmez,
- candidate/offer bazında ayrı tutulur.

### MF-005 — Aile ve çift segmentleri

Beklenen:

- segment-specific fusion,
- genel ortalama yok.

### MF-006 — Stale resmî kaynak + fresh structured provider

Beklenen:

- fresher value seçilebilir,
- stale source lineage içinde korunur.

### MF-007 — Critical unresolved conflict

Beklenen:

- status unresolved,
- selectedValue null,
- kesin öneri engellenir.

### MF-008 — Yetersiz coverage

Beklenen:

- status insufficient,
- confidence düşük,
- cross-check önerisi.

## 3. Hard başarısızlıklar

- fact ve experience tek scalar'a indirgenmesi,
- segment farkının kaybolması,
- unresolved conflict'in gizlenmesi,
- lisans dışı evidence kullanımı,
- source refsiz fusion,
- dominant source penalty uygulanmaması.
