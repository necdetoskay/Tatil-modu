# Trip Intake Agent Specification

**Agent adı:** Trip Intake Agent  
**Agent türü:** intake / normalization agent  
**Durum:** canonical pre-code specification  
**Kodlama durumu:** kapalı  
**Prototype durumu:** kapalı

## 1. Purpose

Trip Intake Agent, kullanıcının serbest metin tatil isteğini yapılandırılmış bir seyahat talebine dönüştürür.

Bu agent'ın temel görevi şudur:

```text
Kullanıcının ne istediğini, neyi kesin söylediğini, neyin eksik olduğunu ve hangi bilgilerin varsayım olamayacağını ayırmak.
```

Trip Intake Agent plan üretmez.

Trip Intake Agent rota önermez.

Trip Intake Agent otel, plaj, etkinlik veya şehir seçmez.

## 2. Non-goals

Bu agent aşağıdakileri yapmaz:

- tatil planı oluşturmaz,
- destinasyon sıralamaz,
- otel veya konaklama önermiz,
- aktivite uygunluğu değerlendirmez,
- trafik / otopark analizi yapmaz,
- kadınlar plajı veya mahremiyet uygunluğu doğrulamaz,
- fiyat / bütçe tahmini yapmaz,
- canlı provider veya tool çağırmaz,
- memory'ye doğrudan yazmaz,
- kullanıcıya nihai cevap oluşturmaz.

## 3. Inputs

Trip Intake Agent aşağıdaki inputları alabilir:

| Input | Zorunlu mu? | Açıklama |
|---|---:|---|
| `user_message` | evet | Kullanıcının serbest metin isteği |
| `conversation_context_summary` | opsiyonel | Aynı konuşmadaki önceki açık bilgiler |
| `memory_disclosure_package` | opsiyonel | Memory Platform tarafından minimum gerekli bilgiyle hazırlanmış disclosure |
| `locale_context` | opsiyonel | Dil, ülke, para birimi, tarih formatı gibi bağlam |
| `current_date_context` | opsiyonel | Göreli tarihleri çözmek için sistem tarihi |

## 4. Outputs

Agent tek bir yapılandırılmış çıktı üretir:

```yaml
trip_request_draft:
  origin:
    value: null
    source: user_explicit | conversation_context | memory_disclosure | missing
    confidence: high | medium | low
  destination:
    value: null
    source: user_explicit | conversation_context | memory_disclosure | missing | open_choice
    confidence: high | medium | low
  duration:
    days: null
    nights: null
    source: user_explicit | inferred_from_dates | missing
  dates:
    start_date: null
    end_date: null
    flexibility: fixed | flexible | user_delegated | missing
  travelers:
    adults: null
    children:
      - age: null
    source: user_explicit | memory_disclosure | missing
  transport:
    mode: own_car | public_transport | flight | unknown
  budget:
    amount: null
    currency: TRY
    source: user_explicit | missing
  preferences:
    women_only_beach_required: null
    child_friendly_required: null
    midday_rest_required: null
    low_fatigue_required: null
    daily_alternatives_required: null
  constraints:
    hard: []
    soft: []
  missing_required_fields: []
  clarification_questions: []
  assumptions_not_allowed: []
  handoff_notes: []
```

## 5. Required context

Trip Intake Agent yalnızca aşağıdaki bağlamlara ihtiyaç duyar:

- kullanıcının son isteği,
- aynı konuşmadaki açıkça belirtilmiş seyahat bilgileri,
- Memory Platform tarafından verilmiş minimum aile/travel disclosure,
- tarih yorumlamak için current date context,
- para birimi ve dil için locale context.

## 6. Forbidden context

Trip Intake Agent şu bilgilere erişmemelidir:

- tüm canonical memory dump,
- geçmiş tüm konuşmalar,
- provider credential bilgileri,
- canlı otel / rota / fiyat / hava durumu verileri,
- kullanıcıya ait gereksiz kişisel bilgiler,
- çocuklarla ilgili gereksiz hassas detaylar,
- ödeme veya kimlik bilgileri.

## 7. Dependencies

Trip Intake Agent şu bileşenlere bağımlıdır:

| Bileşen | Bağımlılık türü | Açıklama |
|---|---|---|
| Travel Orchestrator | caller | Agent'ı yalnız orchestrator çağırır |
| Memory Platform | indirect | Sadece disclosure package üzerinden bilgi alır |
| Contract Schema | required | Output, request/response schema ile uyumlu olmalıdır |
| Locale Context Provider | optional | Tarih/dil/para birimi yorumlama için |

Trip Intake Agent hiçbir expert agent'ı doğrudan çağırmaz.

## 8. Handoff rules

Trip Intake Agent çıktısı aşağıdaki agent/bileşenlere aktarılabilir:

| Hedef | Aktarılan bilgi |
|---|---|
| Constraint & Policy Agent | hard/soft constraint taslağı, eksik alanlar |
| Family Suitability Agent | traveler yaşları, aile/çocuk bilgisi, dinlenme ihtiyacı |
| Destination Candidate Agent | origin, destination açıklığı, süre, bütçe |
| Travel Orchestrator | missing fields, clarification questions, assumptions not allowed |

Handoff sırasında user_message raw şekilde her agent'a verilmez.

Her agent yalnız kendi işi için gerekli alanları almalıdır.

## 9. Hard constraints

Trip Intake Agent aşağıdaki bilgileri hard constraint adayı olarak işaretleyebilir:

- çocuk yaşları,
- kişi sayısı,
- çıkış noktası,
- ulaşım tipi,
- tarih / süre,
- bütçe üst sınırı,
- kadınlar plajı zorunluluğu,
- öğlen dinlenmesi zorunluluğu,
- düşük yorgunluk gereksinimi,
- günlük alternatif zorunluluğu,
- maksimum mesafe / sürüş toleransı.

Bu agent hard constraint enforcement yapmaz.

Sadece candidate constraint olarak sınıflandırır.

## 10. Evidence requirements

Trip Intake Agent için evidence, dış kaynak evidence'ı değildir.

Bu agent'ın evidence'ı şunlardır:

| Evidence türü | Açıklama |
|---|---|
| `user_explicit_quote` | Kullanıcının açıkça söylediği ifade |
| `conversation_context_reference` | Aynı konuşmada daha önce verilen bilgi |
| `memory_disclosure_reference` | Memory Platform tarafından verilen disclosure alanı |
| `inference_note` | Çok düşük riskli normalizasyon gerekçesi |

Örnek:

```yaml
origin:
  value: Kocaeli
  source: user_explicit
  evidence:
    type: user_explicit_quote
    text: "Kocaeli'de oturuyorum"
```

## 11. Confidence rules

Trip Intake Agent confidence değerlerini şöyle belirler:

| Confidence | Koşul |
|---|---|
| high | Kullanıcı açıkça söylemiş veya memory disclosure açık ve güncel |
| medium | Aynı konuşmadan güçlü bağlam var ama son mesajda tekrar edilmemiş |
| low | Dil belirsizliği, eksik tarih, belirsiz hedef, belirsiz kişi sayısı |

`low` confidence olan alanlar downstream agent tarafından kesin bilgi gibi kullanılamaz.

## 12. Failure modes

| Failure mode | Davranış |
|---|---|
| destination_missing | Destination `open_choice` veya `missing` olarak işaretlenir |
| dates_missing | Tarih varsayılmaz, clarification question önerilir |
| traveler_count_missing | Eksik işaretlenir, memory varsa disclosure kaynağı belirtilir |
| budget_missing | Budget null kalır, planlamada bütçe esnekliği olarak yorumlanmaz |
| conflicting_context | Çelişen alanlar `conflict` notu ile döner |
| unsafe_private_data | Gereksiz kişisel bilgi output'a taşınmaz |

## 13. Clarification triggers

Trip Intake Agent aşağıdaki durumlarda clarification question üretir:

- hedef il/bölge hiç yoksa ve kullanıcı açık seçim istemiyorsa,
- tarih/süre yoksa ve planlama için zorunluysa,
- kişi sayısı veya çocuk yaşları yoksa,
- bütçe gerekli ama verilmemişse,
- ulaşım tipi belirsizse,
- kadınlar plajı gibi hassas preference belirsiz ama planı ciddi etkiliyorsa,
- kullanıcı hem düşük yorgunluk hem çok uzak lokasyon istiyorsa,
- kullanıcı hem fixed tarih hem “sana bırakıyorum” gibi çelişkili ifade kullandıysa.

Clarification soruları kısa, somut ve tek boyutlu olmalıdır.

## 14. Fixture requirements

Bu agent için minimum fixture seti:

| Fixture ID | Amaç |
|---|---|
| `TM-INTAKE-001` | Kocaeli çıkışlı, 2 yetişkin 2 çocuk, 3 gün, bütçeli istek |
| `TM-INTAKE-002` | Tarih kullanıcıya bırakılmış istek |
| `TM-INTAKE-003` | Destination missing, sadece tatil isteği var |
| `TM-INTAKE-004` | Kadınlar plajı hassasiyeti içeren deniz planı isteği |
| `TM-INTAKE-005` | Çelişkili tarih/süre bilgisi |
| `TM-INTAKE-006` | Memory disclosure ile tamamlanan aile bilgisi |

## 15. Evaluation rubric

Trip Intake Agent şu ölçütlerle değerlendirilir:

| Ölçüt | Beklenti |
|---|---|
| Explicit fact extraction | Kullanıcının açık söylediği bilgileri eksiksiz çıkarır |
| Missing field detection | Eksik alanları varsaymaz |
| Constraint classification | Hard/soft constraint ayrımını doğru yapar |
| Sensitive preference handling | Hassas tercihleri gereğinden fazla yaymaz |
| No planning leakage | Plan, rota, otel veya aktivite önermez |
| Handoff hygiene | Downstream agent'a sadece gerekli alanları hazırlar |
| Confidence accuracy | Belirsiz alanları low/medium olarak işaretler |

Hard fail örnekleri:

- Kullanıcı tarih vermediği halde tarih uydurmak,
- kadınlar plajı tercihinden genel dini/profil çıkarımı yapmak,
- çocuk yaşını bilmeden aile uygunluğu kesinleştirmek,
- destination yokken şehir seçmek,
- plan üretmeye başlamak,
- memory'ye yazılacak kalıcı tercih önermek.

## 16. Example contract sketch

```yaml
agent_id: trip_intake_agent
input_contract: trip_intake_request_v1
output_contract: trip_intake_response_v1
allowed_capabilities: []
allowed_memory_access: disclosure_only
writes_canonical_memory: false
calls_other_agents: false
produces_final_user_response: false
```

## 17. Open design questions

- Trip Intake Agent tek seferde kaç clarification question önerebilir?
- User-delegated date seçimi nasıl temsil edilmeli?
- Memory disclosure ile gelen çocuk yaşları kaç gün/ay toleransla güncel kabul edilmeli?
- Kullanıcı “sana bırakıyorum” dediğinde hangi alanlar user_delegated sayılır?
- Trip Intake Agent confidence alanlarını numeric mi categorical mı taşımalı?

## 18. Current status

```yaml
agent_spec_status: drafted
implementation_allowed: false
prototype_allowed: false
next_agent_spec: constraint-policy-agent.md
```
