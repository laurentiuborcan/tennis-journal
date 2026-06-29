#!/usr/bin/env node
'use strict';

/**
 * scrape-twb.js
 *
 * Logs in to the TWB (Tennis Province du Brabant Wallon) members area and
 * scrapes the authenticated user's singles/doubles tournament results across
 * all available ranking periods, then writes data/tournaments-twb.json.
 *
 * Uses only Node.js built-ins — no npm packages.
 *
 * Auth:   POST https://auth.tppwb.be/Authenticate/Login
 *         form fields AffiliationNumber + PIN (from env TWB_USERNAME / TWB_PIN)
 * Results: https://tennis.tppwb.be/MyAFT/?page=mytournois_myresults
 *
 * ── ASSUMPTIONS THAT MAY NEED VERIFICATION AGAINST THE LIVE SITE ─────────────
 *  1. PERIOD_PARAM — the query/post field used to select a ranking period.
 *     The dropdown option *labels* are known (see PERIODS) but the request
 *     parameter name is a best guess ('periode'). Adjust if the page uses a
 *     different name or requires an ASP.NET __doPostBack form post.
 *  2. Ranking / totalPoints extraction — pulled best-effort from the current
 *     period page; falls back to '' / 0 if the labels differ.
 *  The match-card parsing itself is driven by the documented text format
 *  ("Tournoi X le DD/MM/YYYY", "Contre NAME (N pts)", score, Victoires/Défaites)
 *  and is covered by a fixture test (see bottom of this file / repo history).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { URL } = require('url');

// ── Config ───────────────────────────────────────────────────────────────────

const LOGIN_URL   = 'https://auth.tppwb.be/Authenticate/Login';
const RESULTS_URL = 'https://tennis.tppwb.be/MyAFT/?page=mytournois_myresults';
const OUT         = path.join(__dirname, '..', 'data', 'tournaments-twb.json');
const DEBUG_HTML  = path.join(__dirname, '..', 'data', 'twb-debug.html');

// When TWB_DEBUG=1, dump the first period's raw HTML to DEBUG_HTML and exit
// before parsing, so the real page structure can be inspected.
const DEBUG = process.env.TWB_DEBUG === '1';

// Ranking-period option labels to iterate. These are sent as the value of
// PERIOD_PARAM on each results request (see assumption #1 above).
const PERIODS = [
  'Période courante',
  'Classement mai 2026',
  'Classement octobre 2025',
  'Classement mai 2025',
  'Classement octobre 2024',
  'Classement mai 2024',
  'Classement octobre 2023',
  'Classement mai 2023',
  'Classement octobre 2022',
];

// Best-guess request parameter name for the period selector.
const PERIOD_PARAM = 'periode';

const USER_AGENT = 'tennis-journal-twb-scraper/1.0 (+https://github.com/laurentiuborcan/tennis-journal)';

// ── Cookie jar ───────────────────────────────────────────────────────────────

// The jar is intentionally a single flat store shared across hosts (not
// scoped by the Set-Cookie Domain attribute). auth.tppwb.be and
// tennis.tppwb.be are different hostnames, so a domain-scoped jar would
// need to know they share a session; instead every cookie this jar has
// ever seen is sent on every request, which means a cookie set while
// logging in on auth.tppwb.be is automatically included when we then call
// tennis.tppwb.be. This is the deliberate fix for "cookies dropped across
// domains" — there's only ever one jar instance, created once in main()
// and threaded through login() and every fetchPeriod() call.
function createJar() {
  const cookies = {};
  return {
    store(setCookieHeaders) {
      if (!setCookieHeaders) return;
      const arr = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
      for (const sc of arr) {
        const pair = sc.split(';')[0];
        const eq   = pair.indexOf('=');
        if (eq === -1) continue;
        const name  = pair.slice(0, eq).trim();
        const value = pair.slice(eq + 1).trim();
        if (!name) continue;
        // An empty value (e.g. "session=; expires=Thu, 01 Jan 1970 ...")
        // means the server is clearing the cookie — drop it instead of
        // storing an empty string, so a logout/clear doesn't get re-sent.
        if (value === '') delete cookies[name];
        else cookies[name] = value;
      }
    },
    header() {
      return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
    },
    names() {
      return Object.keys(cookies);
    },
  };
}

// ── Low-level request ────────────────────────────────────────────────────────

function request(method, urlStr, { headers = {}, body = null, jar = null } = {}) {
  return new Promise((resolve, reject) => {
    const u   = new URL(urlStr);
    const lib = u.protocol === 'https:' ? https : http;

    const opts = {
      method,
      hostname: u.hostname,
      port:     u.port || (u.protocol === 'https:' ? 443 : 80),
      path:     u.pathname + u.search,
      headers:  { 'User-Agent': USER_AGENT, 'Accept': 'text/html,*/*', ...headers },
    };

    if (jar) {
      const cookie = jar.header();
      if (cookie) opts.headers['Cookie'] = cookie;
    }
    if (body != null) {
      opts.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = lib.request(opts, res => {
      if (jar) jar.store(res.headers['set-cookie']);
      let data = '';
      res.setEncoding('utf8');
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body != null) req.write(body);
    req.end();
  });
}

/**
 * Perform a request, following 3xx redirects while preserving the cookie jar.
 * If opts.onHop is given, it's called after every hop (including the final,
 * non-redirecting one) with { method, url, res } — used by login() to print
 * per-hop status/Location/Set-Cookie debug output.
 */
async function requestFollow(method, urlStr, opts = {}, maxRedirects = 6) {
  let url    = urlStr;
  let m      = method;
  let body   = opts.body ?? null;

  for (let i = 0; i <= maxRedirects; i++) {
    const res = await request(m, url, { ...opts, body });
    if (opts.onHop) opts.onHop({ method: m, url, res });
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      url  = new URL(res.headers.location, url).toString();
      m    = 'GET';     // 302/303 → switch to GET, drop body
      body = null;
      continue;
    }
    return res;
  }
  throw new Error('Too many redirects');
}

// ── Auth ─────────────────────────────────────────────────────────────────────

/** Find every <input> tag in html and return its name + type attributes. */
function extractInputFields(html) {
  const inputs = [];
  const re = /<input\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag  = m[0];
    const name = (tag.match(/\bname\s*=\s*["']([^"']*)["']/i) || [])[1] || '';
    const type = (tag.match(/\btype\s*=\s*["']([^"']*)["']/i) || [])[1] || 'text';
    if (name) inputs.push({ name, type });
  }
  return inputs;
}

function pageTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1]).replace(/\s+/g, ' ').trim() : '';
}

/** Fetch the login page to seed cookies and grab an antiforgery token if present. */
async function getLoginToken(jar) {
  const res = await requestFollow('GET', LOGIN_URL, { jar });
  console.log(`[login] GET ${LOGIN_URL} -> HTTP ${res.statusCode}`);

  const fields = extractInputFields(res.body);
  console.log(`[login] login page has ${fields.length} <input> field(s):`);
  for (const f of fields) {
    console.log(`[login]   name="${f.name}" type="${f.type}"`);
  }

  const m = res.body.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/i);
  return m ? m[1] : null;
}

async function login(jar) {
  const user = process.env.TWB_USERNAME;
  const pin  = process.env.TWB_PIN;
  if (!user || !pin) {
    throw new Error('Missing credentials: set TWB_USERNAME and TWB_PIN environment variables');
  }

  const token = await getLoginToken(jar);
  console.log(`[login] __RequestVerificationToken: ${token ? `found (${token.length} chars)` : 'not present on page'}`);

  const params = new URLSearchParams({ AffiliationNumber: user, PIN: pin });
  if (token) params.set('__RequestVerificationToken', token);
  console.log(`[login] POSTing fields: ${[...params.keys()].join(', ')}`);

  let hop = 0;
  const res = await requestFollow('POST', LOGIN_URL, {
    jar,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    onHop({ method, url, res: hopRes }) {
      hop++;
      console.log(`[login] hop ${hop}: ${method} ${url} -> HTTP ${hopRes.statusCode}`);
      if (hopRes.headers.location) {
        console.log(`[login] hop ${hop}: redirect Location -> ${hopRes.headers.location}`);
      }
      const setCookie = hopRes.headers['set-cookie'];
      if (setCookie) {
        const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
        for (const sc of arr) console.log(`[login] hop ${hop}: Set-Cookie -> ${sc}`);
      }
      console.log(`[login] hop ${hop}: cookie jar now holds [${jar.names().join(', ')}]`);
    },
  });

  const title = pageTitle(res.body);
  console.log(`[login] final page title: "${title}"`);

  if (res.statusCode !== 200) {
    throw new Error(`Login failed: HTTP ${res.statusCode}`);
  }

  // A logged-out site typically bounces back to the login form; treat a
  // "Login" page title or the presence of the login form fields on the
  // landing page as an auth failure.
  const stillOnLoginPage =
    /^login$/i.test(title) ||
    (/name="AffiliationNumber"/i.test(res.body) && /name="PIN"/i.test(res.body));

  if (stillOnLoginPage) {
    console.log('[login] result: FAILURE — still on the login page');
    throw new Error('Login failed: still on login page (check credentials)');
  }

  console.log('[login] result: SUCCESS — left the login page');
  return res;
}

// ── Fetch one period ─────────────────────────────────────────────────────────

async function fetchPeriod(jar, period) {
  const sep = RESULTS_URL.includes('?') ? '&' : '?';
  const url = `${RESULTS_URL}${sep}${PERIOD_PARAM}=${encodeURIComponent(period)}`;
  const res = await requestFollow('GET', url, { jar });
  if (res.statusCode !== 200) {
    throw new Error(`Failed to fetch period "${period}": HTTP ${res.statusCode}`);
  }
  return res.body;
}

// ── HTML helpers ─────────────────────────────────────────────────────────────

const ENTITIES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#039;': "'", '&apos;': "'",
  '&eacute;': 'é', '&egrave;': 'è', '&ecirc;': 'ê', '&euml;': 'ë',
  '&agrave;': 'à', '&acirc;': 'â', '&ccedil;': 'ç', '&icirc;': 'î',
  '&ocirc;': 'ô', '&ucirc;': 'û', '&ugrave;': 'ù',
};

function decodeEntities(s) {
  return s
    .replace(/&[a-z]+;|&#0?39;/gi, e => (ENTITIES[e] !== undefined ? ENTITIES[e] : e))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

/** Strip tags to plain text, replacing tags with spaces so words never merge. */
function stripTags(html) {
  return decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}

function toISODate(ddmmyyyy) {
  const [dd, mm, yyyy] = ddmmyyyy.split('/');
  return `${yyyy}-${mm}-${dd}`;
}

// ── Parsing ──────────────────────────────────────────────────────────────────

const ANCHOR_RE   = /Tournoi\s+(.+?)\s+le\s+(\d{2}\/\d{2}\/\d{4})/g;
const OPPONENT_RE = /Contre\s+(.+?)\s*\((\d+)\s*pts?\)/i;
const CATEGORY_RE = /((?:Simples|Doubles)\s+(?:Messieurs|Dames|Mixtes?)[\s\S]*?)(?=Contre|Tournoi|$)/i;
const SCORE_RE    = /(\d+\/\d+(?:-\d+\/\d+)+(?:\s*Ab\.?)?)/;

/**
 * Parse a single results page into match objects.
 * Win vs loss is determined by which section ("Victoires" / "Défaites") the
 * match card falls under in document order.
 */
function parseMatches(html) {
  const text = stripTags(html);

  const vIdx = text.search(/Victoires/i);
  const dIdx = text.search(/D[ée]faites/i);

  const anchors = [];
  let m;
  ANCHOR_RE.lastIndex = 0;
  while ((m = ANCHOR_RE.exec(text)) !== null) {
    anchors.push({ index: m.index, tournament: m[1].trim(), date: m[2] });
  }

  const matches = [];
  for (let i = 0; i < anchors.length; i++) {
    const a    = anchors[i];
    const end  = i + 1 < anchors.length ? anchors[i + 1].index : text.length;
    const card = text.slice(a.index, end);

    const opp = card.match(OPPONENT_RE);
    const cat = card.match(CATEGORY_RE);
    const sc  = card.match(SCORE_RE);

    // Determine win/loss by section ordering.
    let result = 'win';
    if (vIdx !== -1 && dIdx !== -1) {
      result = (a.index >= dIdx) ? 'loss' : 'win';
    } else if (dIdx !== -1 && vIdx === -1) {
      result = 'loss';
    }

    matches.push({
      date:        toISODate(a.date),
      tournament:  a.tournament,
      category:    cat ? cat[1].replace(/\s+/g, ' ').trim() : '',
      opponent:    opp ? opp[1].trim() : '',
      opponentPts: opp ? parseInt(opp[2], 10) : 0,
      score:       sc ? sc[1].replace(/\s+/g, ' ').trim() : '',
      result,
    });
  }

  return matches;
}

/** Best-effort extraction of the user's own ranking and total points. */
function parseHeader(html) {
  const text = stripTags(html);
  const rank = text.match(/\b(NC|[A-C]\d+(?:\.\d+)?|B[-+]?\d+|A\d+)\b/);
  const pts  = text.match(/Total[^0-9]{0,30}?([\d.\s]+?)\s*pts?/i);
  return {
    ranking:     rank ? rank[1] : '',
    totalPoints: pts  ? parseInt(pts[1].replace(/[.\s]/g, ''), 10) || 0 : 0,
  };
}

/** Deduplicate matches that appear across multiple ranking periods. */
function dedupe(matches) {
  const seen = new Set();
  const out  = [];
  for (const mt of matches) {
    const key = [mt.date, mt.tournament, mt.opponent, mt.score].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(mt);
  }
  return out;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const jar = createJar();

  console.log('Logging in to TWB ...');
  const landing = await login(jar);

  let periodsFetched = 0;
  let allMatches     = [];
  let header         = { ranking: '', totalPoints: 0 };

  for (const period of PERIODS) {
    const html = await fetchPeriod(jar, period);
    periodsFetched++;

    // Log a preview of every period's HTML so the structure is visible in the
    // GitHub Action logs.
    console.log(`\n──── HTML preview for "${period}" (first 2000 chars) ────`);
    console.log(html.slice(0, 2000));
    console.log('──── end preview ────\n');

    // Debug mode: dump the first fetched page in full and stop before parsing.
    if (DEBUG) {
      fs.writeFileSync(DEBUG_HTML, html);
      console.log(`✓ TWB_DEBUG=1 — wrote raw HTML of "${period}" to ${DEBUG_HTML} (${html.length} bytes)`);
      console.log('Exiting before parse so the real page structure can be inspected.');
      return;
    }

    if (period === 'Période courante') {
      header = parseHeader(html.length ? html : landing.body);
    }
    allMatches = allMatches.concat(parseMatches(html));
  }

  const matches = dedupe(allMatches);
  const wins    = matches.filter(x => x.result === 'win').length;
  const losses  = matches.filter(x => x.result === 'loss').length;

  const today = new Date().toISOString().slice(0, 10);

  const output = {
    lastUpdated: today,
    ranking:     header.ranking,
    totalPoints: header.totalPoints,
    matches,
  };

  fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + '\n');

  console.log(`✓ periods fetched: ${periodsFetched}`);
  console.log(`✓ matches found:   ${matches.length}`);
  console.log(`✓ wins:            ${wins}`);
  console.log(`✓ losses:          ${losses}`);
  console.log(`✓ written to       ${OUT}`);
}

// Export internals for unit testing; only run when invoked directly.
module.exports = { parseMatches, parseHeader, dedupe, stripTags, toISODate };

if (require.main === module) {
  main().catch(err => {
    console.error('TWB scraper failed:', err.message);
    process.exit(1);
  });
}
