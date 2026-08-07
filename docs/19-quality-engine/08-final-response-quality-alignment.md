# 08 — Final Response Quality Alignment

**Doküman türü:** final response quality alignment  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu dosya, Quality Engine değerlendirmesinin final response ile nasıl hizalanacağını tanımlar.

Final response, yalnızca güzel bir metin değildir.

Final response, contract, evidence, policy, family suitability ve workflow kararlarını kullanıcıya doğru şekilde taşıyan son görünür katmandır.

## Alignment hedefleri

```yaml
final_response_alignment_targets:
  honesty:
    meaning: "kanıtlanmamış bilgi kesin gerçek gibi yazılmaz"
  usability:
    meaning: "kullanıcı planı doğrudan anlayıp uygulayabilir"
  constraint_visibility:
    meaning: "hard constraint ve privacy-sensitive konular görünürdür"
  family_context:
    meaning: "çocuk yaşları, dinlenme ve tempo açıkça yansır"
  alternative_clarity:
    meaning: "alternatifler gerçek seçenek olarak ayrışır"
  evidence_disclosure:
    meaning: "kontrol edilmesi gereken fiyat/saat/hava/otopark gibi bilgiler belirtilir"
  next_step_clarity:
    meaning: "kullanıcı neyi doğrulamalı veya seçmeli bilir"
```

## Final response kalite bandları

```yaml
score_bands:
  excellent:
    criteria:
      - "net, dürüst, uygulanabilir"
      - "aile ve privacy bağlamını doğru taşır"
      - "belirsizlikleri saklamaz"
      - "2-3 alternatifleri okunabilir verir"
  good:
    criteria:
      - "kullanılabilir, küçük açıklık eksikleri var"
  acceptable_with_warnings:
    criteria:
      - "cevap verilebilir ama bazı riskler kullanıcıya görünür olmalı"
  weak:
    criteria:
      - "plan var ama belirsizlik ve aksiyon netliği zayıf"
  failing:
    criteria:
      - "kanıtsız kesin iddia"
      - "hard constraint görünmez"
      - "privacy-sensitive gereksinim saklanır"
      - "çocuklu aile bağlamı yok sayılır"
```

## Final response failure örnekleri

```yaml
failure_examples:
  overconfident_claim:
    example: "Otel fiyatı kesin veriliyor ama evidence yok"
    decision: blocker_if_fact
  hidden_privacy_requirement:
    example: "deniz önerisi var ama kadınlar plajı şartı görünmüyor"
    decision: hard_blocker
  no_family_rationale:
    example: "2 ve 6 yaş çocuklar için neden uygun olduğu açıklanmıyor"
    decision: weak_or_needs_revision
  no_alternatives:
    example: "kullanıcı alternatif istemiş ama tek plan verilmiş"
    decision: needs_revision
```

## Alignment kontrol listesi

```yaml
final_response_alignment_checklist:
  hard_constraints_visible: required
  evidence_gaps_visible: required_when_present
  confidence_language_matched: required
  family_rest_context_visible: required
  privacy_sensitive_context_visible: required_when_present
  route_parking_traffic_cautions_visible: required_when_present
  alternatives_clear: required
  next_steps_clear: preferred
```

## Kapanış

Bu dosya, Quality Engine'in final response ile nasıl hizalanacağını tanımlar; final response generator implementation değildir.
