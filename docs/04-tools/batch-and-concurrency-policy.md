# Batch & Concurrency Policy

## 1. Amaç

Tool çağrılarını verimli gruplamak ve provider, maliyet ve workflow sınırlarını aşmadan paralel çalıştırmak.

## 2. Batch uygunluğu

Batch yalnız capability contract destekliyorsa kullanılır.

Örnek uygun capability'ler:

- directions.matrix,
- places.search belirli providerlarda,
- reviews.collect pagination batch,
- schema.validate,
- rules.evaluate.

## 3. Batch kuralları

- maksimum batch size provider bazında,
- aynı privacy scope,
- aynı locale/timezone,
- aynı capability version,
- aynı provider/policy,
- sonuçlar item bazında izlenebilir.

## 4. Partial batch failure

Tüm batch otomatik başarısız sayılmaz.

Her item:

```text
success
partial
failed
```

durumu taşır.

## 5. Concurrency seviyeleri

```text
global
provider
capability
workflow
agent
user/session
```

## 6. Backpressure

Queue büyürse:

- non-critical enrichment ertelenir veya atlanır,
- batch birleştirme uygulanır,
- düşük öncelikli workflow yavaşlatılır,
- kullanıcıya kritik path sonucu önce sunulabilir.

## 7. Priority sınıfları

```text
critical
interactive
normal
background
shadow
```

## 8. Deadline

Her workflow/tool çağrısı deadline taşır.

Deadline sonrası:

- yeni retry yapılmaz,
- kuyruktaki çağrı iptal edilir,
- partial/fallback değerlendirilir.

## 9. Cancellation

Kullanıcı planı değiştirdiğinde eski workflow çağrıları iptal edilebilir.

Provider çağrısı iptal edilemiyorsa sonucu cache'e alınabilir fakat eski workflow'a uygulanmaz.

## 10. Duplicate suppression

Aynı request fingerprint aktifse yeni çağrı mevcut promise/result ile birleştirilebilir.

## 11. Testler

- batch split,
- partial item error,
- provider concurrency,
- deadline cancellation,
- duplicate suppression,
- priority fairness,
- queue backpressure,
- orphan result isolation.
