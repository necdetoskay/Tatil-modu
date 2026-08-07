# Tatil Modu — Central Error Code Registry

**Doküman türü:** Merkezi hata kodu registry  
**Teknik kod adı:** `central_error_code_registry`  
**Sürüm:** 1.0 Taslak  
**Architecture Review:** ARF-012

## Amaç

Bu doküman, Tatil Modu içinde agent, platform, planner, capability, verification, trust, knowledge ve runtime katmanlarında kullanılacak hata kodlarının merkezi sözlüğünü tanımlar.

ARF-012 kararı: Hata kodları agent veya platform dokümanlarında dağınık biçimde tanımlanmaz. Her hata kodu bu registry içinde benzersiz prefix, sahip, kategori, severity ve kullanıcıya gösterim politikasıyla kayıt altına alınır.

## Hata kodu formatı

```text
<DOMAIN>-<CATEGORY>-<NUMBER>
```

Örnek:

```text
CAP-PERM-001
VER-CONFLICT-001
PLAN-CONSTRAINT-001
```

## Domain prefix sözlüğü

| Prefix | Domain | Sahip |
|---|---|---|
| `ORCH` | Orchestrator / Runtime | Orchestration & Runtime |
| `PLAN` | Planner / Plan decision | Domain Agents / Planners |
| `AGT` | Agent contract / execution | Agent SDK / Evaluation |
| `TI` | Travel Intelligence module | Travel Intelligence Modules |
| `TKS` | Travel Knowledge Store | Travel Knowledge Store |
| `DST` | Data Source & Trust | Data Source & Trust |
| `VER` | Verification Platform | Verification Facade & Registry |
| `CAP` | Capability Platform / Tool Gateway | Capability Platform |
| `MEM` | Memory / Profile boundary | Memory Platform |
| `POL` | Policy / Constraint | Policy Agent / Governance |
| `EVAL` | Evaluation / Fixture / Harness | AI Engineering & Evaluation |
| `CFG` | Configuration / Feature Flag | Configuration Platform |
| `SEC` | Security / Privacy | Security |
| `OBS` | Observability / Audit | Observability |

## Severity sözlüğü

| Severity | Anlam | Kullanıcı etkisi |
|---|---|---|
| `info` | İşlem devam edebilir, yalnız kayıt gerekir | Genellikle gösterilmez |
| `warning` | İşlem devam edebilir ama kalite veya güven düşer | Gerekirse açıklama olarak gösterilir |
| `recoverable` | Alternatif yol veya retry ile devam edilebilir | Kullanıcıya sade açıklama gösterilebilir |
| `blocking` | İşlem bu haliyle devam edemez | Kullanıcıdan aksiyon gerekebilir |
| `critical` | Güvenlik, veri bütünlüğü veya maliyet riski vardır | Teknik log + güvenli kullanıcı mesajı gerekir |

## Kullanıcıya gösterim politikası

| Alan | Kural |
|---|---|
| `user_safe_message` | Teknik ayrıntı sızdırmadan anlaşılır açıklama verir |
| `internal_message` | Log ve debug için teknik açıklama içerir |
| `retry_policy` | `none`, `safe_retry`, `backoff_retry`, `manual_review` değerlerinden biri olur |
| `evidence_required` | Dış veri veya claim hatalarında true olmalıdır |
| `audit_required` | Güvenlik, izin, maliyet ve veri bütünlüğü hatalarında true olmalıdır |

## Registry kayıt şeması

```yaml
code: CAP-PERM-001
domain: CAP
category: PERM
severity: blocking
owner: Capability Platform
user_safe_message: "Bu işlem için gerekli izin bulunamadı."
internal_message: "Capability invocation denied by permission policy."
retry_policy: none
evidence_required: false
audit_required: true
```

## Başlangıç hata kodları

| Code | Severity | Owner | Kullanım |
|---|---|---|---|
| `ORCH-RUN-001` | blocking | Orchestration & Runtime | Orchestrator run başlatılamadı |
| `ORCH-TIMEOUT-001` | recoverable | Orchestration & Runtime | Agent veya tool çağrısı zaman aşımına uğradı |
| `PLAN-CONSTRAINT-001` | blocking | Planner / Policy | Hard constraint ihlal edildi |
| `PLAN-INPUT-001` | recoverable | Planner / Orchestrator | Plan üretimi için gerekli kullanıcı girdisi eksik |
| `AGT-CONTRACT-001` | blocking | Agent SDK / Evaluation | Agent output schema contract ile uyumsuz |
| `TI-ASSESS-001` | warning | Travel Intelligence Modules | Domain assessment düşük güvenle üretildi |
| `TKS-MISS-001` | recoverable | Travel Knowledge Store | Gerekli destination/POI kaydı bulunamadı |
| `DST-SOURCE-001` | warning | Data Source & Trust | Kaynak otoritesi düşük veya yetersiz |
| `DST-CONFLICT-001` | recoverable | Data Source & Trust | Birden fazla kaynak çelişkili veri verdi |
| `VER-CLAIM-001` | recoverable | Verification Platform | Claim doğrulanamadı veya uncertain kaldı |
| `VER-STALE-001` | warning | Verification Platform | Verification snapshot güncel değil |
| `CAP-PERM-001` | blocking | Capability Platform | Tool/capability çağrısı izin politikası nedeniyle engellendi |
| `CAP-RATE-001` | recoverable | Capability Platform | Provider rate limit veya quota sınırına ulaşıldı |
| `CAP-PROVIDER-001` | recoverable | Capability Platform | Provider geçici hata döndürdü |
| `MEM-PRIVACY-001` | blocking | Memory Platform | Amaç dışı veya yetkisiz memory erişimi engellendi |
| `POL-HARD-001` | blocking | Policy Agent / Governance | Hard policy ihlali tespit edildi |
| `EVAL-FIXTURE-001` | blocking | AI Engineering & Evaluation | Fixture eksik veya schema ile uyumsuz |
| `CFG-FLAG-001` | warning | Configuration Platform | Feature flag beklenmeyen durumda |
| `SEC-PII-001` | critical | Security | PII sızıntısı veya yetkisiz disclosure riski |
| `OBS-AUDIT-001` | warning | Observability | Audit event kaydı üretilemedi |

## Kurallar

1. Yeni hata kodu bu registry dışında tanımlanamaz.
2. Aynı hata kodu iki farklı anlamda kullanılamaz.
3. Provider-specific hata mesajları kullanıcıya doğrudan gösterilemez.
4. Capability Platform provider hatalarını merkezi registry kodlarına map eder.
5. Verification ve Data Source & Trust hataları Universal Evidence Model referansı taşımalıdır.
6. `critical` severity her zaman audit gerektirir.
7. Runtime contract'larında yalnız `code` taşımak yeterli değildir; owner, severity ve kullanıcıya gösterim politikası registry'den çözümlenir.

## ARF-012 kararı

ARF-012 kapsamında merkezi hata kodu registry oluşturulmuştur. Bu dosya, Architecture Freeze öncesi hata kodu ownership ve naming kararlarının canonical takip noktasıdır.
