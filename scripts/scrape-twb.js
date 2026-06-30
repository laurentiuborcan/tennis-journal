#!/usr/bin/env node
'use strict';

/**
 * scrape-twb.js
 *
 * Logs in to the TWB (Tennis Province du Brabant Wallon) members area and
 * scrapes the authenticated user's singles tournament results across all 9
 * ranking-period ordinals, then writes data/tournaments-twb.json.
 *
 * Uses only Node.js built-ins — no npm packages.
 *
 * Auth:    POST https://auth.tppwb.be/Authenticate/Login
 *          form fields affiliationNumber + pinCode (from env TWB_USERNAME / TWB_PIN)
 * Results: GET https://tennis.tppwb.be/MyAFT/MyResults/Results?ordinal=N  (N = 1..9)
 *
 * Each results response is parsed directly from its real HTML structure:
 *  - Ranking/points come from the page text matching
 *    "Classement 2026: C30.4 ... 51.387 pts".
 *  - Win cards are <dl class="grid-data-item"> elements inside
 *    <div id="divMyResultsSingleVictory">; loss cards are the same inside
 *    <div id="divMyResultsSingleDefeat">.
 *  - Within each card: tournament + date from the first <dd> ("Tournoi X le
 *    DD/MM/YYYY"), category from the second <dd>, opponent name/points from
 *    the `title="Plus d'info sur NAME (N pts)"` anchor, and score from the
 *    last <dd> before the "view-draw" anchor.
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { URL } = require('url');

// ── Config ───────────────────────────────────────────────────────────────────

const LOGIN_URL    = 'https://auth.tppwb.be/Authenticate/Login';
const RESULTS_BASE = 'https://tennis.tppwb.be/MyAFT/MyResults/Results';
const ORDINALS      = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const OUT          = path.join(__dirname, '..', 'data', 'tournaments-twb.json');

const USER_AGENT = 'tennis-journal-twb-scraper/1.0 (+https://github.com/laurentiuborcan/tennis-journal)';

// ── Cookie jar ───────────────────────────────────────────────────────────────

// A single flat store shared across hosts (not scoped by the Set-Cookie
// Domain attribute) — auth.tppwb.be and tennis.tppwb.be are different
// hostnames but share one session, so every cookie this jar has seen is sent
// on every request regardless of which host set it.
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
        if (value === '') delete cookies[name];
        else cookies[name] = value;
      }
    },
    header() {
      return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
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

/** Perform a request, following 3xx redirects while preserving the cookie jar. */
async function requestFollow(method, urlStr, opts = {}, maxRedirects = 6) {
  let url    = urlStr;
  let m      = method;
  let body   = opts.body ?? null;

  for (let i = 0; i <= maxRedirects; i++) {
    const res = await request(m, url, { ...opts, body });
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

function pageTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1]).replace(/\s+/g, ' ').trim() : '';
}

/** Fetch the login page to seed cookies and grab an antiforgery token if present. */
async function getLoginToken(jar) {
  const res = await requestFollow('GET', LOGIN_URL, { jar });
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
  const params = new URLSearchParams({ affiliationNumber: user, pinCode: pin });
  if (token) params.set('__RequestVerificationToken', token);

  const res = await requestFollow('POST', LOGIN_URL, {
    jar,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (res.statusCode !== 200) {
    throw new Error(`Login failed: HTTP ${res.statusCode}`);
  }

  // A logged-out site typically bounces back to the login form; treat a
  // "Login" page title or the presence of the login form fields on the
  // landing page as an auth failure.
  const title = pageTitle(res.body);
  const stillOnLoginPage =
    /^login$/i.test(title) ||
    (/name="affiliationNumber"/i.test(res.body) && /name="pinCode"/i.test(res.body));

  if (stillOnLoginPage) {
    throw new Error('Login failed: still on login page (check credentials)');
  }

  return res;
}

// ── Fetch one ordinal ────────────────────────────────────────────────────────

async function fetchOrdinal(jar, ordinal) {
  const url = `${RESULTS_BASE}?ordinal=${ordinal}`;
  const res = await requestFollow('GET', url, { jar });
  if (res.statusCode !== 200) {
    throw new Error(`Failed to fetch ordinal ${ordinal}: HTTP ${res.statusCode}`);
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

/**
 * Extract the full inner content of the first <div ... id="id" ...> in html,
 * correctly handling nested <div> elements.
 */
function extractDivById(html, id) {
  const openTagRe = new RegExp(`<div[^>]*\\bid="${id}"[^>]*>`, 'i');
  const openMatch = openTagRe.exec(html);
  if (!openMatch) return null;

  let pos   = openMatch.index + openMatch[0].length;
  let depth = 1;

  while (pos < html.length && depth > 0) {
    const nextOpen  = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);

    if (nextClose === -1) break;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) return html.slice(openMatch.index + openMatch[0].length, nextClose);
      pos = nextClose + 6;
    }
  }
  return null;
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

// ── Parsing ──────────────────────────────────────────────────────────────────

const DL_RE          = /<dl[^>]*class="grid-data-item"[^>]*>([\s\S]*?)<\/dl>/gi;
const DD_RE           = /<dd[^>]*>([\s\S]*?)<\/dd>/gi;
const ANCHOR_RE       = /Tournoi\s+(.+?)\s+le\s+(\d{2}\/\d{2}\/\d{4})/;
const SCORE_RE        = /\d+\/\d+/;

/** Parse one <dl class="grid-data-item"> card into a match object. */
function parseMatchCard(dlHtml, result) {
  const dds = [];
  let dm;
  DD_RE.lastIndex = 0;
  while ((dm = DD_RE.exec(dlHtml)) !== null) {
    dds.push(stripTags(dm[1]));
  }

  const firstDd  = dds[0] || '';
  const secondDd = dds[1] || '';
  const scoreDd  = dds.slice(2).find(dd => SCORE_RE.test(dd)) || '';

  const tournoiMatch = firstDd.match(ANCHOR_RE);

  // Try matching the title attribute with any apostrophe variant
  let opponent    = '';
  let opponentPts = 0;
  const oppMatch = dlHtml.match(/title="Plus d.info sur ([^(]+?)\s*\((\d+)\s*pts\)"/);
  if (oppMatch) {
    opponent    = oppMatch[1].trim();
    opponentPts = parseInt(oppMatch[2]);
  } else {
    // Fallback: extract from the anchor text between >NAME< before " (N pts)"
    const nameMatch = dlHtml.match(/data-url="\/MyAFT\/Players\/Detail\/\d+" title="[^"]*">([^<]+)\s*\((\d+)\s*pts\)<\/a>/);
    if (nameMatch) {
      opponent    = nameMatch[1].trim();
      opponentPts = parseInt(nameMatch[2]);
    }
  }

  return {
    date:        tournoiMatch ? toISODate(tournoiMatch[2]) : '',
    tournament:  tournoiMatch ? tournoiMatch[1].trim() : '',
    category:    secondDd,
    opponent,
    opponentPts,
    opponentRanking: ptsToRanking(opponentPts),
    score:       scoreDd,
    result,
  };
}

/** Parse all <dl class="grid-data-item"> cards inside the named div, tagging them with result. */
function parseSection(html, divId, result) {
  const divContent = extractDivById(html, divId);
  if (!divContent) return [];

  const matches = [];
  let m;
  DL_RE.lastIndex = 0;
  while ((m = DL_RE.exec(divContent)) !== null) {
    matches.push(parseMatchCard(m[1], result));
  }
  return matches;
}

/** Parse a single results-ordinal response into match objects. */
function parseMatches(html) {
  const wins   = parseSection(html, 'divMyResultsSingleVictory', 'win');
  const losses = parseSection(html, 'divMyResultsSingleDefeat', 'loss');
  return wins.concat(losses);
}

/** Extract the user's ranking and total points from the "Classement YYYY: RANK ... PTS pts" text. */
function parseHeader(html) {
  const text = stripTags(html);
  const m = text.match(/Classement\s+\d{4}\s*:\s*([A-C]\d+(?:\.\d+)?|NC)\b[^0-9]*?([\d.]+)\s*pts/i);

  return {
    ranking:     m ? m[1] : '',
    totalPoints: m ? parseInt(m[2].replace(/\./g, ''), 10) || 0 : 0,
  };
}

const TOTAL_RE       = /^Total\s*:?$/i;
const MOYENNE_RE     = /Moyenne\s+pond[eé]r[eé]e\s*:?/i;
const TOURNOI_ROW_RE = /^(?:TOURNOIS\s*-\s*)?(.+?)\((\d+)\)\s+(\d{2}\/\d{2}\/\d{4})\s+(.+)$/i;
const POINTS_RE      = /([\d.]+)\s*pts/i;

/**
 * Parse the "Points obtenus pour le calcul du classement simple" breakdown
 * out of the #pointDetailsModalDialog modal embedded in the ordinal=1
 * results page — the per-tournament results counted toward the current
 * ranking period, the total, and the weighted-average formula.
 */
function parsePointsBreakdown(html) {
  const result = { bestResults: [], totalPoints: 0, weightedFormula: '', finalPoints: 0 };

  const modal = extractDivById(html, 'pointDetailsModalDialog');
  if (!modal) return result;

  // Per-tournament results: <dl class="grid-data-item"><dd>...</dd><dd>...</dd></dl>
  const dlRe = /<dl[^>]*class="grid-data-item"[^>]*>([\s\S]*?)<\/dl>/gi;
  let dlMatch;
  while ((dlMatch = dlRe.exec(modal)) !== null) {
    const dds = [];
    const ddRe = /<dd[^>]*>([\s\S]*?)<\/dd>/gi;
    let ddMatch;
    while ((ddMatch = ddRe.exec(dlMatch[1])) !== null) {
      dds.push(stripTags(ddMatch[1]));
    }
    if (dds.length < 2) continue;

    const rowMatch = dds[0].match(TOURNOI_ROW_RE);
    if (rowMatch) {
      const ptsMatch = dds[1].match(POINTS_RE);
      result.bestResults.push({
        tournament: rowMatch[1].trim(),
        club:       rowMatch[2],
        date:       toISODate(rowMatch[3]),
        category:   rowMatch[4].trim(),
        points:     ptsMatch ? parseFloat(ptsMatch[1]) : 0,
      });
    }
  }

  // Total / weighted-average rows: plain <dl><dt>...</dt><dd>...</dd></dl>
  // (no "grid-data-item" class, content may be wrapped in <strong>).
  const dlDtRe = /<dl(?:\s[^>]*)?>([\s\S]*?)<\/dl>/gi;
  let dlDtMatch;
  while ((dlDtMatch = dlDtRe.exec(modal)) !== null) {
    const block   = dlDtMatch[1];
    const dtMatch = block.match(/<dt[^>]*>([\s\S]*?)<\/dt>/i);
    const ddMatch = block.match(/<dd[^>]*>([\s\S]*?)<\/dd>/i);
    if (!dtMatch || !ddMatch) continue;

    const dt = stripTags(dtMatch[1]);
    const dd = stripTags(ddMatch[1]);

    if (TOTAL_RE.test(dt)) {
      const m = dd.match(POINTS_RE);
      result.totalPoints = m ? parseFloat(m[1]) : 0;
      continue;
    }

    if (MOYENNE_RE.test(dt)) {
      result.weightedFormula = dd;
      const tail = dd.slice(dd.lastIndexOf('=') + 1).trim();
      const m = tail.match(POINTS_RE);
      result.finalPoints = m ? parseFloat(m[1]) : 0;
    }
  }

  return result;
}

function matchKey(mt) {
  return [mt.date, mt.tournament, mt.opponent].join('|');
}

/** Deduplicate matches that appear across multiple ordinals (or scrape runs). */
function dedupe(matches) {
  const seen = new Set();
  const out  = [];
  for (const mt of matches) {
    const key = matchKey(mt);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(mt);
  }
  return out;
}

/** Load previously saved matches from OUT, if the file exists and is valid. */
function loadExisting() {
  try {
    const data = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    return Array.isArray(data.matches) ? data.matches : [];
  } catch {
    return [];
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const jar = createJar();
  await login(jar);

  let allMatches      = [];
  let header          = { ranking: '', totalPoints: 0 };
  let pointsBreakdown = { bestResults: [], totalPoints: 0, weightedFormula: '', finalPoints: 0 };

  for (const ordinal of ORDINALS) {
    const html = await fetchOrdinal(jar, ordinal);
    if (ordinal === 1) {
      header          = parseHeader(html);
      pointsBreakdown = parsePointsBreakdown(html);
    }
    allMatches = allMatches.concat(parseMatches(html));
  }

  const scraped  = dedupe(allMatches);
  const existing = loadExisting();

  const existingKeys = new Set(existing.map(matchKey));
  const newCount      = scraped.filter(mt => !existingKeys.has(matchKey(mt))).length;

  const matches = dedupe(scraped.concat(existing))
    .sort((a, b) => b.date.localeCompare(a.date));

  const wins   = matches.filter(x => x.result === 'win').length;
  const losses = matches.filter(x => x.result === 'loss').length;

  const today = new Date().toISOString().slice(0, 10);

  const output = {
    lastUpdated: today,
    ranking:     header.ranking,
    totalPoints: header.totalPoints,
    pointsBreakdown,
    matches,
  };

  fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + '\n');

  console.log(`✓ matches found:     ${matches.length}`);
  console.log(`✓ new matches added: ${newCount}`);
  console.log(`✓ wins:              ${wins}`);
  console.log(`✓ losses:            ${losses}`);
  console.log(`✓ written to         ${OUT}`);
}

// Export internals for unit testing; only run when invoked directly.
module.exports = { parseMatches, parseHeader, parsePointsBreakdown, dedupe, matchKey, loadExisting, stripTags, toISODate, ptsToRanking };

if (require.main === module) {
  main().catch(err => {
    console.error('TWB scraper failed:', err.message);
    process.exit(1);
  });
}
