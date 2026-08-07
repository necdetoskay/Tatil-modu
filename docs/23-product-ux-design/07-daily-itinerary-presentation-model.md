# Daily Itinerary Presentation Model

## Amaç
Bir günü yalnız POI listesi olarak değil, aile tarafından uygulanabilir zaman/enerji akışı olarak sunmak.

## Gün kartı bilgi modeli
```yaml
day_view:
  day_number: required
  theme: required
  energy_level: low|medium|high
  driving_load: low|medium|high
  primary_plan:
    morning: required
    lunch_rest: required
    afternoon: required
    evening: optional
  alternatives: []
  estimated_cost: optional
  key_warnings: []
  evidence_summary: optional
```

## Sunum ilkeleri
- Aktivite adı tek başına yeterli değildir; aile açısından kısa gerekçe verilir.
- Sürüş/park/geçiş yükü görünür olmalıdır.
- Çocuklar için dinlenme noktası günün normal parçasıdır; boşluk gibi sunulmaz.
- Aynı gün gereksiz zigzag rota oluşturulmamalıdır; varsa kullanıcıya açıklanır.
- Alternatifler ana planı okunamaz hale getirmeden erişilebilir olmalıdır.

## Enerji dili
Teknik skor yerine kullanıcıya `rahat`, `dengeli`, `yoğun` gibi anlaşılır etiketler gösterilebilir; canonical fatigue sonucunun anlamı değiştirilmez.
