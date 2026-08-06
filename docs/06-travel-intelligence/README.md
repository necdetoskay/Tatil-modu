# Travel Intelligence Architecture

## Amaç

Tatil Modu içinde farklı veri ve kanıt türlerini kullanıcıya özel seyahat zekâsına dönüştüren ortak intelligence katmanını tanımlar.

Bu katman:

- yorumları,
- hava ve iklim verisini,
- kalabalık sinyallerini,
- otopark ve ulaşım bilgisini,
- çocuk/aile ihtiyaçlarını,
- bütçe ve fiyat sinyallerini,
- güvenlik ve erişilebilirlik verisini

ortak claim, observation, assessment ve recommendation modelleriyle işler.

## Mimari sınır

```text
Data Source & Trust Architecture
→ Hangi veriye ne kadar güveniyoruz?

Travel Intelligence Architecture
→ Bu kanıt kullanıcı için ne anlama geliyor?
```

## İlk belgeler

- [TI-001 — Travel Intelligence Architecture](TI-001-TRAVEL-INTELLIGENCE-ARCHITECTURE.md)
- [Common Claim Model](common-claim-model.md)
- [Observation Model](observation-model.md)
- [Intelligence Module Contract](intelligence-module-contract.md)
- [Travel Intelligence Test Standard](travel-intelligence-test-standard.md)

## Planlanan modüller

```text
Review Intelligence
Place Intelligence
Crowd Intelligence
Weather Intelligence
Child & Family Intelligence
Food Intelligence
Budget Intelligence
Safety Intelligence
Parking Intelligence
Accessibility Intelligence
Route Intelligence
Recommendation Intelligence
Explanation Intelligence
```
