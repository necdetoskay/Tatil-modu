# Tool Execution Modes

## 1. Fixture Mode

Dış servis çağrısı yapılmaz.

Özellikler:

- aynı request fingerprint aynı fixture'ı döndürür,
- provider adı fixture provider olarak kaydedilir,
- maliyet sıfırdır,
- gerçek `ToolResult` şeması kullanılır,
- eksik fixture hata üretir.

Kullanım:

- unit test,
- contract test,
- behavioral test,
- regression test,
- model karşılaştırması.

## 2. Hybrid Mode

Bazı capability'ler fixture, bazıları live çalışır.

Kullanım:

- tek adapter entegrasyonu,
- belirli provider testi,
- kontrollü maliyet testi,
- cache/fallback testi.

Her capability'nin modu ayrı loglanır.

## 3. Live Mode

Gerçek provider çağrıları yapılır.

Zorunlu kontroller:

- secret mevcut,
- provider health uygun,
- rate limit yeterli,
- bütçe yeterli,
- kullanıcı consent kapsamı uygun,
- logging/redaction aktif.

## 4. Shadow Mode

İleride desteklenebilir.

Ana provider sonucu kullanıcıya giderken alternatif provider arka planda karşılaştırılır.

Amaç:

- kalite kıyaslama,
- provider migration,
- maliyet/latency benchmark.

Shadow sonucu kullanıcı kararını doğrudan değiştirmez.

## 5. Replay Mode

Kaydedilmiş normalize `ToolResult` olayları tekrar oynatılır.

Amaç:

- incident analizi,
- regresyon,
- orchestrator testleri,
- tarihsel plan yeniden üretimi.

Raw provider cevabı yerine mümkünse normalize ve lisans açısından saklanabilir kayıt kullanılır.
