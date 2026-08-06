# Capability & Lineage Test Standard

## Capability Registry

- capability ID format,
- unique capability ID,
- valid tool class mapping,
- input/output contract presence,
- quality metric presence,
- allowed execution mode,
- source trace requirement,
- dependency cycle detection.

## Source Trace

- required metadata,
- trust tier,
- verification status,
- freshness timestamps,
- license metadata,
- privacy classification,
- retention class.

## Evidence

- sourceRefs boş değil,
- transformation chain geçerli,
- confidence 0–1,
- sample/support/contradiction sayıları tutarlı,
- stale evidence işaretli,
- claim entity ile ilişkili.

## End-to-end lineage

Test zinciri:

```text
fixture source
→ normalized fact
→ aggregated evidence
→ assessment
→ recommendation
```

Her aşama geriye doğru izlenebilmelidir.

## Kritik başarısızlıklar

- kaynaksız kritik claim,
- provider kimliği kaybı,
- review lisans metadata eksikliği,
- stale verinin fresh gösterilmesi,
- lineage chain kırılması,
- PII redaction ihlali,
- capability contract olmadan provider adapter kullanımı.
