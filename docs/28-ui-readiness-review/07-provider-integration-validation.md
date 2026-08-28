# Provider Integration Validation

## Current boundary

The web planning API now calls destination and route providers through `CapabilityRegistry` and `executeWithRegistry`. The provider adapters own provider-shaped fixture data; the web layer no longer owns Yalova or route facts.

| Capability | Adapter | Mode | Status |
|---|---|---|---|
| `place_discovery` | `mock:destination-fixture` | fixture | fixture-tested |
| `route_lookup` | `mock:route-fixture` | fixture | fixture-tested |
| `route_lookup` | `mapbox-directions-v5` | live candidate | QUALIFIED, not ACTIVE |

The registry applies a 250ms timeout and two attempts for retryable timeout, rate-limit, and unavailable outcomes. Non-retryable malformed and empty results fail closed. API tests cover completed, warning, blocker, and invalid intake outcomes; registry tests cover timeout, retry, rate-limit, fallback, and inactive-provider behavior.

## Gate boundary

`liveProviderIntegrationAllowed` remains `false`. A live smoke run requires an explicitly configured provider credential and a successful current qualification run; no credential is stored in the repository and no live claim is made by fixture tests.

The reproducible command is `pnpm provider:smoke`. On 2026-08-28 it was safely not executed because `MAPBOX_ACCESS_TOKEN` was not configured (`LIVE_SMOKE_NOT_RUN`); the gate therefore remains closed.
