# Test Architecture Principles

## Ana hedef
Test mimarisi yalnız kodun çalıştığını değil, Tatil Modu'nun canonical davranış sınırlarını koruduğunu kanıtlar.

## İlkeler
1. UI testleri bu fazın kapsamı dışındadır.
2. Her kritik katmanın bağımsız test suite'i vardır.
3. E2E testler yalnız bireysel suite'ler geçtikten sonra anlamlıdır.
4. P0 invariant'lar deterministic testlerle korunur.
5. LLM çıktıları exact-text yerine semantic/contract invariant'larıyla değerlendirilir.
6. Mock mode ile model/provider mode ayrıdır.
7. Her test canonical requirement veya failure mode'a trace edilebilir olmalıdır.
8. Regression suite yalnız geçmiş bug'ları değil, freeze edilmiş davranışları da korur.
9. Test verisi canlı provider'a bağımlı olmaz.
10. UI Unlock bir ürün kararı değil, ölçülebilir acceptance gate sonucudur.
