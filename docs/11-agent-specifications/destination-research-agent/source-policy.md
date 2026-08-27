# TM-AG-003 — Source Policy

## Source precedence

1. **Tier 1** — Bakanlık, valilik, belediye, resmî turizm/korunan alan/tesis sahibi kaynakları.
2. **Tier 2** — structured geocoding ve climate provider.
3. **Tier 3** — yalnız ikincil bağlam; region fact doğrulamasında tek kaynak olamaz.
4. **Tier 4** — discovery-only; kritik fact'i kesinleştiremez.

## Claim-specific rules

### Region identity / administrative scope
- resmî idari kaynak veya trusted geocoding.

### Tourism themes
- resmî turizm kaynağı tercih edilir.
- genel web yalnız yeni theme keşfi için kullanılabilir; verified status veremez.

### Seasonality
- resmî seasonal guidance veya `TL-007 Climate Normals`.
- climate normal açıkça forecast'ten ayrılır.

### Closure/access rule
- resmî kaynak gerekir; yoksa unresolved.

## Conflict handling

Kaynaklar çelişirse:

- daha yüksek tier,
- daha güncel evidence,
- claim type'a daha doğrudan kaynak

önceliklidir. Çelişki çözülemiyorsa `unresolvedClaims` ve düşük confidence.

## Freshness

Her evidence `retrievedAt` ve `freshnessStatus` taşır. Stale kritik claim `VERIFIED_REGION_CONTEXT` üretemez.

## Forbidden source behaviors

- Tier 4 blogu resmî fact gibi sunmak,
- kaynak URL/ref olmadan verified claim,
- model pretraining bilgisini güncel bölgesel fact gibi kullanmak,
- review verisini public authority confirmation yerine koymak.
