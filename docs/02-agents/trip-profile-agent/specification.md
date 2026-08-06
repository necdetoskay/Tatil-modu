# Trip Profile Agent Specification

## Kimlik

- Agent: `trip-profile-agent`
- Sürüm: `1.0.0`
- Tip: analiz ve veri yapılandırma agentı

## Amaç

Kullanıcının serbest metin tatil talebini diğer agentların kullanabileceği yapılandırılmış Trip Profile çıktısına dönüştürür.

## Sorumluluklar

- başlangıç ve hedef konumu çıkarma,
- yetişkin/çocuk sayılarını ve yaşlarını koruma,
- tarih, süre ve esneklik belirleme,
- ulaşım ve bütçe bilgisini çıkarma,
- tercihleri ve özel gereksinimleri kaydetme,
- eksik bilgi, çelişki ve varsayımları ayırma,
- standart JSON üretme.

## Sorumluluk dışı

- rota üretme,
- otel/restoran araştırma,
- hava durumu kontrolü,
- web araması,
- bütçe dağılımı,
- rezervasyon.

## Kaynak önceliği

```text
current_user_message
previous_trip_profile
known_user_context
inference
```

Güncel mesaj eski bağlamla çelişirse güncel mesaj kullanılır ve çelişki raporlanır.

## Çocuk yaş grupları

```text
0–1  infant
2    toddler
3–5  preschool
6–12 child
13–17 teenager
```

## Durumlar

- `complete`: temel bilgiler yeterli,
- `partial`: plan yapılabilir fakat önemli eksikler var,
- `invalid`: kritik eksik, geçersiz veri veya çözülemeyen çelişki var.

## Başarı metrikleri

- Schema geçerliliği: %100
- Bilgi çıkarma doğruluğu: ≥ %98
- Çocuk yaşları: %100
- Bütçe çıkarma: ≥ %99
- Çelişki tespiti: ≥ %95
- Uydurma tercih oranı: ≤ %1
