# Test Data and Fixture Governance

## Amaç
Test sonuçlarının tekrar üretilebilir, güvenli ve versiyonlanabilir olmasını sağlamak.

## Fixture sınıfları
```yaml
fixture_types:
  - unit_fixture
  - contract_fixture
  - agent_fixture
  - integration_fixture
  - golden_scenario
  - adversarial_fixture
  - regression_fixture
  - model_eval_fixture
```

## Kurallar
1. Deterministic suite canlı internet/provider verisine bağlı olmaz.
2. Fixture içinde gerçek kullanıcı kişisel verisi kullanılmaz.
3. Hassas senaryolar sentetik veriyle temsil edilir.
4. Fixture canonical contract version taşır.
5. Expected outcome mümkün olduğunca structured assertion içerir.
6. Golden baseline değişikliği review gerektirir; test geçsin diye sessizce güncellenmez.
7. Bug fix sonrası yeni regression fixture eklenir.
8. Model eval fixture seti versionlanır; farklı modeller aynı version üzerinde karşılaştırılır.
9. Provider mock cevapları success yanında timeout, stale, conflict, malformed ve unavailable durumlarını kapsar.
10. Test fixture governance canonical davranış değişikliğini gizleyemez.

## Versioning
```yaml
fixture_package:
  fixture_id: required
  fixture_version: required
  contract_version: required
  scenario_type: required
  severity_refs: []
  requirement_refs: []
  input: required
  mock_dependencies: optional
  expected_assertions: required
```

## Golden değişiklik politikası
Golden expected davranış yalnız:
- canonical design amendment,
- approved bug correction,
- contract version migration
nedeniyle değiştirilebilir. Model farklı cevap verdi diye baseline modele uydurulmaz.
