# 03 — Quality Gate Hierarchy

**Doküman türü:** quality gate hierarchy  
**Durum:** drafted  
**Kodlama durumu:** kapalı

## Amaç

Bu dosya, Quality Engine değerlendirmesinde hangi gate'in hangi sırayla çalışacağını ve hangi gate'in final response readiness kararını durdurabileceğini tanımlar.

Bu dosya runtime gate implementation değildir.

## Ana karar

```yaml
quality_gate_hierarchy_state: drafted
runtime_gate_execution_allowed: false
scoring_code_allowed: false
source_of_truth: docs/19-quality-engine/03-quality-gate-hierarchy.md
```

## Gate sıralaması

```text
G0 Input completeness and contract validity
G1 Safety and hard constraint compliance
G2 Evidence and verification integrity
G3 Privacy-sensitive requirement handling
G4 Family suitability and fatigue safety
G5 Route, logistics and budget realism
G6 Day plan coherence and alternative quality
G7 Final response clarity and disclosure quality
G8 Regression and golden behavior protection
```

## Gate davranışı

```yaml
gate_behavior:
  G0:
    can_block: true
    reason: "contract invalid ise quality review güvenilir yapılamaz"
  G1:
    can_block: true
    reason: "hard constraint ihlali skorla telafi edilemez"
  G2:
    can_block: true
    reason: "kanıtsız kesin bilgi final fact olamaz"
  G3:
    can_block: true
    reason: "privacy-sensitive gereksinim görünmez uyarıya indirgenemez"
  G4:
    can_block: conditional
    reason: "çocuk güvenliği, aşırı yorgunluk veya öğle dinlenmesi ihlali varsa bloklanır"
  G5:
    can_block: conditional
    reason: "gerçekçi olmayan rota/bütçe planı kullanılabilirliği bozabilir"
  G6:
    can_block: conditional
    reason: "gün planı uygulanamazsa revizyon gerekir"
  G7:
    can_block: conditional
    reason: "cevap kullanıcıyı yanlış yönlendiriyorsa bloklanır"
  G8:
    can_block: true
    reason: "golden behavior güvenlik/regression sınırı bozulmuşsa kabul edilmez"
```

## Quality decision outcomes

```yaml
quality_decision_outcomes:
  pass:
    meaning: "final response verilebilir"
  pass_with_warnings:
    meaning: "final response verilebilir ama kullanıcıya uyarılar görünmelidir"
  needs_revision:
    meaning: "plan veya final response revize edilmelidir"
  blocked:
    meaning: "final response bu haliyle verilemez"
```

## Gate karar kuralı

```text
Alt gate'teki yüksek kalite, üst gate'teki blocker'ı telafi edemez.
```

Örnek:

```yaml
example:
  final_response_clarity: excellent
  evidence_integrity: failing
  outcome: blocked
  reason: "kanıtsız kesin bilgi güzel anlatımla telafi edilemez"
```

## Kapanış

Quality Gate Hierarchy, değerlendirme sırasını ve blocker önceliğini tanımlar; runtime gate engine değildir.
