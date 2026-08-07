# Intake and Missing Information Flow

## Amaç
Kullanıcıdan yalnız plan kalitesini veya geçerliliğini anlamlı ölçüde etkileyen eksik bilgileri istemek.

## Bilgi öncelikleri
### Tier 1 — planı bloke edebilir
- başlangıç noktası gerektiği halde bilinmiyorsa,
- seyahat süresi/gün sayısı bilinmiyorsa,
- ulaşım biçimi kritik olduğu halde bilinmiyorsa,
- açık hard constraint belirsiz/çelişkiliyse.

### Tier 2 — kaliteyi ciddi etkiler
- çocuk yaşları,
- yaklaşık bütçe,
- dinlenme/öğle uykusu ihtiyacı,
- günlük kabul edilebilir sürüş,
- konaklama tipi.

### Tier 3 — sonradan optimize edilebilir
- yemek tercihleri,
- küçük sunum tercihleri,
- düşük etkili aktivite zevkleri.

## Soru politikası
1. Aynı anda mümkün olduğunca az soru sor.
2. Kullanıcının zaten verdiği bilgiyi tekrar isteme.
3. Memory bilgisi varsa körlemesine sorma; gerektiğinde kısa teyit sun.
4. Sistem makul bir soft varsayımla ilerleyebiliyorsa kullanıcıyı durdurma; varsayımı görünür kıl.
5. Hard constraint için belirsiz varsayım yapma.

## Missing information sonucu
```yaml
intake_ux_result:
  blocking_questions: []
  optional_questions: []
  visible_assumptions: []
  confirmed_constraints: []
  editable_context: []
```
