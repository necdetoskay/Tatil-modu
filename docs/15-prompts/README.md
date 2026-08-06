# Prompt Kataloğu

| Alan | Değer |
|---|---|
| Document ID | PROMPT-000 |
| Sürüm | 0.1 (Plan) |
| Durum | Planlandı |
| EOS Sürümü | EOS v1.0 |
| Son Güncelleme | 2026-08-06 |

## Amaç

Promptları doğrudan uzun metinler halinde yazmamak; **katmanlara ayırmak** ve sürümlendirmek.

## Katmanlar

| Katman | Açıklama |
|--------|----------|
| Universal System Rules | Tüm agentlar için ortak kurallar |
| Agent Role Prompt | Agent rol tanımı |
| Task-Specific Instruction | Göreve özel talimat |
| Output Schema | Çıktı şeması |
| Quality Control | Çıktı kontrol |

## Sürümleme

```
trip-profile-agent-prompt-v1.0.0
trip-profile-agent-prompt-v1.1.0
```

## İlgili Dokümanlar

- [Trip Profile Agent System Prompt](../02-agents/trip-profile-agent/system-prompt.md) — örnek composable prompt (5 katman)
