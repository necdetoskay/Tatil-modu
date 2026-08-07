# Tatil-Plan — Governance Foundation

| Alan | Değer |
|---|---|
| Document ID | GOV-000 |
| Sürüm | 1.1 |
| Durum | Onay Bekliyor |
| EOS Sürümü | EOS v1.0 (Referans: Akıllı Alışveriş Asistanı ADR-0001) |
| Son Güncelleme | 2026-08-07 |
| Architecture Review | ARF-009 |

## Amaç

Bu klasör, tatil-plan projesinin çalışma, karar alma ve değişiklik yönetimi kurallarını tanımlar.

Governance dokümanları süreç, karar alma, ADR kullanımı ve değişiklik yönetimi için bağlayıcıdır. Mimari ownership, platform sınırı, canonical layer modeli ve freeze kararları için Architecture Freeze baseline önceliklidir.

## Doküman Haritası

- [EOS Benimseme Standardı](adr/ADR-0001-eos-adoption.md) — EOS'in nasıl kullanılacağı
- [Mühendislik İlkeleri](engineering-principles.md) — Kod ve tasarım ilkeleri
- [Karar Kaydı](decision-log.md) — Önemli kararların logu
- [Terimler Sözlüğü](glossary.md) — Domain terimleri

## Source-of-truth sınırı

ARF-009 kararı: Governance kaynakları genel süreç otoritesidir; güncel mimari ownership kaynağı değildir.

- Governance klasörü; süreç, ADR formatı, karar kaydı, mühendislik ilkeleri ve değişiklik yönetimi kurallarını sahiplenir.
- `docs/08-architecture-baseline/` klasörü; Architecture Freeze öncesi canonical mimari baseline, platform boundary, ownership ve ARF kararlarını sahiplenir.
- `docs/README.md`; dokümantasyon giriş noktası ve yönlendirme haritasıdır, detay kopyalamaz.
- ADR kayıtları kararın nedenini ve bağlamını açıklar; güncel katalog veya runtime ownership listesi olarak kullanılmaz.
- Eski `01-architecture/`, `02-agents/`, `03-testing/` ve `04-tools/` belgeleri, baseline ile çelişirse pre-freeze referans kabul edilir.

## Öncelik Sırası

Çelişki halinde aşağıdaki sıra uygulanır:

1. EOS Constitution — genel mühendislik çalışma ilkeleri
2. EOS Standards — genel standartlar
3. EOS Templates — genel doküman ve ADR şablonları
4. EOS Playbooks — genel çalışma akışları
5. Bu projenin governance dokümanları — süreç ve karar yönetimi için
6. `docs/08-architecture-baseline/` — mimari ownership, platform boundary ve Architecture Freeze kararları için
7. `docs/README.md` — dokümantasyon yönlendirme haritası için
8. Proje ürün, alan ve mimari çalışma dokümanları
9. Specification ve ADR kayıtları
10. Test ve doğrulama dokümanları

## Temel Kural

Genel ve tekrar kullanılabilir bir mühendislik kuralı EOS'ta yaşar. Projeye özgü karar, sapma veya bağlam bu repository içinde yaşar.

Mimari kararlar freeze sürecinde `docs/08-architecture-baseline/` altında toparlanır. Governance bu kararların nasıl alınacağını tanımlar; mimari içeriğin kendisini tekrar tanımlamaz.

## Kararlar

- Proje EOS v1.0'ı referans alır (Akıllı Alışveriş Asistanı projesinden aktarılmıştır).
- Governance dokümanları süreç ve karar yönetimi için proje dokümanlarının üzerinde bağlayıcıdır.
- Mimari ownership ve boundary çakışmalarında `docs/08-architecture-baseline/` önceliklidir.
- Önemli kararlar ADR ve Decision Log ile izlenir.
