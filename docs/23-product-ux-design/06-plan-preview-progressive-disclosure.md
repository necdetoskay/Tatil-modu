# Plan Preview and Progressive Disclosure

## Amaç
Final planı tek seferde aşırı ayrıntıyla yüklemek yerine karar vermeyi kolaylaştıran katmanlar halinde sunmak.

## Katman 1 — hızlı özet
Kullanıcı ilk bakışta şunları görebilmelidir:
- tatil tarih/süre özeti,
- ana bölge/konaklama yaklaşımı,
- gün başına ana tema,
- yaklaşık toplam sürüş/yorgunluk görünümü,
- bütçe durumu,
- önemli warning/blocker/degraded bilgi.

## Katman 2 — günlük plan
Her gün için:
- sabah,
- öğle/dinlenme,
- öğleden sonra,
- akşam,
- tahmini geçiş/sürüş yükü,
- ana alternatifler.

## Katman 3 — ayrıntı
İstendiğinde:
- neden önerildi,
- evidence/source,
- verification/freshness,
- alternatif neden elendi,
- maliyet kırılımı,
- park/trafik/operasyonel notlar.

## İlke
Progressive disclosure bilgi saklamak değildir. Hard warning, kritik belirsizlik veya constraint ihlali ayrıntı katmanına gizlenemez.
