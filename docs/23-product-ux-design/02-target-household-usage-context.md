# Target Household and Usage Context

## Primary household
Tatil Modu'nun first-phase UX'i özellikle çocuklu ailelerin gerçek seyahat karar yükünü azaltmaya odaklanır. Yaşlar sabit ürün varsayımı değildir; çocuk yaşı, uyku/dinlenme düzeni, mobilite, aile tercihleri ve hassasiyetler request/memory context'ten gelir.

## Kullanım bağlamları
- hedef il/ilçe vererek çok günlük plan isteme,
- mevcut tatil planını revize etme,
- bir günün sabah/öğleden sonra/akşam bölümünü tamamlama,
- konaklama/aktivite alternatiflerini karşılaştırma,
- yakın çevrede yüksek değerli günübirlik seçenek arama,
- bütçe veya yorgunluk nedeniyle planı yeniden dengeleme.

## Aile karar yükü
UX şu yükleri azaltmalıdır:
- çocuklara uygunluk araştırması,
- mesafe ve sürüş yükü,
- park/trafik belirsizliği,
- öğle uykusu/dinlenme ihtiyacı,
- yemek ve geçiş zamanları,
- bütçe görünürlüğü,
- mahremiyet/hassas tercihlerin tekrar tekrar anlatılması,
- alternatifler arasında neden-sonuç karşılaştırması.

## Context sınıfları
```yaml
household_context:
  adults: required
  children: optional_list
  mobility_needs: optional
  rest_pattern: optional
  transport_mode: required_or_inferred_with_confirmation
  budget: optional
  privacy_preferences: optional_sensitive
  food_preferences: optional
  planning_style: optional
```

## İlke
UX hiçbir demografik veya hassas tercihi kullanıcı söylemeden varsaymaz. Memory'den gelen bilgi kullanıldığında gerektiği yerde düzenlenebilir/teyit edilebilir olmalıdır.
