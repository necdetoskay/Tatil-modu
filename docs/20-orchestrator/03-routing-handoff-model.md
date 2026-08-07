# Routing & Handoff Model

## Temel kural
Expert agent'lar birbirini doğrudan çağırmaz. Tüm stage geçişleri Orchestrator tarafından canonical workflow ve handoff contract'a göre yönlendirilir.

## Routing kararı girdileri
- current stage
- workflow blueprint
- prerequisite completion
- contract validation sonucu
- policy/gate sonucu
- evidence/verification durumu
- blocker/warning sınıfı
- retry budget
- quality report action

## Routing sonuçları
```yaml
route_action:
  - dispatch_next
  - dispatch_parallel
  - request_revision
  - request_missing_input
  - request_verification
  - apply_fallback
  - send_to_quality_review
  - send_to_final_composer
  - block
  - terminate
```

## Handoff kabul koşulları
Bir handoff downstream'e yalnız:
1. producer ownership doğruysa,
2. contract version destekleniyorsa,
3. required alanlar mevcutsa,
4. provenance/evidence gereksinimleri sağlanıyorsa,
5. unresolved hard blocker yoksa,
6. policy sonucu geçişe izin veriyorsa kabul edilir.

## Routing anti-pattern'leri
- agent A'nın agent B'yi doğrudan çağırması
- Orchestrator'ın eksik alanı tahmin ederek doldurması
- warning'i sessizce hard-pass'e çevirmek
- stale evidence'ı fresh kabul etmek
- final composer'a quality gate öncesi gönderim
- privacy constraint'i genel preference gibi ele almak
