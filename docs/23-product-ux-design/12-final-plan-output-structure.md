# Final Plan Output Structure

## Amaç
Final Response Composer'ın canonical sonuçlarını kullanıcı için tutarlı bir bilgi mimarisinde sunmak.

## Zorunlu üst yapı
1. **Plan özeti** — tarih/süre, kimler için, ana yaklaşım.
2. **Önemli sınırlar** — hard constraint ve kritik varsayımlar.
3. **Hızlı bakış** — günlerin kısa teması, toplam sürüş/yorgunluk/bütçe görünümü.
4. **Günlük planlar** — zaman blokları, dinlenme, geçiş ve alternatifler.
5. **Konaklama yaklaşımı** — varsa seçilen/önerilen seçenek ve trade-off.
6. **Bütçe özeti** — tahmini aralıklar ve belirsiz kalemler.
7. **Kritik operasyonel notlar** — trafik, park, rezervasyon, saat/freshness gibi karar etkili bilgiler.
8. **Warning ve uncertainty** — kullanıcı kararını etkileyen açıklar.
9. **Kaynak/evidence ayrıntısı** — progressive disclosure ile erişilebilir.
10. **Revizyon girişleri** — kullanıcı hangi parçaları kolayca değiştirebilir.

## Günlük plan minimumu
Her gün:
```yaml
minimum_day_output:
  theme: required
  morning: required
  lunch_rest: required
  afternoon: required
  evening: optional
  travel_load: required
  alternatives: minimum_1_when_meaningful
  key_warning: optional
```

## Final output ilkesi
Final cevap rapor gibi uzun olmak zorunda değildir. Öncelik uygulanabilirliktir. Kullanıcı ilk bakışta 'bugün ne yapıyoruz?' sorusunu cevaplayabilmeli, ayrıntıya ihtiyaç duyduğunda derine inebilmelidir.
