# Tatil Modu — Architecture Baseline Staging Policy

**Doküman türü:** Architecture Freeze staging policy  
**Teknik kod adı:** `architecture_baseline_staging_policy`  
**Sürüm:** 1.0 Taslak  
**Architecture Review:** ARF-018  
**Canonical status:** Freeze öncesi staging policy  
**Owner:** Architecture Review / Governance

## Amaç

Bu doküman, `docs/08-architecture-baseline/` klasörünün kalıcı mimari kök değil, Architecture Freeze öncesi staging alanı olduğunu tanımlar.

ARF-018 kararı: `08-architecture-baseline` klasörü, açık mimari çakışmaları çözmek, boundary kararlarını biriktirmek ve freeze öncesi canonical adayları hazırlamak için kullanılır. Freeze tamamlandıktan sonra bu klasör ya arşiv/staging referansına dönüşür ya da içeriği kalıcı canonical dokümantasyon alanlarına taşınır.

## Neden staging alanı var?

Architecture Review sırasında birçok belge aynı kavramları farklı isimlerle tanımlayabilir:

- agent / planner / module / platform ayrımı,
- Knowledge Platform / Travel Knowledge Store ayrımı,
- Verification Platform / Data Source & Trust ayrımı,
- Memory Platform boundary,
- Public Authority layering,
- evaluation hierarchy,
- registry ve artifact ownership.

Bu çakışmalar çözülmeden kalıcı klasör ağacı oluşturmak erken ve risklidir. `08-architecture-baseline` bu yüzden geçici karar toplama ve uyumlama alanıdır.

## Staging alanının sorumlulukları

`docs/08-architecture-baseline/` şunları yapar:

- ARF kararlarını görünür kılar,
- canonical aday boundary dokümanlarını toplar,
- terminology, dependency, error code, evaluation ve artifact registry gibi freeze girdilerini tanımlar,
- eski dokümanlarla çelişen konularda freeze öncesi geçici öncelik sağlar,
- Architecture Freeze checklist ve gap register için kaynak oluşturur.

## Staging alanının yapmayacağı işler

`docs/08-architecture-baseline/` şunları yapmaz:

- kalıcı repo bilgi mimarisinin tek kökü olmaz,
- tüm eski dokümanları süresiz olarak override etmez,
- implementation documentation yerine geçmez,
- AI Agent Architecture Handbook yerine geçmez,
- production contract/schema/package yapısını temsil etmez,
- freeze sonrası yeni kararların dağınık şekilde eklendiği kalıcı çöp klasöre dönüşmez.

## Freeze sonrası hedef yapı

Architecture Freeze tamamlandıktan sonra içerikler kalıcı alanlara taşınır veya bağlanır:

| Staging içeriği | Freeze sonrası hedef |
|---|---|
| Agent / planner boundary kararları | `docs/02-agents/` ve AI Agent Architecture Handbook |
| Platform boundary kararları | `docs/01-architecture/` veya platform-specific architecture klasörleri |
| Knowledge / Travel Knowledge Store ayrımı | `docs/07-knowledge-platform/` ve Travel Knowledge Store architecture |
| Registry kararları | ilgili registry dosyaları veya package-level contract alanları |
| Schema / fixture artifact listesi | `packages/contracts`, `packages/evals` veya eşdeğer uygulama alanları |
| Evaluation hierarchy | `docs/03-testing/` ve evaluation harness dokümanları |
| Governance / source-of-truth kararları | `docs/00-governance/` ve ADR kayıtları |
| Architecture Dependency Index | freeze sonrası canonical doküman index'i veya arşiv snapshot |

## Migration kuralları

Freeze sonrası migration şu kurallarla yapılır:

1. Her staging dokümanı için hedef canonical dosya belirlenir.
2. Taşınan içerik için eski staging dosyasında `superseded_by` referansı bırakılır.
3. Root `README.md` ve `docs/README.md` kalıcı hedeflere yönlendirilir.
4. `08-architecture-baseline` klasörü yalnız freeze snapshot / archive olarak kalır.
5. Yeni development kararları doğrudan kalıcı canonical alana veya ADR'ye yazılır.
6. Freeze sonrası yeni dosya eklemek gerekiyorsa önce `docs/00-governance/` süreciyle karar verilir.

## Geçici öncelik kuralı

Architecture Freeze tamamlanana kadar, ownership ve boundary çakışmalarında `docs/08-architecture-baseline/` önceliklidir.

Architecture Freeze tamamlandıktan sonra bu öncelik otomatik olarak kalıcı canonical dokümanlara devredilir.

## Klasör statüsü

```text
current_status: pre_freeze_staging
post_freeze_target: archive_or_migrate
canonical_scope: temporary_boundary_resolution
permanent_canonical_root: false
```

## ARF-018 kararı

ARF-018 kapsamında `docs/08-architecture-baseline/` kalıcı canonical tree olarak kabul edilmez. Bu klasör Architecture Freeze öncesi staging alanıdır. Freeze tamamlandıktan sonra içerikler kalıcı doküman ağacına taşınacak, bağlanacak veya arşiv snapshot olarak işaretlenecektir.
