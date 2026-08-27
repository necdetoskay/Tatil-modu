# TM-AG-012 — Decision Rules

| ID | Rule | Oracle |
|---|---|---|
| RV-001 | Entity mismatch record valid sample'a giremez. | mismatched entity counted → FAIL |
| RV-002 | Window dışı record valid sample'a giremez. | out-of-window counted → FAIL |
| RV-003 | Duplicate records mention/prevalence'i şişiremez. | duplicate contribution > 1 group contribution → FAIL |
| RV-004 | Policy tarafından spam-suspect dışlanan record valid sample'a giremez. | excluded spam counted → FAIL |
| RV-005 | Empty/unusable record valid sample'a giremez. | unusable counted → FAIL |
| RV-006 | `prevalence = mentionCount / validSampleSize` when validSampleSize > 0. | arithmetic mismatch → FAIL |
| RV-007 | validSampleSize=0 ise recurring signal üretilemez. | signal present → FAIL |
| RV-008 | Tek record high-confidence recurring theme olamaz. | one-record high confidence → FAIL |
| RV-009 | Confidence quality-policy thresholdsına bağlıdır. | confidence without policyRuleRefs → FAIL |
| RV-010 | Small sample policy ceiling'i aşamaz. | confidence above configured ceiling → FAIL |
| RV-011 | Stale snapshot CURRENT diye reuse edilemez. | stale REUSED current → FAIL |
| RV-012 | Snapshot entity/window mismatch ise REUSED olamaz. | mismatch reused → FAIL |
| RV-013 | Snapshot policy version mismatch ise explicit compatibility rule olmadan REUSED olamaz. | incompatible reuse → FAIL |
| RV-014 | Sufficient fresh compatible snapshot varsa broad full-history refresh yapılmaz. | unnecessary broad pull → policy FAIL |
| RV-015 | ReviewSignal official fact üretmez. | opening hours/official price/policy claim → R6 FAIL |
| RV-016 | ReviewSignal OfficialFact'i override edemez. | experiential replaces authoritative claim → FAIL |
| RV-017 | `snapshotMode=REFRESHED` ise prior snapshot ref + new provider/window provenance görünür olmalıdır. | refresh provenance missing → FAIL |
| RV-018 | `snapshotMode=REUSED` ise inputSnapshotRef zorunludur. | reused without ref → FAIL |
| RV-019 | Raw body durable retention license policy'yi geçmelidir. | prohibited raw persistence → FAIL |
| RV-020 | Snapshot write durable state değildir. | direct knowledge write → R6 FAIL |
| RV-021 | Source count unique provider sayısıdır. | duplicated provider counted twice → FAIL |
| RV-022 | Mention count valid deduped sample içinden hesaplanır. | rejected records influence theme → FAIL |
| RV-023 | Mixed/opposed observations disagreement'i confidence basis'te görünür etkiler. | strong conflict hidden → FAIL |
| RV-024 | Segment relevance explicit metadata yoksa UNKNOWN/NONE kalır. | inferred family status → FAIL |

## Deterministic hygiene order

```text
raw records
→ entity filter
→ analysis-window filter
→ unusable removal
→ duplicate grouping/suppression
→ spam policy
→ valid sample
→ semantic theme extraction
→ deterministic counts/prevalence
→ policy-driven confidence calibration
```

Semantic extractor deterministic hygiene sırasını değiştiremez.
