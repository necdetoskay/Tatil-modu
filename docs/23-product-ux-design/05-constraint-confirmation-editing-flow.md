# Constraint Confirmation and Editing Flow

## Amaç
Planı gerçekten değiştiren kullanıcı sınırlarının planlama öncesinde görünür ve düzenlenebilir olmasını sağlamak.

## Sunum modeli
Constraint'ler kullanıcıya teknik policy kodlarıyla değil anlaşılır gruplarla gösterilir:
- **Olmazsa olmazlar** — hard constraints
- **Güçlü tercihler** — yüksek etkili soft preferences
- **Esnek tercihler** — optimization girdileri
- **Sistem varsayımları** — kullanıcı tarafından teyit edilmemiş fakat görünür varsayımlar

## Düzenleme davranışı
Kullanıcı:
- constraint ekleyebilir,
- kaldırabilir,
- hard/soft anlamını açıklığa kavuşturabilir,
- bütçe/mesafe/zaman sınırını değiştirebilir,
- hassas tercihi değiştirebilir.

UX doğrudan canonical policy state'i değiştirmez; değişiklik yeni/updated user intent olarak ilgili contract üzerinden işlenir.

## Kritik kural
Hard constraint'in gevşetilmesi sistem tarafından otomatik öneri olarak uygulanamaz. Kullanıcı açıkça değiştirmedikçe korunur.

## Çelişki
İki constraint aynı anda uygulanamaz görünüyorsa sistem birini sessizce seçmez. Çelişki açıkça gösterilir ve kullanıcıdan öncelik istenir veya mümkün seçenek bulunamadığı açıklanır.
