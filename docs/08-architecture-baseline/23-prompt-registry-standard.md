# Tatil Modu — Prompt Registry Standardı

**Doküman türü:** Prompt yönetimi ve yönetişim standardı
**Teknik kod adı:** `prompt_registry`
**Sürüm:** 1.0 Taslak
**Kritiklik:** Çok yüksek
**Durum:** Dokümantasyon aşaması

## 1. Amaç

Prompt Registry, Tatil Modu içindeki tüm sistem, agent, judge ve tool kullanım promptlarının merkezi, sürümlü, test edilebilir ve geri alınabilir şekilde yönetilmesini sağlar.

Amaç:

- üretim promptlarının kod içine dağılmasını engellemek,
- her prompt değişikliğini eval sonuçlarıyla ilişkilendirmek,
- prompt drift riskini azaltmak,
- rollback ve kontrollü rollout sağlamak,
- agent davranışını izlenebilir hale getirmektir.

## 2. Temel İlkeler

- Üretim promptları kod içine gömülmez.
- Her prompt benzersiz kimlik ve sürüm taşır.
- Her prompt belirli agent/model/tool bağlamına aittir.
- Prompt değişikliği eval çalıştırmadan üretime çıkmaz.
- Prompt içeriği checksum ile doğrulanır.
- Prompt rollback destekler.
- Gizli sistem promptları kullanıcıya veya dış kaynaklara açılmaz.
- Prompt içindeki tool yetkileri gerçek yetki yerine geçmez; yetki ACP ve gateway tarafından uygulanır.

## 3. Prompt Türleri

- `system_prompt`
- `agent_instruction`
- `tool_instruction`
- `judge_prompt`
- `repair_prompt`
- `extraction_prompt`
- `classification_prompt`
- `explanation_prompt`
- `fallback_prompt`

## 4. Prompt Kayıt Modeli

```json
{
  "prompt_id": "prompt.route_planner.system",
  "version": "1.2.0",
  "prompt_type": "system_prompt",
  "target": "route_planner_agent",
  "model_alias": "planner",
  "locale": "tr-TR",
  "status": "staging",
  "content_ref": "registry://prompts/route-planner/1.2.0",
  "checksum": "sha256:...",
  "owner": "travel-core-team",
  "created_at": "2026-08-06T18:00:00Z",
  "supersedes": "1.1.0",
  "linked_evals": [
    "golden_bursa_family_trip_v1"
  ],
  "rollback_target": "1.1.0"
}
```

## 5. Yaşam Döngüsü

- `draft`
- `review`
- `staging`
- `canary`
- `production`
- `deprecated`
- `archived`
- `rolled_back`

## 6. Sürümleme

Semantic Versioning kullanılır:

- major: davranış sözleşmesi değişikliği
- minor: yeni kabiliyet veya anlamlı iyileştirme
- patch: yazım, netlik veya düşük riskli düzeltme

Major sürüm değişikliği agent contract testlerini zorunlu kılar.

## 7. Değişkenler ve Template Alanları

Prompt template değişkenleri açıkça tanımlanır.

```json
{
  "variables": [
    {
      "name": "trip_context",
      "type": "json",
      "required": true,
      "max_size_chars": 12000
    }
  ]
}
```

Bilinmeyen veya tanımsız değişkenler prompt içine enjekte edilmez.

## 8. Prompt Katmanları

Önerilen birleşim sırası:

1. platform security instruction
2. agent system instruction
3. task-specific instruction
4. validated context
5. tool result summaries
6. output schema instruction

Dış web içeriği hiçbir zaman system instruction katmanına yerleştirilmez.

## 9. Prompt Güvenliği

- dış içerik veri olarak etiketlenir,
- prompt injection işaretleri quarantine edilir,
- tool çağrısı yalnızca ACP scope ile yapılır,
- secret veya token prompt içine yazılmaz,
- kullanıcı metni sistem promptuyla birleştirilmeden önce sınırlandırılır,
- output schema zorunlu tutulur.

## 10. Eval Bağlantısı

Her production prompt şu minimum eval setlerine bağlı olmalıdır:

- contract tests
- golden scenarios
- safety tests
- regression tests
- cost/latency benchmark

## 11. Rollout Stratejisi

- local
- development
- staging
- canary
- production

Canary sırasında:

- kalite
- maliyet
- latency
- hata oranı
- confidence calibration

karşılaştırılır.

## 12. Rollback

Rollback tetikleyicileri:

- golden scenario başarısızlığı
- safety regression
- maliyet artışı
- latency SLO ihlali
- hard constraint uyum düşüşü
- açıklanabilirlik skoru düşüşü

## 13. Prompt Diff

Her değişiklikte:

- eklenen talimatlar
- silinen talimatlar
- değişen output formatı
- yeni tool beklentileri
- yeni kısıtlar

raporlanır.

## 14. Prompt Bundle

Bir agent birden fazla prompt kullanabilir.

```json
{
  "bundle_id": "bundle.route_planner.v3",
  "prompts": [
    "prompt.route_planner.system@1.2.0",
    "prompt.route_planner.repair@1.0.1",
    "prompt.route_planner.explanation@1.1.0"
  ]
}
```

## 15. Model Alias Bağlantısı

Prompt doğrudan sağlayıcı model adına bağlanmaz.

Örnek aliaslar:

- `fast_classifier`
- `structured_extractor`
- `planner`
- `verifier`
- `judge`

## 16. Gözlemlenebilirlik

Her prompt çalıştırmasında:

- prompt_id
- version
- model_alias
- checksum
- token kullanımı
- latency
- output validity
- eval correlation
- error code

izlenir.

## 17. Hata Modeli

- `PROMPT_NOT_FOUND`
- `PROMPT_VERSION_UNSUPPORTED`
- `PROMPT_CHECKSUM_MISMATCH`
- `PROMPT_VARIABLE_MISSING`
- `PROMPT_TEMPLATE_INVALID`
- `PROMPT_EVAL_GATE_FAILED`
- `PROMPT_ROLLOUT_BLOCKED`
- `PROMPT_SECURITY_VIOLATION`

## 18. Testler

- missing variable
- unknown variable
- checksum mismatch
- schema output
- prompt injection
- rollback
- canary comparison
- model alias compatibility
- locale fallback

## 19. Kabul Kriterleri

- Üretim promptları registry dışında bulunmamalı.
- Her prompt sürüm ve checksum taşımalı.
- Production öncesi eval gate zorunlu olmalı.
- Rollback tek işlemle yapılabilmeli.
- Prompt/model bağımlılığı alias üzerinden yönetilmeli.
- Dış içerik system instruction olarak kullanılamamalı.
- Prompt değişiklikleri audit edilmelidir.
