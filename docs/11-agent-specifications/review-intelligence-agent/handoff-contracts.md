# TM-AG-012 — Handoff Contracts

## Upstream

### TM-AG-004 / TM-AG-005 / TM-AG-006
Provide:
- stable entityRef/provider refs,
- entity type,
- requested analysis purpose/window.

### TM-BG-001 / Travel Knowledge Store — Issue #50
May provide:
- prior ReviewInsightSnapshot,
- source/provider refs,
- lastUpdatedAt/freshness,
- quality/license policy refs.

Prior snapshot is reusable only if entity/window/policy/freshness compatible.

## Downstream

### TM-AG-004 Place Intelligence
Receives practical experiential signal refs; official eligibility remains separate.

### TM-AG-005 Accommodation
Receives experience themes such as cleanliness/noise/parking/room/location signals.

### TM-AG-006 Food
Receives food/service/value experiential signals.

### TM-AG-014 Verification
Receives full `ReviewSignalSet` including:
- sample metadata,
- data coverage,
- confidence basis,
- freshness,
- limitations,
- snapshot provenance,
- retention decision.

### Background knowledge subsystem
Receives `snapshotWriteCandidate` only. Durable write requires independent gate.

## Claim-family boundary

Consumers must not transform experiential signal into official fact.

```text
ReviewSignal(parking_experience=negative)
!=
OfficialFact(parking_exists=false)
```

## Invalid handoff

- signal without sample/window metadata,
- high-confidence single-review theme,
- stale snapshot labeled current,
- raw review body inside durable knowledge candidate when policy forbids it,
- snapshot write candidate treated as already committed knowledge.
