# 02 — Memory Boundary and Ownership

**Doküman türü:** memory ownership and boundary design  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu belge, Tatil Modu içinde memory ownership sınırlarını tanımlar.

Amaç, expert agent'ların kalıcı kişisel bilgi yönetmesini engellemek ve memory kararlarını tek kanonik platform üzerinden yürütmektir.

## Ana karar

```yaml
memory_boundary_state: drafted
canonical_owner: Memory Platform
orchestrator_role: memory_request_and_disclosure_coordination
expert_agent_role: consume_disclosure_package_only
final_response_role: disclose_memory_use_when_user_relevant
implementation_allowed: false
```

## Ownership modeli

| Bileşen | Memory rolü | Canonical write | Canonical read | Not |
|---|---|---:|---:|---|
| Memory Platform | Sahip | yes | yes | Tek canonical owner |
| Orchestrator | Koordinatör | no | via disclosure | Memory isteğini yönlendirir |
| Expert Agent | Tüketici | no | limited disclosure | Agent özel memory yönetmez |
| Verification Evidence Agent | Context tüketici | no | limited disclosure | Evidence bağlamı alabilir |
| Final Response Composer | Kullanıcı görünümü | no | user-visible disclosure only | Gizli memory taşımaz |

## Yasak sınırlar

```yaml
forbidden_boundaries:
  expert_agent_writes_canonical_memory: forbidden
  expert_agent_reads_full_profile: forbidden
  final_response_uses_hidden_memory_without_disclosure: forbidden
  unverified_assumption_becomes_canonical_memory: forbidden
  provider_cache_becomes_user_memory: forbidden
  debug_log_becomes_user_memory: forbidden
```

## Memory Platform sorumlulukları

```yaml
memory_platform_responsibilities:
  - canonical_memory_store_ownership_design
  - memory_confidence_and_freshness_classification
  - disclosure_package_generation
  - candidate_memory_review
  - memory_correction_deletion_policy
  - privacy_sensitive_memory_handling
  - conflict_detection
  - stale_memory_flagging
```

## Orchestrator sorumlulukları

Orchestrator memory sahibi değildir.

Orchestrator yalnızca şunları yapar:

```text
Memory Platform'dan task için uygun disclosure package ister.
Agent input'una sadece gerekli disclosure package'ı ekler.
Memory conflict veya staleness sinyalini workflow'a taşır.
Agent çıktılarındaki candidate memory önerilerini Memory Platform'a iletir.
```

## Agent sorumlulukları

Expert agent, aldığı disclosure package dışına çıkamaz.

Agent memory üzerinden şu kararları tek başına veremez:

```text
Yeni hard constraint oluşturma
Kullanıcı preference'ını kalıcı yazma
Çocuk yaşını değiştirme
Mahremiyet tercihini kesin kabul etme
Eski memory'i silme veya düzeltme
```

## Kapanış kararı

```text
Memory sınırı platform merkezlidir.
Agent'lar memory'i sahiplenmez; sadece görev bağlamında kontrollü disclosure tüketir.
```
