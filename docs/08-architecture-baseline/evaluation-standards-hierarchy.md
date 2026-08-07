# Tatil Modu — Evaluation Standards Hierarchy

**Document ID:** ARF-017-EVALUATION-STANDARDS-HIERARCHY  
**Component type:** `registry`  
**Canonical status:** `canonical_draft`  
**Owner:** Evaluation Platform / AI Engineering  
**Architecture Review:** ARF-017  
**Depends on:** Architecture Dependency Index, Lifecycle / Status Vocabulary, Confidence Ownership, Error Code Registry  
**Related artifacts:** Golden Bursa Family Trip Fixture, Agent Test Harness Contract, Universal Evidence Schema, ACP Envelope Schema

## Amaç

Bu doküman, Tatil Modu içinde evaluation, test, quality gate, fixture ve scorecard standartlarının hangi hiyerarşiyle uygulanacağını tanımlar.

ARF-017 problemi: Evaluation standartları farklı belgelerde dağınık geçerse aynı test sonucu farklı katmanlarda farklı anlamlara gelebilir. Bu nedenle evaluation standardı tek hiyerarşi ve reconciliation kuralına bağlanır.

## Canonical hiyerarşi

Evaluation kararlarında aşağıdaki sıra kullanılır:

| Sıra | Katman | Sahip | Amaç |
|---|---|---|---|
| 1 | Safety / Policy Gate | Security / Policy | Güvenlik, gizlilik, yasal ve çocuk/family safety engelleri |
| 2 | Contract Validation | ACP / Schema Library | Input/output schema, required fields ve version compatibility |
| 3 | Hard Constraint Compliance | Policy / Constraint Layer | Kadınlar plajı, bütçe limiti, yaş uygunluğu, resmi kural gibi gevşetilemez koşullar |
| 4 | Evidence & Verification Quality | Data Source & Trust / Verification Platform | Kaynak, freshness, confidence, conflict ve verification status |
| 5 | Domain Quality Rubric | Travel Intelligence / Domain Agents | Aile uygunluğu, rota yükü, park, trafik, deneyim kalitesi, alternatif zenginliği |
| 6 | Plan Coherence & Usability | Planner / Final Plan Composer | Gün akışı, uygulanabilirlik, açıklanabilirlik, trade-off ve kullanıcı dili |
| 7 | Cost / Latency / Runtime Quality | Runtime / Capability Platform | Tool maliyeti, latency, retry davranışı, cache kullanımı |
| 8 | Regression / Golden Fixture | Evaluation Platform | Önceki kabul edilmiş çıktılara karşı gerileme kontrolü |

## Reconciliation kuralı

Evaluation sonuçları çelişirse daha üst sıradaki gate daha önceliklidir.

Örnekler:

- Plan çok kaliteli görünse bile hard constraint ihlali varsa başarısızdır.
- Kaynak doğrulaması zayıfsa domain kalite skoru final kabul için yeterli değildir.
- Golden fixture sonucu başarılı olsa bile yeni safety/policy ihlali varsa fixture sonucu override edilir.
- Düşük latency, yanlış veya doğrulanmamış planı kabul ettirmez.

## Evaluation result alanları

Yeni evaluation kayıtları mümkün olduğunda şu alanları taşımalıdır:

```yaml
evaluation_id: string
evaluation_layer: safety_policy | contract | hard_constraint | evidence_verification | domain_quality | plan_coherence | runtime_quality | regression_fixture
subject_type: agent | planner | module | platform | contract | fixture | plan
subject_id: string
result_status: passed | failed | warning | skipped | blocked
severity: info | warning | error | critical
confidence_ref: string | null
evidence_refs: []
error_codes: []
blocking: boolean
explanation: string
created_at: datetime
```

## Score kullanım kuralı

Numerik score tek başına pass/fail anlamına gelmez.

- `score` yalnız kendi rubric bağlamında anlamlıdır.
- `blocking=true` olan failure score ile telafi edilemez.
- Hard constraint ve safety gate score tabanlı optimize edilmez.
- Score, confidence ve verification status farklı kavramlardır.

## Golden fixture ilişkisi

Golden fixture, sistemin beklenen davranışını sabitleyen regression aracıdır; product truth veya kullanıcı truth değildir.

Golden fixture güncellenebilir fakat yalnız şu durumlarda:

1. ARF veya ADR ile canonical karar değişmişse,
2. schema/contract versiyonu değişmişse,
3. dış dünya bilgisi fixture içinde bilerek snapshot olarak yenilenmişse,
4. önceki fixture hatalı kabul edilmişse.

Fixture güncellemesi explanation ve reviewer onayı taşır.

## Agent bağımsız test kuralı

Her agent/planner/module bağımsız test edilebilir olmalıdır.

- Başka agent çalıştırmak zorunlu olmamalıdır.
- Gerekli input fixture olarak verilebilmelidir.
- Tool çağrıları mock adapter ile değiştirilebilmelidir.
- Output contract validation ayrı bir gate olarak çalışmalıdır.

## ARF-017 kararı

Evaluation standardı tek bir score sistemi değildir. Safety, contract, hard constraint, evidence, domain quality, coherence, runtime ve regression katmanlarından oluşan hiyerarşik gate sistemidir.

Architecture Freeze sonrası tüm agent, planner, module, contract ve fixture testleri bu hiyerarşiye bağlanmalıdır.
