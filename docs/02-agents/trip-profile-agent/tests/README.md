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

## Geçme kriteri

- Tüm çıktılar output schema ile uyumlu olmalı.
- Kritik test başarı oranı %100 olmalı.
- Toplam assertion başarı oranı en az %95 olmalı.
- Çelişkiler sessizce çözülmemeli.
- Eksik bütçe veya tarih uydurulmamalı.
- Agent rota veya öneri üretmemeli.
