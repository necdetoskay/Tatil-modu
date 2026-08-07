# Tatil Modu — Architecture Dependency Index

**Doküman türü:** Cross-reference ve dependency metadata index  
**Teknik kod adı:** `architecture_dependency_index`  
**Sürüm:** 1.0 Taslak  
**Architecture Review:** ARF-013

## Amaç

Bu doküman Architecture Freeze öncesi baseline içindeki canonical dosyaların hangi kararlara, artifact'lara ve platform sınırlarına bağlı olduğunu tek yerde gösterir.

ARF-013 kararı: Mimari dokümanlar yalnız içerik taşımamalı; hangi ARF kararına, hangi ownership boundary'ye ve hangi artifact'a bağlı oldukları izlenebilir olmalıdır.

## Metadata alanları

Yeni veya güncellenen Architecture Freeze dokümanları mümkün olduğunda şu metadata'yı taşımalıdır:

```text
document_id
architecture_review
canonical_status
owner
supersedes
depends_on
related_artifacts
lifecycle_status
last_reviewed
```

## Canonical dosya bağımlılık matrisi

| Dosya | Canonical rol | Owner | Bağlı ARF | Depends on | Related artifacts |
|---|---|---|---|---|---|
| `README.md` | Baseline giriş ve boundary karar özeti | Architecture Review | ARF-001..ARF-013 | Governance README, artifact inventory | Error Registry, Dependency Index |
| `travel-knowledge-store.md` | Runtime seyahat bilgi store boundary | Travel Knowledge Store | ARF-001 | Knowledge Platform, Data Source & Trust | Travel Knowledge Store Entity Schema |
| `08-verification-platform.md` | Verification façade boundary | Verification Platform | ARF-002 | Data Source & Trust, Universal Evidence Model | Verification Result Schema |
| `freeze-required-artifact-inventory.md` | Freeze artifact backlog ve readiness takibi | Architecture Review | ARF-006, ARF-012 | Lifecycle vocabulary | Error Registry |
| `error-code-registry.md` | Merkezi hata kodu sözlüğü | Governance / Runtime | ARF-012 | Lifecycle vocabulary, Capability Platform | Error codes |
| `architecture-dependency-index.md` | Cross-reference ve dependency metadata | Architecture Review | ARF-013 | README, Artifact Inventory | Dependency metadata |

## Pre-freeze referans dosyaları

Aşağıdaki dosyalar önemli tarihsel ve tasarım bağlamı taşır; fakat baseline ile çelişmeleri durumunda canonical kaynak değildir:

| Dosya | Statü | Canonical yönlendirme |
|---|---|---|
| `../01-architecture/system-overview.md` | pre-freeze reference | `README.md` ve ilgili baseline dosyaları |
| `../02-agents/agent-catalog.md` | pre-freeze reference | Baseline agent/platform boundary kararları |
| `../00-governance/README.md` | process authority | Mimari ownership için `README.md` |

## Dependency kuralları

1. Bir doküman başka bir platformun ownership alanını kullanıyorsa `depends_on` içinde bunu belirtmelidir.
2. Bir dosya artifact gerektiriyorsa `related_artifacts` alanı inventory veya registry dosyasına bağlanmalıdır.
3. Pre-freeze referans dosyaları canonical gibi kullanılmamalıdır; ilgili baseline dosyasına yönlendirilmelidir.
4. ARF kararları README içinde özetlenebilir; detay veya registry içeriği ilgili canonical dosyada tutulmalıdır.
5. Yeni agent, platform, schema, registry veya prompt dokümanı en az bir owner ve lifecycle/status alanı taşımalıdır.

## ARF-013 kararı

ARF-013 kapsamında cross-reference ve dependency metadata için canonical takip noktası bu dosyadır. Architecture Freeze öncesinde yeni canonical dokümanlar bu index'e eklenmelidir.
