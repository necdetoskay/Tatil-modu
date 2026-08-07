# Tatil Modu — JSON Schema Library

**Sürüm:** 1.1.0
**Şema standardı:** JSON Schema Draft 2020-12

## Amaç

Bu kütüphane, Tatil Modu içindeki agent ve platform mesajlarının makine tarafından doğrulanmasını sağlar.

## Çekirdek Şemalar

- ACP Envelope
- Common Agent Response
- Universal Evidence
- Family Graph
- Preference Package
- Constraint Package
- Trip Plan
- Budget Policy

## Domain Şemaları

- Activity Candidate
- Hotel Candidate
- Route Plan
- Environmental Impact
- Public Authority Notice
- Memory Record
- Verification Claim
- Optimization Result
- Evaluation Result

## Kurallar

- Üretim mesajları şema doğrulamasından geçmeden işlenmez.
- `additionalProperties: false` varsayılan güvenlik tercihidir.
- Major şema sürümü değişikliklerinde adapter gerekir.
- Fixture ve örnekler CI içinde validate edilmelidir.
- Hassas veri alanları disclosure policy ile ayrıca sınırlandırılmalıdır.
- Her şemanın `$id` alanı sabit ve sürümlenebilir olmalıdır.
