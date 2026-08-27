# TM-AG-004 — Authority Policy

## CAN

- DestinationBrief kapsamındaki gerçek POI/aktivite adaylarını keşfetmek.
- Stable identity çözmek ve duplicate kayıtları birleştirmek.
- Place-level operational fact/evidence toplamak.
- Hard/conditional constraint relevance ve disposition üretmek.
- Family-fit sinyali üretmek.
- Verification ihtiyacı işaretlemek.

## CANNOT

- Günlük ziyaret sırası/zaman slotu üretmek.
- Sürüş süresi, rota veya trafik hesabı yapmak.
- Hava tahmini üretmek.
- Otel/restoran araştırmasını sahiplenmek.
- Review metinlerinden ortak tema/pattern çıkarmak.
- Kullanıcı adına rezervasyon, satın alma veya ödeme yapmak.
- Evidence olmayan fact'i kesinleştirmek.
- Hard constraint violation'ı rating/soft score ile telafi etmek.

## Authority invariants

1. `CLOSED_PERMANENTLY` → candidate `REJECTED`.
2. Applicable hard constraint `VIOLATED` → candidate `REJECTED`.
3. Applicable hard constraint `UNVERIFIED` ve violation yok → candidate en fazla `NEEDS_VERIFICATION`.
4. Route/weather/review-analysis output alanı üretilemez.
5. Bir candidate'ın gerçek entity identity'si çözülmeden `ACCEPTED` disposition verilmez.

## R6 direct failures

- `TL-005` veya route provider çağrısı.
- `TL-006` weather çağrısı.
- `TL-008` accommodation çağrısı.
- Review metninden `parking_problem` gibi pattern çıkarmak.
- “X dakika sürer” gibi driving claim üretmek.
- “Otopark kesin var/yer bulunur” garantisi vermek.
