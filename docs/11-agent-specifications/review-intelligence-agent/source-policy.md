# TM-AG-012 — Source Policy

## Source class

Review Intelligence uses experiential sources only.

Primary inputs:
- normalized reviews from allowed review providers,
- provider aggregate/review metadata,
- permitted prior `ReviewInsightSnapshot`.

## Rules

1. Review evidence is `EXPERIENTIAL`, not `AUTHORITATIVE` for official operational claims.
2. Review provider identity alone does not imply high confidence; sample/window/quality matter.
3. Single anonymous or low-quality review cannot support high-confidence recurring signal.
4. Source coverage must be reported; single-source concentration lowers robustness where policy says so.
5. Snapshot reuse requires entity, window, policy version and freshness compatibility.
6. Raw review-body retention follows source/license policy; derived signals are preferred durable output.
7. Provider snippets/ratings cannot be converted into current opening hours, prices, policies or availability.
8. Segment relevance is used only from explicitly available metadata, never inferred sensitive traits.

## Official conflict rule

A review-derived experiential signal and an OfficialFact are not necessarily contradictory.

Example:
```text
OfficialFact: parking facility exists.
ReviewSignal: parking frequently difficult on weekends.
```

Both may coexist because claim types differ.
