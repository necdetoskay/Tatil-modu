# Retry, Recovery & Fallback Policy

## Amaç
Bu belge Orchestrator'ın başarısız stage/handoff durumunda güvenli şekilde retry, recovery veya fallback seçmesini tanımlar. Sonsuz retry veya başarısızlığı gizleme yasaktır.

## Failure sınıfları
```yaml
failure_classes:
  contract_invalid
  transient_capability_failure
  evidence_insufficient
  verification_conflict
  policy_block
  quality_revision_required
  dependency_missing
  unrecoverable_failure
```

## Retry uygunluğu
Retry yalnız yeni bir denemenin sonucu makul biçimde değiştirebileceği durumda yapılır.

| Failure | Default action |
|---|---|
| contract invalid | producer revision; aynı invalid payload tekrar edilmez |
| transient capability failure | bounded retry |
| evidence insufficient | alternate source/capability veya degraded path |
| verification conflict | conflict resolution workflow |
| policy block | retry yok; blocker çözülmeden ilerleme yok |
| quality revision required | hedefli revision cycle |
| dependency missing | prerequisite route |
| unrecoverable failure | terminate/degraded response |

## Retry budget ilkeleri
1. Counter `stage + failure_class + target` bazındadır.
2. Retry aynı input ve aynı failure koşulunu körlemesine tekrarlamaz.
3. Retry yeni evidence, alternate capability, revised input veya transient recovery gibi değişiklik gerektirir.
4. Limit dolduğunda fallback/block/terminate seçeneklerinden biri seçilir.
5. Retry sayısı kullanıcı güvenini zedeleyecek belirsizliği gizlemek için kullanılmaz.

## Recovery
Recovery, daha önce kabul edilmiş güvenli state'e dönerek kontrollü yeniden yönlendirmedir. Accepted canonical artifact'lar gerekçe olmadan silinmez.

## Fallback
Fallback daha düşük kapsamlı ama dürüst ve güvenli sonuç üretme yoludur. Örnek:
- belirli fiyat doğrulanamıyorsa fiyatı kesin yazmamak,
- bir candidate doğrulanamıyorsa doğrulanmış alternatifleri korumak,
- tam günlük plan mümkün değilse kullanılabilir bölüm + açık evidence gap sunmak.

Fallback hiçbir hard constraint'i gevşetemez.

## Stop condition
Aynı blocker retry/revision sonrası çözülemiyorsa Orchestrator terminal `blocked`, `degraded` veya `failed` durumuna geçer ve nedeni audit/disclosure zincirinde korur.
