# Destination Discovery Agent Test Suite

## İlk fixture paketi

| ID | Konu |
|---|---|
| DDA-001 | Sabit il içinde alt bölge |
| DDA-002 | Açık deniz destinasyonu |
| DDA-003 | Kritik eksik profil |
| DDA-004 | Çocuklu aile yol riski |
| DDA-005 | Muhafazakâr deniz constraint |
| DDA-006 | Elektrikli araç |
| DDA-007 | Climate normal / forecast ayrımı |
| DDA-008 | Hariç tutulan destinasyon |
| DDA-009 | Aday çeşitliliği |
| DDA-010 | Yetersiz fiyat verisi |

## Sonraki test kodu

- `contract.test.ts`
- `behavioral.test.ts`
- `scenario.test.ts`
- `adversarial.test.ts`

Bu ilk paket mimari contract ve fixture tabanını kurar. Çalıştırılabilir test runner ayrı teknik pakette eklenecektir.
