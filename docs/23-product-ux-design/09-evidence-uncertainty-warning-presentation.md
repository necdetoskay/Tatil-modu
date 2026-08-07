# Evidence, Uncertainty and Warning Presentation

## Amaç
Güvenilirliği görünür kılarken kullanıcıyı teknik metadata ile boğmamak.

## Semantik seviyeler
### Blocker
Planın ilgili kısmı güvenli/geçerli şekilde önerilemiyor. Gizlenemez.

### Warning
Kullanıcı kararını anlamlı etkileyebilecek risk veya belirsizlik var.

### Information
Yararlı operasyonel açıklama; karar için zorunlu değil.

### Evidence detail
Kaynak, freshness ve verification ayrıntıları gerektiğinde açılır.

## Kullanıcı dili
Canonical `confidence`, `verification_status`, `freshness` değerleri kullanıcıya anlaşılır ifadelerle temsil edilir. UX yeni confidence üretmez.

Örnek:
```text
Doğrulandı
Güncelliği kontrol edilmeli
Kaynaklar çelişiyor
Kesin bilgi bulunamadı
```

## Kritik kurallar
- 'Tahmini' bilgi kesin fiyat/saat gibi sunulmaz.
- High-impact claim'in verification problemi görünür olmalıdır.
- Kaynak linki göstermek tek başına verification açıklaması değildir.
- Warning sayısı arttığında kullanıcıya yüzlerce badge göstermek yerine önceliklendirme yapılır.
- Mahremiyet veya kişisel memory verisi evidence açıklamasına sızdırılmaz.
