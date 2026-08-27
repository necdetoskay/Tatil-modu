# TM-AG-015 — Handoff Contracts

## Upstream

Explanation receives only Verification PASS package:
- verification result ref,
- verified snapshot ref/hash,
- explainable records,
- verified support/decision/constraint/warning refs.

If verification status is not PASS, normal explanation handoff is invalid.

## Downstream to TM-AG-016 Final Composer

Handoff includes:
- `ExplanationBundle` ref,
- exact verified snapshot ref/hash,
- verification result ref,
- explanation policy snapshot ref,
- blocks with support/asserted-claim refs,
- unresolvedWarnings approved for final display.

Final Composer may format/shorten but cannot add facts or change rationale meaning.

## Snapshot mismatch rule

If Final Composer receives an ExplanationBundle whose verified snapshot hash differs from the verified itinerary/budget package, composition must fail before rendering.

## Invalid explanation block

Any block with unsupported claim or uncertainty promotion is rejected upstream; invalid block cannot be silently dropped if required explanation coverage policy says it is mandatory. Coverage gap remains visible.
