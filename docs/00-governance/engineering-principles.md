# Mühendislik İlkeleri

| Alan | Değer |
|---|---|
| Document ID | GOV-003 |
| Sürüm | 1.0 |
| Durum | Onay Bekliyor |
| EOS Sürümü | EOS v1.0 |
| Bağımlılıklar | GOV-001, GOV-002 |
| Son Güncelleme | 2026-08-06 |

## İlkeler

### 1. Documentation First

Kod, önemli davranış ve sınırlar belgelenmeden başlamaz. Agent mimarilerinde bile geçerlidir: bir agent specification'ı kodlanmadan, sisteme eklenemez.

### 2. Agent Contract Before Code

Her agent, girdi/çıktı şeması (JSON Schema), karar kuralları ve test matrisi tanımlı olarak kabul edilmelidir. Spec'ten önce kod yoktur.

### 3. Single Source of Truth

Bir kural veya tanım tek bir dokümanda yaşar. Diğer belgeler tekrar etmek yerine referans verir.

### 4. Evidence Over Assumption

Kararlar varsayıma değil, test verilerine, fixture'lara ve ölçümlere dayanır. Agent testleri deterministiktir.

### 5. Source Provenance

Her agent kararı, kaynağını (girdi, inference, kural) ve confidence'unu taşır. Kararlar "siyah kutu" olmamalıdır.

### 6. Explainable Automation

Agent kararları, LLM inference sonucu olsun ya da deterministic rule sonucu olsun, **gerekçelendirilmiş (reasoning)** olmalıdır.

### 7. Human Review by Design

Belirsizlik %20'nin üzerindeki agent kararları insan incelemesine yönlendirilebilir olmalı.

### 8. Test-Driven Agent Design

Her agent için önce test matrisi, sonra specification, sonra kod. TST-001 standardındaki dört seviyelik test zorunludur.

### 9. Deterministic Where Possible

Aynı girdi için tekrar üretilebilir sonuç tercih edilir. LLM kullanılan agentlarda model, prompt versiyonu ve parametreler kaydedilir.

### 10. Fail Explicitly

Belirsizlik, eksik veri ve çelişkili girdiler gizlenmez; `conflictFlags`, `warnings` ve düşük `confidence` ile ifade edilir.

### 11. Modular by Default

Orchestrator, agentlar ve tool'lar sıkı sınırlarla ayrılmıştır. Bir agent başka bir agentın içinde eritilmez.

### 12. Measure Before Optimize

Performance ve maliyet sorunları ölçülmeden optimizasyon yapılmaz. Cost ve latency metrikleri her agent için tanımlanır.

### 13. Security and Privacy by Default

Kişisel veri (çocuk yaşları, bütçe, erişim ihtiyacı) gerektiği kadar saklanır. Gizli anahtarlar repository'ye yazılmaz.

### 14. Evolutionary Architecture

İlk versiyon için gereksiz karmaşıklık kurulmaz; ancak kanıtlanan ihtiyaçların büyümesine engel olacak kısa yollar da kalıcılaştırılmaz.

### 15. EOS Compliance

Süreç ve teslimler EOS v1.0'a uyar. Sapmalar belgelenir.
