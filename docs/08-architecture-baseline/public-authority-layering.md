# Tatil Modu — Public Authority Layering

**Doküman türü:** Architecture boundary  
**Teknik kod adı:** `public_authority_layering`  
**Sürüm:** 1.0 Taslak  
**Architecture Review:** ARF-016  
**Canonical status:** Architecture Freeze öncesi canonical boundary  
**component_type:** `architecture_boundary`  
**owner:** Data Source & Trust / Policy / Planner boundary  
**depends_on:** `travel-knowledge-store.md`, `error-code-registry.md`, `architecture-terminology-registry.md`, `architecture-dependency-index.md`  
**related_artifacts:** Universal Evidence Schema, Verification Result Schema, Policy Rule Registry

## Amaç

Bu doküman, kamu otoritesi kaynaklarından gelen bilgi, kural, uyarı ve kısıtların Tatil Modu mimarisinde hangi katmanda işlendiğini netleştirir.

ARF-016 kararı: Public Authority bilgisi tek bir agentın serbest yorumu değildir. Kaynak edinme, güven değerlendirme, kural çıkarımı, plan kararına uygulama ve kullanıcıya sunum ayrı katman sorumluluklarıdır.

## Public Authority nedir?

Public Authority; belediye, valilik, bakanlık, resmi turizm kurumu, müze/ören yeri resmi işletmesi, ulaşım otoritesi, afet/meteoroloji kurumu, emniyet/trafik otoritesi veya benzeri resmi/yarı-resmi kaynaklardan gelen bilgidir.

Örnekler:

- resmi çalışma saatleri,
- yol kapanışı veya trafik duyurusu,
- plaj, mesire alanı, milli park veya müze kuralı,
- hava/afet/uyarı bilgisi,
- yaş, güvenlik, erişilebilirlik veya giriş kısıtı,
- ücret, rezervasyon, ziyaretçi limiti veya izin bilgisi,
- kadınlar plajı, aile alanı, özel kullanım günü gibi işletme/kamu düzenlemeleri.

## Katman ayrımı

| Katman | Sorumluluk | Yapmaz |
|---|---|---|
| Capability Platform / Tool Gateway | Resmi kaynağa erişim, provider adapter çağrısı, izin/rate limit/audit | Kaynağın otoritesini yorumlamaz |
| Data Source & Trust | Kaynak türü, authority seviyesi, freshness, evidence strength, conflict semantics | Plan kararı vermez |
| Verification Platform | Data Source & Trust sonucunu runtime verification result olarak taşır | Authority/freshness/conflict algoritmalarını sahiplenmez |
| Policy / Constraint Layer | Resmi kuralı hard constraint, soft warning veya operational advisory olarak sınıflandırır | Kaynak toplamaz |
| Travel Knowledge Store | Public authority kaynaklı doğrulanmış POI/destination/operational fact snapshot'larını saklar | Kullanıcı/family memory tutmaz |
| Planner / Orchestrator | Policy ve verification sonucuna göre plan kapısı uygular | Kamu kuralını yeniden yorumlayarak gevşetmez |
| Final Plan Composer | Kullanıcıya resmi uyarı, kısıt, varsayım ve kaynak durumunu açıklar | Yeni kural üretmez |

## Public authority claim akışı

```text
Provider / Official Source
        ↓
Capability Platform / Tool Gateway
        ↓
Data Source & Trust authority/freshness/evidence evaluation
        ↓
Verification Platform result assembly
        ↓
Policy / Constraint classification
        ↓
Planner / Orchestrator decision gate
        ↓
Final Plan Composer explanation
```

## Constraint sınıflandırması

Public authority bilgileri plan kararına şu sınıflarla girer:

| Sınıf | Anlam | Plan etkisi |
|---|---|---|
| `hard_constraint` | Uyulması zorunlu resmi kural veya güvenlik engeli | Alternatif elenir veya plan değiştirilir |
| `soft_warning` | Risk veya öneri niteliğinde resmi uyarı | Kullanıcıya açıklanır, alternatif önerilir |
| `operational_advisory` | Saat, yoğunluk, erişim, rezervasyon, bakım, geçici kapanış gibi operasyonel bilgi | Plan zamanı/rota/alternatif etkilenir |
| `source_note` | Kaynak güveni veya freshness notu | Kullanıcıya varsayım/emin değiliz açıklaması olarak taşınır |

## Sahiplik kuralları

1. Resmi kaynak iddiası Universal Evidence Model referansı olmadan canonical bilgiye dönüşemez.
2. Official source güçlü sinyaldir; fakat tarih, yetki alanı ve kapsam kontrolü olmadan mutlak doğru kabul edilmez.
3. Birden fazla resmi kaynak çelişirse Data Source & Trust conflict semantics uygulanır.
4. Policy Layer hard constraint olarak sınıflandırdığı kuralı Planner gevşetemez.
5. Planner yalnız doğrulanmış veya açıkça belirsizlikle işaretlenmiş public authority bilgisini kullanır.
6. Final Plan Composer resmi kısıtları saklamaz; kullanıcıya açık, kısa ve uygulanabilir biçimde gösterir.
7. Agentlar public authority bilgisini yorumlayabilir; fakat canonical authority/freshness/conflict kararını sahiplenemez.

## Örnek

Kadınlar plajı örneği:

```text
Belediye/resmi işletme sayfası
  → Capability Platform fetch
  → Data Source & Trust: official/local authority, freshness check
  → Verification Platform: likely/verified result
  → Policy Layer: user requirement + official rule eşleşmesi
  → Planner: uygun gün/saat/rota seçimi
  → Final Plan Composer: kaynak durumu ve varsayım açıklaması
```

## ARF-016 kararı

Public Authority sorumluluğu tek katmanda toplanmaz. Kaynak erişimi Capability Platform'da, authority/freshness/evidence semantiği Data Source & Trust'ta, runtime taşıma Verification Platform'da, kural etkisi Policy / Constraint Layer'da, plan uygulaması Planner / Orchestrator'da ve kullanıcı açıklaması Final Plan Composer'da tutulur.
