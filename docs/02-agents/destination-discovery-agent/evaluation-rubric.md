# Destination Discovery Agent — Evaluation Rubric

## Deterministic skorlar

### Schema — %20

- output schema valid,
- candidate rank benzersiz,
- skorlar 0–1,
- maxCandidates aşılmıyor.

### Hard constraints — %25

- hard constraint ihlali shortlist'te yok,
- elenen adayın nedeni mevcut,
- hedef kapsamı aşılmıyor.

### Source integrity — %15

- kritik iddiaların sourceRef'i var,
- iklim/tahmin etiketi doğru,
- unresolved konum kesin gösterilmiyor.

### Behavioral quality — %20

- tercih öncelikleri korunuyor,
- çocuk/aile profili dikkate alınıyor,
- benzer adaylar çeşitlilik kuralını ihlal etmiyor,
- agent görev sınırını aşmıyor.

### LLM reviewer — %10

- gerekçeler anlaşılır,
- aday farkları anlamlı,
- belirsizlik dili uygun.

### Cost/performance — %10

- gereksiz tool çağrısı yok,
- cache kullanımı doğru,
- gecikme/maliyet limitte.

## Kritik başarısızlıklar

Aşağıdakilerden biri varsa test doğrudan kalır:

- uydurma destinasyon,
- hard constraint ihlal eden top aday,
- hedef ülke/bölge kapsamı dışına çıkma,
- forecast/iklim karışıklığı,
- sourceRef olmadan kritik kesin iddia,
- otel/restoran/günlük rota üretme.

## Geçme eşiği

- genel skor ≥ 0.88
- kritik testler %100
- schema %100
- hard constraint testleri %100
