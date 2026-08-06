# Trip Profile Agent — Decision Rules

## Kaynak önceliği

Güncel kullanıcı mesajı eski bağlamdan önceliklidir.

## Çocuk yaşları

```text
0–1 infant
2 toddler
3–5 preschool
6–12 child
13–17 teenager
```

Negatif yaş veya 18+ değer çocuk olarak kabul edilmez.

## Toplam kişi

```text
totalTravelers = adults + children.length
```

## Tarih

Sabit tarih aralığının dahil gün sayısı ile belirtilen süre uyuşmazsa:

- code: `DATE_DURATION_MISMATCH`
- severity: `high`
- resolution: `ask_user`

## Bütçe

- Sıfır veya negatif bütçe geçersizdir.
- Yalnız otel bütçesi verilirse scope `accommodation_only` olur.
- Otel bütçesi toplam bütçeyi aşarsa `ACCOMMODATION_BUDGET_EXCEEDS_TOTAL` üretilir.
- `TL` ifadesi `TRY` olarak normalize edilir.

## Varsayım

Çocuk yaşına göre dinlenme veya bebek arabası uygunluğu olasılık olarak işaretlenebilir; kesin rutin uydurulamaz.

## Durum

- `complete`: temel bilgiler yeterli.
- `partial`: önemli eksik var ama planlama mümkün.
- `invalid`: kritik eksik, geçersiz veri veya yüksek/kritik çelişki var.

## Görev sınırı

Agent rota, tarih seçimi, otel, restoran veya fiyat önerisi üretmez.
