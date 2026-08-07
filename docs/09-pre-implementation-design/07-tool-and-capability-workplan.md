# 07 — Tool and Capability Workplan

**Doküman türü:** Pre-implementation tool/capability workplan  
**Durum:** tasarım planı  
**Tarih:** 2026-08-07  
**Kodlama durumu:** kapalı  
**Canlı provider entegrasyonu:** kapalı

## Amaç

Bu doküman, Tatil Modu için dış araç, veri kaynağı, provider ve adapter tasarımının hangi sırayla tamamlanacağını tanımlar.

Bu belge bir tool implementation planı değildir.

Amaç, canlı provider entegrasyonuna geçmeden önce capability registry, tool gateway, adapter sınırları, mock provider davranışı, tazelik politikası, hata yönetimi ve evidence handoff tasarımını netleştirmektir.

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
live_provider_integration_allowed: false
tool_runtime_allowed: false
mock_provider_design_allowed: true
capability_registry_design_allowed: true
```

Bu aşamada araçlar kodlanmayacak, bağlanmayacak ve canlı servis çağrıları yapılmayacaktır.

Önce araçların sistemde ne şekilde temsil edileceği tasarlanacaktır.

## Temel ilke

Agent'lar provider çağırmaz.

Agent'lar capability talep eder.

```text
Agent
  ↓ capability_request
Capability Platform / Tool Gateway
  ↓ adapter_selection
Provider Adapter
  ↓ provider_call
External / Local / Mock Provider
```

Bu ayrım yapılmadan tool entegrasyonu başlatılamaz.

## Kapsam

Bu workplan şu alanları kapsar:

- capability registry,
- capability request envelope,
- tool gateway responsibility,
- adapter boundary,
- provider selection policy,
- mock provider strategy,
- online/offline mode,
- freshness and cache policy,
- rate limit and cost policy,
- prompt injection and untrusted content handling,
- evidence handoff,
- error mapping,
- observability and audit.

## Tool/capability tasarım sırası

| Sıra | Artifact | Amaç | Durum |
|---|---|---|---|
| 1 | `capability-taxonomy.md` | Travel domain capability sınıflarını tanımlar | pending |
| 2 | `capability-registry.md` | Tüm capability kimliklerini ve izinlerini listeler | pending |
| 3 | `capability-request-envelope.md` | Agent'ların tool gateway'e nasıl talep göndereceğini tanımlar | pending |
| 4 | `tool-gateway-boundary.md` | Tool gateway sorumluluklarını ve yasaklarını tanımlar | pending |
| 5 | `provider-adapter-standard.md` | Provider adapter contract'ını tanımlar | pending |
| 6 | `mock-provider-strategy.md` | Kod öncesi fixture/mock provider davranışını tanımlar | pending |
| 7 | `freshness-cache-policy.md` | Saat, fiyat, rota, hava gibi değişken veriler için tazelik politikasını tanımlar | pending |
| 8 | `tool-error-mapping.md` | Provider hatalarını stable error code'lara map eder | pending |
| 9 | `tool-evidence-handoff.md` | Tool result'ın evidence envelope'a nasıl döneceğini tanımlar | pending |
| 10 | `tool-security-policy.md` | Prompt injection, untrusted content ve permission sınırlarını tanımlar | pending |

## İlk capability sınıfları

Tatil Modu için ilk capability sınıfları şunlardır:

| Capability class | Örnek amaç | Canlı entegrasyon durumu |
|---|---|---|
| `route_distance` | Mesafe, sürüş süresi, rota alternatifi | tasarım only |
| `traffic_risk` | Trafik yoğunluğu ve saat riski | tasarım only |
| `parking_availability_hint` | Otopark bulunabilirliği ve risk uyarısı | tasarım only |
| `weather_forecast` | Günlük/saatlik hava etkisi | tasarım only |
| `poi_search` | Gezi noktası / aktivite adayı bulma | tasarım only |
| `poi_operational_hours` | Açılış-kapanış, tatil günü, sezon bilgisi | tasarım only |
| `public_authority_rule_lookup` | Resmi kural / yasak / belediye duyurusu | tasarım only |
| `accommodation_search` | Otel/termal/kaplıca adayları | tasarım only |
| `accommodation_facility_check` | Havuz, aile odası, çocuk uygunluğu, mahremiyet bilgisi | tasarım only |
| `price_estimation` | Yaklaşık maliyet ve bütçe etkisi | tasarım only |
| `beach_privacy_suitability_check` | Kadınlar plajı / mahremiyet hassasiyeti doğrulama | tasarım only |

## Capability registry minimum alanları

Her capability için en az şu alanlar tanımlanmalıdır:

```yaml
capability_id: route_distance.v1
capability_class: route_distance
owner_platform: capability_platform
allowed_callers:
  - travel_orchestrator
  - route_and_logistics_agent
mode_support:
  - fixture
  - mock
  - live_later
required_input_schema: route_distance_request.v1
output_schema: route_distance_result.v1
freshness_requirement: same_day_or_mark_stale
evidence_required: true
confidence_policy: derived_from_source_and_freshness
cost_policy: bounded
rate_limit_policy: required_before_live
security_notes:
  - do_not_pass_raw_untrusted_html_to_agent
```

## Mock provider ilkesi

Koddan önce mock provider davranışı tasarlanmalıdır.

Mock provider şu amaçlarla kullanılacaktır:

- agent'ları canlı servislere bağımlı olmadan test etmek,
- golden scenario'ları tekrarlanabilir yapmak,
- provider hatalarını simüle etmek,
- stale data / conflict / timeout davranışını test etmek,
- cost ve rate limit riskini ortadan kaldırmak.

Mock provider gerçek entegrasyon değildir.

## Tool result evidence handoff

Tool result doğrudan final cevapta kullanılmaz.

Önce evidence envelope'a dönüştürülür:

```text
tool_result
  ↓
evidence_envelope
  ↓
verification_status
  ↓
confidence
  ↓
planner decision
  ↓
final answer
```

Bu zincir tamamlanmadan canlı tool entegrasyonu yapılmaz.

## Public authority özel kuralı

Resmi kaynak, belediye duyurusu, yasak, plaj statüsü, yol kapatma veya giriş kuralı gibi alanlarda provider sonucu doğrudan öneriye dönüşemez.

Bu bilgiler önce:

1. source authority,
2. freshness,
3. conflict status,
4. verification status,
5. policy impact

ile değerlendirilmelidir.

## Kadınlar plajı / mahremiyet hassasiyeti özel kuralı

Kadınlar plajı veya mahremiyet hassasiyeti sıradan bir tercih değildir.

Tool/capability tasarımında bu alan için:

- stronger evidence requirement,
- lower confidence when unverified,
- fallback requirement,
- user-facing uncertainty explanation,
- hard constraint escalation

tanımlanmalıdır.

Unverified beach data, privacy-sensitive recommendation olarak sunulamaz.

## Tool hata sınıfları

İlk hata sınıfları:

| Error class | Anlam |
|---|---|
| `TOOL_TIMEOUT` | Provider zaman aşımı |
| `TOOL_RATE_LIMITED` | Rate limit / kota sorunu |
| `TOOL_UNAVAILABLE` | Provider erişilemez |
| `TOOL_STALE_RESULT` | Veri taze değil |
| `TOOL_CONFLICTING_RESULT` | Kaynaklar çelişkili |
| `TOOL_SCHEMA_MISMATCH` | Provider sonucu beklenen schema ile uyumsuz |
| `TOOL_UNTRUSTED_CONTENT` | İçerik güvenilmeyen / prompt injection riski taşıyor |
| `TOOL_PERMISSION_DENIED` | Capability policy çağrıya izin vermedi |

## Agent davranış kuralları

Agent'lar:

- provider adı bilmemeli,
- API key bilmemeli,
- canlı endpoint bilmemeli,
- capability dışında tool istememeli,
- evidence olmadan kesin iddia üretmemeli,
- tool hatasını gizlememeli,
- stale veya conflicting sonucu yüksek güvenle kullanmamalı.

## Orchestrator davranış kuralları

Travel Orchestrator:

- hangi capability'nin gerektiğine karar verebilir,
- tool gateway'e capability request gönderebilir,
- tool result'ı evidence/verification zincirine sokmalıdır,
- hard constraint için eksik evidence varsa fallback veya belirsizlik açıklaması üretmelidir,
- live tool yoksa fixture/mock modunu kullanmalıdır,
- canlı provider'a geçişi tasarım freeze sonrası değerlendirmelidir.

## Tool Gateway davranış kuralları

Tool Gateway:

- capability policy uygular,
- adapter seçer,
- timeout/retry sınırlarını uygular,
- provider hatasını stable error code'a map eder,
- raw sonucu normalize eder,
- evidence handoff için metadata üretir,
- audit/trace event oluşturur,
- agent'a raw provider karmaşıklığı sızdırmaz.

## Tasarım bağımlılıkları

Bu workplan aşağıdaki belgelerle birlikte ilerlemelidir:

- `05-contract-schema-workplan.md`,
- `06-fixture-and-evaluation-workplan.md`,
- `08-memory-and-privacy-workplan.md`,
- `10-pre-code-freeze-checklist.md`,
- generic handbook `07-tool-capability-and-adapter-model.md`,
- generic handbook `08-evidence-verification-and-confidence.md`.

## Çıkış kriteri

Bu workplan tamamlanmış sayılmaz; sadece tool/capability tasarım sırasını belirler.

Bir sonraki aşamada gerçek artifact dosyaları yazılmalıdır.

```yaml
tool_capability_workplan_state: created
live_provider_integration_allowed: false
mock_provider_design_required: true
first_required_artifact: capability-taxonomy.md
next_design_document: 08-memory-and-privacy-workplan.md
```
