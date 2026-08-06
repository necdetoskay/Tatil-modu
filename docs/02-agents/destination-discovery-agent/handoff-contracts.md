# Destination Discovery Agent — Handoff Contracts

## Producer girdisi

### Trip Profile Agent → Destination Discovery Agent

Contract: `TripProfile`

Zorunlu alanlar:

- origin,
- destination mode/scope,
- travel party,
- dates/duration,
- transportation,
- budget,
- trip preferences,
- hard constraints.

Kabul politikası:

- `invalid` TripProfile reddedilir,
- `partial` profil kritik alanlar yeterliyse kabul edilir,
- varsayımlar aynen taşınır.

## Consumer çıktısı

Contract: `DestinationCandidateSet`

Consumerlar:

### Places & Experiences Agent

Kullanır:

- candidate identity,
- geographic scope,
- recommended research scope,
- risks,
- source references.

### Accommodation Agent

Kullanır:

- shortlisted candidate areas,
- family/budget fit,
- geographic boundaries,
- access risks.

### Food & Local Taste Agent

Kullanır:

- destination identity,
- subregion,
- local research scope.

### Orchestrator

Kullanır:

- ranking,
- rejected candidates,
- hard constraint status,
- confidence,
- warnings.

## Handoff kabul şartları

- schema valid,
- contract version supported,
- en az bir aday veya açıklanmış invalid/partial durum,
- rank değerleri benzersiz,
- totalScore 0–1,
- source references kritik adaylarda boş değil,
- hard constraint fail olan aday shortlist'te değil.
