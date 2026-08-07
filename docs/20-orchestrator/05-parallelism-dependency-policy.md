# Parallelism & Dependency Policy

## Amaç
Bu belge Orchestrator'ın hangi işleri paralel, hangilerini sıralı yürütebileceğini ve dependency sınırlarını tanımlar. Bu tasarım runtime scheduler değildir.

## Temel karar
Parallelism hız optimizasyonudur; correctness, evidence integrity, hard constraint ve policy precedence üzerinde üstünlüğü yoktur.

## Parallel çalışabilecek işler
Aynı prerequisite setini paylaşan ve birbirinin sonucunu semantik olarak değiştirmeyen bağımsız araştırma/analiz kolları paralel yürütülebilir.

Örnekler:
- birbirinden bağımsız POI candidate research kolları
- bağımsız konaklama candidate research kolları
- aynı candidate seti üzerinde ayrı lojistik veri toplama görevleri
- kanonik workflow izin veriyorsa alternatif gün planı taslaklarının bağımsız üretilmesi

## Sıralı kalması gereken işler
- intake normalization → hard constraint gate
- research result → verification gerektiren downstream kararlar
- candidate eligibility → ranking/composition
- plan composition → quality review
- quality blocker resolution → finalization
- finalization gate → final response assembly

## Dependency sınıfları
```yaml
dependency_types:
  hard:
    meaning: downstream başlayamaz
  soft:
    meaning: downstream başlayabilir ancak sonuç conditional/degraded olabilir
  informational:
    meaning: sıralama zorunluluğu oluşturmaz
```

## Join kuralları
Parallel branch'ler birleşirken Orchestrator:
1. her branch'in contract validity durumunu kontrol eder,
2. required hard dependency'lerin tamamlandığını doğrular,
3. branch-level blocker ve warning'leri korur,
4. eksik branch'i sessizce successful kabul etmez,
5. timeout/failure sonucunu retry/fallback politikasına yönlendirir.

## Race-condition tasarım ilkeleri
- aynı canonical artifact'ın birden fazla branch tarafından sahiplenilmesine izin verilmez,
- last-write-wins semantiği kullanılmaz,
- conflict durumunda explicit reconcile/revision route gerekir,
- provenance branch birleşiminde korunur.

## Parallelism budget
Parallel dispatch sınırsız değildir. Runtime uygulamada concurrency limiti Capability Platform ve operasyonel politikalara bağlı olacaktır; bu belge yalnız semantik izin sınırını tanımlar.
