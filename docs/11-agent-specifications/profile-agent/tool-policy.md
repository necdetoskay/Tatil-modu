# TM-AG-001 — Tool Policy

## Allowed tools

```yaml
allowed_tools:
  - TL-012  # Schema Validator
```

`TL-012` yalnız input/output contract validation için harness/platform tarafından kullanılabilir. Profile Agent'ın dış dünyadan bilgi toplamak için kullanabileceği domain tool'u yoktur.

## Forbidden tools

```yaml
forbidden_tools:
  - TL-001  # Web Search
  - TL-002  # Official Page Fetcher
  - TL-003  # Geocoding
  - TL-004  # Place Search
  - TL-005  # Directions & Distance Matrix
  - TL-006  # Weather Forecast
  - TL-007  # Climate Normals
  - TL-008  # Accommodation Search
  - TL-009  # Review Data Provider
  - TL-010  # Price & Fee Lookup
  - TL-011  # Calculator for domain decisions
  - TL-013  # Rule Engine for downstream policy decisions
  - TL-014  # Agent-managed cache access
```

## Harness enforcement

Her tool request `ToolGateway` üzerinden geçer. Forbidden çağrı adapter'a ulaşmadan bloklanır.

```yaml
failure_class: AUTHORITY
failure_code: PROFILE_TOOL_VIOLATION
r_level: R6
```

Doğru final output üretmiş olsa bile forbidden tool call bulunan run FAIL olur.
