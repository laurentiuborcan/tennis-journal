#!/usr/bin/env node
'use strict';

/**
 * scrape-league.js
 * Fetches https://dvl.webismagic.net/classement/4, parses standings,
 * completed matches, and upcoming matches, then writes data/season-2025-26.json.
 *
 * Uses only Node.js built-ins — no npm packages required.
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const MY_NAME = 'Laurentiu Borcan';
const SOURCE  = 'https://dvl.webismagic.net/classement/4';
const OUT     = path.join(__dirname, '..', 'data', 'season-2025-26.json');

// ── HTTP fetch ───────────────────────────────────────────────────────────────

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end',  () => resolve(body));
    }).on('error', reject);
  });
}

// ── HTML helpers ─────────────────────────────────────────────────────────────

/** Strip all HTML tags and decode common entities from a fragment. */
function stripTags(s) {
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// ── HTML helpers (continued) ─────────────────────────────────────────────────

/**
 * Extract the full inner content of the first <div id="<id>"> in html,
 * correctly handling nested <div> elements (the lazy-regex approach stops
 * at the first inner </div> and misses trailing content).
 */
function extractDivById(html, id) {
  const openTag = `<div id="${id}">`;
  const start   = html.indexOf(openTag);
  if (start === -1) return null;

  let pos   = start + openTag.length;
  let depth = 1;

  while (pos < html.length && depth > 0) {
    const nextOpen  = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);

    if (nextClose === -1) break;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;          // skip past "<div"
    } else {
      depth--;
      if (depth === 0) return html.slice(start + openTag.length, nextClose);
      pos = nextClose + 6;         // skip past "</div>"
    }
  }
  return null;
}

// ── Parsers ──────────────────────────────────────────────────────────────────

/**
 * Parse the #tableau-resultats standings table.
 * Returns an array of { name, ranking, pts, played, wins, draws, losses, diff }.
 */
function parseStandings(html) {
  const tableMatch = html.match(/<table id="tableau-resultats"[\s\S]*?>([\s\S]*?)<\/table>/);
  if (!tableMatch) {
    console.warn('WARNING: standings table not found');
    return [];
  }

  const rows    = [];
  const rowsHtml = tableMatch[1];

  // Skip the first <tr> (header row)
  const rowRe  = /<tr>([\s\S]*?)<\/tr>/g;
  let   match;
  let   first  = true;

  while ((match = rowRe.exec(rowsHtml)) !== null) {
    if (first) { first = false; continue; }

    const rowHtml = match[1];

    // Extract name from the <a> tag inside the nom cell
    const nameMatch = rowHtml.match(/<td class="nom[^"]*">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();

    // Extract ranking from the <span> that follows
    const rankMatch = rowHtml.match(/<span[^>]*>\(([^)]+)\)<\/span>/);
    const ranking   = rankMatch ? rankMatch[1].trim() : '';

    // Extract all <td> cells as plain text to get the numeric columns
    const tdRe  = /<td(?:\s[^>]*)?>[\s\S]*?<\/td>/g;
    const cells = [];
    let   tm;
    while ((tm = tdRe.exec(rowHtml)) !== null) {
      cells.push(stripTags(tm[0]));
    }
    // cells[0] = "Name (RANKING)" (the nom cell)
    // cells[1] = pts, [2] = played, [3] = wins, [4] = draws, [5] = losses, [6] = diff

    const pts    = parseInt(cells[1], 10) || 0;
    const played = parseInt(cells[2], 10) || 0;
    const wins   = parseInt(cells[3], 10) || 0;
    const draws  = parseInt(cells[4], 10) || 0;
    const losses = parseInt(cells[5], 10) || 0;
    const diff   = parseInt(cells[6], 10) || 0;

    rows.push({ name, ranking, pts, played, wins, draws, losses, diff });
  }

  return rows;
}

/**
 * Parse the #liste_matches div into completed allMatches and upcoming arrays.
 *
 * Each <p> in the div looks like one of:
 *   <p><b></b> Player1 S1 - S2 Player2</p>          (completed)
 *   <p><b>DD/MM/YYYY HH:MM</b> Player1 0 - 0 Player2</p>  (upcoming)
 *
 * Upcoming matches are identified by a non-empty <b> tag (which holds the date/time).
 */
function parseMatches(html) {
  const divContent = extractDivById(html, 'liste_matches');
  if (!divContent) {
    console.warn('WARNING: #liste_matches div not found');
    return { allMatches: [], upcoming: [] };
  }

  const allMatches = [];
  const upcoming   = [];

  const pRe = /<p>([\s\S]*?)<\/p>/g;
  let   pm;

  while ((pm = pRe.exec(divContent)) !== null) {
    const inner = pm[1];

    // Capture the <b> tag content (may be empty for completed, or "DD/MM/YYYY HH:MM" for upcoming)
    const boldMatch = inner.match(/<b>(.*?)<\/b>/);
    if (!boldMatch) continue;
    const bold = boldMatch[1].trim();

    // Everything after the closing </b>
    const after = inner.slice(inner.indexOf('</b>') + 4).trim();

    // Parse "Player1 S1 - S2 Player2"
    // Use a lazy match on the first name so multi-word names are captured correctly.
    const scoreMatch = after.match(/^(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+)$/);
    if (!scoreMatch) continue;

    const p1 = scoreMatch[1].trim();
    const s1 = parseInt(scoreMatch[2], 10);
    const s2 = parseInt(scoreMatch[3], 10);
    const p2 = scoreMatch[4].trim();

    if (bold) {
      // Upcoming: bold contains "DD/MM/YYYY HH:MM"
      const parts = bold.split(' ');
      const date  = parts[0] || '';
      const time  = parts[1] || '';
      upcoming.push({ date, time, p1, p2 });
    } else {
      // Completed match
      allMatches.push({ p1, s1, p2, s2 });
    }
  }

  return { allMatches, upcoming };
}

/**
 * Derive myMatches and myStats for MY_NAME from the parsed data.
 * myMatches lists matches involving MY_NAME (most recent first, mirroring allMatches order).
 * myStats is taken directly from the standings row.
 */
function deriveMyData(standings, allMatches) {
  const meRow = standings.find(s => s.name === MY_NAME);

  const myMatches = allMatches
    .filter(m => m.p1 === MY_NAME || m.p2 === MY_NAME)
    .map((m, i) => {
      const isP1     = m.p1 === MY_NAME;
      const my       = isP1 ? m.s1 : m.s2;
      const opp      = isP1 ? m.s2 : m.s1;
      const opponent = isP1 ? m.p2 : m.p1;
      const result   = my > opp ? 'win' : my < opp ? 'loss' : 'draw';
      return { id: `lm${i + 1}`, opponent, my, opp, result };
    });

  const myStats = meRow
    ? {
        points:  meRow.pts,
        played:  meRow.played,
        wins:    meRow.wins,
        draws:   meRow.draws,
        losses:  meRow.losses,
        diff:    meRow.diff,
        ranking: meRow.ranking,
      }
    : { points: 0, played: 0, wins: 0, draws: 0, losses: 0, diff: 0, ranking: '' };

  return { myStats, myMatches };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Fetching ${SOURCE} ...`);
  const html = await fetchUrl(SOURCE);

  const standings              = parseStandings(html);
  const { allMatches, upcoming } = parseMatches(html);
  const { myStats, myMatches } = deriveMyData(standings, allMatches);

  const today  = new Date().toISOString().slice(0, 10);

  const output = {
    id:          '2025-26',
    label:       '2025/26',
    status:      'active',
    lastUpdated: today,
    standings,
    allMatches,
    upcoming,
    myMatches,
    myStats,
  };

  fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + '\n');

  console.log(`✓ standings:         ${standings.length}`);
  console.log(`✓ completed matches: ${allMatches.length}`);
  console.log(`✓ upcoming:          ${upcoming.length}`);
  console.log(`✓ my matches:        ${myMatches.length}`);
  console.log(`✓ written to        ${OUT}`);
}

main().catch(err => {
  console.error('Scraper failed:', err.message);
  process.exit(1);
});
