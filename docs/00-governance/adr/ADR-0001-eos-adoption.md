# ADR-0001 — EOS Benimseme Modeli

| Alan | Değer |
|---|---|
| Tür | Process ADR |
| Durum | Accepted |
| Tarih | 2026-08-06 |
| Karar Sahibi | Project Team |
| İlgili Doküman | GOV-000 |

## Bağlam

Önceki projeler (Project_LUMI, Akıllı Alışveriş Asistanı) için oluşturulan EOS mühendislik sistemi belge-first, test-deterministic ve agent-test standardına sahiptir. Bu sistem, kod yazarken değil, tasarlarken başlar.

tatil-plan projesi, bu aynı mühendislik felsefesini **agent sistem mimarileri** için özelleştirerek kullanacaktır.

## Karar

EOS, merkezi ve proje bağımsız mühendislik sistemi olarak kullanılacaktır.

Bu proje:

- EOS v1.0'ı referans alır,
- EOS dosyalarını topluca kopyalamaz,
- yalnızca kullanım sürümünü, proje bağlamını ve sapmaları kaydeder,
- genel iyileştirmeleri EOS backlog'una geri besler.

## Değerlendirilen Seçenekler

### A. Her proje için yeni mühendislik sistemi yazmak

**Reddedildi.** Gereksiz tekrar ve tutarsızlık üretir.

### B. EOS dokümanlarını kopyalayarak kullanmak

**Reddedildi.** Kopyalar zamanla ayrışır, sürüm takibi zorlaşır.

### C. Merkezi EOS + proje adoption belgesi

**Kabul edildi.** Genel standart ile proje bağlamını ayırır.

## Sonuçlar

### Olumlu

- Tekrar azalır, standartlar merkezileşir
- Sürüm takibi kolaylaşır, projeler arası tutarlılık artar
- Agent test standardı tüm projelerde tekrar kullanılabilir

### Olumsuz

- EOS kaynağına erişim gerektirir
- Sürüm yükseltmeleri ayrıca yönetilmelidir

## Riskler

- EOS sürümünün sabit referansla kaydedilmemesi
- Proje kuralı ile EOS kuralının karıştırılması

## Değiştirme Koşulu

Merkezi EOS yaklaşımının erişilebilirlik veya sürüm yönetimi açısından sürdürülemez olduğu kanıtlanırsa yeni ADR ile değiştirilir.
