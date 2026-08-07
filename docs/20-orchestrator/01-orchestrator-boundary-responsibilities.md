# Orchestrator Boundary & Responsibilities

## Rol
Orchestrator, Tatil Modu'nun control-plane bileşenidir. Domain uzmanı veya kullanıcıya içerik yazan agent değildir.

## Sahip olduğu sorumluluklar
- request/workflow instance başlatma ve correlation kimliği taşıma
- canonical workflow adımını seçme
- prerequisite ve dependency kontrolü
- contract-valid handoff routing
- Decision Policy Engine gate sonuçlarını uygulama
- retry/recovery/fallback kararlarını yürütme
- Quality Engine sonucuna göre revise/block/finalize yönlendirmesi
- terminal state ve finalization kararı
- audit/explainability olaylarının üretilmesini sağlama

## Sahip olmadığı sorumluluklar
- destinasyon/POI/otel/rota araştırması yapmak
- evidence doğrulamak veya confidence hesaplamak
- family suitability değerlendirmesini uzman yerine üretmek
- bütçe optimizasyonunu kendisi yapmak
- quality score üretmek
- memory içeriği icat etmek
- final kullanıcı metnini compose etmek
- policy precedence değiştirmek

## Ownership kuralı
```text
Agent = uzman sonucu üretir
Verification Platform = iddia/kanıt güvenini doğrular
Decision Policy Engine = izin/verme/öncelik kararını belirler
Quality Engine = sonuç kalitesini değerlendirir
Orchestrator = bunların doğru sırada ve doğru contract ile çalışmasını koordine eder
Final Composer = onaylanmış state'ten kullanıcı cevabını oluşturur
```

Bir responsibility başka canonical platforma aitse Orchestrator onu kopyalamaz; yalnız sonucunu tüketir.
