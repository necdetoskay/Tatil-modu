# Privacy, Redaction and Sensitive Telemetry Policy

## Amaç
Observability sinyallerinin kullanıcı veya aile hakkında gereksiz kişisel/hassas bilgi taşımamasını sağlayacak tasarım sınırlarını tanımlar.

## Varsayılan yaklaşım
Telemetry için varsayılan davranış **minimum gerekli metadata** taşımaktır. Domain payload, prompt, memory içeriği veya kullanıcı cümlesi doğrudan telemetry değildir.

## Redaction sınıfları
```yaml
redaction_state:
  - none_required
  - identifiers_removed
  - content_redacted
  - sensitive_reference_only
  - dropped
```

## Raw olarak yazılmaması gereken örnekler
- kullanıcı adı, e-posta, telefon veya hesap kimliği
- çocukların kişisel tanımlayıcıları
- raw memory/profile içeriği
- mahremiyet tercihlerinin serbest metin açıklaması
- raw prompt veya konuşma gövdesi
- ödeme/rezervasyon detayları
- evidence kaynağında bulunan gereksiz kişisel veri

## Güvenli temsil
Sensitive içerik gerektiğinde:
```text
raw value yerine
→ policy/constraint type
→ reason code
→ artifact ref
→ sensitivity class
```
kullanılır.

## Kurallar
1. Correlation ID PII'den türetilmez.
2. Metrics label'larına kişisel veya yüksek-cardinality sensitive veri konulmaz.
3. Debug kolaylığı privacy sınırını geçersiz kılamaz.
4. Raw provider/tool cevabı logging'e otomatik taşınmaz.
5. Audit gereksinimi varsa canonical Audit Logger politikasıyla hizalanır; Observability kendi başına sensitive audit deposuna dönüşmez.
6. Redaction uygulanmışsa bu durum event envelope içinde görünür olur.
7. Sensitive telemetry gereksinimi açık gerekçe ve minimum veri ilkesiyle tasarlanır.
