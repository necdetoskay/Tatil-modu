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
│  ORCHESTRATOR (proje müdürü)                         │
│  — Görev dağıtır, sonuçları birleştirir,            │
│    çakışmaları çözer, nihai planı üretir            │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
  [02] Trip    [03] Dest.  [05] Accom-
  Profile     Research    modation
  Agent        Agent       Agent
        │         │         │
        └─────────┼─────────┘
                  │
                  ▼
  [08] Route/Scheduler  ← [04] Place/Exp + [06] Food
        │                     ↑
        ▼                     │
  [09] Budget              [07] Review
        │                     │
        └─────────┬───────────┘
                  │
                  ▼
        [10] Quality Reviewer
                  │
                  ▼
        [01] Orchestrator → Final Plan
```

## Kodlama ve Belge İlkeleri

1. **Documentation First**: Kod, belgenlenmeden başlamaz (GOV-003, İlke 1).
2. **Agent Contract Before Code**: Her agent spec, schema ve test matrisi olmadan kodlanmaz.
3. **Documentation First**: Specification → System Prompt → Decision Rules → Test Fixtures → Test Matrix. Kod son.
4. Kısa yollar yok: "acaba bu agent ne yapacaktı?" sorusuna kod içinde değil, spec'de cevap bulunur.

## Documentation Structure

```
docs/
├── 00-governance/          ← EOS adoption, engineering principles, ADR'ler
├── 10-product/             ← Vision, scope, user journey
├── 11-architecture/        ← Agent spec template, agent catalog
├── 12-testing/             ← Agent Testing & Evaluation Standard (TST-001)
├── 13-agents/
│   ├── 02-trip-profile/    ← ✅ İlk detaylı agent
│   └── ...
├── 14-tools/               ← Tool catalog
├── 15-prompts/             ← Prompt catalog
└── 16-workflows/           ← Workflow catalog
```

## Agent Geliştirme Sırası

1. **Trip Profile Agent** — ✅ Tamamlandı (AGENT-002)
2. **Destination Research Agent** — Sıradaki
3. **Place & Experience Agent**
4. **Accommodation Agent**
5. **Food & Culture Agent**
6. **Review Intelligence Agent**
7. **Route & Schedule Optimizer**
8. **Budget & Constraint Evaluator**
9. **Quality Reviewer**
10. **Orchestrator** — En son (tüm contract'lar netleştiğinde)

## Verification

- Her agent için: `contract.test.ts`, `behavioral.test.ts`, `scenario.test.ts`, `adversarial.test.ts`
- Triple evaluation: Schema Validator + Rule Evaluator + LLM Reviewer
- `pnpm test` — tüm fixture-mode testler (kanoniktir)
- `pnpm test -- --live` — live mode integration testleri (canlı DB/güncel veri için)

## Local Contracts

- Proje EOS v1.0'ı referans alır (ör: Akıllı Alışveriş Asistanı ADR-0001).
- Agent testleri deterministiktir; LLM çıktıları rubric tablı kıyaslanır, metin eşleştirme değil.
- Gizli anahtarlar asla repository'ye yazılmaz.
