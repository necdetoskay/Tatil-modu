# Tatil Modu — UI/UX Flow Workplan

**Doküman türü:** Pre-implementation UX flow çalışma planı  
**Durum:** tasarım planı  
**Tarih:** 2026-08-07  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı  
**UI implementation durumu:** kapalı

## Amaç

Bu doküman, Tatil Modu için kod veya prototype başlamadan önce tasarlanması gereken kullanıcı yolculuğu, bilgi toplama, alternatif sunumu, uyarı gösterimi, açıklanabilirlik ve karar destek akışlarını belirler.

Bu doküman UI kodu yazmak için değildir.

Amaç, kullanıcı deneyiminin hangi kararları, hangi sırada, hangi açıklıkla göstermesi gerektiğini tasarlamaktır.

## Ana karar

```yaml
implementation_allowed: false
prototype_allowed: false
ui_implementation_allowed: false
ux_design_required: true
ux_flow_state: workplan
```

Tatil Modu kullanıcıya yalnızca güzel görünen bir liste vermemelidir.

Kullanıcı şunları anlayabilmelidir:

- Sistem benden hangi bilgileri istedi?
- Hangi bilgiler eksik kaldı?
- Hangi varsayımlar yapıldı?
- Hangi seçenekler neden önerildi?
- Hangi seçenekler neden elendi?
- Trafik, otopark, çocuk yorgunluğu ve mahremiyet nasıl hesaba katıldı?
- Hangi bilgiler güncel/doğrulanmış, hangileri belirsiz?
- Planı nasıl değiştirebilirim?

## UX tasarım ilkeleri

| İlke | Açıklama |
|---|---|
| Aile odaklılık | Çocuk yaşı, uyku/dinlenme ve yorgunluk görünür olmalı |
| Alternatifli karar | Tek plan yerine seçenekler ve trade-off'lar sunulmalı |
| Açıklanabilirlik | Planın neden önerildiği anlaşılmalı |
| Güven işareti | Saat/fiyat/rota gibi değişken bilgilerin güven seviyesi gösterilmeli |
| Hard constraint görünürlüğü | Kesin kısıtlar normal tercih gibi saklanmamalı |
| Düşük bilişsel yük | Kullanıcı uzun form doldurmak zorunda kalmamalı |
| Düzeltilebilirlik | Kullanıcı her aşamada tercihini değiştirebilmeli |
| Mahremiyet saygısı | Hassas tercihler açık, saygılı ve gereğinden fazla vurgulanmadan ele alınmalı |

## Tasarlanacak ana kullanıcı akışları

1. İlk istek girişi
2. Eksik bilgi tamamlama
3. Kısıt ve tercih onayı
4. Plan üretim ön izlemesi
5. Günlük plan sunumu
6. Alternatif karşılaştırma
7. Uyarı ve belirsizlik gösterimi
8. Plan revizyonu
9. Kaynak / evidence görünümü
10. Memory önerisi ve kullanıcı onayı

## Flow 1 — İlk istek girişi

Kullanıcı serbest metinle başlayabilmelidir.

Örnek:

```text
Kocaeli'den çıkıyorum. 2 yetişkin 2 çocukla Bursa/Balıkesir tarafında 3 günlük çok yormayan bir tatil planı istiyorum.
```

UX bu aşamada şunları yakalamalıdır:

- çıkış noktası,
- kişi sayısı,
- çocuk yaşları,
- süre,
- hedef bölge,
- bütçe,
- ulaşım tipi,
- özel hassasiyetler,
- plan yoğunluğu tercihi.

Eksik bilgiler hemen uzun form ile sorulmamalıdır. Önce sistem anladığını özetlemelidir.

## Flow 2 — Eksik bilgi tamamlama

Eksik bilgi ekranı kısa ve amaçlı olmalıdır.

Örnek eksik bilgiler:

- tarih aralığı,
- bütçe,
- araç var mı,
- deniz isteniyor mu,
- öğle dinlenmesi zorunlu mu,
- otel türü,
- kadınlar plajı gibi özel hassasiyetler.

Tasarım ilkesi:

```text
Her soru plan kalitesini doğrudan etkiliyorsa sorulur.
Merak için soru sorulmaz.
```

## Flow 3 — Kısıt ve tercih onayı

Planlamadan önce kullanıcıya anlaşılan bilgiler gösterilmelidir.

Örnek:

```yaml
hard_constraints:
  - 2 ve 6 yaş çocuklara uygun olacak
  - günlük yorgunluk düşük tutulacak
  - öğle dinlenmesi korunacak
  - deniz önerilirse kadınlar plajı seçeneği değerlendirilecek
strong_preferences:
  - trafik ve otopark riski düşük olsun
  - her gün 2-3 alternatif olsun
soft_preferences:
  - doğa / hayvanat bahçesi / çocuk aktivitesi tercih edilir
```

Kullanıcı bu aşamada kısıtları düzeltebilmelidir.

## Flow 4 — Plan üretim ön izlemesi

Plan üretilmeden önce sistem hangi alanları değerlendireceğini göstermelidir:

- rota ve trafik,
- aktivite uygunluğu,
- çocuk yorgunluğu,
- otel/konaklama uyumu,
- bütçe,
- hava durumu,
- resmi kaynaklar,
- mahremiyet hassasiyeti,
- alternatifler.

Bu ekranın amacı kullanıcıya güven vermektir; teknik trace göstermemelidir.

## Flow 5 — Günlük plan sunumu

Final plan günü parçalara bölmelidir:

- sabah,
- öğle,
- dinlenme,
- öğleden sonra,
- akşam,
- alternatifler,
- trafik/otopark notu,
- çocuk yorgunluğu notu,
- belirsizlik/güncellik notu.

Örnek günlük yapı:

```text
Gün 1 — Bursa çocuk odaklı hafif plan
Sabah: Bursa Hayvanat Bahçesi
Öğle: Yakın bölgede yemek + otel/dinlenme
Öğleden sonra Alternatif A: Bilim Merkezi
Öğleden sonra Alternatif B: Kısa park / hafif gezi
Uyarı: Teleferik çocuklarla yorucu olabilir, hava durumuna bağlı değerlendirilmeli.
```

## Flow 6 — Alternatif karşılaştırma

Alternatifler yalnız isim listesi olmamalıdır.

Karşılaştırma alanları:

| Alan | Açıklama |
|---|---|
| Çocuk uygunluğu | 2 ve 6 yaş için uygunluk |
| Yorgunluk | düşük / orta / yüksek |
| Trafik riski | düşük / orta / yüksek |
| Otopark riski | düşük / orta / yüksek / bilinmiyor |
| Bütçe etkisi | düşük / orta / yüksek |
| Hava bağımlılığı | evet / hayır |
| Kanıt güveni | yüksek / orta / düşük |

Kullanıcı şu aksiyonları alabilmelidir:

- daha sakin plan yap,
- daha ekonomik yap,
- deniz ağırlıklı yap,
- çocuk aktivitesi artır,
- bu alternatifi çıkar,
- bu alternatife göre yeniden planla.

## Flow 7 — Uyarı ve belirsizlik gösterimi

Uyarılar planı bozmayacak ama saklanmayacak şekilde gösterilmelidir.

Uyarı türleri:

- saat/fiyat güncelliği belirsiz,
- trafik riski yüksek,
- otopark bilgisi yetersiz,
- çocuk yorgunluğu yüksek,
- mahremiyet/kadınlar plajı bilgisi doğrulanamadı,
- hava durumuna bağımlı,
- resmi kaynak kontrolü gerekli.

Hard fail uyarıları normal not gibi gösterilmemelidir.

Örnek:

```text
Bu plaj için kadınlara özel kullanım bilgisi doğrulanamadığı için kesin öneri olarak sunulmadı.
```

## Flow 8 — Plan revizyonu

Kullanıcı planı doğal dille değiştirebilmelidir.

Örnek komutlar:

- daha az yorucu yap,
- oteli merkeze yakın seç,
- denizi çıkar,
- bütçeyi düşür,
- çocuk aktivitelerini artır,
- kadınlar plajı olmayan deniz önerilerini kaldır,
- ikinci günü tamamen dinlenme yap.

Revizyon UX'i, önceki planı kaybetmeden değişiklik etkisini göstermelidir.

## Flow 9 — Evidence ve kaynak görünümü

Kullanıcı isterse planın dayandığı bilgileri görebilmelidir.

Görünürlük seviyesi:

1. Basit güven etiketi
2. Açıklanmış kaynak özeti
3. Detaylı evidence listesi

Varsayılan ekranda teknik JSON gösterilmemelidir.

Örnek:

```text
Güven: Orta
Neden: Rota bilgisi mevcut, ancak canlı trafik doğrulanmadı.
```

## Flow 10 — Memory önerisi ve kullanıcı onayı

Sistem, kullanıcıdan açık onay almadan hassas veya kalıcı bilgi kaydetmemelidir.

Örnek memory önerileri:

```text
Bu aile için düşük yorgunluklu, öğle dinlenmeli planları tercih ettiğinizi hatırlamamı ister misiniz?
```

Kaydedilmemesi gereken otomatik çıkarımlar:

- dini/muhafazakar varsayımlar,
- mahremiyet hassasiyeti hakkında geniş genellemeler,
- çocukların sağlık veya özel durumları,
- tek seferlik yolculuktan kalıcı tercih çıkarımları.

## Tasarlanacak UX artifact'ları

| Artifact | Hedef dosya |
|---|---|
| UX journey map | `docs/12-ux/ux-journey-map.md` |
| Intake question flow | `docs/12-ux/intake-question-flow.md` |
| Constraint confirmation screen | `docs/12-ux/constraint-confirmation-flow.md` |
| Plan output structure | `docs/12-ux/final-plan-output-structure.md` |
| Alternative comparison model | `docs/12-ux/alternative-comparison-model.md` |
| Warning and uncertainty display | `docs/12-ux/warning-uncertainty-display.md` |
| Revision flow | `docs/12-ux/plan-revision-flow.md` |
| Evidence display model | `docs/12-ux/evidence-display-model.md` |
| Memory consent UX | `docs/12-ux/memory-consent-flow.md` |

## UX acceptance criteria

UX tasarımı tamamlanmış sayılmaz, eğer:

- kullanıcıdan hangi bilgiler alınacağı belli değilse,
- eksik bilgi soruları önceliklendirilmemişse,
- hard constraint ve soft preference ayrımı görünür değilse,
- final plan günlük yapısı tanımlı değilse,
- alternatif karşılaştırma modeli yoksa,
- uyarıların kullanıcıya nasıl gösterileceği belirsizse,
- evidence/confidence kullanıcı diline çevrilmemişse,
- memory consent akışı yoksa,
- plan revizyonu akışı tasarlanmamışsa.

## Kod öncesi UX kararları

Koddan önce şu kararlar verilmelidir:

```yaml
ux_decisions_required:
  - first_intake_mode
  - required_question_order
  - hard_constraint_confirmation_format
  - daily_plan_card_structure
  - alternative_comparison_fields
  - warning_severity_display
  - evidence_summary_display
  - revision_command_model
  - memory_consent_prompt_model
```

## Next design document

```yaml
next_design_document: 10-pre-code-freeze-checklist.md
```
