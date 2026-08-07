# Tatil Modu — Architecture Freeze Required Artifact Inventory

**Doküman türü:** Freeze öncesi zorunlu artifact envanteri  
**Teknik kod adı:** `freeze_required_artifact_inventory`  
**Sürüm:** 1.1 Taslak  
**Architecture Review:** ARF-006, ARF-012

## Amaç

Bu doküman, mimari dokümanlarda referans verilen fakat henüz repo içinde canonical artifact olarak bulunmayan schema, fixture, registry ve test varlıklarını tek yerde takip eder.

ARF-006 kararı: Eksik artifact referansları görünmez bırakılmaz. Her referans ya mevcut dosyaya bağlanır ya da bu envanterde `required` olarak izlenir.

## Artifact durumları

```text
required
drafted
implemented
validated
deprecated
```

## Sahiplik kuralı

- Schema artifact'ları `packages/contracts` veya eşdeğer contract alanında uygulanmalıdır.
- Golden fixture artifact'ları `packages/evals` veya eşdeğer evaluation alanında uygulanmalıdır.
- Registry artifact'ları ilgili platform ownership alanında uygulanmalıdır.
- Dokümantasyon yalnızca artifact gereksinimini tanımlar; runtime implementasyon tamamlanmadan `implemented` statüsü verilemez.

## Zorunlu artifact listesi

| ID | Artifact | Tür | Sahip | Durum | Not |
|---|---|---|---|---|---|
| ARF6-001 | ACP Envelope Schema | JSON Schema | Agent Communication Protocol | required | Agent mesaj standardı |
| ARF6-002 | Universal Evidence Schema | JSON Schema | Data Source & Trust / Verification Facade | required | Tüm dış bilgi kanıt zinciri |
| ARF6-003 | Family Graph Schema | JSON Schema | Profile / Memory boundary | required | Kişi, aile ve ilişki yapısı |
| ARF6-004 | Trip Profile Schema | JSON Schema | Trip Profile Agent | drafted | Eski agent catalog içinde v1 çalışması var |
| ARF6-005 | Trip Plan Schema | JSON Schema | Adaptive Day Planner / Orchestrator | required | Plan ve alternatif çıktıları |
| ARF6-006 | Error Registry | Registry | Governance / Runtime | implemented | [`error-code-registry.md`](error-code-registry.md) |
| ARF6-007 | Prompt Registry Index | Registry | Knowledge Platform / Prompt Governance | required | Production prompt versiyonlama |
| ARF6-008 | Tool Capability Registry | Registry | Capability Platform | required | Tool discovery ve izin modeli |
| ARF6-009 | Verification Result Schema | JSON Schema | Verification Facade & Registry | required | Planner'a taşınan doğrulama sonucu |
| ARF6-010 | Travel Knowledge Store Entity Schema | JSON Schema | Travel Knowledge Store | required | Destination, POI, activity, accommodation |
| ARF6-011 | Golden Bursa Family Trip Fixture | Eval Fixture | Evaluation Platform | required | E2E referans senaryo |
| ARF6-012 | Mock Tool Interfaces | Contract/Test | Capability Platform | required | Online/offline/mock adapter ayrımı |
| ARF6-013 | Agent Test Harness Contract | Contract/Test | AI Engineering & Evaluation | required | Agent bağımsız test standardı |
| ARF6-014 | Architecture Freeze Checklist | Governance | Architecture Review | required | Freeze karar kapısı |
| ARF6-015 | Architecture Gap Register | Governance | Architecture Review | required | Blocker/high/medium takip |

## Freeze kapısı

Architecture Freeze öncesinde:

1. Her `required` artifact için dosya yolu belirlenmelidir.
2. Her dosya için owner belirlenmelidir.
3. Schema/registry/fixture artifact'ları CI veya review checklist içinde doğrulanmalıdır.
4. Eksik artifact'lar Architecture Freeze onayını bloke eder.
5. Artifact isimleri dokümanlarda farklı adlarla tekrar edilmemelidir.

## ARF-006 kararı

ARF-006 kapsamında eksik artifact'lar artık dağınık referans olarak bırakılmaz. Bu envanter freeze öncesi artifact backlog'unun canonical takip noktasıdır.

## ARF-012 kararı

ARF-012 kapsamında merkezi Error Registry artifact'ı [`error-code-registry.md`](error-code-registry.md) dosyasıyla oluşturulmuş ve `implemented` statüsüne alınmıştır.
