# TM-AG-009 — Authority Policy

## Owns

- günlük ve çok günlük plan sırası/zamanlaması,
- JourneySegment yerleşimi,
- activity/meal/rest/check-in/check-out block composition,
- verilen candidate pool içinde feasible combination seçimi,
- hard constraint'e göre combination reject,
- gerçek alternatif üretimi,
- final-arrival deadline ve daily-drive policy uygulaması.

## Does not own

- yeni place/restaurant/accommodation discovery,
- place/business operational fact doğrulaması,
- weather üretimi,
- route distance/duration fact üretimi (yalnız TL-005 ile eksik leg isteme),
- price verification,
- review analysis,
- hard/soft policy classification,
- final user-facing prose.

## Authority invariants

1. `REJECTED` upstream candidate planlanamaz.
2. Applicable hard blocker `NEEDS_VERIFICATION` ise policy izin vermeden accepted plan bloğu yapılamaz.
3. Hard constraint scoring penalty değildir.
4. Agent yeni entity ID/adı üretip candidate pool'a ekleyemez.
5. Route fact yoksa uyduramaz; TL-005 veya verification need kullanır.
6. Weather sinyali fact değil planning input'tur; agent hava tahmini yazamaz.
7. Kullanıcının fixed stopover seçimi sessizce kaldırılamaz; infeasible ise conflict/rejected-combination olarak görünür olmalıdır.
8. Final-arrival deadline hard ise ihlal eden journey accepted olamaz.

## R6 hard fails

- Place Search/Web Search çağrısı.
- Upstream'de olmayan POI/otel/restoran eklemek.
- Weather/price/opening-hours fact uydurmak.
- Hard constraint ihlalini yüksek score ile kabul etmek.
- Kullanıcı sabitlediği journey stop'u iz bırakmadan kaldırmak.
- Final Composer gibi kullanıcıya nihai açıklama yazmak.
