# Tatil Modu — Verification Platform Teknik Tasarımı

**Doküman türü:** Platform teknik tasarımı
**Teknik kod adı:** `verification_platform`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Verification Platform, sistemde kullanılan dış bilgilerin kaynağını, güncelliğini, tutarlılığını ve plan bağlamına uygunluğunu doğrular.

## 2. Pipeline

```text
Raw Claim
  ↓
Normalizer
  ↓
Source Verification
  ↓
Cross-Source Comparison
  ↓
Conflict Detection
  ↓
Confidence Calculation
  ↓
Verification Decision
```

## 3. Doğrulama Seviyeleri

- `verified`
- `likely`
- `uncertain`
- `rejected`

## 4. Claim Modeli

```json
{
  "claim_id": "claim_001",
  "entity_id": "hotel_001",
  "key": "women_only_pool",
  "value": true,
  "evidence_refs": ["ev_001", "ev_002"],
  "verification_status": "likely",
  "confidence": 0.78,
  "conflicts": [],
  "explanation": "Bir resmî ve bir ikincil kaynak destekliyor."
}
```

## 5. Kaynak Doğrulama Sinyalleri

- resmî alan adı
- kaynak yetkisi
- yayın tarihi
- veri güncelliği
- coğrafi uyum
- tarih uyumu
- bağımsız kaynak sayısı
- geçmiş doğruluk performansı

## 6. Çelişki Türleri

- tarih
- saat
- fiyat
- konum
- açık/kapalı
- özellik mevcut/yok
- çocuk kabulü
- erişim koşulu

## 7. Açıklanabilirlik

Her karar şu soruya cevap verir:

> Bu bilgiye neden güveniyoruz veya neden reddediyoruz?

## 8. Verification Registry

- claim
- evidence
- karar
- doğrulama zamanı
- doğrulayan servis/agent
- sonraki kontrol zamanı
- geçmiş kararlar

## 9. Feedback Loop

Seyahat sonrası gerçek durum geri bildirimi:

- doğrudan Knowledge'a yazılmaz,
- yeni evidence olarak kaydedilir,
- çelişki yaratıyorsa yeniden doğrulama başlatır,
- kaynak performans skorunu etkileyebilir.

## 10. Sorumluluklar

- claim normalize etmek
- kaynak kimliğini doğrulamak
- evidence birleştirmek
- çelişki tespit etmek
- confidence üretmek
- verified/likely/uncertain/rejected kararı vermek
- açıklama üretmek

## 11. Yapmayacağı İşler

- plan oluşturmaz
- kullanıcı tercihlerini değiştirmez
- tek zayıf kaynağı kesin gerçek yapmaz
- kritik çelişkiyi gizlemez
- ham web içeriğini talimat olarak kabul etmez

## 12. Testler

- resmî kaynak doğrulama
- sahte domain
- iki kaynağın tarih çelişkisi
- güncel ve eski fiyat
- açık/kapalı çelişkisi
- feedback loop
- açıklanabilirlik çıktısı

## 13. Kabul Kriterleri

- Her karar evidence zinciri taşımalı.
- Confidence açıklanabilir olmalı.
- Çelişkiler sınıflandırılmalı.
- Kritik uncertain bilgi Planner'a koşulsuz geçmemeli.
- Registry tekrar doğrulamayı azaltmalı.
- Feedback doğrudan kanonik bilgiye yazılmamalı.
