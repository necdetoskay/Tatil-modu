# Tatil-Plan — Ürün Vizyonu ve Kapsam

| Alan | Değer |
|---|---|
| Document ID | PRD-001 |
| Sürüm | 1.0 |
| Durum | Onay Bekliyor |
| EOS Sürümü | EOS v1.0 |
| Son Güncelleme | 2026-08-06 |

---

## 1. Ürün Vizyonu

Tatil-Plan, mobil bir tatil planlama uygulaması değildir.

**Tatil-Plan, bir seyahit danışmanlığı şirketidir.**

Mobil uygulama yalnızca **vitrindir** — yüz yüze görüşen ofis değil, dijital vitrin. Gerçek ürün, arkada çalışan onlarca uzman ajanın oluşturduğu **karar mekanizmasıdır**.

### 1.1. Felsefe

> **"İnsan bir tatil planlarken hangi işleri yapıyor?"** sorusunun cevabı, agent mimarimizin temelini oluşturur.

Bir insan tatil planlarken:

1. Kendisini ve yolcularını tanımlar
2. Tarih ve süreyi belirler
3. Bütçesini kısıtlar
4. Ulaşım aracını seçer
5. Destinasyonu keşfeder
6. Konaklamayı araştırır
7. Yemek ve aktiviteleri planlar
8. Rotayı optimize eder
9. Son planı gözden geçirir

Bu 9 adımı, **9+ uzman ajan** olarak paralellikleştiririz. Her biri kendi alanında derin uzmanlık gösterir. Orchestrator ise **proje müdürü** gibi, görev dağıtır, sonuçları birleştirir, çakışmaları çözer.

---

## 2. Ürün Sınırları

### 2.1. Kapsam dışı (Yapılmaz)

- ❌ **Rezervasyon yapma** (Booking, Expedia entegrasyonu değil)
- ❌ **Ödeme alma** (kredi kartı, kupon sistemi yok)
- ❌ **Kullanıcı adına işletmeyle iletişim kurma**
- ❌ **Gerçek zamanlı fiyat takibi** (offline analiz)
- ❌ **Harita gösterimi** (agent rota üretir, mobil UI haritayı gösterir)

### 2.2. Kapsam içinde (Yapılır)

- ✅ **Tatil keşfi**: Nereye gidilmesi gerektiğini önerir
- ✅ **Destinasyon seçimi**: Alternatif hedefleri değerlendirir
- ✅ **Konaklama araştırması**: En uygun otelleri bulur
- ✅ **Yeme-içme önerileri**: Lezzet haritasını çizer
- ✅ **Günlük rota üretimi**: Her gün için saatlik plan
- ✅ **Yorum analizi**: Türkiye'deki review'ları sentezler
- ✅ **Bütçe tahmini**: Gerçekçi maliyet tahmini
- ✅ **Tatil sırasında dinamik yeniden planlama**: Yağmur gelirse rotayı değiştirir

---

## 3. Hedef Kullanıcılar

| Profil | Tanım | Agent İçin Özelleştirme |
|--------|-------|------------------------|
| **Çocuklu Aile** | 2 yetişkin + 1-2 çocuk (0-12) | childCareNeeds=true, ageBand bazlı etkinlik planı |
| **Düşük Bütçeli Çift** | 2 yetişkin, bütçe dar | budgetFlexibility=strict, ucuz alternatifler |
| **Yaşlı Yolcular** | 65+ yaş, erişim ihtiyacı | accessibilityRequired=true |
| **Engelli Kullanıcı** | Tekerlekli sandalye / engel | accessibilityNeeds dolu |
| **EV Sürücüsü** | Elektrikli araç, şarj istasyonu | vehicle.chargingNeeded=true |
| **Evcil Hayvanlı** | Köpek/kaplumbağa | petFriendly=true |
| **Gastronomi Tutkunlu** | Yemek odaklı | foodPriority=high |
| **Kalabalıktan Kaçınan** | Az yoğunluk | crowdSensitivity=high |

---

## 4. Kullanıcı Yolculuğu (End-to-End Journey)

```
Başlangıç noktası
  → 1. Tarih esnekliği
  → 2. Kişi ve çocuk bilgileri
  → 3. Tatil türü
  → 4. Bütçe
  → 5. Araç durumu
  → 6. Konaklama tercihi
  → 7. Özel ihtiyaçlar
  → 8. Destinasyon alternatifleri (agent önerir)
  → 9. Rota üretimi (agent üretir)
  → 10. Kullanıcı revizyonu (agent yeniden planlar)
  → 11. Nihai tatil planı
```

Her adımda **"neden soruluyor?"** sorusunun cevabı belirtilir — gereksiz sorular kullanıcıyı yormaz.

---

## 5. İlk Teslimat Paketi

| Doküman | ID | Durum |
|---------|-----|-------|
| Product Vision & Scope | PRD-001 | ✅ (bu doküman) |
| End-to-End User Journey | PRD-002 | ✅ (section 4) |
| Initial Agent Catalog | ARCH-002 | ⏳ (hazırlanıyor) |
| Agent Specification Template | ARCH-001 | ⏳ (hazırlanıyor) |
| Agent Testing & Evaluation Standard | TST-001 | ✅ |
| Trip Profile Agent (Specification + Fixtures + Tests) | AGENT-002 | ✅ |

---

## 6. Versiyonlama

| Versiyon | Tarih | Değişiklik |
|----------|-------|-----------|
| v1.0 | 2026-08-06 | İlk sürüm |
