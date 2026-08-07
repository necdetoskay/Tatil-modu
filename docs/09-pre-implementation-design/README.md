# Tatil Modu — Pre-Implementation Design

**Doküman türü:** Pre-implementation design alanı  
**Durum:** aktif tasarım alanı  
**Tarih:** 2026-08-07  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## Amaç

Bu klasör, Tatil Modu için kodlamaya veya prototype uygulamasına geçmeden önce tamamlanması gereken ürün, mimari, agent, contract, schema, fixture, evaluation, tool, memory ve UX tasarım belgelerini toplar.

Bu alanın amacı implementation başlatmak değildir.

Amaç, implementation başlamadan önce sistemin kağıt üzerindeki tasarımını eksiksiz hale getirmektir.

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
current_phase: documentation_and_design_completion
next_goal: complete_pre_implementation_design_package
```

Tatil Modu için bu aşamada izin verilen çalışmalar:

- ürün ve kapsam tasarımı,
- mimari blueprint,
- agent specification,
- contract ve schema tasarımı,
- fixture ve golden scenario tasarımı,
- evaluation rubric tasarımı,
- memory disclosure tasarımı,
- capability / tool registry tasarımı,
- UX flow tasarımı,
- risk ve karar kayıtları.

Bu aşamada izin verilmeyen çalışmalar:

- application coding,
- runtime coding,
- live provider integration,
- persistent memory implementation,
- production UI implementation,
- agent execution framework implementation,
- real booking / payment / availability integration.

## Neden bu alan gerekli?

Tatil Modu, basit bir tatil listesi üretme projesi değildir.

Sistem; çocuklu aile ihtiyaçları, trafik, otopark, mahremiyet hassasiyetleri, resmi kaynaklar, güncel saat/fiyat bilgisi, rota yorgunluğu, alternatifli planlama, hard constraint ve evidence taşıyan agent kararlarını birlikte yönetmelidir.

Bu nedenle koddan önce aşağıdaki sorular eksiksiz cevaplanmalıdır:

- Hangi agent hangi işi yapacak?
- Hangi agent neyi kesinlikle yapmayacak?
- Hangi bilgi memory'den hangi agent'a verilecek?
- Hangi bilgi tool/provider'dan hangi capability ile alınacak?
- Hangi karar evidence ve confidence ile taşınacak?
- Hangi hard constraint skorla telafi edilemeyecek?
- Hangi fixture ile hangi agent bağımsız test edilecek?
- Hangi output kabul edilebilir sayılacak?
- Hangi hatalar kullanıcıya nasıl açıklanacak?

## Bu klasörün kapsamı

| Belge | Amaç |
|---|---|
| `01-design-completion-assessment.md` | Kod/prototype kapalıyken eksik tasarım alanlarını görünür hale getirir |
| `02-system-blueprint-gap-analysis.md` | Sistem blueprint'inde eksik kalan alanları çıkarır |
| `03-required-design-artifact-map.md` | Koddan önce gereken tüm artifact dosyalarını listeler |
| `04-agent-specification-workplan.md` | İlk-phase agent spec yazım sırasını belirler |
| `05-contract-schema-workplan.md` | ACP, request, response, error, evidence ve confidence schema planını belirler |
| `06-fixture-and-evaluation-workplan.md` | Golden scenarios, fixture ve evaluation rubric planını belirler |
| `07-tool-and-capability-workplan.md` | Capability registry, tool gateway ve mock provider planını belirler |
| `08-memory-and-privacy-workplan.md` | Memory disclosure ve privacy tasarım planını belirler |
| `09-ui-ux-flow-workplan.md` | Koddan önce UX flow ve kullanıcı karar akışlarını belirler |
| `10-pre-code-freeze-checklist.md` | Kod başlamadan önce geçilecek son tasarım checklist'ini tutar |

## Handbook ilişkisi

Generic AI Agent Architecture Handbook root seviyesinde yaşar:

```text
ai-agent-architecture-handbook/
```

Bu klasör ise Tatil Modu'na özeldir:

```text
docs/09-pre-implementation-design/
```

Handbook genel standardı verir. Bu klasör, o standardın Tatil Modu için eksiksiz uygulanmasını takip eder.

## Çalışma prensibi

Bu klasördeki her belge şu soruya hizmet eder:

```text
Kod yazmadan önce tasarım borcumuz kaldı mı?
```

Cevap evet olduğu sürece kodlama başlamaz.

## Current status

```yaml
design_state: active
implementation_state: blocked_by_design_completion
prototype_state: blocked_by_design_completion
completed_documents:
  - 01-design-completion-assessment.md
  - 02-system-blueprint-gap-analysis.md
  - 03-required-design-artifact-map.md
  - 04-agent-specification-workplan.md
  - 05-contract-schema-workplan.md
next_document: 06-fixture-and-evaluation-workplan.md
```
