# 01 — Memory Architecture Overview

**Doküman türü:** memory architecture overview  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu belge, Tatil Modu içinde memory kavramının ne olduğunu, ne olmadığını ve hangi mimari sınırlar içinde kullanılacağını tanımlar.

Memory, sistemin kullanıcıyı ve ailesini daha iyi anlamasını sağlar; fakat agent'ların kontrolsüz şekilde kişisel bilgi biriktirdiği bir alan değildir.

## Ana karar

```yaml
memory_architecture_overview_state: drafted
canonical_memory_owner: Memory Platform
expert_agent_direct_write_allowed: false
expert_agent_direct_canonical_read_allowed: false
memory_disclosure_package_required: true
implementation_allowed: false
runtime_memory_allowed: false
```

## Memory ne demektir?

Memory, Tatil Modu'nun daha iyi plan üretmek için güvenli ve sınırlı şekilde kullanabileceği geçmiş veya kalıcı bağlamdır.

Örnekler:

```text
Kullanıcının çıkış şehri
Ailede çocuk yaşları
Öğle dinlenmesi tercihi
Mahremiyet / kadınlar plajı hassasiyeti
Daha önce beğenilen destinasyon tipi
Yorucu planlardan kaçınma tercihi
Bütçe bandı eğilimi
```

## Memory ne değildir?

```text
Agent scratchpad'i değildir.
Her konuşmayı kalıcı saklama alanı değildir.
Doğrulanmamış varsayımların depolandığı yer değildir.
Final cevapta gizlice kullanılacak görünmez bilgi havuzu değildir.
Provider/cache/log/debug alanı değildir.
```

## Memory katmanları

```yaml
memory_layers:
  session_context:
    purpose: tek konuşma içi geçici bağlam
    canonical: false
  candidate_memory:
    purpose: memory'e yazılması önerilen ancak henüz commit edilmemiş bilgi
    canonical: false
  canonical_memory:
    purpose: kullanıcı/family/travel preference için onaylı veya güçlü sinyalli bilgi
    canonical: true
  disclosure_package:
    purpose: expert agent'a minimum gerekli memory görünümü
    canonical: derived
```

## Memory ve agent ilişkisi

Expert agent memory platform sahibi değildir.

Agent'lar yalnızca orchestrator veya Memory Platform tarafından hazırlanmış disclosure package alır.

```yaml
agent_memory_access:
  trip_intake_agent: disclosure_limited
  constraint_policy_agent: disclosure_limited
  family_suitability_agent: family_profile_disclosure
  destination_candidate_agent: preference_disclosure
  route_logistics_agent: origin_and_logistics_disclosure
  accommodation_fit_agent: family_and_budget_disclosure
  activity_fit_agent: activity_preference_disclosure
  day_plan_composer_agent: planning_disclosure
  verification_evidence_agent: verification_context_disclosure
  final_response_composer_agent: user_visible_disclosure_only
```

## Memory kullanım ilkesi

Memory, plan kalitesini artırmak için kullanılır; kullanıcı adına kesin bilgi üretmek veya yeni hard constraint icat etmek için kullanılmaz.

```text
Memory yardımcı bağlamdır.
Hard constraint haline gelebilmesi için confidence, recency ve kullanıcı ifadesi gerekir.
```

## Kapanış notu

Bu overview, memory architecture aşamasının üst sınırlarını belirler. Sonraki dosyalar ownership, taxonomy, aile profili, tercih, privacy, read/write ve correction policy ayrıntılarını tanımlar.
