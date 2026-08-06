# Trip Profile Agent Test Suite

## Fixture alanları

- `testId`
- `name`
- `category`
- `critical`
- `input`
- `expectedStatus`
- `assertions`

## Operatörler

```text
equals
equalsAny
contains
containsAll
containsAny
containsExactly
containsText
notContains
hasLength
minimumLength
greaterThan
lessThan
isNull
isNotNull
exists
notExists
matchesRegex
```

## Test dosyaları

| Dosya | Açıklama |
|-------|----------|
| `contract.test.ts` | Schema, required fields, enum, confidence range |
| `behavioral.test.ts` | Decision rule compliance (R-01 ~ R-06) |
| `scenario.test.ts` | Zor gerçek dünya senaryoları |
| `adversarial.test.ts` | Çelişkili, yanıltıcı girdiler |

## Triple Evaluation

Her testte üç motor çalışır:

1. **Schema Validator** — JSON Schema (Zod)
2. **Rule Evaluator** — Deterministic rule engine
3. **LLM Reviewer** — Yapılandırılmış prompt → puan + gerekçe

LLM Reviewer tek başına geçme/kalma kararı veremez.

## Geçme kriteri

- Tüm çıktılar output schema ile uyumlu olmalı.
- Schema testleri %100 geçmeli.
- Kritik test başarı oranı %100 olmalı.
- Toplam assertion başarı oranı en az %95 olmalı.
- Çelişkiler sessizce çözülmemeli.
- Eksik bütçe veya tarih uydurulmamalı.
- Agent rota veya öneri üretmemeli.
