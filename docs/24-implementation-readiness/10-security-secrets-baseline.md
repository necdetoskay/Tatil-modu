# Security and Secrets Baseline

## Amaç
Headless geliştirme sırasında bile provider anahtarları, hassas memory ve test verisinin kontrolsüz kullanımını önlemek.

## İlk faz güvenlik ilkeleri
1. Deterministic test suite secrets gerektirmez.
2. Live provider credential'ları source code, fixture veya log içine yazılmaz.
3. `.env.example` yalnız key adlarını içerir; gerçek değer içermez.
4. Eval secrets production secrets'tan ayrılır.
5. CI secrets yalnız ihtiyaç duyan L8/job scope'una açılır.
6. Agent prompt/loglarında hassas memory default olarak redacted olur.
7. Test fixture'larında gerçek kişisel veri kullanılmaz.
8. Capability permission deny-by-default yaklaşımı kullanır.

## Secret sınıfları
```yaml
secret_classes:
  provider_api_key: high
  model_api_key: high
  database_credential: high
  signing_secret: high
  public_endpoint: not_secret
```

## Test safety
- network default disabled/blocked where feasible
- mutation capability default disabled
- fake payment/booking only
- production endpoint denylist/allowlist controls
- accidental live-call detector

## Logging
Asla raw secret, auth header veya full sensitive memory payload loglanmaz. Structured event yalnız redacted identifier/reference taşır.

## Future production gate
Production secrets management, rotation, encryption-at-rest, RBAC ve incident response ayrı production-readiness aşamasında detaylandırılır.
