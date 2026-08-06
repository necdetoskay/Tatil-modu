# Trip Profile Agent — Handoff Contracts

| Alan | Değer |
|---|---|
| Document ID | AGENT-002-HC |
| Sürüm | 1.0 |
| Durum | Onay Bekliyor |
| Bağımlılıklar | AGENT-002, ARCH-002 (Agent Catalog) |
| Son Güncelleme | 2026-08-06 |

## Amaç

Trip Profile Agent'ın çıktısının diğer agentlar tarafından nasıl tüketildiğini tanımlar. Her handoff contract, alıcı agent için gerekli olan TripProfile alanlarını, tiplerini ve geçerlilik kurallarını belirtir.

## 1. TripProfile → Destination Research Agent

**Contract Name**: `TripProfileSummary`

```json
{
  "budget": { "totalTRY": "number", "perPersonPerNightTRY": "number" },
  "dates": { "durationDays": "number", "seasonPreference": "string?" },
  "preferences": { "tripTypes": [{ "type": "string" }] },
  "transportation": { "vehicleType": "string" }
}
```

**Geçerlilik**: `confidence.score ≥ 0.50`, `conflicts` boş mu kontrol et. Eğer `status === "invalid"`, Destination Research Agent hemen başarısız olur.

## 2. TripProfile → Accommodation Agent

**Contract Name**: `AccommodationRequest`

```json
{
  "travelParty": {
    "adults": "number",
    "children": [{ "age": "number", "ageBand": "string" }]
  },
  "budget": {
    "perPersonPerNightTRY": "number",
    "scope": "string?",
    "budgetFlexibility": "string"
  },
  "preferences": {
    "mustHaveFeatures": ["step_free_access", "accessible_bathroom", "free_parking", "kid_club", ...]
  },
  "specialRequirements": [{ "category": "string", "strength": "hard" }]
}
```

**Geçerlilik**:
- `travelParty.adults ≥ 1`
- `budget.perPersonPerNightTRY > 0` (veya `missingInformation` kontrolü)

## 3. TripProfile → Route Planner Agent

**Contract Name**: `RouteRequest`

```json
{
  "travelParty": {
    "children": [{ "age": "number", "ageBand": "string" }],
    "elderlyCount": "number",
    "accessibilityRequired": "boolean"
  },
  "transportation": { "vehicleType": "string", "drivingRangeKm": "number?" },
  "dates": { "durationDays": "number" },
  "budget": { "scope": "string?" }
}
```

**Geçerlilik**:
- `travelParty.children[].age` 0-17 arasında olmalı
- `transportation.vehicleType` geçerli enum olmalı (çelişki yoksa)

## 4. TripProfile → Budget Evaluator Agent

**Contract Name**: `BudgetConstraint`

```json
{
  "budget": {
    "totalTRY": "number",
    "perPersonPerNightTRY": "number",
    "scope": "string?",
    "budgetFlexibility": "string"
  },
  "dates": { "durationDays": "number" },
  "transportation": { "vehicleType": "string" },
  "travelParty": { "totalTravelers": "number" }
}
```

## 5. TripProfile → Orchestrator

**Contract Name**: `ProfileReadiness`

```json
{
  "tripProfileId": "string",
  "status": "complete|partial|invalid",
  "confidence": "number (0-1)",
  "conflictCount": "number",
  "validationErrorCount": "number",
  "missingFieldCount": "number",
  "canProceed": "boolean",
  "reason": "string"
}
```

### Profile Readiness Kuralı

| confidence | conflictCount | validationErrorCount | canProceed |
|-----------|---------------|---------------------|------------|
| ≥ 0.80 | 0 | 0 | true |
| ≥ 0.50 | ≤ 2 | ≤ 1 | true (uyarı) |
| < 0.50 | any | any | false |
| any | > 3 | any | false |

## 6. Test Edilebilirlik

Her handoff contract için ayrı bir **contract test** yazılır:

```typescript
test('TripProfile → DestinationResearch input contract', () => {
  const output = loadFixture('tpa-001').output;
  const { valid, errors } = validateHandoff('TripProfileSummary', output);
  expect(valid).toBe(true);
});
```

Bu sayede Destination Research Agent'ı çalıştırmadan Trip Profile Agent'ın çıktısı test edilebilir.
