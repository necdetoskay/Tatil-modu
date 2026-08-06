# ADR-0002 — Sınırlı ve Kanıt Temelli Agent Mimarisi

| Alan | Değer |
|---|---|
| Tür | Architecture Decision Record |
| Durum | Accepted — Revised |
| İlk Tarih | 2026-08-06 |
| Son Revizyon | 2026-08-06 |
| Kanonik Katalog | `docs/02-agents/agent-catalog.md` |

## Bağlam

İlk tasarımda yaklaşık 20 ayrı agent rolü önerildi. Sonraki aşamada 10 domain agent + 1 Orchestrator yaklaşımı değerlendirildi. Ayrıntılı tasarım sırasında Weather Context ve Final Plan Composer gibi bağımsız sözleşme ve test ihtiyacı olan roller ortaya çıktı.

## Karar

Agent sayısı sabit bir hedef değildir.

Sistem:

- sınırlı sayıda ana uzmanlık rolüyle başlar,
- her yeni agent için bağımsız sözleşme, prompt, test ve yaşam döngüsü ihtiyacını kanıtlamayı zorunlu tutar,
- deterministik servis veya tool ile çözülebilen işi agent yapmaz,
- yalnız sorumluluk sınırı ve kalite ölçümü belirgin olduğunda yeni agent ekler.

İlk kanonik katalog 12 mantıksal rol içerir.

## Yeni agent kabul kriterleri

- Ayrı ve net sorumluluk sınırı var mı?
- Bağımsız giriş/çıkış sözleşmesi var mı?
- Farklı model, prompt veya tool politikası gerekiyor mu?
- Bağımsız fixture testleri yazılabilir mi?
- Ayrı confidence ve kalite metriği anlamlı mı?
- Mevcut agenta eklenmesi single-responsibility ilkesini bozuyor mu?
- Deterministik servis veya tool olarak çözülemiyor mu?

## Sonuç

Agentların güncel listesi yalnız `docs/02-agents/agent-catalog.md` içinde tutulur. ADR kararın gerekçesini kaydeder; operasyonel katalog görevi görmez.
