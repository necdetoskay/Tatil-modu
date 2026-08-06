# Destination Discovery Agent Specification

## 1. Kimlik ve amaç

| Alan | Değer |
|---|---|
| Agent ID | AG-002 |
| Teknik ad | `destination-discovery-agent` |
| Sürüm | 1.0.0 |
| Olgunluk | specified |
| Ana çıktı | `DestinationCandidateSet` |

Amaç, kullanıcının seyahat profiline göre uygun destinasyonları veya hedef bölge içindeki alt bölgeleri bulmak, elemek ve gerekçeli biçimde sıralamaktır.

## 2. Sorumluluk sınırı

### Yapar

- sabit hedef yoksa destinasyon adayı keşfeder,
- sabit il/bölge varsa alt bölge adayları üretir,
- yol yükü ve erişilebilirliği değerlendirir,
- sezon ve iklim uyumunu değerlendirir,
- kullanıcı tercihleriyle adayları eşleştirir,
- hard constraint ihlallerini işaretler,
- adayları puanlar ve kısa liste üretir,
- elenen adayların nedenlerini kaydeder,
- kaynak ve confidence taşır.

### Yapmaz

- otel seçmez,
- restoran seçmez,
- gezilecek yer listesi üretmez,
- saat saat rota oluşturmaz,
- kesin hava tahmini üretmez,
- rezervasyon veya fiyat garantisi vermez,
- kullanıcı adına destinasyonu sessizce kesinleştirmez,
- güvenilir veri olmadan hidden gem uydurmaz.

## 3. Tetiklenme koşulları

Agent şu durumlarda çalışır:

1. `TripProfile.destination.mode = open`
2. `TripProfile.destination.mode = suggest`
3. Hedef il sabittir fakat alt bölge seçimi gereklidir.
4. Kullanıcı mevcut destinasyon önerilerini değiştirmek ister.
5. Orchestrator, hava/bütçe/erişim değişikliği nedeniyle yeniden keşif ister.

Çalışmamalıdır:

- kritik TripProfile alanları eksikse,
- hedef ve alt bölge kullanıcı tarafından kesinleştirilmişse,
- yalnız mevcut rota içindeki mekanlar araştırılacaksa.

## 4. Girdi/çıktı sözleşmesi

Girdi: `DestinationDiscoveryInput`

Çıktı: `DestinationCandidateSet`

Şemalar:

- `input.schema.json`
- `output.schema.json`

## 5. Veri kaynakları

### Birincil

- resmî turizm portalları,
- resmî belediye/valilik/kültür müdürlüğü sayfaları,
- ulaşım ve yol sağlayıcıları,
- lisanslı geocoding ve directions servisleri,
- hava/iklim sağlayıcıları.

### İkincil

- güvenilir harita/place sağlayıcıları,
- lisanslı seyahat ve konaklama veri sağlayıcıları,
- güvenilir gezi platformları.

### Kaynak kullanım kuralı

- değişken bilgi timestamp taşır,
- iklim normali tahmin gibi sunulmaz,
- mesafe blogdan alınmaz,
- tek bir düşük güven kaynağı kritik kararı belirleyemez.

## 6. Tool politikası

İzinli tool sınıfları:

- TL-001 Web Search
- TL-002 Official Page Fetcher
- TL-003 Geocoding
- TL-005 Directions & Distance Matrix
- TL-006 Weather Forecast
- TL-007 Climate Normals
- TL-011 Calculator
- TL-012 Schema Validator
- TL-013 Rule Engine
- TL-014 Cache

Ayrıntılar `tool-policy.md` içindedir.

## 7. Sistem promptu

Kanonik prompt: `system-prompt.md`

Prompt katmanları:

1. ortak güven/doğruluk kuralları,
2. agent rolü,
3. görev ve sınırlar,
4. tool politikası,
5. çıktı sözleşmesi.

## 8. Alt görev akışı

```text
Input validation
      ↓
TripProfile constraint extraction
      ↓
Discovery scope decision
      ↓
Candidate generation
      ↓
Geographic/access validation
      ↓
Season and trip-type matching
      ↓
Hard constraint elimination
      ↓
Weighted scoring
      ↓
Diversity and redundancy check
      ↓
Source/confidence validation
      ↓
DestinationCandidateSet
```

## 9. Karar algoritması

### Ön eleme

Aday şu durumlarda elenir:

- kullanıcı hard constraint'ini açıkça ihlal ediyorsa,
- seyahat süresine göre yol yükü uygulanamazsa,
- gerekli tatil türünü sağlamadığı doğrulanmışsa,
- erişim veya sezon koşulu planı fiilen olanaksız yapıyorsa,
- adayın varlığı/konumu doğrulanamıyorsa.

### Temel skor

Başlangıç ağırlıkları:

| Kriter | Ağırlık |
|---|---:|
| Kullanıcı tercih uyumu | 0.25 |
| Yol ve erişilebilirlik | 0.20 |
| Mevsim/tarih uyumu | 0.15 |
| Aile ve özel ihtiyaç uyumu | 0.15 |
| Bütçe uyumu | 0.10 |
| Deneyim çeşitliliği | 0.10 |
| Veri güvenilirliği | 0.05 |

Ağırlıklar TripProfile'a göre değişebilir. Değişiklik `scoringProfile` içinde açıklanır.

### Çeşitlilik kuralı

İlk üç aday birbirinin neredeyse aynısı olmamalıdır. Aynı il içindeki benzer alt bölgeler sunuluyorsa aralarındaki gerçek fark açıklanmalıdır.

## 10. Agentlar arası iletişim

Producer:

- Trip Profile Agent
- Weather Context data/service
- Route/Distance tool adapter

Consumer:

- Places & Experiences Agent
- Accommodation Agent
- Food & Local Taste Agent
- Orchestrator

Ayrıntılar `handoff-contracts.md` içindedir.

## 11. Hata ve fallback

- tool timeout: bir kez retry,
- rate limit: cache veya yedek provider,
- geocoding belirsizliği: adayı `unresolved` işaretle,
- çelişkili kaynak: primary source önceliği ve confidence cezası,
- yetersiz veri: partial çıktı,
- kritik profil eksikliği: invalid çıktı.

## 12. Cache ve maliyet

- geocoding: 30 gün,
- sabit bölge metadata: 30 gün,
- climate normal: 90 gün,
- directions: 1–24 saat; trafik gerekiyorsa daha kısa,
- web discovery: 1–7 gün,
- tool çağrıları aday havuzu daraltıldıktan sonra yapılır.

## 13. Confidence

Confidence şu faktörlerden hesaplanır:

- input completeness,
- source reliability,
- source agreement,
- geographic resolution,
- temporal relevance,
- assumption penalty,
- unresolved conflict penalty.

Agentın kendi beyanı tek başına confidence değildir.

## 14. Test paketi

- contract testleri,
- behavioral testleri,
- scenario testleri,
- adversarial testleri,
- live tool entegrasyon testleri,
- regresyon testleri.

İlk fixture paketi 10 senaryo içerir.

## 15. Başarı metrikleri

- output schema validity: %100
- hard constraint ihlali: %0
- destinasyon/alt bölge sınıflandırma doğruluğu: ≥ %97
- kaynak izlenebilirliği: %100 kritik alan
- gereksiz tool çağrısı oranı: ≤ %5
- top-3 uygulanabilirlik skoru: ≥ 0.90
- uydurma destinasyon oranı: %0

## 16. Loglama ve gözlemlenebilirlik

Kaydedilecek alanlar:

- request/trace ID,
- kullanılan scoring profile,
- üretilen ve elenen adaylar,
- eleme nedenleri,
- tool çağrıları ve cache hit,
- kaynak güven seviyeleri,
- confidence bileşenleri,
- toplam süre ve maliyet.
