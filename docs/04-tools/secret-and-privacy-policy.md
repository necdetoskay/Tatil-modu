# Tool Secret & Privacy Policy

## 1. Amaç

Capability Platform, provider adapterları ve tool çağrılarında gizli bilgilerin ve kullanıcı verilerinin güvenli işlenmesini tanımlar.

## 2. Secret sınıfları

```text
api_key
oauth_client_secret
oauth_access_token
refresh_token
service_account
session_cookie
webhook_secret
database_credential
encryption_key
```

## 3. Secret saklama

Secret değerleri:

- repository'ye yazılamaz,
- fixture dosyalarına konulamaz,
- loglanamaz,
- ToolRequest içine düz metin olarak eklenemez,
- kullanıcıya döndürülemez.

Runtime yalnız secret reference kullanır:

```json
{
  "secretRef": "secret://providers/maps/production"
}
```

## 4. Secret erişimi

Erişim en az yetki ilkesiyle verilir.

```text
provider adapter
→ yalnız kendi provider secret'ı
```

Agentlar secret okuyamaz.

Orchestrator secret okuyamaz.

## 5. Veri sınıfları

| Sınıf | Örnek |
|---|---|
| `public` | resmî sayfa, place metadata |
| `user_context` | şehir, tercihler, seyahat grubu |
| `sensitive` | hassas konum, sağlık/erişilebilirlik ihtiyacı |
| `restricted` | hesap tokenı, ödeme/rezervasyon verisi |

## 6. Veri minimizasyonu

Provider'a yalnız capability için gerekli alanlar gönderilir.

Örnek:

Directions capability için kullanıcının adı veya çocukların isimleri gönderilmez.

## 7. Consent

Aşağıdakiler açık consent gerektirebilir:

- canlı hassas konum,
- kişisel takvim,
- üçüncü taraf hesap bağlantısı,
- rezervasyon geçmişi,
- kişiselleştirilmiş davranış geçmişi.

## 8. Log redaction

Redact edilmesi gerekenler:

- secret değerleri,
- authorization header,
- cookie,
- email/telefon,
- hassas koordinat gerektiğinde,
- serbest metindeki kişisel veriler.

## 9. Raw response

Raw provider cevabı yalnız:

- lisans izin veriyorsa,
- güvenlik amacıyla gerekliyse,
- retention sınıfı belirlenmişse,
- encryption at rest uygulanıyorsa

saklanabilir.

## 10. Yorum verisi

Review author kimliği gereksizse saklanmaz.

Tercih edilen temsil:

```text
provider review ID
author hash
verification flag
```

## 11. Silme ve retention

Kayıtlar retention class taşır:

```text
ephemeral
short_term
operational
audit
restricted
```

Silme isteği lineage üzerinden ilgili derived evidence kayıtlarına kadar izlenebilmelidir.

## 12. Güvenlik olayları

- secret exposure,
- unauthorized provider access,
- consent violation,
- PII log leakage,
- excessive data transfer

kritik incident olarak sınıflandırılır.

## 13. Testler

- secret pattern scan,
- log redaction,
- consent enforcement,
- data minimization,
- retention expiry,
- deletion propagation,
- fixture secret leakage.
