/* =================================================
   TENNIS JOURNAL — app.js
   ================================================= */

// ===== STORAGE =====
const KEY = { matches: 'tj_matches', training: 'tj_training' };

function lsGet(k) {
  try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

// ===== STATE =====
let matches  = lsGet(KEY.matches);
let training = lsGet(KEY.training);

const state = {
  view:          'journal',  // journal | detail | add-match | stats | training
  detailId:      null,
  editId:        null,
  formSets:      [{ p: '', o: '' }],
  showTrainForm: false,
};

function saveMatches()  { lsSet(KEY.matches,  matches);  }
function saveTraining() { lsSet(KEY.training, training); }

// ===== UTILS =====
function genId()   { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function today()   { return new Date().toISOString().slice(0, 10); }

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m - 1]} ${+day}, ${y}`;
}

function fmtScore(sets) {
  return (sets || [])
    .filter(s => s.p !== '' && s.o !== '')
    .map(s => `${s.p}–${s.o}`)
    .join('  ');
}

function surfaceLabel(s) {
  return { hard: 'Hard', clay: 'Clay', grass: 'Grass', indoor: 'Indoor' }[s] || (s || '');
}

// ===== NAVIGATION =====
function navigate(view, extras = {}) {
  state.view = view;

  if (extras.detailId !== undefined) state.detailId = extras.detailId;

  if (view === 'add-match') {
    if (extras.editId !== undefined) {
      state.editId = extras.editId;
      const m = matches.find(x => x.id === extras.editId);
      state.formSets = m
        ? m.sets.map(s => ({ p: String(s.p), o: String(s.o) }))
        : [{ p: '', o: '' }];
    } else {
      state.editId  = null;
      state.formSets = [{ p: '', o: '' }];
    }
  }

  render();
  window.scrollTo(0, 0);
}

// ===== RENDER DISPATCHER =====
const app = document.getElementById('app');

function render() {
  // Sync active tab highlight
  const tabView = state.view === 'detail' ? 'journal' : state.view;
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === tabView)
  );

  switch (state.view) {
    case 'journal':   renderJournal();   break;
    case 'detail':    renderDetail();    break;
    case 'add-match': renderAddMatch();  break;
    case 'stats':     renderStats();     break;
    case 'training':  renderTraining();  break;
    default:          renderJournal();
  }
}

// ===== JOURNAL =====
function renderJournal() {
  const sorted = [...matches].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
  );

  if (!sorted.length) {
    app.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎾</div>
        <h2 class="empty-title">No matches logged yet</h2>
        <p class="empty-sub">Start recording your matches to track your progress over time.</p>
        <button class="btn-primary" onclick="navigate('add-match')">+ Log Your First Match</button>
      </div>`;
    return;
  }

  app.innerHTML = `
    <div class="journal-header">
      <span class="journal-count">${sorted.length} match${sorted.length !== 1 ? 'es' : ''}</span>
      <button class="btn-primary" onclick="navigate('add-match')">+ Add Match</button>
    </div>
    <div class="match-list">
      ${sorted.map(renderMatchCard).join('')}
    </div>`;
}

function renderMatchCard(m) {
  const score = fmtScore(m.sets);
  return `
    <div class="match-card" onclick="navigate('detail', {detailId:'${m.id}'})">
      <div class="match-card-result match-card-result--${m.result}">${m.result === 'win' ? 'W' : 'L'}</div>
      <div class="match-card-body">
        <div class="match-card-top">
          <span class="match-opp">vs ${escHtml(m.opponent)}</span>
          <span class="match-date">${fmtDate(m.date)}</span>
        </div>
        <div class="match-card-mid">
          ${m.location ? `<span class="match-loc">📍 ${escHtml(m.location)}</span>` : ''}
          ${m.surface  ? `<span class="badge-surf badge-surf--${m.surface}">${surfaceLabel(m.surface)}</span>` : ''}
        </div>
        ${score ? `<div class="match-score">${escHtml(score)}</div>` : ''}
      </div>
      <div class="match-card-arrow">›</div>
    </div>`;
}

// ===== MATCH DETAIL =====
function renderDetail() {
  const m = matches.find(x => x.id === state.detailId);
  if (!m) { navigate('journal'); return; }

  const validSets = (m.sets || []).filter(s => s.p !== '' && s.o !== '');

  app.innerHTML = `
    <div class="detail-view">
      <div class="detail-nav">
        <button class="back-btn" onclick="navigate('journal')">← Journal</button>
        <div class="detail-actions">
          <button class="btn-secondary" onclick="navigate('add-match', {editId:'${m.id}'})">Edit</button>
          <button class="btn-danger"    onclick="deleteMatch('${m.id}')">Delete</button>
        </div>
      </div>

      <div class="detail-header">
        <div class="detail-result detail-result--${m.result}">${m.result === 'win' ? 'WIN' : 'LOSS'}</div>
        <div>
          <h2 class="detail-opp">vs ${escHtml(m.opponent)}</h2>
          <div class="detail-meta">
            <span>${fmtDate(m.date)}</span>
            ${m.location ? `<span class="meta-sep">·</span><span>${escHtml(m.location)}</span>` : ''}
            ${m.surface  ? `<span class="meta-sep">·</span><span class="badge-surf badge-surf--${m.surface}">${surfaceLabel(m.surface)}</span>` : ''}
          </div>
        </div>
      </div>

      ${validSets.length ? `
      <div class="detail-section">
        <div class="section-title">Score by Set</div>
        <div class="sets-display">
          ${validSets.map((s, i) => `
            <div class="set-box ${+s.p > +s.o ? 'set-box--won' : 'set-box--lost'}">
              <div class="set-label">Set ${i + 1}</div>
              <div class="set-score">${s.p}–${s.o}</div>
            </div>`).join('')}
        </div>
      </div>` : ''}

      ${m.notes ? `
      <div class="detail-section">
        <div class="section-title">Match Notes</div>
        <div class="notes-content">${escHtml(m.notes).replace(/\n/g, '<br>')}</div>
      </div>` : ''}
    </div>`;
}

function deleteMatch(id) {
  if (!confirm('Delete this match? This cannot be undone.')) return;
  matches = matches.filter(m => m.id !== id);
  saveMatches();
  navigate('journal');
}

// ===== ADD / EDIT MATCH =====
function renderAddMatch() {
  const editing = state.editId ? matches.find(m => m.id === state.editId) : null;
  const f = editing || {};

  const setsHtml = state.formSets.map((s, i) => `
    <div class="set-row" id="set-row-${i}">
      <span class="set-row-label">Set ${i + 1}</span>
      <input type="number" class="set-input" id="sp-${i}"
             value="${escHtml(String(s.p))}" min="0" max="99" placeholder="0"
             oninput="updateSet(${i},'p',this.value)"/>
      <span class="set-sep">–</span>
      <input type="number" class="set-input" id="so-${i}"
             value="${escHtml(String(s.o))}" min="0" max="99" placeholder="0"
             oninput="updateSet(${i},'o',this.value)"/>
      ${state.formSets.length > 1
        ? `<button type="button" class="set-remove" onclick="removeSet(${i})" title="Remove set">×</button>`
        : ''}
    </div>`).join('');

  const isWin  = (f.result === 'win')  || !f.result;
  const isLoss = (f.result === 'loss');

  app.innerHTML = `
    <div class="form-view">
      <div class="form-nav">
        <button class="back-btn" onclick="handleFormBack()">← ${editing ? 'Back' : 'Journal'}</button>
        <h2 class="form-title">${editing ? 'Edit Match' : 'Log Match'}</h2>
      </div>

      <form id="matchForm" onsubmit="submitMatch(event)">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="fDate">Date <span class="req">*</span></label>
            <input class="form-input" type="date" id="fDate"
                   value="${f.date || today()}" required/>
          </div>
          <div class="form-group">
            <label class="form-label" for="fSurface">Surface</label>
            <select class="form-select" id="fSurface">
              ${['hard','clay','grass','indoor'].map(s =>
                `<option value="${s}"${(f.surface || 'hard') === s ? ' selected' : ''}>${surfaceLabel(s)}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="fOpp">Opponent <span class="req">*</span></label>
          <input class="form-input" type="text" id="fOpp"
                 value="${escHtml(f.opponent || '')}"
                 placeholder="e.g. John Smith" required/>
        </div>

        <div class="form-group">
          <label class="form-label" for="fLoc">Tournament / Location</label>
          <input class="form-input" type="text" id="fLoc"
                 value="${escHtml(f.location || '')}"
                 placeholder="e.g. Club Championship, Court 3"/>
        </div>

        <div class="form-group">
          <label class="form-label">Score by Set</label>
          <div id="setsContainer">${setsHtml}</div>
          ${state.formSets.length < 5
            ? `<button type="button" class="btn-add-set" onclick="addSet()">+ Add Set</button>`
            : ''}
        </div>

        <div class="form-group">
          <label class="form-label">Result <span class="req">*</span></label>
          <div class="result-toggle">
            <label class="result-option result-win-opt${isWin ? ' result-option--active' : ''}">
              <input type="radio" name="result" value="win" ${isWin ? 'checked' : ''}/>
              <span>Win</span>
            </label>
            <label class="result-option result-loss-opt${isLoss ? ' result-option--active' : ''}">
              <input type="radio" name="result" value="loss" ${isLoss ? 'checked' : ''}/>
              <span>Loss</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="fNotes">Match Notes</label>
          <textarea class="form-textarea" id="fNotes" rows="5"
                    placeholder="Tactics used, what went well, areas to improve…">${escHtml(f.notes || '')}</textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary btn-lg">
            ${editing ? 'Save Changes' : 'Log Match'}
          </button>
        </div>
      </form>
    </div>`;

  // Wire result-toggle visual feedback
  document.querySelectorAll('input[name="result"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.result-option').forEach(o => o.classList.remove('result-option--active'));
      radio.closest('.result-option').classList.add('result-option--active');
    });
  });
}

function handleFormBack() {
  if (state.editId) {
    navigate('detail', { detailId: state.editId });
  } else {
    navigate('journal');
  }
}

function updateSet(idx, field, val) {
  if (state.formSets[idx]) state.formSets[idx][field] = val;
}

function addSet() {
  if (state.formSets.length >= 5) return;
  state.formSets.push({ p: '', o: '' });
  renderAddMatch();
}

function removeSet(idx) {
  state.formSets.splice(idx, 1);
  renderAddMatch();
}

function submitMatch(e) {
  e.preventDefault();

  const date     = document.getElementById('fDate').value;
  const opponent = document.getElementById('fOpp').value.trim();
  const location = document.getElementById('fLoc').value.trim();
  const surface  = document.getElementById('fSurface').value;
  const resultEl = document.querySelector('input[name="result"]:checked');
  const notes    = document.getElementById('fNotes').value.trim();

  if (!date || !opponent) { alert('Please fill in the required fields.'); return; }

  const result = resultEl ? resultEl.value : 'win';

  // Collect sets from live DOM inputs (latest values)
  const sets = state.formSets.map((_, i) => ({
    p: parseInt(document.getElementById(`sp-${i}`)?.value || '0', 10),
    o: parseInt(document.getElementById(`so-${i}`)?.value || '0', 10),
  }));

  if (state.editId) {
    const idx = matches.findIndex(m => m.id === state.editId);
    if (idx !== -1) {
      matches[idx] = { ...matches[idx], date, opponent, location, surface, sets, result, notes };
    }
  } else {
    matches.push({
      id: genId(), date, opponent, location, surface, sets, result, notes,
      createdAt: Date.now(),
    });
  }

  saveMatches();
  state.formSets = [{ p: '', o: '' }];
  navigate('journal');
}

// ===== STATS =====
function computeStats() {
  const total  = matches.length;
  const wins   = matches.filter(m => m.result === 'win').length;
  const losses = total - wins;
  const winPct = total ? Math.round(wins / total * 100) : 0;

  // Surface breakdown
  const surfStats = ['hard', 'clay', 'grass', 'indoor'].map(s => {
    const ms = matches.filter(m => m.surface === s);
    const sw = ms.filter(m => m.result === 'win').length;
    return { surface: s, total: ms.length, wins: sw, pct: ms.length ? Math.round(sw / ms.length * 100) : 0 };
  }).filter(s => s.total > 0);

  // Current streak — from most-recent match outward
  const sorted = [...matches].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
  );
  let streak = 0, streakType = null;
  for (const m of sorted) {
    if (!streakType)            { streakType = m.result; streak = 1; }
    else if (m.result === streakType) streak++;
    else break;
  }

  return { total, wins, losses, winPct, surfStats, streak, streakType, sorted };
}

function renderStats() {
  if (!matches.length) {
    app.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <h2 class="empty-title">No data yet</h2>
        <p class="empty-sub">Log some matches to see your statistics here.</p>
        <button class="btn-primary" onclick="navigate('add-match')">+ Log a Match</button>
      </div>`;
    return;
  }

  const { total, wins, losses, winPct, surfStats, streak, streakType, sorted } = computeStats();

  const streakHtml = streak > 0 ? `
    <div class="streak-banner streak-banner--${streakType}">
      <span>${streakType === 'win' ? '🔥' : '📉'}</span>
      <span><strong>${streak}-match</strong> ${streakType === 'win' ? 'win' : 'losing'} streak</span>
    </div>` : '';

  const surfBarsHtml = surfStats.map(s => `
    <div class="surf-row">
      <span class="surf-label">${surfaceLabel(s.surface)}</span>
      <div class="surf-bar-track">
        <div class="surf-bar-fill surf-bar-fill--${s.surface}" style="width:${s.pct}%"></div>
      </div>
      <span class="surf-pct">${s.pct}%</span>
      <span class="surf-rec">${s.wins}–${s.total - s.wins}</span>
    </div>`).join('');

  const recentDots = sorted.slice(0, 10).map(m => `
    <span class="form-dot form-dot--${m.result}"
          title="${fmtDate(m.date)} vs ${escHtml(m.opponent)}"
    >${m.result === 'win' ? 'W' : 'L'}</span>`).join('');

  app.innerHTML = `
    <div class="stats-view">
      ${streakHtml}

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-big">${total}</span>
          <span class="stat-label">Matches</span>
        </div>
        <div class="stat-card">
          <span class="stat-big stat-big--green">${wins}</span>
          <span class="stat-label">Wins</span>
        </div>
        <div class="stat-card">
          <span class="stat-big stat-big--red">${losses}</span>
          <span class="stat-label">Losses</span>
        </div>
        <div class="stat-card">
          <span class="stat-big">${winPct}%</span>
          <span class="stat-label">Win Rate</span>
        </div>
      </div>

      <div class="win-rate-bar">
        <div class="win-rate-fill" style="width:${winPct}%">
          ${winPct >= 15 ? `<span class="win-rate-label">${wins}W</span>` : ''}
        </div>
        <div class="loss-rate-fill">
          ${(100 - winPct) >= 15 ? `<span class="loss-rate-label">${losses}L</span>` : ''}
        </div>
      </div>

      ${surfStats.length ? `
      <div class="section-card">
        <div class="section-title">Win % by Surface</div>
        <div class="surf-bars">${surfBarsHtml}</div>
      </div>` : ''}

      <div class="section-card">
        <div class="section-title">Recent Form (last ${Math.min(sorted.length, 10)})</div>
        <div class="recent-form">
          ${recentDots}
          <span class="form-arrow">← most recent</span>
        </div>
      </div>
    </div>`;
}

// ===== TRAINING =====
function renderTraining() {
  const sorted = [...training].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
  );

  const formHtml = state.showTrainForm ? `
    <div class="train-form-wrap">
      <div class="section-title">New Training Session</div>
      <form id="trainForm" onsubmit="submitTraining(event)">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="tDate">Date</label>
            <input class="form-input" type="date" id="tDate" value="${today()}"/>
          </div>
          <div class="form-group">
            <label class="form-label" for="tDuration">Duration</label>
            <input class="form-input" type="text" id="tDuration" placeholder="e.g. 90 min"/>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="tFocus">Focus Area</label>
          <input class="form-input" type="text" id="tFocus"
                 placeholder="e.g. Serve, Footwork, Backhand cross-court…"/>
        </div>
        <div class="form-group">
          <label class="form-label" for="tNotes">Notes</label>
          <textarea class="form-textarea" id="tNotes" rows="4"
                    placeholder="What did you drill? Key takeaways, things to keep working on…"></textarea>
        </div>
        <div class="form-actions form-actions--row">
          <button type="submit" class="btn-primary">Save Session</button>
          <button type="button" class="btn-secondary" onclick="toggleTrainForm(false)">Cancel</button>
        </div>
      </form>
    </div>` : '';

  const sessionsHtml = sorted.length
    ? sorted.map(t => `
      <div class="train-card">
        <div class="train-card-head">
          <div>
            <span class="train-date">${fmtDate(t.date)}</span>
            ${t.focus    ? `<span class="train-focus">${escHtml(t.focus)}</span>` : ''}
          </div>
          <div class="train-card-right">
            ${t.duration ? `<span class="train-dur">${escHtml(t.duration)}</span>` : ''}
            <button class="btn-icon-del" onclick="deleteTraining('${t.id}')" title="Delete">×</button>
          </div>
        </div>
        ${t.notes ? `<div class="train-notes">${escHtml(t.notes).replace(/\n/g, '<br>')}</div>` : ''}
      </div>`).join('')
    : `<div class="empty-inline">No training sessions logged yet.</div>`;

  app.innerHTML = `
    <div class="training-view">
      <div class="training-header">
        <span class="journal-count">${sorted.length} session${sorted.length !== 1 ? 's' : ''}</span>
        ${!state.showTrainForm
          ? `<button class="btn-primary" onclick="toggleTrainForm(true)">+ Add Session</button>`
          : ''}
      </div>
      ${formHtml}
      <div class="train-list">${sessionsHtml}</div>
    </div>`;
}

function toggleTrainForm(show) {
  state.showTrainForm = show;
  renderTraining();
}

function submitTraining(e) {
  e.preventDefault();
  const date     = document.getElementById('tDate').value;
  const focus    = document.getElementById('tFocus').value.trim();
  const duration = document.getElementById('tDuration').value.trim();
  const notes    = document.getElementById('tNotes').value.trim();

  training.push({ id: genId(), date, focus, duration, notes, createdAt: Date.now() });
  saveTraining();
  state.showTrainForm = false;
  renderTraining();
}

function deleteTraining(id) {
  if (!confirm('Delete this training session?')) return;
  training = training.filter(t => t.id !== id);
  saveTraining();
  renderTraining();
}

// ===== INIT =====
function init() {
  // Tab click — delegated
  document.getElementById('tabsBar').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn || !btn.dataset.view) return;
    navigate(btn.dataset.view);
  });

  // Show journal on load
  navigate('journal');
}

document.addEventListener('DOMContentLoaded', init);
