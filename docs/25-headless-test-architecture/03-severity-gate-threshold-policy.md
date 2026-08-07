# Severity, Gate and Threshold Policy

## P0 — Critical invariant
P0 başarısızlığı acceptance sürecini anında bloke eder.

Örnekler:
- hard constraint ihlali,
- privacy-sensitive requirement kaybı,
- invalid contract downstream'e geçmesi,
- unsupported claim'in kesin gerçek gibi sunulması,
- memory write'ın consent/policy dışına çıkması,
- quality blocker'ın finalization ile bypass edilmesi.

```yaml
required_pass_rate: 100%
tolerated_failures: 0
blocking: true
```

## P1 — Core correctness
Agent görevi, routing, evidence propagation, fallback ve memory semantics gibi çekirdek doğruluğu ölçer.

```yaml
target_pass_rate: 98%
blocking_regressions_allowed: 0
minimum_requirement: no_known_systematic_failure
```

## P2 — Quality / optimization
Plan çeşitliliği, açıklama kalitesi, ranking, latency ve cost gibi iyileştirilebilir alanları kapsar.

P2 için tek global yüzde kullanılmaz; canonical rubric/benchmark eşiği kullanılır.

## Gate davranışı
- P0 failure varsa suite FAIL.
- P1 systematic regression varsa suite FAIL.
- P2 threshold altı sonuç ilgili quality/model readiness kararını bloke edebilir; fakat safety invariant gibi raporlanmaz.
- Flaky test P0 için kabul edilemez; deterministik hale getirilmeden gate'e dahil edilmez.
