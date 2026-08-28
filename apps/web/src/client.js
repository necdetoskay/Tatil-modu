const app = document.querySelector('#app');
let state = { kind: 'intake' };

function render() {
  if (state.kind === 'intake') {
    app.innerHTML = '<h2>Planınızı anlatın</h2><p class="muted">Kritik bilgileri kısa tutuyoruz.</p><div class="grid"><label>Başlangıç noktası<input data-testid="origin" value="Istanbul"></label><label>Hedef bölge<input data-testid="region" value="Marmara"></label><label>Kaç gün?<input data-testid="days" type="number" value="2"></label><label>Bütçe (₺)<input data-testid="budget" type="number" value="40000"></label></div><button data-action="confirm">Devam et</button>';
    return;
  }
  if (state.kind === 'confirm') {
    app.innerHTML = '<h2>Sizi doğru anladık mı?</h2><p class="muted">Planı çalıştırmadan önce sınırları onaylayın.</p><div class="notice"><strong>Olmazsa olmazlar</strong><ul><li>Çocuklar için düşük yorgunluk</li><li>Öğle dinlenme aralığı</li><li>Deniz önerilirse kadınlara özel plaj kanıtı</li></ul></div><p><span class="pill">2 gün</span> <span class="pill">₺40.000 bütçe</span> <span class="pill">Marmara</span></p><button data-action="plan">Planı oluştur</button><button class="secondary" data-action="back">Düzenle</button>';
    return;
  }
  if (state.kind === 'loading') {
    app.innerHTML = '<h2>Plan hazırlanıyor…</h2><p class="muted" aria-live="polite">API; sınırları, rotayı ve doğrulamayı kontrol ediyor.</p><div class="notice">Polling ile planlama durumu izleniyor. Final plan doğrulama tamamlanana kadar final plan gösterilmez.</div>';
    return;
  }
  const plan = state.viewModel;
  const blocked = plan.status === 'blocked';
  const warnings = plan.verificationWarnings.length ? '<strong>Uyarılar</strong><ul>' + plan.verificationWarnings.map((item) => '<li>' + item + '</li>').join('') + '</ul>' : '';
  const finalContent = '<div class="grid"><div><strong>Süre</strong><br>' + plan.durationDays + ' gün</div><div><strong>Tempo</strong><br>' + plan.travelStyle + '</div></div><div class="notice"><strong>Verification</strong><p>' + plan.disclosures.map((item) => item.message + ' (' + item.status + ')').join('<br>') + '</p>' + warnings + '</div>' + plan.days.map((day) => '<article class="day"><h3>Gün ' + day.dayNumber + ' · ' + day.theme + '</h3>' + day.blocks.map((block) => '<div class="block"><strong>' + block.label + '</strong>' + block.title + '<div class="muted">' + block.notes.join(' ') + '</div></div>').join('') + '<p><strong>Alternatifler</strong></p><div class="alternatives">' + day.alternatives.map((item) => '<span class="alternative">' + item + '</span>').join('') + '</div></article>').join('') + '<button class="danger" data-action="blocked">Kanıt eksik senaryosunu göster</button><button class="secondary" data-action="back">Yeni plan</button>';
  app.innerHTML = '<div aria-live="polite"><span class="pill">' + (blocked ? 'Doğrulama engeli' : 'Doğrulandı') + '</span><h2>' + plan.title + '</h2><p class="lede">' + plan.summary + '</p>' + (blocked ? '<div class="notice" role="alert"><strong>Plan durduruldu</strong><p>Gerekli kanıt bulunamadığı için final plan gösterilmiyor.</p><ul>' + plan.blockers.map((item) => '<li>' + item + '</li>').join('') + '</ul></div>' : finalContent) + '</div>';
}

async function start(mode) {
  const payload = { ...state.request, ...(mode ? { mode } : {}) };
  state = { kind: 'loading', request: payload };
  render();
  const response = await fetch('/api/plans', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const job = await response.json();
  if (!response.ok) { state = { kind: 'intake' }; render(); return; }
  poll(job.id);
}

async function poll(id) {
  const response = await fetch('/api/plans/' + id);
  const job = await response.json();
  if (job.status === 'planning') { setTimeout(() => poll(id), 40); return; }
  state = { kind: 'result', request: state.request, viewModel: job.viewModel };
  history.pushState({}, '', job.status === 'blocked' ? '/blocked' : '/plan');
  render();
}

app.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  const action = button?.dataset.action;
  if (!action) return;
  if (action === 'confirm') state = { kind: 'confirm', request: { origin: document.querySelector('[data-testid=origin]').value, targetRegion: document.querySelector('[data-testid=region]').value, durationDays: Number(document.querySelector('[data-testid=days]').value), budgetAmount: Number(document.querySelector('[data-testid=budget]').value) } };
  if (action === 'plan') void start();
  if (action === 'blocked') void start('blocked');
  if (action === 'back') { state = { kind: 'intake' }; history.pushState({}, '', '/'); }
  if (action !== 'plan' && action !== 'blocked') render();
});
window.addEventListener('popstate', () => { state = { kind: 'intake' }; render(); });
render();
