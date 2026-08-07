# H4 / L2 Aggregate Memory Validation

Status: pending_ci

This aggregate gate validates the complete in-memory Memory Core on the latest main baseline.

## Required coverage
- direct agent write denial
- consent-gated canonical writes
- provenance preservation
- scope isolation
- expired/deleted/superseded/invalidated read exclusion
- origin precedence
- conflict representation without silent resolution
- current-request precedence over memory
- correction/supersession lifecycle
- forget/delete semantics
- disclosure metadata
- fresh / approaching-expiry / expired / inactive staleness classification
- deterministic snapshots independent of write order
- combined conflict -> correction -> forget lifecycle

## Gate
```yaml
primary_gate: L2 Memory
privacy_p0_failures_allowed: 0
production_database_required: false
```
