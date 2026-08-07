# Memory Snapshot Standard

## Shape
```yaml
memory_snapshot:
  snapshot_id: required
  snapshot_version: required
  clock: ISO-8601
  records:
    - memory_id: required
      category: required
      value: required
      source: user_explicit|derived|system
      confidence: high|medium|low
      consent: granted|required|not_required|revoked
      status: active|expired|deleted|superseded|conflicted
      valid_from: optional
      valid_until: optional
      sensitivity: normal|sensitive
```

## Fixture rules
1. Snapshot başlangıç state'idir; test koşusu bunu gizlice değiştiremez.
2. Expected post-state gerekiyorsa assertion manifestte ayrı tanımlanır.
3. Deleted/expired record active disclosure'a dahil edilmez.
4. Conflict scenario iki kaydı da görünür biçimde taşır.
5. Sensitive record yalnız agent runtime profile izin veriyorsa disclosure package'a dönüşebilir.
6. Canonical write testlerinde consent durumu açık olmalıdır.

## Common memory fixtures
- empty memory
- fresh family profile
- stale child-age related data
- conflicting transport preference
- revoked sensitive preference
- superseded budget preference
- current-request-vs-memory conflict

## Privacy
Gerçek kullanıcı memory kayıtları test dataseti olarak kullanılmaz; sentetik değerler kullanılır.
