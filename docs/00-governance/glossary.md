# Terimler Sözlüğü

| Terim | Tanım |
|-------|-------|
| **Agent** | Belirli bir göreve sahip, bağımsız çalışabilen, başka ajanlarla kontratlı iletişim kuran yapay zeka bileşeni. |
| **Orchestrator** | Agentları yöneten, görev dağıtan, sonuçları birleştiren, çakışmaları çözen merkezi kontrol bileşeni. Hiç araştırma yapmaz. |
| **TripProfile** | Trip Profile Agent'ın ürettiği, tüm diğer agentların girdi olarak kullandığı yapılandırılmış kullanıcı/trip profili nesnesi. |
| **Fixture Mode** | Testlerde tüm girdiler önceden hazırlanmış JSON'den gelir. Hiç API çağrısı yapılmaz. Hızlı, ucuz, deterministik. |
| **Live Mode** | Testlerde gerçek API'ler, web arama ve harici servisler kullanılır. Entegrasyon ve güncellik testi için. |
| **Handoff Contract** | Bir agent'ın çıktısının diğer agent'ın girdisi olarak kabul edilmesi için gerekli olan JSON şeması ve alan tanımları. |
| **Confidence Score** | Agent'ın kararına ne kadar güvendiğini gösteren 0-1 arası değer. Eksiksizlik × kural uyumu. |
| **Conflict Flags** | Agent'ın tespit ettiği çelişkili/girilmesi gereken girdiler. Agent sessizce kabul etmez. |
| **Profile Readiness** | Orchestrator'ın Trip Profile Agent'ın çıktısını değerlendirirken kullandığı kritik: confidence ≥ 0.80 ve conflictFlags boş. |
| **Triple Evaluation** | Test sonucunu üç farklı motorla değerlendirme: Schema Validator + Rule Evaluator + LLM Reviewer. |
| **Composable Prompt** | Uzun promptlar yerine, katmanlara ayrılmış prompt bileşenleri (universal rules, role, task, schema, quality). |
| **MCP (Model Context Protocol)** | Agentların LLM'lere bağlam sağlama protokolü. Bu proje için entegrasyon planı vardır. |
| **Rubric** | Bir test senaryosu için kazanımlı kontrol listesi (checklist). Her kural bir kontrol. Skor = geçen / toplam. |
