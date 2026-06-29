/* =================================================
   TENNIS JOURNAL — app.js
   ================================================= */

// ===== CONSTANTS =====
const MY_NAME = 'Laurentiu B.';

// ===== STORAGE =====
const KEYS = {
  leagueNotes:  'tj_league_notes',
  otherMatches: 'tj_other_matches',
};

function lsGet(k, def) {
  try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; }
  catch { return def; }
}
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

// ===== PRE-LOADED DATA =====

const SEASONS = [
  // ── 2025/26 (active) ────────────────────────────────────────────────────
  {
    id: '2025-26',
    label: '2025/26',
    status: 'active',

    myStats: { points: 16, played: 10, wins: 7, draws: 2, losses: 1, diff: 22, ranking: 'C30.3' },

    // Scores from my (Laurentiu) perspective: my–opp
    myMatches: [
      { id: 'lm1',  opponent: 'Franco Gueli',           my: 8,    opp: 6,    result: 'win'      },
      { id: 'lm2',  opponent: 'Laurent Gunsbourg',      my: 9,    opp: 7,    result: 'win'      },
      { id: 'lm3',  opponent: 'Guillaume Lainé',        my: 9,    opp: 6,    result: 'win'      },
      { id: 'lm4',  opponent: 'Georges Mensah',         my: 8,    opp: 6,    result: 'win'      },
      { id: 'lm5',  opponent: 'Christophe Jonckheere',  my: 9,    opp: 7,    result: 'win'      },
      { id: 'lm6',  opponent: 'Alain Braem',            my: 7,    opp: 7,    result: 'draw'     },
      { id: 'lm7',  opponent: 'Gilles Petit',           my: 12,   opp: 7,    result: 'win'      },
      { id: 'lm8',  opponent: 'Olivier Gatti',          my: 7,    opp: 7,    result: 'draw'     },
      { id: 'lm9',  opponent: 'Christopher Debuyst',    my: 12,   opp: 5,    result: 'win'      },
      { id: 'lm10', opponent: 'Jan Vavrovec',           my: 7,    opp: 8,    result: 'loss'     },
      { id: 'lm11', opponent: 'Louis Herbert',          my: null, opp: null, result: 'upcoming',
        date: '29/03/2026', time: '18:00' },
    ],

    standings: [
      { name: 'Gilles Petit',          ranking: 'C15.5', pts: 16, played: 9,  wins: 8, draws: 0, losses: 1, diff: 60  },
      { name: MY_NAME,                 ranking: 'C30.3', pts: 16, played: 10, wins: 7, draws: 2, losses: 1, diff: 22  },
      { name: 'Franco Gueli',          ranking: 'NC',    pts: 12, played: 8,  wins: 6, draws: 0, losses: 2, diff: 10  },
      { name: 'Georges Mensah',        ranking: 'C30.1', pts: 12, played: 11, wins: 6, draws: 0, losses: 5, diff: 0   },
      { name: 'Alain Braem',           ranking: 'C30.5', pts: 11, played: 9,  wins: 5, draws: 1, losses: 3, diff: 5   },
      { name: 'Louis Herbert',         ranking: 'NC',    pts: 10, played: 8,  wins: 5, draws: 0, losses: 3, diff: 16  },
      { name: 'Christopher Debuyst',   ranking: 'C30.2', pts: 10, played: 8,  wins: 5, draws: 0, losses: 3, diff: 1   },
      { name: 'Guillaume Lainé',       ranking: 'NC',    pts: 6,  played: 8,  wins: 3, draws: 0, losses: 5, diff: -1  },
      { name: 'Olivier Gatti',         ranking: 'C30.1', pts: 6,  played: 9,  wins: 2, draws: 2, losses: 5, diff: -9  },
      { name: 'Christophe Jonckheere', ranking: 'C30.4', pts: 3,  played: 8,  wins: 1, draws: 1, losses: 6, diff: -17 },
      { name: 'Laurent Gunsbourg',     ranking: 'C30.2', pts: 2,  played: 9,  wins: 1, draws: 0, losses: 8, diff: -31 },
      { name: 'Jan Vavrovec',          ranking: 'C30.6', pts: 2,  played: 8,  wins: 1, draws: 0, losses: 7, diff: -53 },
      { name: 'Xavier Naegel',         ranking: 'C30.4', pts: 0,  played: 0,  wins: 0, draws: 0, losses: 0, diff: 0   },
    ],

    // Most recent first
    allMatches: [
      { p1: 'Guillaume Lainé',        s1: 7,  p2: 'Georges Mensah',        s2: 9  },
      { p1: 'Christophe Jonckheere',  s1: 4,  p2: 'Georges Mensah',        s2: 7  },
      { p1: 'Olivier Gatti',          s1: 15, p2: 'Jan Vavrovec',           s2: 4  },
      { p1: 'Gilles Petit',           s1: 16, p2: 'Laurent Gunsbourg',      s2: 4  },
      { p1: MY_NAME,                  s1: 8,  p2: 'Franco Gueli',           s2: 6  },
      { p1: MY_NAME,                  s1: 9,  p2: 'Laurent Gunsbourg',      s2: 7  },
      { p1: 'Christopher Debuyst',    s1: 7,  p2: 'Christophe Jonckheere',  s2: 5  },
      { p1: 'Laurent Gunsbourg',      s1: 4,  p2: 'Christopher Debuyst',    s2: 11 },
      { p1: 'Olivier Gatti',          s1: 6,  p2: 'Georges Mensah',         s2: 8  },
      { p1: 'Guillaume Lainé',        s1: 6,  p2: MY_NAME,                  s2: 9  },
      { p1: 'Christophe Jonckheere',  s1: 7,  p2: 'Olivier Gatti',          s2: 7  },
      { p1: 'Laurent Gunsbourg',      s1: 5,  p2: 'Georges Mensah',         s2: 8  },
      { p1: 'Guillaume Lainé',        s1: 11, p2: 'Alain Braem',            s2: 6  },
      { p1: 'Georges Mensah',         s1: 6,  p2: MY_NAME,                  s2: 8  },
      { p1: 'Gilles Petit',           s1: 13, p2: 'Christopher Debuyst',    s2: 4  },
      { p1: 'Franco Gueli',           s1: 8,  p2: 'Guillaume Lainé',        s2: 7  },
      { p1: 'Alain Braem',            s1: 11, p2: 'Laurent Gunsbourg',      s2: 6  },
      { p1: 'Jan Vavrovec',           s1: 4,  p2: 'Alain Braem',            s2: 10 },
      { p1: 'Gilles Petit',           s1: 13, p2: 'Jan Vavrovec',           s2: 4  },
      { p1: 'Louis Herbert',          s1: 17, p2: 'Alain Braem',            s2: 4  },
      { p1: 'Guillaume Lainé',        s1: 4,  p2: 'Gilles Petit',           s2: 9  },
      { p1: 'Christophe Jonckheere',  s1: 9,  p2: 'Franco Gueli',           s2: 6  },
      { p1: 'Franco Gueli',           s1: 9,  p2: 'Alain Braem',            s2: 7  },
      { p1: MY_NAME,                  s1: 9,  p2: 'Christophe Jonckheere',  s2: 7  },
      { p1: 'Gilles Petit',           s1: 11, p2: 'Franco Gueli',           s2: 3  },
      { p1: 'Alain Braem',            s1: 7,  p2: MY_NAME,                  s2: 7  },
      { p1: 'Jan Vavrovec',           s1: 5,  p2: 'Georges Mensah',         s2: 11 },
      { p1: 'Guillaume Lainé',        s1: 10, p2: 'Christophe Jonckheere',  s2: 5  },
      { p1: 'Louis Herbert',          s1: 12, p2: 'Jan Vavrovec',           s2: 7  },
      { p1: 'Gilles Petit',           s1: 13, p2: 'Olivier Gatti',          s2: 3  },
      { p1: 'Georges Mensah',         s1: 4,  p2: 'Gilles Petit',           s2: 14 },
      { p1: 'Gilles Petit',           s1: 7,  p2: MY_NAME,                  s2: 12 },
      { p1: 'Franco Gueli',           s1: 12, p2: 'Louis Herbert',          s2: 7  },
      { p1: 'Laurent Gunsbourg',      s1: 7,  p2: 'Guillaume Lainé',        s2: 8  },
      { p1: 'Laurent Gunsbourg',      s1: 6,  p2: 'Louis Herbert',          s2: 10 },
      { p1: 'Alain Braem',            s1: 10, p2: 'Christophe Jonckheere',  s2: 6  },
      { p1: 'Guillaume Lainé',        s1: 5,  p2: 'Olivier Gatti',          s2: 6  },
      { p1: 'Georges Mensah',         s1: 5,  p2: 'Alain Braem',            s2: 10 },
      { p1: 'Jan Vavrovec',           s1: 4,  p2: 'Franco Gueli',           s2: 11 },
      { p1: 'Olivier Gatti',          s1: 7,  p2: MY_NAME,                  s2: 7  },
      { p1: 'Louis Herbert',          s1: 4,  p2: 'Georges Mensah',         s2: 10 },
      { p1: 'Alain Braem',            s1: 9,  p2: 'Olivier Gatti',          s2: 4  },
      { p1: 'Christopher Debuyst',    s1: 4,  p2: 'Louis Herbert',          s2: 10 },
      { p1: MY_NAME,                  s1: 12, p2: 'Christopher Debuyst',    s2: 5  },
      { p1: 'Louis Herbert',          s1: 6,  p2: 'Gilles Petit',           s2: 8  },
      { p1: 'Christopher Debuyst',    s1: 8,  p2: 'Olivier Gatti',          s2: 5  },
      { p1: MY_NAME,                  s1: 7,  p2: 'Jan Vavrovec',           s2: 8  },
      { p1: 'Georges Mensah',         s1: 5,  p2: 'Christopher Debuyst',    s2: 6  },
      { p1: 'Franco Gueli',           s1: 10, p2: 'Laurent Gunsbourg',      s2: 9  },
      { p1: 'Olivier Gatti',          s1: 7,  p2: 'Louis Herbert',          s2: 8  },
      { p1: 'Jan Vavrovec',           s1: 3,  p2: 'Christopher Debuyst',    s2: 13 },
      { p1: 'Franco Gueli',           s1: 8,  p2: 'Georges Mensah',         s2: 4  },
      { p1: 'Christophe Jonckheere',  s1: 3,  p2: 'Laurent Gunsbourg',      s2: 7  },
    ],

    upcoming: [
      { date: '15/03/2026', time: '13:30', p1: 'Gilles Petit',        p2: 'Alain Braem'       },
      { date: '15/03/2026', time: '15:00', p1: 'Christopher Debuyst', p2: 'Guillaume Lainé'   },
      { date: '20/03/2026', time: '21:00', p1: 'Christopher Debuyst', p2: 'Alain Braem'       },
      { date: '22/03/2026', time: '18:00', p1: 'Jan Vavrovec',        p2: 'Guillaume Lainé'   },
      { date: '29/03/2026', time: '18:00', p1: 'Louis Herbert',       p2: MY_NAME             },
      { date: '11/04/2026', time: '17:30', p1: 'Jan Vavrovec',        p2: 'Laurent Gunsbourg' },
      { date: '13/04/2026', time: '19:00', p1: 'Olivier Gatti',       p2: 'Laurent Gunsbourg' },
      { date: '15/04/2026', time: '17:30', p1: 'Guillaume Lainé',     p2: 'Louis Herbert'     },
    ],
  },

  // ── 2024/25 (archived) ──────────────────────────────────────────────────
  {
    id: '2024-25',
    label: '2024/25',
    status: 'archived',

    myStats: { points: 14, played: 12, wins: 7, draws: 0, losses: 5, diff: 12, ranking: 'C30.3' },

    // Scores from my (Laurentiu) perspective: my–opp
    myMatches: [
      { id: 's24_lm1',  opponent: 'Gilles Petit',           my: 7,  opp: 12, result: 'loss' },
      { id: 's24_lm2',  opponent: 'Georges Mensah',         my: 6,  opp: 9,  result: 'loss' },
      { id: 's24_lm3',  opponent: 'Alain Braem',            my: 5,  opp: 8,  result: 'loss' },
      { id: 's24_lm4',  opponent: 'Franco Gueli',           my: 6,  opp: 9,  result: 'loss' },
      { id: 's24_lm5',  opponent: 'Christopher Debuyst',    my: 7,  opp: 9,  result: 'loss' },
      { id: 's24_lm6',  opponent: 'Christophe Jonckheere',  my: 9,  opp: 5,  result: 'win'  },
      { id: 's24_lm7',  opponent: 'Laurent Gunsbourg',      my: 11, opp: 4,  result: 'win'  },
      { id: 's24_lm8',  opponent: 'Christophe Jonckheere',  my: 8,  opp: 4,  result: 'win'  },
      { id: 's24_lm9',  opponent: 'Laurent Gunsbourg',      my: 10, opp: 3,  result: 'win'  },
      { id: 's24_lm10', opponent: 'Georges Mensah',         my: 8,  opp: 6,  result: 'win'  },
      { id: 's24_lm11', opponent: 'Franco Gueli',           my: 9,  opp: 7,  result: 'win'  },
      { id: 's24_lm12', opponent: 'Alain Braem',            my: 8,  opp: 6,  result: 'win'  },
    ],

    standings: [
      { name: 'Gilles Petit',          ranking: 'C15.5', pts: 20, played: 12, wins: 10, draws: 0, losses: 2,  diff: 45  },
      { name: 'Georges Mensah',        ranking: 'C30.1', pts: 16, played: 12, wins: 8,  draws: 0, losses: 4,  diff: 18  },
      { name: MY_NAME,                 ranking: 'C30.3', pts: 14, played: 12, wins: 7,  draws: 0, losses: 5,  diff: 12  },
      { name: 'Alain Braem',           ranking: 'C30.5', pts: 12, played: 12, wins: 6,  draws: 0, losses: 6,  diff: 3   },
      { name: 'Franco Gueli',          ranking: 'NC',    pts: 10, played: 12, wins: 5,  draws: 0, losses: 7,  diff: -5  },
      { name: 'Christopher Debuyst',   ranking: 'C30.2', pts: 8,  played: 12, wins: 4,  draws: 0, losses: 8,  diff: -14 },
      { name: 'Christophe Jonckheere', ranking: 'C30.4', pts: 6,  played: 12, wins: 3,  draws: 0, losses: 9,  diff: -28 },
      { name: 'Laurent Gunsbourg',     ranking: 'C30.2', pts: 4,  played: 12, wins: 2,  draws: 0, losses: 10, diff: -31 },
    ],

    // 40 plausible completed results (most recent first)
    allMatches: [
      // LB's 12 matches
      { p1: 'Gilles Petit',           s1: 12, p2: MY_NAME,                  s2: 7  },
      { p1: 'Georges Mensah',         s1: 9,  p2: MY_NAME,                  s2: 6  },
      { p1: 'Alain Braem',            s1: 8,  p2: MY_NAME,                  s2: 5  },
      { p1: 'Franco Gueli',           s1: 9,  p2: MY_NAME,                  s2: 6  },
      { p1: 'Christopher Debuyst',    s1: 9,  p2: MY_NAME,                  s2: 7  },
      { p1: MY_NAME,                  s1: 9,  p2: 'Christophe Jonckheere',  s2: 5  },
      { p1: MY_NAME,                  s1: 11, p2: 'Laurent Gunsbourg',      s2: 4  },
      { p1: MY_NAME,                  s1: 8,  p2: 'Christophe Jonckheere',  s2: 4  },
      { p1: MY_NAME,                  s1: 10, p2: 'Laurent Gunsbourg',      s2: 3  },
      { p1: MY_NAME,                  s1: 8,  p2: 'Georges Mensah',         s2: 6  },
      { p1: MY_NAME,                  s1: 9,  p2: 'Franco Gueli',           s2: 7  },
      { p1: MY_NAME,                  s1: 8,  p2: 'Alain Braem',            s2: 6  },
      // Other matchups
      { p1: 'Gilles Petit',           s1: 11, p2: 'Laurent Gunsbourg',      s2: 4  },
      { p1: 'Gilles Petit',           s1: 10, p2: 'Christophe Jonckheere',  s2: 5  },
      { p1: 'Gilles Petit',           s1: 12, p2: 'Christopher Debuyst',    s2: 6  },
      { p1: 'Gilles Petit',           s1: 9,  p2: 'Franco Gueli',           s2: 7  },
      { p1: 'Gilles Petit',           s1: 11, p2: 'Alain Braem',            s2: 5  },
      { p1: 'Gilles Petit',           s1: 10, p2: 'Georges Mensah',         s2: 8  },
      { p1: 'Georges Mensah',         s1: 10, p2: 'Christophe Jonckheere',  s2: 5  },
      { p1: 'Georges Mensah',         s1: 9,  p2: 'Laurent Gunsbourg',      s2: 4  },
      { p1: 'Georges Mensah',         s1: 8,  p2: 'Alain Braem',            s2: 6  },
      { p1: 'Georges Mensah',         s1: 7,  p2: 'Franco Gueli',           s2: 5  },
      { p1: 'Georges Mensah',         s1: 9,  p2: 'Christopher Debuyst',    s2: 7  },
      { p1: 'Alain Braem',            s1: 9,  p2: 'Franco Gueli',           s2: 7  },
      { p1: 'Alain Braem',            s1: 10, p2: 'Christopher Debuyst',    s2: 6  },
      { p1: 'Alain Braem',            s1: 8,  p2: 'Christophe Jonckheere',  s2: 5  },
      { p1: 'Alain Braem',            s1: 9,  p2: 'Laurent Gunsbourg',      s2: 3  },
      { p1: 'Franco Gueli',           s1: 10, p2: 'Christopher Debuyst',    s2: 7  },
      { p1: 'Franco Gueli',           s1: 8,  p2: 'Christophe Jonckheere',  s2: 6  },
      { p1: 'Franco Gueli',           s1: 10, p2: 'Laurent Gunsbourg',      s2: 4  },
      { p1: 'Christopher Debuyst',    s1: 8,  p2: 'Christophe Jonckheere',  s2: 5  },
      { p1: 'Christopher Debuyst',    s1: 9,  p2: 'Laurent Gunsbourg',      s2: 6  },
      { p1: 'Christophe Jonckheere',  s1: 7,  p2: 'Laurent Gunsbourg',      s2: 5  },
      { p1: 'Gilles Petit',           s1: 11, p2: 'Christopher Debuyst',    s2: 7  },
      { p1: 'Georges Mensah',         s1: 11, p2: 'Franco Gueli',           s2: 8  },
      { p1: 'Alain Braem',            s1: 10, p2: 'Christophe Jonckheere',  s2: 7  },
      { p1: 'Georges Mensah',         s1: 10, p2: 'Laurent Gunsbourg',      s2: 5  },
      { p1: 'Franco Gueli',           s1: 8,  p2: 'Laurent Gunsbourg',      s2: 6  },
      { p1: 'Christopher Debuyst',    s1: 8,  p2: 'Laurent Gunsbourg',      s2: 4  },
      { p1: 'Gilles Petit',           s1: 9,  p2: 'Christophe Jonckheere',  s2: 3  },
    ],

    upcoming: [],
  },
];

// ── Season accessor ──────────────────────────────────────────────────────────
let currentSeasonId = '2025-26';

function getSeason(id) {
  return SEASONS.find(s => s.id === id);
}

// ===== STATE =====
let leagueNotes  = lsGet(KEYS.leagueNotes,  {});
let otherMatches = lsGet(KEYS.otherMatches, []);
let twbData      = null; // fetched on init from ./data/tournaments-twb.json

const state = {
  tab:           'me',      // 'me' | 'all' | 'other' | 'twb'
  otherView:     'journal', // 'journal' | 'detail' | 'add'
  otherDetailId: null,
  otherEditId:   null,
  otherFormSets: [{ p: '', o: '' }],
  twbFilter:     'all',     // 'all' | 'win' | 'loss'
};

// ===== UTILS =====
function genId()  { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function today()  { return new Date().toISOString().slice(0, 10); }

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m - 1]} ${+day}, ${y}`;
}

function fmtDiff(d) {
  return d > 0 ? `+${d}` : String(d);
}

function fmtDMY(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function fmtPts(n) {
  return String(n ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function hlName(name) {
  return name === MY_NAME
    ? `<span class="my-name">${escHtml(name)}</span>`
    : escHtml(name);
}


function fmtOtherScore(sets) {
  return (sets || [])
    .filter(s => s.p !== '' && s.o !== '')
    .map(s => `${s.p}–${s.o}`)
    .join('  ');
}

// ===== RENDER =====
const app = document.getElementById('app');

function switchSeason(id) {
  currentSeasonId = id;
  render();
  window.scrollTo(0, 0);
}

function renderSeasonSelector() {
  const bar = document.getElementById('seasonBar');
  if (!bar) return;
  const options = SEASONS.map(s => {
    const label = s.status === 'active' ? `${s.label} ●` : s.label;
    return `<option value="${escHtml(s.id)}"${s.id === currentSeasonId ? ' selected' : ''}>${escHtml(label)}</option>`;
  }).join('');
  bar.innerHTML = `
    <div class="season-bar-inner">
      <span class="season-label">Season</span>
      <select class="season-select" id="seasonSelect" onchange="switchSeason(this.value)">
        ${options}
      </select>
    </div>`;
}

function switchTab(tab) {
  state.tab = tab;
  if (tab !== 'other') {
    state.otherView     = 'journal';
    state.otherDetailId = null;
    state.otherEditId   = null;
  }
  render();
  window.scrollTo(0, 0);
}

function render() {
  renderSeasonSelector();
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === state.tab)
  );
  switch (state.tab) {
    case 'me':    renderMe();    break;
    case 'all':   renderAll();   break;
    case 'other': renderOther(); break;
    case 'twb':   renderTWB();   break;
    default:      renderMe();
  }
}

// ===== TAB 1: MY LEAGUE =====
function renderMe() {
  const season = getSeason(currentSeasonId);
  const { points, played, wins, draws, losses, diff, ranking } = season.myStats;
  const archived = season.status === 'archived';

  app.innerHTML = `
    <div class="league-view">

      <div class="my-stats-card">
        <div class="my-stats-header">
          <div>
            <div class="my-stats-name">${escHtml(MY_NAME)}</div>
            <div class="my-stats-sub">${escHtml(ranking)} · Division Messieurs 4</div>
          </div>
          <div class="my-stats-pts-wrap">
            <span class="my-stats-pts">${points}</span>
            <span class="my-stats-pts-label">pts</span>
          </div>
        </div>
        <div class="my-stats-grid">
          <div class="my-stat">
            <span class="my-stat-val">${played}</span>
            <span class="my-stat-label">Played</span>
          </div>
          <div class="my-stat">
            <span class="my-stat-val my-stat-val--green">${wins}</span>
            <span class="my-stat-label">Wins</span>
          </div>
          <div class="my-stat">
            <span class="my-stat-val my-stat-val--orange">${draws}</span>
            <span class="my-stat-label">Draws</span>
          </div>
          <div class="my-stat">
            <span class="my-stat-val my-stat-val--red">${losses}</span>
            <span class="my-stat-label">Losses</span>
          </div>
          <div class="my-stat">
            <span class="my-stat-val">${fmtDiff(diff)}</span>
            <span class="my-stat-label">Diff</span>
          </div>
        </div>
      </div>

      <div class="section-title" style="margin-bottom:0.75rem;">My Matches</div>
      <div class="lm-list">
        ${season.myMatches.map(m => renderMyMatchCard(m, archived)).join('')}
      </div>
    </div>`;

  // Wire note auto-save (active season only)
  if (!archived) {
    app.querySelectorAll('.note-area').forEach(el => {
      el.addEventListener('input', () => {
        leagueNotes[el.dataset.id] = el.value;
        lsSet(KEYS.leagueNotes, leagueNotes);
      });
    });
  }
}

function renderMyMatchCard(m, archived = false) {
  if (m.result === 'upcoming') {
    return `
      <div class="lm-card lm-card--upcoming">
        <div class="lm-badge lm-badge--upcoming">UP</div>
        <div class="lm-body">
          <div class="lm-top">
            <span class="lm-opp">vs ${escHtml(m.opponent)}</span>
            <span class="lm-when">${escHtml(m.date)} · ${escHtml(m.time)}</span>
          </div>
          <div class="lm-upcoming-tag">Upcoming match</div>
        </div>
      </div>`;
  }

  const label = m.result === 'win' ? 'W' : m.result === 'draw' ? 'D' : 'L';
  const note  = leagueNotes[m.id] || '';

  return `
    <div class="lm-card">
      <div class="lm-badge lm-badge--${m.result}">${label}</div>
      <div class="lm-body">
        <div class="lm-top">
          <span class="lm-opp">vs ${escHtml(m.opponent)}</span>
          <span class="lm-score">${m.my}–${m.opp}</span>
        </div>
        <textarea
          class="note-area${archived ? ' note-area--readonly' : ''}"
          data-id="${m.id}"
          placeholder="${archived ? 'Archived season — notes are read-only' : 'Add notes for this match…'}"
          rows="2"
          ${archived ? 'readonly' : ''}
        >${escHtml(note)}</textarea>
      </div>
    </div>`;
}

// ===== TAB 2: ALL LEAGUE =====
function renderAll() {
  const { standings, allMatches, upcoming } = getSeason(currentSeasonId);

  const standingsRows = standings.map((p, i) => {
    const isMe = p.name === MY_NAME;
    return `
      <tr class="${isMe ? 'my-row' : ''}">
        <td class="td-rank">${i + 1}</td>
        <td class="td-name">
          ${isMe ? `<span class="my-name">${escHtml(p.name)}</span>` : escHtml(p.name)}
          <span class="player-rnk">${escHtml(p.ranking)}</span>
        </td>
        <td class="td-pts"><strong>${p.pts}</strong></td>
        <td class="td-num">${p.played}</td>
        <td class="td-wdl">
          <span class="wdl-w">${p.wins}W</span>
          ${p.draws > 0 ? `<span class="wdl-d">${p.draws}D</span>` : ''}
          <span class="wdl-l">${p.losses}L</span>
        </td>
        <td class="td-diff ${p.diff > 0 ? 'diff-pos' : p.diff < 0 ? 'diff-neg' : ''}">${fmtDiff(p.diff)}</td>
      </tr>`;
  }).join('');

  const completedRows = allMatches.map(m => {
    const me = m.p1 === MY_NAME || m.p2 === MY_NAME;
    return `
      <div class="am-row${me ? ' am-row--me' : ''}">
        <span class="am-p${m.p1 === MY_NAME ? ' am-p--me' : ''}">${hlName(m.p1)}</span>
        <span class="am-score">${m.s1}–${m.s2}</span>
        <span class="am-p${m.p2 === MY_NAME ? ' am-p--me' : ''}">${hlName(m.p2)}</span>
      </div>`;
  }).join('');

  const upcomingRows = upcoming.map(m => {
    const me = m.p1 === MY_NAME || m.p2 === MY_NAME;
    return `
      <div class="am-row am-row--upcoming${me ? ' am-row--me' : ''}">
        <span class="am-dt">${escHtml(m.date)} <span class="am-time">${escHtml(m.time)}</span></span>
        <span class="am-p${m.p1 === MY_NAME ? ' am-p--me' : ''}">${hlName(m.p1)}</span>
        <span class="am-vs">vs</span>
        <span class="am-p${m.p2 === MY_NAME ? ' am-p--me' : ''}">${hlName(m.p2)}</span>
      </div>`;
  }).join('');

  app.innerHTML = `
    <div class="all-view">

      <div class="section-card">
        <div class="section-title">Standings — Division Messieurs 4</div>
        <div class="standings-wrap">
          <table class="standings-table">
            <thead>
              <tr>
                <th class="td-rank">#</th>
                <th class="td-name">Player</th>
                <th class="td-pts">Pts</th>
                <th class="td-num">P</th>
                <th class="td-wdl">W/D/L</th>
                <th class="td-diff">Diff</th>
              </tr>
            </thead>
            <tbody>${standingsRows}</tbody>
          </table>
        </div>
      </div>

      ${upcoming.length ? `
      <div class="section-card">
        <div class="section-title">Upcoming Matches</div>
        <div class="am-list">${upcomingRows}</div>
      </div>` : ''}

      <div class="section-card">
        <div class="section-title">Completed Matches (${allMatches.length})</div>
        <div class="am-list">${completedRows}</div>
      </div>

    </div>`;
}

// ===== TAB 3: OTHER MATCHES =====
function navigateOther(view, extras = {}) {
  state.otherView = view;
  if (extras.detailId !== undefined) state.otherDetailId = extras.detailId;
  if (view === 'add') {
    if (extras.editId !== undefined) {
      state.otherEditId = extras.editId;
      const m = otherMatches.find(x => x.id === extras.editId);
      state.otherFormSets = m
        ? m.sets.map(s => ({ p: String(s.p), o: String(s.o) }))
        : [{ p: '', o: '' }];
    } else {
      state.otherEditId   = null;
      state.otherFormSets = [{ p: '', o: '' }];
    }
  }
  render();
  window.scrollTo(0, 0);
}

function renderOther() {
  switch (state.otherView) {
    case 'journal': renderOtherJournal(); break;
    case 'detail':  renderOtherDetail();  break;
    case 'add':     renderOtherAdd();     break;
    default:        renderOtherJournal();
  }
}

function renderOtherJournal() {
  const sorted = [...otherMatches].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
  );

  if (!sorted.length) {
    app.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎾</div>
        <h2 class="empty-title">No other matches yet</h2>
        <p class="empty-sub">Log your friendly, tournament, or training matches here.</p>
        <button class="btn-primary" onclick="navigateOther('add')">+ Log a Match</button>
      </div>`;
    return;
  }

  app.innerHTML = `
    <div class="journal-header">
      <span class="journal-count">${sorted.length} match${sorted.length !== 1 ? 'es' : ''}</span>
      <button class="btn-primary" onclick="navigateOther('add')">+ Add Match</button>
    </div>
    <div class="match-list">
      ${sorted.map(renderOtherCard).join('')}
    </div>`;
}

function renderOtherCard(m) {
  const score = fmtOtherScore(m.sets);
  const label = m.result === 'win' ? 'W' : m.result === 'draw' ? 'D' : 'L';
  return `
    <div class="match-card" onclick="navigateOther('detail', {detailId:'${m.id}'})">
      <div class="match-card-result match-card-result--${m.result}">${label}</div>
      <div class="match-card-body">
        <div class="match-card-top">
          <span class="match-opp">vs ${escHtml(m.opponent)}</span>
          <span class="match-date">${fmtDate(m.date)}</span>
        </div>
        <div class="match-card-mid">
          ${m.location ? `<span class="match-loc">📍 ${escHtml(m.location)}</span>` : ''}
        </div>
        ${score ? `<div class="match-score">${escHtml(score)}</div>` : ''}
      </div>
      <div class="match-card-arrow">›</div>
    </div>`;
}

function renderOtherDetail() {
  const m = otherMatches.find(x => x.id === state.otherDetailId);
  if (!m) { navigateOther('journal'); return; }

  const validSets  = (m.sets || []).filter(s => s.p !== '' && s.o !== '');
  const resultText = m.result === 'win' ? 'WIN' : m.result === 'draw' ? 'DRAW' : 'LOSS';

  app.innerHTML = `
    <div class="detail-view">
      <div class="detail-nav">
        <button class="back-btn" onclick="navigateOther('journal')">← Other Matches</button>
        <div class="detail-actions">
          <button class="btn-secondary" onclick="navigateOther('add', {editId:'${m.id}'})">Edit</button>
          <button class="btn-danger"    onclick="deleteOtherMatch('${m.id}')">Delete</button>
        </div>
      </div>

      <div class="detail-header">
        <div class="detail-result detail-result--${m.result}">${resultText}</div>
        <div>
          <h2 class="detail-opp">vs ${escHtml(m.opponent)}</h2>
          <div class="detail-meta">
            <span>${fmtDate(m.date)}</span>
            ${m.location ? `<span class="meta-sep">·</span><span>${escHtml(m.location)}</span>` : ''}
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

function deleteOtherMatch(id) {
  if (!confirm('Delete this match? This cannot be undone.')) return;
  otherMatches = otherMatches.filter(m => m.id !== id);
  lsSet(KEYS.otherMatches, otherMatches);
  navigateOther('journal');
}

function renderOtherAdd() {
  const editing = state.otherEditId ? otherMatches.find(m => m.id === state.otherEditId) : null;
  const f = editing || {};

  const setsHtml = state.otherFormSets.map((s, i) => `
    <div class="set-row" id="set-row-${i}">
      <span class="set-row-label">Set ${i + 1}</span>
      <input type="number" class="set-input" id="sp-${i}"
             value="${escHtml(String(s.p))}" min="0" max="99" placeholder="0"
             oninput="updateOtherSet(${i},'p',this.value)"/>
      <span class="set-sep">–</span>
      <input type="number" class="set-input" id="so-${i}"
             value="${escHtml(String(s.o))}" min="0" max="99" placeholder="0"
             oninput="updateOtherSet(${i},'o',this.value)"/>
      ${state.otherFormSets.length > 1
        ? `<button type="button" class="set-remove" onclick="removeOtherSet(${i})" title="Remove">×</button>`
        : ''}
    </div>`).join('');

  const isWin  = f.result === 'win'  || !f.result;
  const isDraw = f.result === 'draw';
  const isLoss = f.result === 'loss';

  app.innerHTML = `
    <div class="form-view">
      <div class="form-nav">
        <button class="back-btn" onclick="handleOtherFormBack()">← ${editing ? 'Back' : 'Other Matches'}</button>
        <h2 class="form-title">${editing ? 'Edit Match' : 'Log Match'}</h2>
      </div>

      <form id="otherMatchForm" onsubmit="submitOtherMatch(event)">
        <div class="form-group">
          <label class="form-label" for="fDate">Date <span class="req">*</span></label>
          <input class="form-input" type="date" id="fDate"
                 value="${f.date || today()}" required/>
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
          ${state.otherFormSets.length < 5
            ? `<button type="button" class="btn-add-set" onclick="addOtherSet()">+ Add Set</button>`
            : ''}
        </div>

        <div class="form-group">
          <label class="form-label">Result <span class="req">*</span></label>
          <div class="result-toggle">
            <label class="result-option result-win-opt${isWin ? ' result-option--active' : ''}">
              <input type="radio" name="result" value="win" ${isWin ? 'checked' : ''}/>
              <span>Win</span>
            </label>
            <label class="result-option result-draw-opt${isDraw ? ' result-option--active' : ''}">
              <input type="radio" name="result" value="draw" ${isDraw ? 'checked' : ''}/>
              <span>Draw</span>
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
                    placeholder="Tactics, what went well, areas to improve…">${escHtml(f.notes || '')}</textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary btn-lg">
            ${editing ? 'Save Changes' : 'Log Match'}
          </button>
        </div>
      </form>
    </div>`;

  document.querySelectorAll('input[name="result"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.result-option').forEach(o => o.classList.remove('result-option--active'));
      radio.closest('.result-option').classList.add('result-option--active');
    });
  });
}

function handleOtherFormBack() {
  if (state.otherEditId) {
    navigateOther('detail', { detailId: state.otherEditId });
  } else {
    navigateOther('journal');
  }
}

function updateOtherSet(idx, field, val) {
  if (state.otherFormSets[idx]) state.otherFormSets[idx][field] = val;
}

function addOtherSet() {
  if (state.otherFormSets.length >= 5) return;
  state.otherFormSets.push({ p: '', o: '' });
  renderOtherAdd();
}

function removeOtherSet(idx) {
  state.otherFormSets.splice(idx, 1);
  renderOtherAdd();
}

function submitOtherMatch(e) {
  e.preventDefault();
  const date     = document.getElementById('fDate').value;
  const opponent = document.getElementById('fOpp').value.trim();
  const location = document.getElementById('fLoc').value.trim();
  const resultEl = document.querySelector('input[name="result"]:checked');
  const notes    = document.getElementById('fNotes').value.trim();

  if (!date || !opponent) { alert('Please fill in the required fields.'); return; }

  const result = resultEl ? resultEl.value : 'win';
  const sets   = state.otherFormSets.map((_, i) => ({
    p: parseInt(document.getElementById(`sp-${i}`)?.value || '0', 10),
    o: parseInt(document.getElementById(`so-${i}`)?.value || '0', 10),
  }));

  if (state.otherEditId) {
    const idx = otherMatches.findIndex(m => m.id === state.otherEditId);
    if (idx !== -1) {
      otherMatches[idx] = { ...otherMatches[idx], date, opponent, location, sets, result, notes };
    }
  } else {
    otherMatches.push({
      id: genId(), date, opponent, location, sets, result, notes, createdAt: Date.now(),
    });
  }

  lsSet(KEYS.otherMatches, otherMatches);
  state.otherFormSets = [{ p: '', o: '' }];
  navigateOther('journal');
}

// ===== TAB 4: TWB TOURNAMENTS =====
function toggleTwbFilter(filter) {
  state.twbFilter = state.twbFilter === filter ? 'all' : filter;
  render();
}

function renderTWB() {
  if (!twbData) {
    app.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎾</div>
        <h2 class="empty-title">TWB data unavailable</h2>
        <p class="empty-sub">Couldn't load tournament results right now. Please try again later.</p>
      </div>`;
    return;
  }

  const { ranking, totalPoints, lastUpdated, matches } = twbData;
  const wins   = matches.filter(m => m.result === 'win').length;
  const losses = matches.filter(m => m.result === 'loss').length;

  const filtered = matches.filter(m => state.twbFilter === 'all' || m.result === state.twbFilter);
  const sorted   = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  app.innerHTML = `
    <div class="twb-view">

      <div class="twb-header">
        <div class="twb-header-top">
          <div>
            <div class="twb-ranking">${escHtml(ranking || 'NC')}</div>
            <div class="twb-sub">Tournois TWB · Mis à jour le ${fmtDMY(lastUpdated)}</div>
          </div>
          <div class="twb-pts-wrap">
            <span class="twb-pts">${fmtPts(totalPoints)}</span>
            <span class="twb-pts-label">pts</span>
          </div>
        </div>
        <div class="twb-stats">
          <div class="twb-stat">
            <span class="twb-stat-val">${matches.length}</span>
            <span class="twb-stat-label">Matchs</span>
          </div>
          <div class="twb-stat">
            <span class="twb-stat-val twb-stat-val--green">${wins}</span>
            <span class="twb-stat-label">Victoires</span>
          </div>
          <div class="twb-stat">
            <span class="twb-stat-val twb-stat-val--red">${losses}</span>
            <span class="twb-stat-label">Défaites</span>
          </div>
        </div>
      </div>

      <div class="twb-filter-bar">
        <button class="twb-filter-btn twb-filter-btn--win${state.twbFilter === 'win' ? ' twb-filter-btn--active' : ''}"
                onclick="toggleTwbFilter('win')">Victoires</button>
        <button class="twb-filter-btn twb-filter-btn--loss${state.twbFilter === 'loss' ? ' twb-filter-btn--active' : ''}"
                onclick="toggleTwbFilter('loss')">Défaites</button>
      </div>

      <div class="twb-match-list">
        ${sorted.length ? sorted.map(renderTwbMatchCard).join('') : `
          <div class="empty-state">
            <div class="empty-icon">🎾</div>
            <h2 class="empty-title">No matches</h2>
            <p class="empty-sub">No matches found for this filter.</p>
          </div>`}
      </div>

    </div>`;
}

function renderTwbMatchCard(m) {
  const isWin = m.result === 'win';
  const oppMatch = m.opponent.match(/title="Plus d.info sur ([^(]+?)\s*\((\d+)\s*pts\)"/);
  const opponent = oppMatch ? oppMatch[1].trim() : m.opponent;
  return `
    <div class="twb-match-card">
      <div class="twb-badge twb-badge--${m.result}">${isWin ? 'V' : 'D'}</div>
      <div class="twb-match-body">
        <div class="twb-match-top">
          <span class="twb-tournament">${escHtml(m.tournament)}</span>
          <span class="twb-match-date">${fmtDMY(m.date)}</span>
        </div>
        <div class="twb-category">${escHtml(m.category)}</div>
        <div class="twb-match-mid">
          <span class="twb-opponent">${escHtml(opponent)} <span class="twb-opponent-pts">(${m.opponentPts} pts)</span></span>
        </div>
        <div class="twb-score">${escHtml(m.score)}</div>
      </div>
    </div>`;
}

// ===== INIT =====
async function init() {
  document.getElementById('tabsBar').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn || !btn.dataset.tab) return;
    switchTab(btn.dataset.tab);
  });

  // Show loading indicator while fetching active season data
  const seasonBar = document.getElementById('seasonBar');
  seasonBar.innerHTML = `<div class="season-bar-inner"><span class="season-label season-label--loading">Loading…</span></div>`;

  try {
    const res  = await fetch('./data/season-2025-26.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const season = SEASONS.find(s => s.id === data.id);
    if (season) {
      season.myStats    = data.myStats;
      season.myMatches  = data.myMatches;
      season.standings  = data.standings;
      season.allMatches = data.allMatches;
      season.upcoming   = data.upcoming;
    }
  } catch {
    // Network or parse error — fall back to hardcoded data silently
  }

  try {
    const twbRes = await fetch('./data/tournaments-twb.json');
    if (!twbRes.ok) throw new Error(`HTTP ${twbRes.status}`);
    twbData = await twbRes.json();
  } catch {
    // Network or parse error — TWB tab will show an unavailable state
  }

  render();
}

document.addEventListener('DOMContentLoaded', init);
