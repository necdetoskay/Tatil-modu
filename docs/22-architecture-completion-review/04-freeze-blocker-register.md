# Freeze Blocker Register

## Amaç
Pre-code freeze öncesinde açık kalan blocker'ları tek yerde tutar.

## Blocker'lar

### ACR-BLK-001 — Canonical Product / UX Deep Design eksik
**Durum:** open  
**Şiddet:** blocking  
**Neden:** Ürün vizyonu mevcut olsa da kullanıcı yolculukları, karar akışları, warning/evidence gösterimi, plan revizyonu, memory consent ve final plan presentation için ayrı canonical deep-design seti yok.

**Kapanış koşulu:** Yeni canonical Product/UX design alanı oluşturulmalı ve completion checklist ile kapatılmalı.

### ACR-BLK-002 — Pre-Code Freeze checklist canonical replacement mapping ile yeniden değerlendirilmedi
**Durum:** open  
**Şiddet:** blocking  
**Neden:** `docs/09-pre-implementation-design/10-pre-code-freeze-checklist.md` eski required path'leri ve eski `not_ready/partial` durumlarını içeriyor; oysa requirement'ların çoğu `11–21` altında canonical olarak yeniden tasarlandı.

**Kapanış koşulu:** Eski checklist yeni source-of-truth haritasına göre reconcile edilmeli; her gate için `ready/not_ready` kararı kanıtlı şekilde güncellenmeli.

## Blocker olmayan bulgular
- Agent / Orchestrator ownership collision bulunmadı.
- Verification / Quality ownership collision bulunmadı.
- Observability / Audit Logger ayrımı korunuyor.
- Hard constraint precedence korunuyor.
- Runtime implementation hâlâ kapalı.

## Current decision
```yaml
open_blocker_count: 2
pre_code_freeze_ready: false
implementation_allowed: false
```
