# Tatil Modu — Architecture Terminology Registry

**Doküman türü:** Canonical mimari terminoloji sözlüğü  
**Teknik kod adı:** `architecture_terminology_registry`  
**Sürüm:** 1.0 Taslak  
**Architecture Review:** ARF-014  
**Canonical status:** Architecture Freeze öncesi terminoloji kaynağı

## Amaç

Bu doküman, Tatil Modu mimarisinde `platform`, `service`, `agent`, `planner`, `module`, `registry`, `store`, `gateway`, `adapter` ve `architecture` terimlerinin birbirinin yerine kullanılmasını engeller.

ARF-014 kararı: Mimari terimler serbest metin içinde rastgele seçilmez. Her bileşen türü kendi sorumluluk, ownership ve çağrı sınırına göre adlandırılır.

## Canonical terimler

| Terim | Canonical anlam | Sahiplik kuralı | Örnek |
|---|---|---|---|
| `Platform` | Birden fazla agent/module/runtime tarafından kullanılan ortak altyapı ve governance katmanı | Cross-cutting ownership alabilir; domain görevi yürütmez | Capability Platform, Knowledge Platform, Evaluation Platform |
| `Service` | Runtime'da çağrılabilen bounded teknik servis | API/contract sunar; kendi domain sınırı içinde işlem yapar | Verification Platform façade service, Disclosure Service |
| `Agent` | Belirli bir kullanıcı veya planlama görevini yürüten LLM destekli uzman iş birimi | Görev yürütür; canonical memory/knowledge ownership almaz | Trip Profile Agent, Accommodation Agent |
| `Planner` | Plan oluşturma, sıralama, karar kapısı veya alternatif üretme sorumluluğu olan orchestration-adjacent bileşen | Plan kararlarını verir; data source veya policy ownership almaz | Day Planner, Route Planner |
| `Module` | Bir agent/planner tarafından çağrılan bounded domain değerlendirme yeteneği | Orkestrasyon yapmaz; agent çağırmaz; canonical veri yazmaz | Travel Intelligence Module, Environmental Intelligence Module |
| `Registry` | Versioned canonical metadata veya sözlük kaydı | Runtime kararları için referans semantik sağlar; kendisi iş yürütmez | Error Code Registry, Prompt Registry, Capability Registry |
| `Store` | Kalıcı veri veya knowledge saklama alanı | Sahip olduğu veri tipini saklar ve sorgular; semantic registry değildir | Travel Knowledge Store |
| `Gateway` | Dış sistem, tool veya provider çağrılarını normalize eden giriş katmanı | Permission, routing ve normalization uygular | Tool Gateway |
| `Adapter` | Tek bir provider/tool entegrasyon sözleşmesi | Gateway altında çalışır; doğrudan agent tarafından çağrılmaz | Google Maps Adapter, Weather Provider Adapter |
| `Architecture` | Sistem genelindeki ownership, boundary, dependency ve governance kararları | Canonical freeze baseline altında tutulur | Architecture Baseline, Architecture Dependency Index |

## Terim seçme kuralları

1. Bir bileşen görev yürütüyorsa ve LLM destekli uzman davranışı varsa `Agent` olarak adlandırılır.
2. Bir bileşen plan veya rota/akış kararı veriyorsa `Planner` olarak adlandırılır.
3. Bir bileşen yalnız domain skoru, risk, suitability veya trade-off üretiyorsa `Module` olarak adlandırılır.
4. Bir bileşen çoklu agent/module tarafından paylaşılan altyapı ise `Platform` olarak adlandırılır.
5. Bir bileşen runtime çağrı yüzeyi sunuyorsa `Service` olarak adlandırılabilir; fakat service terimi platform ownership yerine kullanılmaz.
6. Bir bileşen canonical sözlük veya metadata listesi tutuyorsa `Registry` olarak adlandırılır.
7. Bir bileşen kalıcı runtime/travel knowledge verisi tutuyorsa `Store` olarak adlandırılır.
8. Provider entegrasyonlarına doğrudan `Platform` denmez; provider-specific katman `Adapter`, ortak giriş katmanı `Gateway` olarak adlandırılır.

## Yasak / kaçınılacak kullanımlar

| Kaçınılacak kullanım | Doğru kullanım |
|---|---|
| `Travel Intelligence Agent` | `Travel Intelligence Module` |
| `Tool Adapter Platform` | `Capability Platform / Tool Gateway` altında `Tool Adapter Standard` |
| `Knowledge Store Platform` | `Travel Knowledge Store` veya `Knowledge Platform`, bağlama göre |
| `Verification Agent` | `Verification Platform` veya `Verification Facade`, göreve göre |
| `Error Service Registry` | `Error Code Registry` |
| `Agent Service Module` | Bileşenin gerçek rolüne göre tek terim seçilir |

## ARF kararlarıyla ilişki

| ARF | Terminoloji etkisi |
|---|---|
| ARF-001 | `Knowledge Platform` ile `Travel Knowledge Store` ayrıldı |
| ARF-002 | `Verification Platform` runtime façade olarak konumlandı |
| ARF-004 | `Travel Intelligence` agent değil module olarak tanımlandı |
| ARF-005 | `Tool Adapter Standard`, Capability Platform altında adapter sözleşmesi olarak tanımlandı |
| ARF-012 | `Error Code Registry` merkezi registry olarak oluşturuldu |
| ARF-013 | Terminoloji dokümanları dependency metadata ile izlenir |

## Yeni doküman yazım kuralı

Yeni canonical dokümanlarda bileşen türü metadata veya giriş bölümünde açıkça belirtilmelidir:

```yaml
component_type: platform | service | agent | planner | module | registry | store | gateway | adapter | architecture
owner: <canonical owner>
depends_on: [...]
architecture_review: ARF-014
```

## ARF-014 kararı

ARF-014 kapsamında mimari terminoloji için canonical registry oluşturulmuştur. Freeze öncesi ve sonrası dokümanlarda platform, service, agent, planner, module, registry, store, gateway ve adapter terimleri bu sözlüğe göre kullanılmalıdır.
