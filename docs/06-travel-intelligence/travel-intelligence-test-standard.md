# Travel Intelligence Test Standard

## 1. Contract testleri

- claim schema,
- observation schema,
- assessment schema,
- module/version,
- lineage refs,
- score ranges.

## 2. Behavioral testler

- modül domain sınırını aşmaz,
- raw provider çağrısı yapmaz,
- fact/experience ayrımı korunur,
- segment ve time window kaybolmaz,
- source/evidence refs korunur.

## 3. Context testleri

- aynı entity farklı kullanıcı profillerinde farklı assessment üretebilir,
- kullanıcı tercihi dış source ile override edilmez,
- eksik trip context confidence düşürür.

## 4. Risk testleri

- probability/impact/exposure/user sensitivity uygulanır,
- mitigability riski düşürebilir,
- critical risk recommendation signal üretir.

## 5. Explanation testleri

- assessment nedeni,
- kullanılan evidence,
- kullanıcı etkisi,
- sınırlılık,
- önerilen mitigation

bulunur.

## 6. Kritik başarısızlıklar

- source refsiz assessment,
- modülün provider çağırması,
- unresolved conflict'i gizleme,
- kullanıcı segmentini kaybetme,
- fact ve experience'i tek scalar'a indirme,
- confidence'ı LLM sezgisiyle uydurma.
