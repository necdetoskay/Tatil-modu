# AG-002 — Destination Discovery Agent

Kullanıcının seyahat profiline göre uygun destinasyon veya alt bölge adaylarını bulur, eler, karşılaştırır ve gerekçeli bir kısa liste üretir.

Bu agent:

- kullanıcı sabit bir il vermediyse destinasyon adayları keşfeder,
- kullanıcı il verdiğinde il içindeki uygun alt bölgeleri karşılaştırır,
- erişilebilirlik, sezon, tatil türü, aile profili ve bütçe uyumunu değerlendirir,
- sonraki araştırma agentlarına yapılandırılmış aday listesi aktarır.

Bu agent otel, restoran, gezilecek yer veya günlük rota üretmez.

## Dosyalar

- `specification.md`
- `input.schema.json`
- `output.schema.json`
- `system-prompt.md`
- `decision-rules.md`
- `tool-policy.md`
- `handoff-contracts.md`
- `evaluation-rubric.md`
- `tests/fixtures/`
