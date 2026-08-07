# Plan Revision Interaction Flow

## Amaç
Kullanıcının planın tamamını baştan kurmadan kontrollü değişiklik yapabilmesini sağlamak.

## Revision türleri
- tek aktivite değiştir,
- günün bir bölümünü değiştir,
- tüm günü yeniden planla,
- konaklamayı değiştir,
- bütçe sınırını değiştir,
- sürüş/yorgunluk sınırını değiştir,
- yeni hard constraint ekle/kaldır,
- plan stilini değiştir.

## Etki kapsamı
UX revision isteğini scope ile ifade eder:
```yaml
revision_request:
  target_scope: activity|day_part|day|lodging|constraint|whole_plan
  target_ref: optional
  requested_change: required
  preserve_unaffected_parts: true
```

Orchestrator gerçek dependency impact'ini belirler; UX kendisi hangi agent'ın yeniden çalışacağına karar vermez.

## Kullanıcı beklentisi
Revision sonrası sistem:
- neyin değiştiğini,
- başka hangi plan parçalarının etkilendiğini,
- yeni warning/bütçe/yorgunluk sonucunu
kısa biçimde göstermelidir.

## Kural
Kullanıcı 'sadece öğleden sonrayı değiştir' dediğinde sistem gerekçe olmadan tüm planı farklılaştırmamalıdır.
