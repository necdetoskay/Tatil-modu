# TM-AG-011 — Handoff Contracts

## Requesters via Orchestrator

- TM-AG-003 Destination Research
- TM-AG-004 Place Intelligence
- TM-AG-005 Accommodation
- TM-AG-006 Food & Local Taste
- TM-AG-014 Verification

Each request must include:
- `claimRef`,
- `subjectRef`,
- `claimType`,
- asserted/question value,
- effective date/window,
- verification policy.

## Output to consumers

`OfficialFact` contains:
- status,
- resolvedValue,
- exact verification scope,
- claim-specific authority/freshness evidence,
- conflicts,
- source lookup path,
- source feedback.

Consumers cannot interpret `UNKNOWN` as false. `UNKNOWN` means not sufficiently established.

## Issue #50 feedback

Source feedback may be sent to TM-BG-001/TM-SR-001 pipeline:
- HEALTHY,
- DEGRADED,
- DEAD,
- REPLACED,
- SCOPE_MISMATCH,
- NEW_SOURCE_DISCOVERED.

This is a write candidate only. Durable registry update requires background verification/gate.

## Invalid handoff

- `VERIFIED` without authoritative evidence,
- `CONTRADICTED` without contradicting evidence,
- status without effective scope,
- review text as OfficialFact evidence,
- source-registry record treated as claim proof.
