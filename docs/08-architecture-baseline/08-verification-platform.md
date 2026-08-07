# Tatil Modu — Verification Platform Teknik Tasarımı

**Doküman türü:** Platform teknik tasarımı
**Teknik kod adı:** `verification_platform`
**Sürüm:** 1.1 Taslak
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması
**Architecture Review:** ARF-002

## 1. Amaç

Verification Platform, sistemde kullanılan claim'ler için runtime doğrulama isteği alır, Data Source & Trust karar mekanizmalarını çağırır ve planlama katmanına açıklanabilir verification result döndürür.

Bu platform kaynak otoritesi, freshness, evidence strength, conflict resolution veya multi-source fusion algoritmalarının canonical sahibi değildir. Bu algoritmaların sahibi Data Source & Trust Architecture'dır.

## 2. Canonical sınır

### Data Source & Trust sahipliği

Data Source & Trust şu kararların canonical sahibidir:

- source taxonomy,
- claim-specific authority model,
- freshness scoring,
- evidence strength,
- conflict detection semantics,
- conflict resolution,
- multi-source fusion,
- coverage/sufficiency assessment,
- license/permitted-use policy,
- source performance scoring.

### Verification Platform sahipliği

Verification Platform şu runtime sorumlulukların sahibidir:

- verification request kabul etmek,
- claim normalize etmek,
- ilgili Data Source & Trust kontrollerini çağırmak,
- evidence refs ve Data Source & Trust kararlarını verification result'a bağlamak,
- verified/likely/uncertain/rejected durumunu runtime sözleşmede taşımak,
- açıklanabilir verification summary üretmek,
- verification snapshot ve registry kaydı oluşturmak,
- Planner/Agent katmanına güvenli karar paketi döndürmek.

## 3. Pipeline

```text
Raw Claim
  ↓
Claim Normalization
  ↓
Evidence Collection / Lookup
  ↓
Data Source & Trust Evaluation
  ↓
Verification Result Assembly
  ↓
Explanation & Snapshot
  ↓
Planner / Agent Decision Gate
```

## 4. Doğrulama Seviyeleri

- `verified`
- `likely`
- `uncertain`
- `rejected`

Bu seviyeler Verification Platform tarafından runtime output olarak taşınır; seviyenin nasıl hesaplandığı Data Source & Trust karar mekanizmalarına dayanır.

## 5. Claim Modeli

```json
{
  "claim_id": "claim_001",
  "entity_id": "hotel_001",
  "key": "women_only_pool",
  "value": true,
  "evidence_refs": ["ev_001", "ev_002"],
  "data_source_trust_result_ref": "dst_001",
  "verification_status": "likely",
  "confidence": 0.78,
  "conflicts": [],
  "explanation": "Bir resmî ve bir ikincil kaynak destekliyor.",
  "snapshot_version": "verif_snap_001"
}
```

## 6. Kaynak ve evidence sinyalleri

Verification Platform bu sinyalleri kendisi hesaplamaz; Data Source & Trust sonucundan tüketir:

- resmî alan adı,
- kaynak yetkisi,
- yayın tarihi,
- veri güncelliği,
- coğrafi uyum,
- tarih uyumu,
- bağımsız kaynak sayısı,
- geçmiş doğruluk performansı,
- license/permitted-use durumu.

## 7. Çelişki Türleri

Çelişki sınıflandırması Data Source & Trust semantiğine dayanır; Verification Platform bunları runtime result içinde görünür kılar.

- tarih
- saat
- fiyat
- konum
- açık/kapalı
- özellik mevcut/yok
- çocuk kabulü
- erişim koşulu

## 8. Açıklanabilirlik

Her karar şu soruya cevap verir:

> Bu bilgiye neden güveniyoruz veya neden reddediyoruz?

Açıklama; evidence refs, Data Source & Trust karar özeti, confidence, conflict bilgisi ve planner decision gate sonucunu birlikte göstermelidir.

## 9. Verification Registry

- claim
- evidence refs
- Data Source & Trust result ref
- verification result
- doğrulama zamanı
- doğrulayan servis
- kullanılan registry/schema version
- snapshot version
- sonraki kontrol zamanı
- geçmiş kararlar

## 10. Feedback Loop

Seyahat sonrası gerçek durum geri bildirimi:

- doğrudan Travel Knowledge Store'a yazılmaz,
- doğrudan Knowledge Platform registry'lerine yazılmaz,
- yeni evidence olarak kaydedilir,
- Data Source & Trust yeniden değerlendirmesine gönderilir,
- çelişki yaratıyorsa yeniden doğrulama başlatır,
- kaynak performans skorunu etkileyebilir.

## 11. Sorumluluklar

- claim normalize etmek
- verification request/result sözleşmesini yönetmek
- Data Source & Trust kontrollerini çağırmak
- evidence refs ile verification result arasında izlenebilir bağ kurmak
- verified/likely/uncertain/rejected durumunu runtime output olarak taşımak
- Planner/Agent için decision gate üretmek
- açıklama ve snapshot üretmek

## 12. Yapmayacağı İşler

- plan oluşturmaz
- kullanıcı tercihlerini değiştirmez
- kaynak otorite modelinin canonical sahibi olmaz
- freshness algoritmasının canonical sahibi olmaz
- conflict resolution/fusion algoritmalarını sahiplenmez
- tek zayıf kaynağı kesin gerçek yapmaz
- kritik çelişkiyi gizlemez
- ham web içeriğini talimat olarak kabul etmez

## 13. Testler

- resmî kaynak doğrulama request/result akışı
- sahte domain için Data Source & Trust sonucunun taşınması
- iki kaynağın tarih çelişkisi
- güncel ve eski fiyat
- açık/kapalı çelişkisi
- uncertain bilginin planner'a koşulsuz geçmemesi
- feedback loop
- açıklanabilirlik çıktısı
- Data Source & Trust result ref zorunluluğu

## 14. Kabul Kriterleri

- Her karar evidence zinciri taşımalı.
- Her verification result, Data Source & Trust result ref taşımalı.
- Confidence açıklanabilir olmalı.
- Çelişkiler sınıflandırılmalı.
- Kritik uncertain bilgi Planner'a koşulsuz geçmemeli.
- Registry tekrar doğrulamayı azaltmalı.
- Feedback doğrudan kanonik bilgiye yazılmamalı.
- Verification Platform, Data Source & Trust algoritmalarını duplicate etmemeli.

## 15. ARF-002 kararı

ARF-002 kapsamında Verification Platform runtime verification façade olarak konumlandırılmıştır.

Data Source & Trust; source authority, freshness, evidence strength, conflict resolution, fusion ve coverage kararlarının canonical sahibidir. Verification Platform bu kararları çağırır, snapshot'lar, açıklar ve planlama katmanına güvenli result olarak taşır.
