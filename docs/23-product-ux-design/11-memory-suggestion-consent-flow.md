# Memory Suggestion and Consent Flow

## Amaç
Gelecek planları iyileştirebilecek bilgilerin kullanıcı kontrolünde memory adayı haline gelmesini sağlamak.

## Temel akış
```text
Plan sırasında tekrar kullanılabilir tercih gözlenir
→ canonical memory write candidate policy değerlendirmesi
→ uygunsa kullanıcıya kısa öneri gösterilir
→ kullanıcı kabul / reddet / düzenle seçer
→ Memory Platform canonical commit sürecini yürütür
```

## UX ilkeleri
- Sessiz kalıcılaştırma yoktur.
- Hassas tercih için belirsiz veya dolaylı consent yeterli değildir.
- Kullanıcı neyin hatırlanacağını anlayabilmelidir.
- Kullanıcı öneriyi düzenleyebilmelidir.
- Reddetmek planın mevcut kullanımını bozmaz.
- 'Bu seyahat için' ile 'gelecek seyahatlerde de' ayrımı görünür olmalıdır.

## Memory açıklaması
UX internal memory ID veya storage ayrıntısı göstermek zorunda değildir. Kullanıcı açısından temel sorular:
- Ne hatırlanacak?
- Neden yararlı?
- Gelecekte nerede kullanılabilir?
- Nasıl değiştirilebilir/silinebilir?

## Kural
UX consent toplar; canonical memory write işlemini kendisi yapmaz.
