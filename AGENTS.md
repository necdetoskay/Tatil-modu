# AGENTS.md — Tatil-Plan

## Purpose

Tatil-Plan, mobil bir tatil planlama uygulaması değildir. Gerçek ürün, arkada çalışan **uzman ajanların (agent) oluşturduğu karar mekanizmasıdır.**

Bu repository, belge-first, test-deterministic, composable-prompt mimarisiyle tasarlanan bir **agent sistemidir.**

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  MOBILE APP (vitrin)                                 │
│  — Planı gösterir, kullanıcı girdi alır             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  ORCHESTRATOR (AG-012)                                │
│  — Görev dağıtır, sonuçları birleştirir,            │
│    çakışmaları çözer, nihai planı üretir            │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
  [AG-001] Trip  [AG-002] Dest.  [AG-004] Accom-
  Profile         Research    dation
  Agent           Agent       Agent
        │         │         │
        └─────────┼─────────┘
                  │
                  ▼
  [AG-008] Route & Schedule  ← [AG-003] Places  + [AG-006] Food
  Optimizer                    & Experiences      & Local Taste
        │                     ↑
        ▼                     │
  [AG-009] Budget            [AG-006] Review
  & Constraint               Intelligence
  Evaluator                  Agent
        │                     │
        └─────────┬───────────┘
                  │
                  ▼
        [AG-010] Verification & Quality Reviewer
                  │
                  ▼
        [AG-011] Final Plan Composer
                  │
                  ▼
        [AG-012] Orchestrator → Final Travel Plan
```

## Documentation Structure

```
docs/
├── 00-governance/          ← EOS adoption, engineering principles, ADR'ler, glossary, karar logu
├── 01-architecture/        ← Sistem overview, handoff contract standard, data source trust policy
├── 02-agents/              ← Agent kataloğu + her agent için klasör (spec, schema, prompt, rules, tests)
│   ├── agent-catalog.md    ← 12 agent katalogu (AG-001 ~ AG-012)
│   └── trip-profile-agent/ ← ✅ İlk tam agent (AG-001)
├── 03-testing/             ← Agent Testing & Evaluation Standard (TST-001)
├── 04-tools/               ← Tool catalog (14 tool sınıfı: TL-001 ~ TL-014)
├── 10-product/             ← Ürün vizyonu ve kapsam (PRD-001)
├── 11-architecture/        ← Agent specification template (ARCH-001)
├── 15-prompts/             ← Prompt catalog (composable katmanlar)
└── 16-workflows/           ← Workflow catalog (agent iş akışları)
```

## Agent Geliştirme Sırası

1. **Trip Profile Agent** — ✅ Tamamlandı (AG-001)
2. **Destination Discovery Agent** — Sıradaki (AG-002)
3. **Places & Experiences Agent** (AG-003)
4. **Accommodation Agent** (AG-004)
5. **Food & Local Taste Agent** (AG-006)
6. **Review Intelligence Agent** (AG-005)
7. **Route & Schedule Optimizer** (AG-008)
8. **Budget & Constraint Evaluator** (AG-009)
9. **Verification & Quality Reviewer** (AG-010)
10. **Final Plan Composer** (AG-011)
11. **Orchestrator** — En son (AG-012, tüm contract'lar netleştiğinde)

## Verification

- Her agent için: `contract.test.ts`, `behavioral.test.ts`, `scenario.test.ts`, `adversarial.test.ts`
- Triple evaluation: Schema Validator + Rule Evaluator + LLM Reviewer
- `pnpm test` — tüm fixture-mode testler (kanoniktir)
- `pnpm test -- --live` — live mode integration testleri

## Local Contracts

- Proje EOS v1.0'ı referans alır (ADR-0001).
- Agent testleri deterministiktir; LLM çıktıları rubric tablı kıyaslanır.
- Gizli anahtarlar asla repository'ye yazılmaz.
- Trip Profile Agent dış tool kullanmaz — tamamen fixture-mode test uyumlu.

## İlk Teslimat (Tamamlandı)

`docs/02-agents/trip-profile-agent/`:
- `specification.md` — 16 başlık ARCH-001 template'i
- `system-prompt.md` — Composable prompt (5 katman)
- `decision-rules.md` — Deterministic rule engine (R-01 ~ R-06)
- `input.schema.json` / `output.schema.json` — JSON Schema
- `tool-policy.md` — Tool kullanımı (hiçbiri)
- `handoff-contracts.md` — 5 consumer agent için contract
- `evaluation-rubric.md` — Test rubrikleri
- `tests/` — 15 fixture (TPA-001~TPA-015), 4 test dosyası, README
