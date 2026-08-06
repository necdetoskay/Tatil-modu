# Trip Profile Agent — Tool Policy

| Alan | Değer |
|---|---|
| Document ID | AGENT-002-TP |
| Sürüm | 1.0 |
| Durum | Onay Bekliyor |
| Bağımlılıklar | AGENT-002 |
| Son Güncelleme | 2026-08-06 |

## Amaç

Trip Profile Agent'ın kullandığı tool'ları, kotaları ve fallback davranışlarını tanımlar.

## Tool Kullanımı

Trip Profile Agent **hiçbir dış tool'u kullanmaz.** Kararları tamamen:

1. **LLM inference** (system-prompt.md)
2. **Deterministic rule validation** (decision-rules.md)

ile yapılır.

Bu tasarım, agent'ın **tamamen fixture-mode test edilebilir** olmasını sağlar. Trip Profile Agent'ın doğru çalışabilmesi için hiçbir harici servis gerektirmez.

## Fallback Stratejileri

| Durum | Fallback |
|-------|----------|
| LLM hatası / timeout | Keyword-based extraction: regex ile `budget`, `child age`, `vehicle type` çıkar |
| Girdi çok kısa | `missingInformation` doldur, confidence = 0.0 |
| Geçersiz enum | `validationErrors` ekle, enum'ı `any` veya default'a çevir |
| Çelişkili girdi | `conflicts` ekle, confidence düşür |

## Tool Kotaları

| Tool | Kullanım | Kotası | Maliyet |
|------|----------|-------|---------|
| (hiçbiri) | Trip Profile Agent dış tool kullanmaz | N/A | $0 |

## Canlı Mod Gereksinimi

Yoktur. Trip Profile Agent, her zaman **fixture mode** ile test edilir. Canlı mod, downstream agentların (Destination, Accommodation, vb.) testlerinde kullanılır.

## Versiyonlama

| Sürüm | Tarih | Değişiklik |
|-------|-------|-----------|
| v1.0 | 2026-08-06 | İlk sürüm — tool yok |
