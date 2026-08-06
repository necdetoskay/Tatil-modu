# Capability Contracts

Bu klasör, Capability Registry içinde tanımlanan yeteneklerin ayrıntılı input/output sözleşmelerini içerir.

İlk contract paketi:

- `geo.geocode`
- `directions.matrix`
- `places.search`
- `weather.forecast`

Her capability klasörü şunları içerir:

```text
specification.md
input.schema.json
output.schema.json
fixtures/
```

Provider adapterları bu contract'ları uygular; agentlar provider-specific alanları doğrudan tüketmez.
