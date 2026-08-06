# Destination Discovery Agent — Scoring Test Matrix

| ID | Alan | Kritik |
|---|---|---|
| DDA-011 | Profil bazlı ağırlık uyarlaması | Evet |
| DDA-012 | Hard constraint shortlist dışı | Evet |
| DDA-013 | Yol yükü cezası | Evet |
| DDA-014 | Duplicate aday normalizasyonu | Evet |
| DDA-015 | Top-N çeşitlilik post-process | Hayır |

## Geçme kriterleri

- ağırlık toplamı her senaryoda 1.0,
- hard fail aday rank alamaz,
- aynı input aynı output üretir,
- penalty tablosu birebir uygulanır,
- duplicate aday tekilleştirilir,
- diversity adjustment kayıt altına alınır.
