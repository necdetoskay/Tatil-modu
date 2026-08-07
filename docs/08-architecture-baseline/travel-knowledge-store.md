# Tatil Modu — Travel Knowledge Store

**Doküman türü:** Runtime bilgi katmanı teknik tasarımı  
**Teknik kod adı:** `travel_knowledge_store`  
**Sürüm:** 1.0 Taslak  
**Architecture Review:** ARF-001

## Amaç

Travel Knowledge Store; destinasyon, POI, konaklama, aktivite, rota karakteri,
mevsimsel davranış ve operasyonel seyahat bilgisini runtime kullanım için
saklayan ve sorgulanabilir hale getiren bilgi katmanıdır.

Bu bileşen `Knowledge Platform` değildir.

## Canonical sınır

`docs/07-knowledge-platform/` altındaki Knowledge Platform; ontology, claim,
rule, formula, threshold, policy, prompt, schema, evaluation ve migration
registry tanımlarının canonical sahibidir.

Travel Knowledge Store bu tanımları kullanarak seyahat alanındaki runtime
entity ve bilgi kayıtlarını saklar.

## Katman ilişkisi

```text
Knowledge Platform
  ↓ registry snapshot / ontology / schema
Travel Knowledge Store
  ↓ runtime travel knowledge
Data Source & Trust
  ↓ evidence / authority / freshness / conflict
Travel Intelligence
  ↓ user-specific assessment
Agents / Planners
```

## Ownership kuralları

Travel Knowledge Store:

- destinasyon ve POI kayıtlarını tutabilir,
- aktivite ve konaklama runtime bilgisini tutabilir,
- rota ve park karakteristiğini tutabilir,
- mevsimsel ve operasyonel bilgiyi tutabilir,
- source/evidence lineage referanslarını taşır.

Travel Knowledge Store şunların canonical sahibi değildir:

- ontology,
- claim schema,
- global rule/formula,
- prompt registry,
- schema registry,
- policy registry,
- evaluation registry,
- authority/freshness/evidence-strength algoritmaları.

## ARF-001 kararı

