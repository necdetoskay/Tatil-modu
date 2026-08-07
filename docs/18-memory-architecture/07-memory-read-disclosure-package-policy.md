# 07 — Memory Read and Disclosure Package Policy

**Doküman türü:** memory read and disclosure package design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu belge, Memory Platform'un expert agent'lara hangi memory bilgisini hangi formatta ve hangi minimum kapsamla vereceğini tanımlar.

## Ana karar

```yaml
memory_read_disclosure_policy_state: drafted
full_profile_read_by_agents: forbidden
disclosure_package_required: true
minimum_necessary_context_required: true
implementation_allowed: false
```

## Disclosure package nedir?

Disclosure package, canonical memory'nin görev için gerekli minimum görünümüdür.

Agent canonical memory store görmez; sadece kendisine hazırlanmış disclosure package görür.

## Disclosure package alanları

```yaml
disclosure_package_fields:
  package_id: required
  target_agent: required
  task_scope: required
  included_memory_items: required
  excluded_memory_summary: optional
  confidence_summary: required
  freshness_summary: required
  privacy_flags: required
  user_visibility_requirements: required
```

## Agent bazlı disclosure

| Agent | Alabileceği memory görünümü |
|---|---|
| Trip Intake | çıkış şehri, bilinen aile yapısı, eksik bilgi ipuçları |
| Constraint Policy | hard constraint candidate'ları ve confidence bilgisi |
| Family Suitability | çocuk yaşları, dinlenme ihtiyacı, aile yükü sinyalleri |
| Destination Candidate | destinasyon tercihleri, radius hassasiyeti, privacy scope |
| Route Logistics | çıkış noktası, araç, sürüş/mola tercihleri |
| Accommodation Fit | aile, bütçe bandı, konaklama tercihleri |
| Activity Fit | aktivite tercihleri, çocuk yaşları, privacy relevance |
| Day Plan Composer | özetlenmiş planning context |
| Final Response Composer | yalnız kullanıcıya görünür disclosure özeti |

## Full profile yasağı

```yaml
full_profile_access:
  expert_agents: forbidden
  final_response_composer: forbidden
  orchestrator: not_owner_limited_requester
  memory_platform: owner
```

## Disclosure conflict sinyali

Eski veya çelişkili memory varsa package bunu açıkça taşımalıdır.

```yaml
conflict_signal_example:
  memory_item: child_age
  issue: stale_possible
  action: ask_or_disclose_uncertainty
```

## Kullanıcı görünürlüğü

Eğer memory planı anlamlı şekilde etkiliyorsa final response bunu kullanıcının anlayacağı şekilde belirtmelidir.

```text
Daha önce belirttiğiniz çocuklu ve düşük yorulmalı plan tercihini dikkate aldım.
```

## Kapanış kararı

Memory read doğrudan profil okuma değildir; görev bazlı disclosure package üretimidir.
