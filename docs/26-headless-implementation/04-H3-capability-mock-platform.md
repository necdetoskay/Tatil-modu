# H3 — Capability & Mock Provider Platform

**Durum:** planned  
**Requires:** H2 relevant core PASS  
**Primary gate:** L2 Capability

## Amaç
Agent'ların provider detaylarını bilmeden capability çağırabildiği ve bütün davranışların deterministic mock'larla test edilebildiği platformu kurmak.

## Capability families
İlk implementation canonical tool design ile hizalanarak en az şu aileleri destekleyecek:
- place/destination discovery
- route/distance/travel-time lookup
- weather/forecast lookup
- accommodation lookup
- activity/POI lookup
- opening-hours/availability facts
- pricing facts
- parking/accessibility facts
- beach/facility attributes
- source/evidence retrieval

## Boundary
```text
Agent → Capability interface → Gateway → Provider adapter
```
Agent provider ismi, endpoint, auth veya retry implementasyonu bilmez.

## Gateway responsibilities
- capability authorization
- request validation
- provider selection
- timeout
- retry policy hook
- normalized errors
- evidence envelope
- trace propagation
- metrics hooks

## Mock provider design
Mock sonuçları fixture ID ile çağrılır ve şu özelliklere sahiptir:
```yaml
fixture_id: stable
clock: fixed
seed: fixed
latency: simulated
response: deterministic
fault_mode: optional
```

## Fault injection catalog
- timeout
- rate limit
- provider unavailable
- malformed payload
- partial payload
- stale data
- contradictory sources
- missing evidence
- empty result

## Network rule
Deterministic L0–L7 suite varsayılan olarak gerçek network'e çıkamaz. Test sırasında beklenmeyen network erişimi P0 ihlalidir.

## Evidence rule
Provider sonucu doğrudan fact değildir. Gateway normalized evidence metadata üretir; verification katmanı daha sonra claim değerlendirmesi yapar.

## Tests
- interface conformance
- provider isolation
- deterministic replay
- timeout/error normalization
- evidence propagation
- trace propagation
- forbidden direct provider import
- fault injection
- no-network guard

## Definition of Done
```yaml
capability_L2: PASS
mock_provider_coverage: required_capabilities_complete
fault_modes_executable: true
agent_direct_provider_access: 0
unexpected_network_access: 0
p0_failures: 0
```
