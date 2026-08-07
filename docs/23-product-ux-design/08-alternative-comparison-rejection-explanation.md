# Alternative Comparison and Rejection Explanation

## Amaç
Kullanıcıya yalnız tek 'kazanan' vermek yerine anlamlı alternatifleri karşılaştırılabilir hale getirmek ve önemli seçeneklerin neden elendiğini gerektiğinde açıklamak.

## Karşılaştırma boyutları
Alternatife göre uygun olanlar seçilir:
- aile/çocuk uygunluğu,
- sürüş ve zaman,
- yorgunluk,
- bütçe,
- hava bağımlılığı,
- park/erişim,
- doğrulama güveni,
- mahremiyet/hard constraint uyumu.

## Önerilen UX dili
```text
Ana seçim — neden öne çıktı?
Alternatif A — ne zaman daha iyi seçim?
Alternatif B — hangi trade-off'u getiriyor?
```

## Rejection explanation
Her reddedilen candidate kullanıcıya gösterilmez. Ancak kullanıcı özellikle sorduğunda veya seçenek görünür biçimde önemliyse canonical reason code anlaşılır dile çevrilir.

Örnek sınıflar:
- hard constraint ile uyumsuz,
- güncel bilgi doğrulanamadı,
- bütçe hard limitini aşıyor,
- çocuk/yorgunluk açısından uygun değil,
- rota verimsizliği yüksek.

## Kural
UX 'puanı düşük' gibi anlamsız açıklamayla yetinmemeli; fakat iç scoring formülünü de gereksiz yere kullanıcıya dökmemelidir.
