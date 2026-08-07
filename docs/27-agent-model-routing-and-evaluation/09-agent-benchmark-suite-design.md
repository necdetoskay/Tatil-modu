# Agent Benchmark Suite Design

## Amaç
Her agent için model seçimini genel sohbet benchmark'larıyla değil, Tatil Modu'na özgü görevlerle ölçmek.

## Benchmark unit
Her benchmark case şu yapıya sahiptir:
```yaml
case_id: stable
agent_id: required
input_fixture: required
capability_fixture_set: optional
memory_fixture: optional
expected_invariants: []
forbidden_behaviors: []
severity: P0|P1|P2
```

## Agent suite minimumları
### Trip Intake
- açık istek
- eksik tarih/bütçe
- çelişkili bilgi
- hard constraint çıkarımı
- gereksiz varsayım yapmama

### Constraint & Policy-facing behavior
- hard/soft ayrımı
- kullanıcı önceliği
- privacy constraint preservation

### Family Suitability
- toddler + school-age children
- fatigue/pacing
- yaşa uygunsuz aktivite
- unknown accessibility

### Destination Candidate
- çeşitlilik
- radius kuralı
- uzak ama exceptional-value case
- evidence gap

### Route & Logistics
- route/load interpretation
- parking unknown
- traffic uncertainty
- impossible sequence

### Accommodation / Activity Fit
- budget/family/privacy/evidence trade-offs

### Day Plan Composer
- multi-day pacing
- alternatives
- lunch/rest block
- coherent geography
- constraint conflicts

### Verification & Evidence
- stale source
- contradiction
- unsupported claim
- insufficient evidence

### Final Response Composer
- no new facts
- all warnings preserved
- structured plan completeness

## Deterministic vs model benchmark
Aynı case önce fake/scripted model ile agent implementation testinde, sonra gerçek candidate model ile L8 benchmark'ta kullanılabilir.

## Minimum coverage
Her agent:
- en az 10 representative case
- tüm P0 failure modes
- en az 3 edge/adversarial case
- en az 1 capability failure case when tool-aware
- en az 1 memory conflict case when memory-aware

Gerçek sayı agent karmaşıklığına göre artırılır.
