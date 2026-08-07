# Primary Planning Journey

## Amaç
First-phase ana kullanıcı yolculuğunu ekran koduna bağlamadan tanımlar.

## Journey
```text
1. Kullanıcı tatil hedefini/isteğini anlatır
2. Sistem request'i anlar ve kritik eksikleri belirler
3. Gerekliyse az sayıda yüksek etkili soru sorulur
4. Sistem anladığı hard constraint ve önemli tercihleri özetler
5. Kullanıcı bunları onaylar/düzeltir
6. Planlama çalışır
7. Kullanıcı önce planın kısa özetini görür
8. Günlük planlar ve alternatifler incelenebilir
9. Warning/evidence/uncertainty gerektiğinde açılabilir
10. Kullanıcı belirli gün veya tercihi revize edebilir
11. Güncellenmiş plan yeniden sunulur
12. Uygunsa memory önerileri ayrıca kullanıcı onayına sunulur
```

## Journey ilkeleri
- Planlamadan önce her ayrıntıyı toplamak zorunlu değildir.
- Eksik bilgi yalnız karar etkisi yüksekse kullanıcıyı durdurmalıdır.
- Sistem uzun bir form doldurtmak yerine conversational intake kullanabilir.
- Kullanıcı tüm planı yeniden başlatmadan tek gün/aktivite/constraint değiştirebilmelidir.
- Revision sonrası etkilenmeyen plan parçaları mümkün olduğunca korunmalıdır.

## Başarı kriteri
Kullanıcı final plana geldiğinde sistemin kim için, hangi sınırlar içinde ve hangi önceliklerle plan yaptığını anlayabilmelidir.
