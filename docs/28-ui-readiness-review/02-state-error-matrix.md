# UI State and Error Matrix

| State | User-visible result | Allowed action | Final plan visible? |
|---|---|---|---|
| `idle` | Yeni plan başlatma | İstek gir | Hayır |
| `collecting_input` | Intake ve eksik alanlar | Bilgi ekle/düzenle | Hayır |
| `clarification_required` | Az sayıda kritik soru | Soruyu yanıtla | Hayır |
| `planning` | İlerleme ve bekleme açıklaması | Güvenli retry/cancel | Hayır |
| `partial_result` | Etkilenen bölümler ve belirsizlikler | Eksik kanıtı tamamla/revise | Yalnız açıkça partial olarak |
| `completed` | Doğrulanmış plan ve disclosures | İncele/revise/export | Evet |
| `blocked` | Blocker nedeni ve recovery action | Kanıt sağla, constraint değiştir veya geri dön | Hayır |
| `failed` | Teknik hata ve tekrar deneme bilgisi | Retry veya yeniden başlat | Hayır |
| `revising` | Değişen scope ve korunmuş bölümler | Bekle/iptal et | Önceki plan açıkça stale ise |

## Error semantics

- `hard_blocker` ve `blocker` metinsel olarak görünür; progressive disclosure altında gizlenmez.
- `warning` planı geçersiz kılmaz fakat karar etkisi kullanıcıya gösterilir.
- `unverified`, `stale` veya `unknown` bilgi kesin gerçek gibi etiketlenmez.
- `clarification_required` kullanıcıya soru veya etkilenen alanla birlikte gösterilir.
- Verification `blocked` ise UI final planı tamamlanmış/verified olarak gösteremez.
- Revision sonucu hangi bölümlerin değiştiğini ve hangi bölümlerin korunduğunu belirtir.
