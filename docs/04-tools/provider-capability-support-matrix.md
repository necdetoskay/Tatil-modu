# Provider–Capability Support Matrix

## 1. Amaç

Hangi provider adapterının hangi capability sürümünü, bölgeleri ve çalışma modlarını desteklediğini kaydetmek.

Bu belge gerçek provider seçimini henüz yapmaz; kayıt formatını tanımlar.

## 2. Kayıt örneği

```json
{
  "providerId": "example-provider",
  "adapterId": "example-directions-adapter",
  "adapterVersion": "1.0.0",
  "capabilities": [
    {
      "capabilityId": "directions.route",
      "capabilityVersions": ["1.0.0"],
      "regions": ["TR", "EU"],
      "executionModes": ["hybrid", "live", "shadow"],
      "batch": false,
      "traffic": true,
      "status": "candidate",
      "qualityScore": null
    }
  ]
}
```

## 3. Durumlar

```text
candidate
fixture-tested
live-tested
approved
degraded
disabled
deprecated
```

## 4. Zorunlu bilgiler

- provider ID,
- adapter ID/version,
- capability ID/version,
- bölgesel kapsama,
- execution mode,
- batch desteği,
- freshness/realtime özellikleri,
- pricing reference,
- privacy/data residency,
- status,
- quality score.

## 5. Provider seçimiyle ilişki

Provider Selection Policy yalnız:

- support matrix uyumlu,
- health uygun,
- policy izinli,
- bütçe içinde,
- quality threshold üstü

providerları değerlendirebilir.

## 6. Testler

- unsupported capability seçilmez,
- region mismatch,
- version mismatch,
- disabled provider,
- execution mode mismatch,
- batch capability mismatch,
- pricing reference eksikliği.
