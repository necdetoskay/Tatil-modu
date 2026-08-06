# Source Foundation Test Standard

## 1. Taxonomy testleri

- Her kaynak tek ana source family taşır.
- Source subtype kayıtlı listede bulunur.
- S7 kayıtlar lineage refsiz kabul edilmez.
- S5 kaynaklar kritik claim'de tek authoritative kaynak olamaz.
- User preference kaynağı dış kaynakla geçersiz kılınmaz.

## 2. Authority testleri

- Authority claim-specific hesaplanır.
- Authority score `0–1` aralığındadır.
- Authority class skor aralığıyla uyumludur.
- Resmî pazarlama metni deneyim authority'si kazanmaz.
- Verified review resmî policy authority'si kazanmaz.
- Segment relevance authority skoruna doğrudan karıştırılmaz.

## 3. Source profile testleri

- source ID,
- family/subtype,
- provider,
- roles,
- authority scopes,
- license,
- privacy,
- status

zorunludur.

## 4. Lisans testleri

- Yorum kaynağında text usage mode bulunur.
- Storage izni bilinmiyorsa güvenli varsayılan `false` olur.
- Restricted kaynak public output'a doğrudan taşınamaz.

## 5. Kritik fixture senaryoları

### DS-001 — Resmî çalışma saati

Beklenen:

- S1,
- authoritative,
- opening_hours authority ≥ 0.90.

### DS-002 — Doğrulanmış otel yorumu

Beklenen:

- S3,
- experiential,
- cleanliness_experience authority ≥ 0.75,
- official_policy authority < 0.50.

### DS-003 — Sponsorlu blog

Beklenen:

- S4 veya S5,
- conflict-of-interest penalty,
- discovery/corroborating role,
- kritik claim'de tek kaynak olamaz.

### DS-004 — Kullanıcı tercihi

Beklenen:

- S6,
- user preference authoritative for user intent,
- dış kaynakla override edilmez.

### DS-005 — Türetilmiş evidence

Beklenen:

- S7,
- sourceRefs ve transformationRefs zorunlu.

## 6. Kritik başarısızlıklar

- Kaynak türünü puana göre değiştirme,
- authority scope dışına skor taşıma,
- lisans metadata eksikliği,
- deneyim ve resmî claim'i aynı authority modeliyle değerlendirme,
- source profile schema ihlali.
