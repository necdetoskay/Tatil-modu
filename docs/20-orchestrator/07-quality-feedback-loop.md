# Quality Feedback Loop

## Amaç
Quality Engine review sonucunun Orchestrator tarafından nasıl aksiyona dönüştürüleceğini tanımlar. Orchestrator kalite puanı üretmez veya reviewer rolünü üstlenmez.

## Girdi
```yaml
quality_report:
  overall_status: pass|pass_with_warnings|revise|block
  blockers: []
  warnings: []
  dimension_results: []
  revision_targets: []
  disclosure_requirements: []
  report_ref: required
```

## Orchestrator aksiyon eşlemesi
| Quality sonucu | Orchestrator aksiyonu |
|---|---|
| pass | finalization gate'e ilerle |
| pass_with_warnings | disclosure'ları koruyarak finalization değerlendirmesi |
| revise | yalnız belirtilen owner/stage'e hedefli revision route |
| block | finalization durur; blocker çözüm yolu veya terminal block |

## Hedefli revision
Quality feedback tüm workflow'u varsayılan olarak baştan çalıştırmaz. `revision_targets` hangi artifact/owner/stage'in yeniden ele alınacağını belirler.

Örnekler:
- family suitability sorunu → ilgili suitability/plan composition stage
- evidence quality sorunu → verification/evidence workflow
- plan coherence sorunu → day plan composition
- final response alignment sorunu → final composer

## Revision guard
1. Quality Engine başka domain'in çıktısını kendisi düzeltmez.
2. Orchestrator revision içeriği yazmaz; doğru owner'a route eder.
3. Hard blocker soft warning'e dönüştürülemez.
4. Aynı quality failure sınırsız loop oluşturamaz.
5. Revision sonrası yeni quality report gerekir; önceki pass varsayılamaz.
6. Disclosure requirement final composer'a kadar state içinde korunur.

## Quality-loop termination
Bounded revision sonunda blocker sürüyorsa sonuç `blocked` veya güvenli ise `degraded` olarak terminal hale gelir. Orchestrator sırf kullanıcıya cevap verebilmek için quality gate'i bypass edemez.
