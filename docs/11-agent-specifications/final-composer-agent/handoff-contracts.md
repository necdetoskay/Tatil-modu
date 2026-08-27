# TM-AG-016 — Handoff Contracts

## Upstream

Final Composer receives only a Verification PASS package:
- verification result ref,
- verified snapshot ref/hash,
- verified itinerary/alternatives/budget,
- ExplanationBundle with matching snapshot hash,
- warning refs + mandatory warning refs,
- render policy snapshot.

## Output

`FinalTravelPlan.v1` is terminal user-facing structured artifact.

It carries:
- verified snapshot binding,
- render policy binding,
- render generation refs,
- section-level source/claim/value binding refs,
- deterministic renderValidation.

## No downstream fact mutation

Any later UI/channel-specific renderer may alter layout only. It may not alter fact/value/warning semantics without creating a new validated artifact.

## Snapshot invalidation

If any upstream verified structured object changes after composition:

```text
old FinalTravelPlan invalid
→ new Verification run if snapshot changed
→ new Explanation if rationale universe changed
→ new Final Composer run
```

## Failure handoff

Final Composer validation failure returns to Orchestrator as rendering/authority defect; it must not silently repair upstream data.
