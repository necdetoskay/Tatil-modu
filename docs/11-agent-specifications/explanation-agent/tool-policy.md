# TM-AG-015 — Tool Policy

## Allowed

- `TL-012` Schema Validator
- deterministic claim-support/subset validator

## Forbidden external tools

- Web Search
- Official Page Fetcher
- Place Search
- Directions
- Weather
- Accommodation Search
- Review provider
- Price lookup

Explanation Agent is a renderer of verified rationale, not a researcher.

## Tool leakage oracle

Any external-world tool call by TM-AG-015 → R6 FAIL.

## Post-generation validation

After text generation:
1. extract/normalize factual claims,
2. map to `assertedClaimRefs`,
3. verify each claim is allowed + supported,
4. verify uncertainty level is not upgraded,
5. reject invalid block before downstream handoff.
