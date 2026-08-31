# H3 Registry & Retry Validation Record

## Scope
Second H3/L2 slice validation marker.

Covers:
- capability registry
- primary/fallback provider selection
- retryable vs non-retryable faults
- maxAttempts enforcement
- provider timeout normalization
- deterministic fallback behavior

## Gate
```yaml
primary_gate: L2 Capability
status: pending_ci
p0_failures_allowed: 0
```
