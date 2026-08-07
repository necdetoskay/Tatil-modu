# 01 — Capability Design Overview

**Doküman türü:** canonical capability design overview  
**Durum:** drafted  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Adapter entegrasyonu:** kapalı

## Purpose

Bu doküman, Tatil Modu için capability tasarımının genel çerçevesini tanımlar.

Amaç; agent, contract, fixture ve final cevap kalitesi için gerekli dış bilgi ihtiyaçlarını provider bağımsız capability kimlikleriyle tasarlamaktır.

Bu dosya gerçek tool çağrısı, API entegrasyonu, scraper, adapter kodu veya runtime orchestration değildir.

## Ana karar

```yaml
capability_design_overview_state: drafted
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
source_of_truth: docs/14-tool-and-capability-design/01-capability-design-overview.md
```

## Capability nedir?

Capability, sistemin dış dünyadan ihtiyaç duyduğu yeteneğin provider bağımsız adıdır.

```text
Capability = Sistemin ne bilmeye veya doğrulamaya ihtiyacı var?
Provider = Bu bilgiyi hangi servis/araç sağlayabilir?
Adapter = Provider sonucunu sistemin contract/evidence diline çeviren sınır.
```

Örnek:

```yaml
capability: place_opening_hours
possible_providers:
  - official_website
  - maps_provider
  - municipality_source
  - venue_page
adapter_responsibility:
  - raw sonucu normalize eder
  - freshness bilgisini taşır
  - confidence üretir
  - evidence envelope alanlarını doldurur
```

Agent provider seçmez.

Agent capability ihtiyacını bildirir.

Orchestrator / capability layer, uygun provider ve adapter kararını verir.

## Neden provider bağımsızlık gerekli?

Tatil Modu uzun vadede farklı veri kaynaklarını kullanabilir.

Aşağıdaki alanlar sık değişir veya farklı provider kalitesi gerektirir:

```yaml
volatile_information:
  - açılış saati
  - giriş ücreti
  - otopark durumu
  - trafik riski
  - hava durumu
  - konaklama müsaitliği
  - tesis olanakları
  - kadınlar plajı / mahremiyet durumu
  - rota ve mesafe
```

Provider adı agent prompt'una veya contract semantiğine gömülürse sistem kırılgan olur.

Bu nedenle agent specification ve contract dosyaları capability kimliğiyle konuşmalıdır.

## Capability lifecycle

Bir capability sonucu aşağıdaki lifecycle'dan geçer:

```text
Need detected
> Capability request shaped
> Provider candidate selected
> Adapter normalizes result
> Evidence envelope produced
> Verification status assigned
> Downstream contract consumes evidence
> Final response discloses verified / unverified state
```

Bu aşama lifecycle tasarımıdır; runtime implementation değildir.

## Capability request tasarım alanları

Her capability request en az şu tasarım alanlarını taşımalıdır:

```yaml
capability_request_fields:
  - capability_id
  - requested_by_agent
  - claim_or_decision_to_support
  - input_context
  - freshness_requirement
  - confidence_requirement
  - user_visibility_requirement
  - privacy_sensitivity
  - failure_behavior
```

Bu alanlar ileride contract veya schema olarak yazılabilir; şu anda yalnız tasarım kuralıdır.

## Capability result tasarım alanları

Her capability sonucu evidence-aware olmalıdır:

```yaml
capability_result_fields:
  - capability_id
  - provider_category
  - normalized_result
  - source_summary
  - evidence_status
  - verification_status
  - confidence
  - freshness
  - limitations
  - warnings
  - blockers
  - user_visible_disclosure
```

Raw provider sonucu final cevaba doğrudan taşınmaz.

## Capability ve evidence ilişkisi

Capability sonucu, `docs/12-contracts/common-evidence-envelope.md` ile uyumlu olmalıdır.

```yaml
evidence_mapping_required:
  claim_type: required
  evidence_status: required
  verification_status: required
  confidence: required
  freshness: required
  source_summary: required
  user_visibility: required
  blockers: conditional
  warnings: conditional
```

Bir claim doğrulanamamışsa final cevapta kesin gerçek gibi sunulamaz.

## Capability failure davranışı

Capability başarısız olursa sistem şu davranışlardan birini seçmelidir:

```yaml
failure_behavior_options:
  evidence_gap:
    description: "Bilgi doğrulanamadı, final cevapta belirsizlik gösterilir."
  fallback_capability:
    description: "Daha düşük güvenli veya farklı kaynaklı başka capability denenebilir."
  clarification_required:
    description: "Kullanıcıdan karar için gerekli bilgi istenir."
  hard_blocker:
    description: "Plan devam edemez veya öneri güvenle yapılamaz."
  soft_warning:
    description: "Plan devam edebilir ama kullanıcıya uyarı gösterilir."
```

Failure durumunda uydurma veri üretmek yasaktır.

## Agent doğrudan tool çağırmalı mı?

Varsayılan karar: hayır.

```yaml
agent_direct_tool_access_default: false
exceptions_require:
  - explicit_capability_access_matrix_entry
  - defined_input_contract
  - defined_output_evidence_mapping
  - defined_failure_behavior
  - privacy_review_when_sensitive
```

Özellikle aşağıdaki agent'lar doğrudan live capability çağırmaz:

```yaml
no_direct_live_access_agents:
  - trip_intake_agent
  - constraint_policy_agent
  - day_plan_composer_agent
  - final_response_composer_agent
```

Verification Evidence Agent, capability sonuçlarını evidence ve confidence açısından düzenleyen ana tasarım noktasıdır.

## Capability kategorileri

İlk üst kategori tasarımı:

```yaml
capability_categories:
  location_and_route:
    examples:
      - maps_distance_and_route
      - traffic_estimation
      - parking_information
  place_information:
    examples:
      - place_opening_hours
      - place_price_information
      - official_source_lookup
  weather_and_environment:
    examples:
      - weather_forecast
  accommodation:
    examples:
      - accommodation_search
      - accommodation_availability
  privacy_sensitive:
    examples:
      - women_only_beach_verification
  social_signal:
    examples:
      - review_signal_lookup
```

Bu kategoriler capability taxonomy dosyasında detaylandırılacaktır.

## Trust ve freshness ilkeleri

Her capability için trust ve freshness gereksinimi farklıdır.

```yaml
trust_freshness_examples:
  weather_forecast:
    freshness_need: high
    stale_result_risk: high
  place_opening_hours:
    freshness_need: high
    stale_result_risk: high
  women_only_beach_verification:
    freshness_need: high
    stale_result_risk: critical
  maps_distance_and_route:
    freshness_need: medium
    stale_result_risk: medium
  review_signal_lookup:
    freshness_need: medium
    stale_result_risk: low_to_medium
```

Mahremiyet ve kadınlar plajı bilgisi stale veya düşük güvenli ise kesin bilgi gibi sunulamaz.

## Cost ve latency tasarım ilkeleri

Capability tasarımında maliyet ve gecikme görünür olmalıdır.

```yaml
cost_latency_principles:
  call_everything_by_default: false
  prefer_required_evidence_first: true
  batch_when_possible: true
  avoid_repeating_same_capability_for_same_claim: true
  expensive_capability_requires_reason: true
  low_value_capability_can_be_skipped_with_disclosure: true
```

Bu aşamada gerçek maliyet ölçümü veya latency benchmark yapılmaz.

## Out of scope

```yaml
out_of_scope:
  - adapter implementation
  - provider SDK seçimi
  - API key yönetimi
  - Playwright veya scraper yazımı
  - live map/weather/hotel çağrısı
  - booking veya ödeme aksiyonu
  - production retry logic
  - runtime cache implementation
```

## Acceptance criteria

Bu overview tamamlanmış sayılmak için şu kararları vermelidir:

```yaml
acceptance_criteria:
  capability_definition_clear: true
  provider_independence_defined: true
  adapter_boundary_defined: true
  evidence_mapping_required: true
  failure_behavior_defined: true
  direct_agent_tool_access_default_false: true
  privacy_sensitive_capability_warning_defined: true
  next_artifact_identified: true
```

## Current status

```yaml
capability_design_overview_state: drafted
next_artifact: 02-capability-taxonomy.md
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
```
