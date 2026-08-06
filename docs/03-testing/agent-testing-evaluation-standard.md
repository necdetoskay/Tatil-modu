# Agent Testing & Evaluation Standard

## Amaç

Tatil Modu agentlarının bağımsız, ölçülebilir, sürümlenebilir ve tekrarlanabilir biçimde test edilmesini sağlar.

## Temel ilke

Bir agent başka agentlardan veri alsa bile test sırasında bu agentlar çalıştırılmaz. Beklenen girdiler fixture JSON olarak verilir.

## Test modları

### Fixture Mode
Web, harita, hava durumu veya başka agent kullanılmaz. Unit, davranış, prompt, regresyon ve model karşılaştırma testleri için kullanılır.

### Live Tool Mode
Gerçek servisler kullanılır. Entegrasyon, güncellik, tool seçimi ve fallback davranışı ölçülür.

### Hybrid Mode
Bazı girdiler fixture, bazıları canlı servislerden gelir.

## Zorunlu dosyalar

```text
agents/agent-name/
  specification.md
  input.schema.json
  output.schema.json
  system-prompt.md
  decision-rules.md
  tool-policy.md
  handoff-contracts.md
  evaluation-rubric.md
  tests/
```

## Test seviyeleri

- Schema Test
- Contract Test
- Behavioral Test
- Decision Rule Test
- Scenario Test
- Adversarial Test
- Regression Test
- Live Integration Test

## Değerlendirme

1. Deterministic Validator
2. Rule Evaluator
3. LLM Reviewer

LLM Reviewer tek başına geçme/kalma kararı veremez.

## Puanlama

```text
Schema ve contract: %25
Kesin iş kuralları: %30
Senaryo başarısı: %20
LLM reviewer: %15
Maliyet ve performans: %10
```

## Geçme kriterleri

- Schema testleri %100 geçmeli.
- Kritik iş kuralı hatası olmamalı.
- Genel skor en az 0,85 olmalı.
- Kritik testlerden biri başarısızsa agent başarısız sayılmalı.
- Kaynaksız kesin bilgi üretilmemeli.
- Handoff sözleşmeleri bozulmamalı.

## Confidence

Confidence şu faktörlerden hesaplanır:

- veri tamlığı,
- açık bilgi oranı,
- çelişki,
- doğrulama hatası,
- varsayım miktarı,
- kaynak güvenilirliği,
- güncellik.

## Prompt sürümleme

Örnek:

```text
trip-profile-agent-prompt-v1.0.0
trip-profile-agent-prompt-v1.1.0
trip-profile-agent-prompt-v2.0.0
```

Her değişiklikte regresyon testleri yeniden çalıştırılır.

## Yayın kapısı

Bir agent ancak kritik testleri geçmiş, handoff sözleşmeleri doğrulanmış, en az bir canlı entegrasyon testi yapılmış ve maliyet sınırları doğrulanmışsa üretime alınabilir.
