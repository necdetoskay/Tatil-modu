# Agent Handoff Contract Standard

## 1. Amaç

Agentlar arası veri aktarımını serbest metin konuşmalar yerine sürümlü, doğrulanabilir sözleşmelerle yönetmek.

## 2. Temel ilke

Bir agent başka agentın iç düşüncesini veya ham cevabını tüketmez.

Yalnızca tanımlı handoff nesnesini tüketir.

```text
Producer Agent
      ↓
Versioned Handoff Contract
      ↓
Consumer Agent
```

## 3. Handoff zarfı

Her aktarım ortak bir zarf kullanır:

```json
{
  "contractName": "WeatherAssessment",
  "contractVersion": "1.0.0",
  "handoffId": "uuid",
  "producer": {
    "agent": "weather-context-agent",
    "agentVersion": "1.0.0"
  },
  "createdAt": "2026-08-06T12:00:00Z",
  "validUntil": "2026-08-06T15:00:00Z",
  "status": "complete",
  "confidence": 0.87,
  "data": {},
  "sources": [],
  "warnings": [],
  "assumptions": [],
  "errors": []
}
```

## 4. Zorunlu alanlar

- sözleşme adı ve sürümü,
- benzersiz handoff ID,
- producer agent ve sürümü,
- oluşturulma zamanı,
- durum,
- confidence,
- veri,
- kaynaklar,
- uyarılar,
- varsayımlar,
- hatalar.

## 5. Durumlar

```text
complete
partial
invalid
expired
```

Consumer agent yalnızca politikasının izin verdiği durumları kabul eder.

## 6. Kaynak taşıma

Producer agentın kullandığı kritik kaynaklar handoff ile taşınmalıdır.

Consumer agent:

- kaynağı kaybetmemeli,
- kaynağı kendisi doğrulamamışsa doğrulanmış gibi göstermemeli,
- son kullanma süresi geçmiş veriyi sessizce kullanmamalıdır.

## 7. Confidence

Consumer, producer confidence değerini kopyalamak zorunda değildir.

Kendi confidence hesabında:

- producer confidence,
- veri tamlığı,
- veri yaşı,
- diğer kaynaklarla uyum,
- uyguladığı yeni varsayımlar

dikkate alınır.

## 8. Sürüm uyumluluğu

Semantic Versioning kullanılır.

- Patch: açıklama veya geriye uyumlu düzeltme.
- Minor: geriye uyumlu yeni alan.
- Major: kırıcı değişiklik.

Consumer desteklemediği major sürümü reddetmelidir.

## 9. Handoff doğrulaması

Orchestrator her aktarımda:

1. JSON Schema doğrular.
2. Contract adı ve sürümünü kontrol eder.
3. Geçerlilik süresini kontrol eder.
4. Kritik hata/uyarıları inceler.
5. Consumer kabul politikasını uygular.
6. Sonucu loglar.

## 10. Retry ve düzeltme

Handoff geçersizse Orchestrator:

- aynı agentı düzeltme promptuyla yeniden çalıştırabilir,
- yedek model kullanabilir,
- eksik tool çağrısını tamamlatabilir,
- kullanıcıdan kritik bilgi isteyebilir,
- iş akışını güvenli biçimde durdurabilir.

## 11. İlk sözleşme listesi

```text
TripProfile
DestinationCandidateSet
PlaceCandidateSet
AccommodationCandidateSet
FoodCandidateSet
ReviewInsight
WeatherAssessment
RouteMatrix
ItineraryDraft
ConstraintEvaluation
QualityReview
FinalTravelPlan
```

## 12. Handoff testleri

Her sözleşme için:

- geçerli örnek,
- eksik zorunlu alan,
- yanlış sürüm,
- expired veri,
- partial veri,
- çelişkili kaynak,
- düşük confidence,
- bilinmeyen enum

testleri bulunmalıdır.
