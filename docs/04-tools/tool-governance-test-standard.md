# Tool Governance & Observability Test Standard

## Adapter template compliance

- kimlik ve version alanları,
- request/response mapping,
- error/cost/source mapping,
- privacy ve fixture bölümleri.

## Secret & privacy

- secret repository scan,
- runtime secretRef,
- consent enforcement,
- log redaction,
- retention/deletion.

## Configuration

- precedence,
- version propagation,
- rollback,
- breaking change,
- disabled capability/provider.

## Batch/concurrency

- partial batch,
- deadline,
- cancellation,
- duplicate suppression,
- backpressure.

## Observability

- event schema,
- event order,
- trace propagation,
- cost/cache/error fields,
- sampling ve redaction.

## Capability quality

- hard gates,
- capability-specific metrics,
- provider comparison,
- regression threshold.

## Support matrix

- capability/version/region/mode uyumu,
- disabled provider exclusion,
- quality threshold,
- pricing reference.

## Kritik kriterler

- secret leakage: 0
- unsupported capability invocation: 0
- trace kırılması: 0
- invalid configuration production promotion: 0
- hard quality gate ihlali: 0
