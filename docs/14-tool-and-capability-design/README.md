# 14 — Tool and Capability Design

**Doküman türü:** canonical tool ve capability design alanı  
**Durum:** aktif tasarım artifact alanı  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**Adapter entegrasyonu:** kapalı

## Amaç

Bu klasör, Tatil Modu için kullanılacak tool, capability, adapter, verification access ve evidence üretim sınırlarını koddan önce kanonik şekilde tasarlamak için kullanılır.

Bu alan gerçek tool çağrısı, adapter kodu, provider entegrasyonu, scraping implementation veya runtime orchestration değildir.

Bu alanın amacı şudur:

```text
Tatil Modu hangi dış yeteneklere ihtiyaç duyar, bu yetenekler hangi capability kimlikleriyle temsil edilir, hangi agent hangi capability'e hangi şartlarda erişebilir ve bu erişim final cevaba nasıl evidence olarak taşınır?
```

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
runtime_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
source_of_truth: docs/14-tool-and-capability-design/
input_sources:
  - docs/11-agent-specifications/
  - docs/12-contracts/
  - docs/13-fixtures-and-evaluation/
  - docs/04-tools/
```

Bu klasörde TypeScript adapter, API client, scraper, browser automation, workflow, CI veya production monitoring yazılmaz.

Önce capability tasarımı yapılır.

## Neden bu aşama gerekli?

Agent ve contract tasarımı tamamlandıktan sonra sistemin gerçek dünyaya nasıl bakacağını tanımlamak gerekir.

Tatil planı üretirken aşağıdaki bilgiler sık değişir veya doğrulama ister:

```text
fiyat
müsaitlik
açılış saati
resmi tatil / kapanış
otopark
trafik
yol süresi
hava durumu
kadınlar plajı / mahremiyet durumu
tesis olanakları
yaş kısıtı
mesafe / rota
```

Bu bilgiler doğrudan agent içine gömülmez.

Bunlar capability tasarımı ve verification policy üzerinden yönetilir.

## Kapsam

```yaml
scope:
  - capability taxonomy
  - capability access matrix
  - tool trust levels
  - provider neutrality rules
  - adapter boundary design
  - verification access policy
  - evidence emission requirements
  - failure and fallback behavior
  - privacy-sensitive capability handling
  - cost and latency design constraints
```

## Kapsam dışı

```yaml
out_of_scope:
  - live API integration
  - scraping code
  - Playwright automation
  - browser runtime
  - provider SDK setup
  - production secrets
  - real credentials
  - booking or payment action
  - notification automation
  - test runner implementation
```

## İlk-phase tool ve capability design seti

| Sıra | Artifact | Dosya | Durum |
|---:|---|---|---|
| 1 | Capability Design Overview | [`01-capability-design-overview.md`](01-capability-design-overview.md) | drafted |
| 2 | Capability Taxonomy | [`02-capability-taxonomy.md`](02-capability-taxonomy.md) | drafted |
| 3 | Agent Capability Access Matrix | [`03-agent-capability-access-matrix.md`](03-agent-capability-access-matrix.md) | drafted |
| 4 | Verification Capability Policy | [`04-verification-capability-policy.md`](04-verification-capability-policy.md) | drafted |
| 5 | Evidence Emission Mapping | `05-evidence-emission-mapping.md` | next |
| 6 | Tool Trust and Freshness Model | `06-tool-trust-and-freshness-model.md` | planned |
| 7 | Provider and Adapter Boundary | `07-provider-and-adapter-boundary.md` | planned |
| 8 | Capability Failure and Fallback Policy | `08-capability-failure-and-fallback-policy.md` | planned |
| 9 | Privacy Sensitive Capability Policy | `09-privacy-sensitive-capability-policy.md` | planned |
| 10 | Cost Latency and Quota Policy | `10-cost-latency-and-quota-policy.md` | planned |
| 11 | Tool Capability Completion Checklist | `11-tool-capability-completion-checklist.md` | planned |

## Capability tasarım ilkeleri

1. Agent'lar provider adı bilmez; capability kimliği bilir.
2. Tool çağrısı doğrudan final cevap üretmez; evidence envelope üretir.
3. Doğrulanmamış capability sonucu final cevapta kesin bilgiye dönüşemez.
4. Her capability için trust, freshness ve failure davranışı tanımlanır.
5. Booking, ödeme, rezervasyon veya kullanıcı adına işlem yapma bu aşamanın kapsamı dışındadır.
6. Kadınlar plajı / privacy gibi hassas alanlarda doğrulama ihtiyacı açıkça görünür olmalıdır.
7. Capability başarısız olursa agent uydurma bilgi üretmez; evidence gap veya fallback üretir.
8. Provider değişse bile contract ve agent specification değişmemelidir.
9. Cost ve latency tasarımda görünür olmalıdır; fakat runtime ölçüm yapılmaz.
10. Capability erişimi minimum gerekli agent'a verilir.

## İlk capability adayları

```yaml
initial_capability_candidates:
  maps_distance_and_route:
    purpose: "mesafe, rota ve yol yükü doğrulama"
  traffic_estimation:
    purpose: "trafik riski ve zaman belirsizliği değerlendirme"
  parking_information:
    purpose: "otopark ve erişim riski doğrulama"
  weather_forecast:
    purpose: "hava hassasiyeti ve indoor fallback ihtiyacı"
  place_opening_hours:
    purpose: "açılış/kapanış saati doğrulama"
  place_price_information:
    purpose: "fiyat veya giriş ücreti doğrulama"
  accommodation_search:
    purpose: "konaklama adayları ve aile uygunluğu"
  accommodation_availability:
    purpose: "müsaitlik doğrulama ihtiyacı"
  women_only_beach_verification:
    purpose: "kadınlar plajı veya privacy uyumu doğrulama"
  official_source_lookup:
    purpose: "belediye, tesis, müze veya resmi kaynak doğrulaması"
  review_signal_lookup:
    purpose: "aile uygunluğu ve pratik kullanıcı deneyimi sinyali"
```

Bu liste provider listesi değildir.

Capability listesi; sistemin ne tür yeteneklere ihtiyaç duyduğunu gösterir.

## Agent erişim yaklaşımı

```yaml
agent_access_principles:
  trip_intake_agent:
    live_capability_access: false
  constraint_policy_agent:
    live_capability_access: false
  family_suitability_agent:
    live_capability_access: limited_indirect
  destination_candidate_agent:
    live_capability_access: verification_needed_only
  route_logistics_agent:
    live_capability_access: route_and_parking_capabilities
  accommodation_fit_agent:
    live_capability_access: accommodation_capabilities
  activity_fit_agent:
    live_capability_access: place_weather_privacy_capabilities
  day_plan_composer_agent:
    live_capability_access: no_direct_live_access_by_default
  verification_evidence_agent:
    live_capability_access: verification_orchestrated_access
  final_response_composer_agent:
    live_capability_access: false
```

Final Response Composer doğrudan tool çağırmaz.

Final cevap yalnızca orchestrator tarafından verilen verified/evidence-aware veriyi kullanıcıya taşır.

## Evidence bağlantısı

Her capability sonucu aşağıdaki envelope alanlarını beslemelidir:

```yaml
evidence_connection:
  - claim_type
  - evidence_status
  - verification_status
  - confidence
  - freshness
  - source_summary
  - user_visibility
  - blockers
  - warnings
```

Capability sonucu yoksa veya başarısızsa `common-error-envelope.md` ile uyumlu hata/disclosure üretilir.

## Current status

```yaml
tool_capability_design_state: active
completed_artifacts:
  - 01-capability-design-overview.md
  - 02-capability-taxonomy.md
  - 03-agent-capability-access-matrix.md
  - 04-verification-capability-policy.md
next_artifact: 05-evidence-emission-mapping.md
implementation_allowed: false
prototype_allowed: false
adapter_code_allowed: false
provider_integration_allowed: false
live_tool_call_allowed: false
```
