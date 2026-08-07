# Model Evaluation Dataset Governance

## Amaç
Model benchmark sonuçlarının fixture ezberleme, test leakage, kolay senaryo ağırlığı veya sürekli benchmark'a göre prompt ayarlama nedeniyle yanıltıcı hale gelmesini önlemek.

## Dataset katmanları
### Development set
Geliştiricinin görebildiği; agent/prompt geliştirme sırasında kullanılan fixture'lar.

### Regression set
Geçmiş bug ve P0/P1 failure'lardan oluşan kalıcı set.

### Holdout qualification set
Model/prompt promotion kararı için kullanılan ve günlük geliştirmede optimize edilmeyen senaryolar.

### Challenge set
Zor, çelişkili, eksik evidence ve adversarial vakalar.

## Leakage kuralı
Holdout fixture'ın expected answer veya rubric detayları production prompt/context içine dahil edilemez.

## Dataset balance
Set yalnız mutlu yol örneklerinden oluşamaz. Aşağıdaki boyutlar dengelenir:
- çocuklu/çocuksuz,
- farklı çocuk yaşları,
- bütçe seviyeleri,
- kısa/uzun seyahat,
- deniz/non-sea,
- hard constraint çeşitleri,
- evidence quality,
- provider failure,
- clarification-required,
- impossible request,
- memory conflict.

## Versioning
Her benchmark sonucu `dataset_version` taşır. Fixture değişirse eski ve yeni sonuçlar doğrudan aynı seri gibi karşılaştırılmaz.

## Promotion integrity
Bir model yalnız development set'te iyi olduğu için promote edilemez. Promotion en az regression + holdout + challenge setlerini geçmelidir.

## Yeni bug kuralı
Production/evaluation'da bulunan doğrulanmış bug:
1. minimize edilir,
2. fixture haline getirilir,
3. regression set'e eklenir,
4. fix uygulanır,
5. tüm ilgili modeller tekrar değerlendirilir.

## Privacy
Gerçek kullanıcı konuşmaları benchmark datasetine doğrudan kopyalanmaz. Gerekirse anonimleştirilmiş/sentetik fixture üretilir ve kişisel/sensitive veri çıkarılır.
