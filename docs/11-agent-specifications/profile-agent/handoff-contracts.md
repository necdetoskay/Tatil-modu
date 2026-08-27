# TM-AG-001 — Handoff Contracts

## Primary downstream

`TM-AG-002 Preference & Policy Agent`

## Handoff payload

```yaml
ProfileToPolicyHandoff.v1:
  request_id: string
  traveler_profile_ref: string
  traveler_profile_version: "1.0"
  relevant_evidence_refs: []
  unknown_fields: []
  conflict_refs: []
  source_trip_request_ref: string
```

## Rules

- Raw conversation history handoff edilmez.
- Profile Agent preference/constraint classification yapmaz.
- TM-AG-002 kendi görevi için original `TripRequest`'in gerekli disclosure alanlarını ayrıca ContextAssembler üzerinden alabilir.
- Output schema geçersizse handoff yapılmaz.
- ContextManifest/handoff trace aynı `request_id` ve `trace_id` ile izlenebilir olmalıdır.
- Conflict varsa downstream'e görünür biçimde aktarılır; silently resolved profile gönderilmez.

## Failure codes

```text
PROFILE_HANDOFF_SCHEMA_INVALID
PROFILE_HANDOFF_MISSING_EVIDENCE
PROFILE_HANDOFF_SCOPE_LEAK
PROFILE_HANDOFF_CONFLICT_HIDDEN
```
