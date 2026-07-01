/* =================================================
   TENNIS JOURNAL — app.js
   ================================================= */

// ===== CONSTANTS =====
const MY_NAME = 'Laurentiu B.';

const GH_OWNER     = 'laurentiuborcan';
const GH_REPO      = 'tennis-journal';
const GH_FILE_PATH = 'data/user-data.json';

// ===== STORAGE =====
const KEYS = {
  leagueNotes:  'tj_league_notes',
  otherMatches: 'tj_other_matches',
  ghToken:      'gh_token',
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

  // ── 2026/27 (upcoming) ───────────────────────────────────────────────────
  {
    id: '2026-27',
    label: '2026/27',
    status: 'upcoming',

    myStats: { points: 0, played: 0, wins: 0, draws: 0, losses: 0, diff: 0, ranking: '' },
    myMatches: [],
    standings: [],
    allMatches: [],
    upcoming: [],
  },
];

// ── Other Matches — seeded from opponent notes history ──────────────────────
// One entry per opponent. date/score/result reflect the most recent meeting;
// notes summarize the full head-to-head history when there were several.
const OTHER_MATCHES_SEED = [
  {
    id: 'om-la-jisse', date: '2024-02-14', opponent: 'La Jisse', location: '',
    sets: [{ p: 4, o: 10 }], result: 'loss', createdAt: 1,
    notes: "Lost 4-10, fell behind 1-7 early. He has a strong two-handed backhand — early, flat, deep, with good angles — and hit to my backhand 80% of the time. Quick feet, sharp angled short balls, weak serve that I didn't punish enough. Too many unforced errors and a rushed first serve.\n\nTakeaway: attack his weak second serve, respect the backhand depth/angle, don't hurry the first serve."
  },
  {
    id: 'om-xavier-naegel', date: '2024-02-17', opponent: 'Xavier Naegel', location: '',
    sets: [{ p: 3, o: 6 }], result: 'loss', createdAt: 2,
    notes: "Lost 3-6 after a rough start (0-5), too many unforced errors. His forehand cross-court in long rallies was solid, and he preys on short/easy balls. Backhand was clearly weaker — go back and turn more when he plays it. Return of serve was good and he moves well while waiting.\n\nTakeaway: slow down, play higher-margin cross-court tennis, use more first-serve placement instead of rushing."
  },
  {
    id: 'om-jv-de-reus', date: '2024-03-31', opponent: 'JV De Reus', location: '',
    sets: [{ p: 6, o: 8 }], result: 'loss', createdAt: 3,
    notes: "Lost 6-8 after underestimating the opponent — low energy and focus from the start, stiff, no movement before shots. Backhand (especially the slice) was actually better than usual, but the forehand was rushed and lacked confidence all match, and the drop shot was predictable and lost every point. He's an all-court player with soft, all-round shots who attacks the backhand; his weak points are the serve and body shots.\n\nTakeaway: treat every opponent seriously regardless of reputation, and trust the forehand instead of playing tentatively."
  },
  {
    id: 'om-christopher', date: '2024-04-02', opponent: 'Christopher', location: '',
    sets: [{ p: 7, o: 5 }], result: 'win', createdAt: 4,
    notes: "Won 7-5 despite a stiff, tight start with a forced forehand. Long cross-court rallies (both forehand and backhand) worked well, backhand slice was a highlight, and staying low helped across the board. He's a fit baseliner who rarely misses and attacks short balls to the backhand, but is vulnerable on serve and at net. Lost focus at key moments and volleys were shaky.\n\nTakeaway: more movement and rhythm at the start, don't crowd the net, add spin on the inside-out forehand instead of going for too much width."
  },
  {
    id: 'om-geoffroy', date: '2024-04-06', opponent: 'Geoffroy', location: '',
    sets: [{ p: 3, o: 14 }], result: 'loss', createdAt: 5,
    notes: "Lopsided loss, 3-14. Stood too close to the ball and to the baseline all match, and leaned back too much on the backhand (the slice was fine). Serve was fine on the few I got in. Only won points when locked in and putting in effort.\n\nTakeaway: create more distance/time by standing further back, and bring the same focus/effort level from the start."
  },
  {
    id: 'om-jilles', date: '2024-04-14', opponent: 'Jilles', location: '',
    sets: [{ p: 3, o: 4 }], result: 'loss', createdAt: 6,
    notes: "Close loss, 3-4. He kept his cool and recovered after falling behind early against an opponent who hits hard and attacks the backhand with power. Forehand cross-court and patience for the short ball worked, backhand slice was a plus, but the second serve was consistently too short and the backhand leaked when leaning back.\n\nTakeaway: longer forehand cross-court rallies, harder cross and slice on the backhand, get to net more, and serve-and-attack when possible given his tendency to overhit and miss."
  },
  {
    id: 'om-denis', date: '2024-04-26', opponent: 'Denis', location: '',
    sets: [{ p: 2, o: 6 }, { p: 6, o: 3 }, { p: 6, o: 3 }], result: 'win', createdAt: 7,
    notes: "Strong comeback win, 2-6 6-3 6-3, after a rough, stiff start with mental lows in set one. Turned it around by resetting between points (breath/ball/feet) and committing to the left-right cross-court pattern, which worked well from set two onward. He's a solid baseline player with a good backhand, but his second serve is a clear weakness (many double faults) and he loses consistency under pressure.\n\nTakeaway: keep the reset-between-points routine ready for slow starts, and lean on the same left-right, attack-the-backhand game plan."
  },
  {
    id: 'om-phi-long', date: '2024-04-27', opponent: 'Phi-Long', location: '',
    sets: [{ p: 7, o: 5 }, { p: 3, o: 6 }, { p: 5, o: 7 }], result: 'loss', createdAt: 8,
    notes: "Tough three-set loss, 7-5 3-6 5-7, after leading throughout — lost focus late in the second set, and in the third couldn't convert break chances at 5-4 and 5-5. Played some of my best tennis when confident and committed: forehand, backhand (including wide-angle backhand slice), and serve were all good. He's a patient, all-back baseliner with real resilience and few unforced errors, but a shaky second serve.\n\nTakeaway: same patient left-right game plan, but manage critical points and closing out sets better."
  },
  {
    id: 'om-timote-r', date: '2024-05-04', opponent: 'Timote R.', location: '',
    sets: [{ p: 7, o: 6 }, { p: 6, o: 4 }], result: 'win', createdAt: 9,
    notes: "One of the best matches so far, won 7-6 6-4. Forehand acceleration and depth were on point, backhand was stable, and I stayed patient and mentally strong, coming back when behind. He's a resilient baseliner who doesn't hit hard but gets everything back with deep, high balls, and his serve is a weak point. Only real blemish was the backhand slice opening up short at times.\n\nTakeaway: keep the same patient, high-percentage game plan; look to attack the slice more with topspin down the line."
  },
  {
    id: 'om-filip-i', date: '2024-05-05', opponent: 'Filip I.', location: '',
    sets: [{ p: 2, o: 6 }, { p: 1, o: 6 }], result: 'loss', createdAt: 10,
    notes: "Lost 2-6 1-6 to a resilient, technically strong two-handed-backhand baseliner who plays almost everything cross-court and rarely overhits. Forehand acceleration and inside-out forehand were good when I could get into rallies, but I couldn't sustain long enough exchanges and confidence dropped after early mistakes. His second serve is clearly the weak link.\n\nTakeaway: build more confidence in the ability to win these longer rallies, and attack the second serve harder."
  },
  {
    id: 'om-seppo', date: '2024-05-03', opponent: 'Seppo', location: '',
    sets: [], result: 'draw', createdAt: 11,
    notes: "Practice session, not a competitive score. Long, fast rallies with good depth; backhand slice worked well though the topspin backhand was sometimes late/leaning back. He's fast with good spin off the baseline and likes to work the backhand until he gets a short ball to go inside-in/inside-out.\n\nTakeaway: stay more relaxed, especially in the warm-up, and work on hand separation on the forehand to reduce over-rotation."
  },
  {
    id: 'om-david', date: '2024-05-10', opponent: 'David', location: '',
    sets: [], result: 'draw', createdAt: 12,
    notes: "Score wasn't recorded for this one. All-court player with a very good backhand — he found width off my forehand into short balls, then attacked my backhand down the line; backhand slice and backhand down the line were his other main patterns. My forehand worked when the basics were there (hand separation), backhand slice was solid, but my backhand side was left uncovered too often, and lower/shorter balls gave me trouble.\n\nTakeaway: cover the backhand side better, play higher-percentage tennis on shorter balls, more net approaches."
  },
  {
    id: 'om-fabio', date: '2024-05-20', opponent: 'Fabio', location: '',
    sets: [{ p: 2, o: 2 }], result: 'draw', createdAt: 13,
    notes: "Ended 2-2 (session cut short). A similar style to my own — forehand cross-court, attack the backhand — so the match came down to who executed better. His forehand is the strength, backhand and over-hitting shorter balls the weakness. My own forehand and volleys were solid; focus lapses were the main issue on my side.\n\nTakeaway: stay patient cross-court without forcing the point, keep focus consistent throughout rather than just in patches."
  },
  {
    id: 'om-guillaume', date: '2024-06-06', opponent: 'Guillaume', location: '',
    sets: [{ p: 3, o: 4 }], result: 'loss', createdAt: 14,
    notes: "Long history, mostly favorable overall (6W-2L): 15/02 W 5-2, 01/03 W 5-2, 15/03 L 1-7, 22/03 W 4-3, 18/04 W 5-4, 19/05 W 4-2, 30/05 W 5-2, 06/06 L 3-4. He's a defensive, counter-punching player who lobs and defends well off the ground — left-right cross-court plus attacking his backhand is the strategy that keeps working. Losses have come from too many unforced errors and going to net without a split step.\n\nTakeaway: keep the same left-right game plan, add more volleys/net play, and don't get careless with shot selection once ahead."
  },
  {
    id: 'om-george', date: '2024-06-05', opponent: 'George', location: '',
    sets: [{ p: 0, o: 2 }], result: 'loss', createdAt: 15,
    notes: "Results have trended the wrong way: W 3-0, then a split 1-1 (24/05), then L 0-2 (05/06). He's an attacking baseliner, likes to go cross-court and to the backhand down the line, and is comfortable at net with flat shots — his weaknesses are the high backhand and coming forward. My own basics (footwork, distance to ball) broke down on both wings in the more recent matches.\n\nTakeaway: get the fundamentals back on both forehand and backhand before worrying about tactics against him."
  },
  {
    id: 'om-alberto', date: '2024-05-01', opponent: 'Alberto', location: '',
    sets: [{ p: 5, o: 2 }], result: 'win', createdAt: 16,
    notes: "Head-to-head this stretch: 16/02 D 6-6, 25/02 L 3-5, 11/04 L 1-5, 01/05 W 5-2 (1W-1D-2L overall). A defensive counter-punching opponent who makes everything come back, so patience and not overhitting matters. The best win came from a fast, focused start and attacking short balls on his backhand. Critical points have been the recurring problem against him — confidence dips and unforced errors creep in right when the score tightens.\n\nTakeaway: focus on point-by-point discipline in tight moments rather than technique changes."
  },
  {
    id: 'om-bruno', date: '2024-05-31', opponent: 'Bruno', location: '',
    sets: [{ p: 1, o: 7 }], result: 'loss', createdAt: 17,
    notes: "Tough matchup overall: 19/04 W 6-2 6-3, 25/04 up 6-0 then lost focus and dropped the next set 2-4, 02/05 down 1-6 2-2, 31/05 L 1-7. Bruno plays quick, early-ball tennis and volleys when he can — regularity is his weak point, but overpowering him doesn't work; he handles pace well. The pattern that's hurt most: getting complacent after building a lead and mentally checking out.\n\nTakeaway: keep playing the game plan regardless of the score, don't try to end points with raw power against him."
  },
  {
    id: 'om-jari', date: '2024-06-12', opponent: 'Jari', location: '',
    sets: [{ p: 4, o: 2 }], result: 'win', createdAt: 18,
    notes: "Regular hitting/practice partner with a strong overall record: 21/02 W 2-1, 27/03 split 0-2/2-0, 29/03 W 4-1, 03/04 W 2-0, 10/04 split 1-1, 08/05 W 3-0, plus practice sessions on 07/06 and 12/06 (W 4-2). His patterns: hard cross-court, attacks the backhand, generally solid defense. Forehand and slice backhand have been the most reliable tools against him; focus/concentration lapses mid-match are the recurring issue, not technique.\n\nTakeaway: keep the left-right cross-court pattern, stay patient, and guard against mental letdowns that cost sets already won."
  },
];

// ── Season accessor ──────────────────────────────────────────────────────────
let currentSeasonId = '2025-26';

function getSeason(id) {
  return SEASONS.find(s => s.id === id);
}

// ===== STATE =====
let leagueNotes  = lsGet(KEYS.leagueNotes,  {});
let otherMatches = lsGet(KEYS.otherMatches, OTHER_MATCHES_SEED);
let twbData      = null; // fetched on init from ./data/tournaments-twb.json
let userData     = { twbNotes: {}, davisNotes: {}, otherMatchesExtra: [] }; // fetched on init from ./data/user-data.json
let twbNoteIndex = {}; // localStorage key -> raw "date|tournament|opponent" key, built from twbData

const state = {
  tab:           'twb',     // 'me' | 'all' | 'other' | 'twb'
  otherView:     'journal', // 'journal' | 'detail' | 'add'
  otherDetailId: null,
  otherEditId:   null,
  otherFormSets: [{ p: '', o: '' }],
  twbFilter:     'all',     // 'all' | 'win' | 'loss'
  twbPointsModalOpen: false,
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
  if (state.tab !== 'me' && state.tab !== 'all') {
    bar.style.display = 'none';
    bar.innerHTML = '';
    return;
  }
  bar.style.display = '';
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
        updateSaveBadge();
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
  const note  = (userData.davisNotes && userData.davisNotes[m.id]) || leagueNotes[m.id] || '';

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

function openPointsBreakdown() {
  state.twbPointsModalOpen = true;
  render();
}

function closePointsBreakdown() {
  state.twbPointsModalOpen = false;
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

  const { ranking, totalPoints, lastUpdated, matches, pointsBreakdown } = twbData;
  const wins   = matches.filter(m => m.result === 'win').length;
  const losses = matches.filter(m => m.result === 'loss').length;

  const filtered = matches.filter(m => state.twbFilter === 'all' || m.result === state.twbFilter);
  const sorted   = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const hasBreakdown = !!(pointsBreakdown && pointsBreakdown.bestResults && pointsBreakdown.bestResults.length);

  const ptsContent = `
    <span class="twb-pts">${fmtPts(totalPoints)}</span>
    <span class="twb-pts-label">pts</span>
    ${hasBreakdown ? '<span class="twb-pts-info" aria-hidden="true">i</span>' : ''}`;

  app.innerHTML = `
    <div class="twb-view">

      <div class="twb-header">
        <div class="twb-header-top">
          <div>
            <div class="twb-ranking">${escHtml(ranking || 'NC')}</div>
            <div class="twb-sub">Tournois TWB · Mis à jour le ${fmtDMY(lastUpdated)}</div>
          </div>
          ${hasBreakdown
            ? `<button type="button" class="twb-pts-wrap twb-pts-wrap--clickable" onclick="openPointsBreakdown()" aria-label="Voir le calcul du classement">${ptsContent}</button>`
            : `<div class="twb-pts-wrap">${ptsContent}</div>`}
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

    </div>
    ${state.twbPointsModalOpen && hasBreakdown ? renderPointsBreakdownModal(pointsBreakdown) : ''}`;

  // Wire note auto-save
  app.querySelectorAll('.twb-match-list .note-area').forEach(el => {
    el.addEventListener('input', () => {
      localStorage.setItem(el.dataset.storageKey, el.value);
      updateSaveBadge();
    });
  });
}

function renderPointsBreakdownModal(pointsBreakdown) {
  const { bestResults, totalPoints, weightedFormula } = pointsBreakdown;
  return `
    <div class="points-breakdown-overlay" onclick="closePointsBreakdown()">
      <div class="points-breakdown-modal" onclick="event.stopPropagation()">
        <div class="points-breakdown-header">
          <h3 class="points-breakdown-title">Calcul du classement</h3>
          <button type="button" class="points-breakdown-close" onclick="closePointsBreakdown()" aria-label="Fermer">✕</button>
        </div>
        <div class="points-breakdown-list">
          ${bestResults.map(r => `
            <div class="points-breakdown-row">
              <div class="points-breakdown-row-main">
                <span class="points-breakdown-tournament">${escHtml(r.tournament)}</span>
                <span class="points-breakdown-date">${fmtDMY(r.date)}</span>
              </div>
              <div class="points-breakdown-row-sub">
                <span class="points-breakdown-category">${escHtml(r.category)}</span>
                <span class="points-breakdown-points">${r.points} pts</span>
              </div>
            </div>`).join('')}
        </div>
        <div class="points-breakdown-total">
          <span>Total</span>
          <span>${totalPoints} pts</span>
        </div>
        ${weightedFormula ? `<div class="points-breakdown-formula">${escHtml(weightedFormula)}</div>` : ''}
      </div>
    </div>`;
}

/** Map opponent points to a ranking classification per the fixed FFT/AFT scale. */
function ptsToRanking(pts) {
  if (pts >= 115) return 'A international';
  if (pts >= 110) return 'A national';
  if (pts >= 105) return 'B-15.4';
  if (pts >= 100) return 'B-15.2';
  if (pts >= 95)  return 'B-15.1';
  if (pts >= 90)  return 'B-15';
  if (pts >= 85)  return 'B0';
  if (pts >= 80)  return 'B2';
  if (pts >= 75)  return 'B4';
  if (pts >= 70)  return 'C15';
  if (pts >= 65)  return 'C15.1';
  if (pts >= 60)  return 'C15.2';
  if (pts >= 55)  return 'C15.3';
  if (pts >= 50)  return 'C15.4';
  if (pts >= 45)  return 'C15.5';
  if (pts >= 40)  return 'C30';
  if (pts >= 35)  return 'C30.1';
  if (pts >= 30)  return 'C30.2';
  if (pts >= 25)  return 'C30.3';
  if (pts >= 20)  return 'C30.2';
  if (pts >= 15)  return 'C30.3';
  if (pts >= 10)  return 'C30.4';
  if (pts >= 5)   return 'C30.5';
  if (pts >= 3)   return 'C30.6';
  return 'NC';
}

/** Sanitize a string for use as an id/localStorage-key segment. */
function sanitizeKeyPart(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Extract the plain opponent name out of the scraped title-attribute markup, if present. */
function twbOpponentName(m) {
  const oppMatch = m.opponent.match(/title="Plus d.info sur ([^(]+?)\s*\((\d+)\s*pts\)"/);
  return oppMatch ? oppMatch[1].trim() : m.opponent;
}

/** Rebuild the map from localStorage note key -> raw "date|tournament|opponent" key used in user-data.json. */
function buildTwbNoteIndex() {
  twbNoteIndex = {};
  if (!twbData || !twbData.matches) return;
  twbData.matches.forEach(m => {
    const opponent = twbOpponentName(m);
    const storageKey = `twb_note_${sanitizeKeyPart(m.date)}_${sanitizeKeyPart(m.tournament)}_${sanitizeKeyPart(opponent)}`;
    twbNoteIndex[storageKey] = `${m.date}|${m.tournament}|${opponent}`;
  });
}

function renderTwbMatchCard(m) {
  const isWin = m.result === 'win';
  const opponent = twbOpponentName(m);

  const keyDate       = sanitizeKeyPart(m.date);
  const keyTournament = sanitizeKeyPart(m.tournament);
  const keyOpponent   = sanitizeKeyPart(opponent);
  const noteId         = `twb-note-${keyDate}-${keyTournament}-${keyOpponent}`;
  const noteStorageKey = `twb_note_${keyDate}_${keyTournament}_${keyOpponent}`;
  const rawNoteKey     = `${m.date}|${m.tournament}|${opponent}`;
  const note = (userData.twbNotes && userData.twbNotes[rawNoteKey]) || localStorage.getItem(noteStorageKey) || '';

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
          <span class="twb-opponent">${escHtml(opponent)} <span class="twb-opponent-pts">(${escHtml(ptsToRanking(m.opponentPts))} / ${m.opponentPts} pts)</span></span>
        </div>
        <div class="twb-score">${escHtml(m.score)}</div>
        <textarea
          class="note-area"
          id="${noteId}"
          data-storage-key="${noteStorageKey}"
          placeholder="Add notes for this match..."
          rows="2"
        >${escHtml(note)}</textarea>
      </div>
    </div>`;
}

// ===== SAVE TO REPO =====

/** Overlay all locally-saved notes on top of the last-loaded user-data.json. */
function collectMergedUserData() {
  const merged = {
    twbNotes:          { ...(userData.twbNotes          || {}) },
    davisNotes:        { ...(userData.davisNotes        || {}) },
    otherMatchesExtra: [ ...(userData.otherMatchesExtra  || []) ],
  };

  Object.keys(localStorage).forEach(k => {
    if (!k.startsWith('twb_note_')) return;
    const rawKey = twbNoteIndex[k];
    if (!rawKey) return;
    const val = localStorage.getItem(k);
    if (val) merged.twbNotes[rawKey] = val;
  });

  Object.entries(leagueNotes).forEach(([id, val]) => {
    if (val) merged.davisNotes[id] = val;
  });

  return merged;
}

function hasUnsavedChanges() {
  const merged = collectMergedUserData();
  return JSON.stringify(merged.twbNotes)   !== JSON.stringify(userData.twbNotes   || {})
      || JSON.stringify(merged.davisNotes) !== JSON.stringify(userData.davisNotes || {});
}

function updateSaveBadge() {
  const badge = document.getElementById('saveToRepoBadge');
  if (badge) badge.hidden = !hasUnsavedChanges();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('toast--visible'), 10);
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function openTokenModal() {
  const overlay = document.getElementById('tokenModalOverlay');
  const input   = document.getElementById('tokenModalInput');
  overlay.hidden = false;
  input.value = '';
  input.focus();
}

function closeTokenModal() {
  document.getElementById('tokenModalOverlay').hidden = true;
}

async function submitTokenModal() {
  const input = document.getElementById('tokenModalInput');
  const token = input.value.trim();
  if (!token) return;
  localStorage.setItem(KEYS.ghToken, token);
  closeTokenModal();
  await performSaveToRepo(token);
}

async function onSaveToRepoClick() {
  const token = localStorage.getItem(KEYS.ghToken);
  if (!token) { openTokenModal(); return; }
  await performSaveToRepo(token);
}

async function performSaveToRepo(token) {
  const btn = document.getElementById('saveToRepoBtn');
  if (btn) btn.classList.add('save-to-repo-btn--busy');

  try {
    const merged  = collectMergedUserData();
    const apiUrl  = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_FILE_PATH}`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept':        'application/vnd.github+json',
    };

    let sha = null;
    const getRes = await fetch(apiUrl, { headers });
    if (getRes.ok) {
      sha = (await getRes.json()).sha;
    } else if (getRes.status !== 404) {
      throw new Error(`couldn't read current file (HTTP ${getRes.status})`);
    }

    const contentStr = JSON.stringify(merged, null, 2) + '\n';
    const contentB64 = btoa(unescape(encodeURIComponent(contentStr)));

    const body = {
      message: 'data: update user notes and data',
      content: contentB64,
      branch:  'main',
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(apiUrl, {
      method:  'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!putRes.ok) {
      const errJson = await putRes.json().catch(() => ({}));
      throw new Error(errJson.message || `GitHub API error (HTTP ${putRes.status})`);
    }

    userData = merged;
    updateSaveBadge();
    showToast('Saved to repo.', 'success');
  } catch (err) {
    showToast(`Save failed: ${err.message}`, 'error');
  } finally {
    if (btn) btn.classList.remove('save-to-repo-btn--busy');
  }
}

// ===== INIT =====
async function init() {
  document.getElementById('tabsBar').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn || !btn.dataset.tab) return;
    switchTab(btn.dataset.tab);
  });

  // Show loading indicator while fetching active season data (only relevant on Davis League tabs)
  const seasonBar = document.getElementById('seasonBar');
  if (state.tab === 'me' || state.tab === 'all') {
    seasonBar.innerHTML = `<div class="season-bar-inner"><span class="season-label season-label--loading">Loading…</span></div>`;
  }

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
    buildTwbNoteIndex();
  } catch {
    // Network or parse error — TWB tab will show an unavailable state
  }

  try {
    const userDataRes = await fetch('./data/user-data.json');
    if (!userDataRes.ok) throw new Error(`HTTP ${userDataRes.status}`);
    const data = await userDataRes.json();
    userData = {
      twbNotes:          data.twbNotes          || {},
      davisNotes:        data.davisNotes        || {},
      otherMatchesExtra: data.otherMatchesExtra || [],
    };
  } catch {
    // Network or parse error — fall back to the empty structure, localStorage notes still work
  }

  document.getElementById('saveToRepoBtn').addEventListener('click', onSaveToRepoClick);
  document.getElementById('tokenModalCancel').addEventListener('click', closeTokenModal);
  document.getElementById('tokenModalClose').addEventListener('click', closeTokenModal);
  document.getElementById('tokenModalSubmit').addEventListener('click', submitTokenModal);
  document.getElementById('tokenModalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeTokenModal();
  });
  updateSaveBadge();

  render();
}

document.addEventListener('DOMContentLoaded', init);
