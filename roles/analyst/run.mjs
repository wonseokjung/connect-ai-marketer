// 숫자 담당. Read only: your own public numbers on X and YouTube, once a day.
// X: followers, your recent posts with views, likes and replies, replies under your best 5.
// YouTube: subscribers, video count, your latest videos with views and age (the public channel page, not Studio).
// Each day adds one row per site to out/analyst-daily.csv, so the desk can show the change since last time.
import fs from 'node:fs';
import path from 'node:path';
import {wrap, run} from '../../lib/ego.mjs';
import {writeJson, today} from '../../lib/paths.mjs';
import {count, ageDays, unset} from '../../lib/num.mjs';

export const id = 'analyst';
const READ_X = `
await page.goto('https://x.com/' + P.handle, {timeout: 40000}); await W(4500);
const followersText = await page.evaluate(() => { const a = document.querySelector('a[href$="/verified_followers"], a[href$="/followers"]'); return a ? a.innerText : ''; });
const posts = new Map();
for (let s = 0; s < P.screens; s++) {
  for (const p of await page.evaluate((h) => [...document.querySelectorAll('article[data-testid="tweet"]')].map(a => {
    const link = [...a.querySelectorAll('a[href*="/status/"]')].find(x => x.querySelector('time'));
    const g = a.querySelector('[role="group"]');
    return {url: link ? link.href.split('?')[0] : '', mine: !!(link && link.getAttribute('href').toLowerCase().startsWith('/' + h.toLowerCase() + '/')),
      text: (a.querySelector('[data-testid="tweetText"]') || {}).innerText || '', time: (a.querySelector('time') || {}).dateTime || '', stats: g ? g.getAttribute('aria-label') || '' : ''};
  }), P.handle)) if (p.url && p.mine) posts.set(p.url, p);
  await page.mouse.move(600, 500); await page.mouse.wheel(0, 2400); await W(1500);
}
done({followersText, posts: [...posts.values()]});
`;
const REPLIES = `
const out = [];
for (const u of P.urls) {
  await page.goto(u, {timeout: 40000}); await W(4000);
  out.push({url: u, replies: await page.evaluate(() => [...document.querySelectorAll('article[data-testid="tweet"]')].slice(1, 16).map(a => ({
    user: ((a.querySelector('[data-testid="User-Name"]') || {}).innerText || '').split('\\n')[0], text: (a.querySelector('[data-testid="tweetText"]') || {}).innerText || ''})).filter(r => r.text))});
}
done(out);
`;
const READ_YT = `
await page.goto('https://www.youtube.com/' + P.handle + '/videos', {timeout: 40000}); await W(4500);
for (let s = 0; s < P.screens; s++) { await page.mouse.move(700, 500); await page.mouse.wheel(0, 2400); await W(1200); }
done(await page.evaluate(() => ({
  header: ((document.querySelector('#page-header') || {}).innerText || '').slice(0, 600),
  items: [...document.querySelectorAll('ytd-rich-item-renderer')].map(v => {
    const links = [...v.querySelectorAll('a[href*="/watch"]')];
    const t = links.map(a => (a.innerText || '').trim()).sort((p, q) => q.length - p.length)[0] || '';
    return {title: t, url: links[0] ? links[0].href.split('&')[0] : '', lines: (v.innerText || '').split('\\n').map(x => x.trim()).filter(Boolean)};
  }).filter(x => x.url)
})));
`;

const n = (s, k) => { const m = (s || '').match(new RegExp('([\\d,.]+)\\s*' + k)); return m ? +m[1].replace(/,/g, '') : 0; };
export const numbers = (p) => ({...p, views: n(p.stats, 'view'), likes: n(p.stats, 'like'), replies: n(p.stats, 'repl'), reposts: n(p.stats, 'repost')});

// YouTube channel page text → numbers. Works for English and Korean pages.
export function ytHeader(text) {
  const parts = String(text || '').split(/[•·\n]/).map((x) => x.trim()).filter(Boolean);
  const sub = parts.find((x) => /subscriber|구독자/i.test(x)) || '';
  const vid = parts.find((x) => /\bvideos?\b|동영상/i.test(x)) || '';
  return {subscribers: count(sub), videos: count(vid), subscribersText: sub, videosText: vid};
}
// one item from the videos tab: lines are "11:11", title, (channel), "21K views" or "21K", "16h ago"
export function ytItem(it) {
  const ageI = it.lines.findIndex((l) => /\bago\b|전$/.test(l));
  const ageText = ageI >= 0 ? it.lines[ageI] : '';
  const viewsText = (ageI > 0 ? it.lines.slice(0, ageI).reverse() : it.lines).find((l) => /views?|조회수|회$/i.test(l) || /^[\d.,]+\s*[KMB천만억]?$/i.test(l)) || '';
  const lengthText = it.lines.find((l) => /^\d{1,2}(:\d{2}){1,2}$/.test(l)) || '';
  return {title: it.title, url: it.url, viewsText, ageText, lengthText, views: count(viewsText), days: ageDays(ageText)};
}

// ---- daily CSV: one row per date and site, a second run the same day replaces that day's row ----
export const CSV_COLS = ['date', 'site', 'handle', 'followers', 'posts_read', 'views', 'likes', 'replies', 'best_url'];
const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export function parseCsv(text) {
  const out = [];
  for (const line of String(text || '').split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const cells = []; let cur = '', inq = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inq) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') inq = false; else cur += c; }
      else if (c === '"') inq = true; else if (c === ',') { cells.push(cur); cur = ''; } else cur += c;
    }
    cells.push(cur);
    out.push(Object.fromEntries(CSV_COLS.map((k, i) => [k, cells[i] ?? ''])));
  }
  return out;
}
export function upsertCsv(file, row) {
  const rows = fs.existsSync(file) ? parseCsv(fs.readFileSync(file, 'utf8')) : [];
  const kept = rows.filter((r) => !(r.date === row.date && r.site === row.site));
  kept.push(Object.fromEntries(CSV_COLS.map((k) => [k, row[k] ?? ''])));
  kept.sort((a, b) => (a.date + a.site).localeCompare(b.date + b.site));
  fs.writeFileSync(file, [CSV_COLS.join(','), ...kept.map((r) => CSV_COLS.map((k) => q(r[k])).join(','))].join('\n') + '\n');
  return kept;
}
// latest row per site with the change since the row before it (for the desk card)
export function latest(rows) {
  const bySite = {};
  for (const r of rows) (bySite[r.site] ||= []).push(r);
  return Object.entries(bySite).map(([site, rs]) => {
    rs.sort((a, b) => a.date.localeCompare(b.date));
    const now = rs[rs.length - 1], prev = rs[rs.length - 2];
    const d = (k) => (prev && now[k] !== '' && prev[k] !== '' ? +now[k] - +prev[k] : null);
    return {site, ...now, since: prev?.date || null, change: {followers: d('followers'), views: d('views')}};
  });
}
export const csvFile = (h) => path.join(h, 'out', 'analyst-daily.csv');

function youtubeHandle(cfg) {
  const v = cfg.youtube?.handle || ((cfg.profile?.Channel || '').match(/youtube\.com\/(@[^/?#\s]+)/) || [])[1] || '';
  if (unset(v)) return '';
  return v.startsWith('@') ? v : '@' + v;
}
const xHandle = (cfg, a = {}) => { const v = (a.handle || cfg.x?.handle || '').replace(/^@/, ''); return unset(v) ? '' : v; };

async function readX(handle, screens) {
  const got = await run(wrap(READ_X, {handle, screens: screens || 4}), {timeoutMs: 180000});
  const posts = got.posts.map(numbers);
  const best = [...posts].sort((a, b) => (b.likes * 10 + b.replies * 20 + b.views / 100) - (a.likes * 10 + a.replies * 20 + a.views / 100)).slice(0, 5);
  const replies = best.length ? await run(wrap(REPLIES, {urls: best.map((b) => b.url)}), {timeoutMs: 60000 * (1 + best.length)}) : [];
  const sum = (k) => posts.reduce((s, p) => s + p[k], 0);
  return {handle, followers: count(got.followersText), followersText: got.followersText, posts: posts.length, totals: {views: sum('views'), likes: sum('likes'), replies: sum('replies')}, best, replies};
}
async function readYouTube(handle, screens) {
  const got = await run(wrap(READ_YT, {handle, screens: screens || 1}), {timeoutMs: 120000});
  const head = ytHeader(got.header);
  const vids = got.items.map(ytItem).slice(0, 30);
  return {handle, ...head, latest: vids, totals: {views: vids.reduce((s, v) => s + v.views, 0)}, best: [...vids].sort((a, b) => b.views - a.views).slice(0, 5)};
}

export async function read(h, cfg, {handle, site} = {}) {
  const want = {x: xHandle(cfg, {handle}), youtube: youtubeHandle(cfg)};
  const sites = Object.keys(want).filter((s) => want[s] && (!site || site === s));
  if (!sites.length) throw new Error('Set x.handle and/or youtube.handle in config.json (your own handles), then run again');
  const res = {date: today(), sites: {}}, errors = {};
  for (const s of sites) {
    try { res.sites[s] = s === 'x' ? await readX(want.x) : await readYouTube(want.youtube); } catch (e) { errors[s] = e.message.split('\n')[0]; }
  }
  if (Object.keys(errors).length) res.errors = errors;
  const json = path.join(h, 'out', `analyst-${today()}.json`);
  writeJson(json, res);
  const csv = csvFile(h);
  const x = res.sites.x, y = res.sites.youtube;
  if (x) upsertCsv(csv, {date: today(), site: 'x', handle: '@' + x.handle, followers: x.followers, posts_read: x.posts, views: x.totals.views, likes: x.totals.likes, replies: x.totals.replies, best_url: x.best[0]?.url});
  if (y) upsertCsv(csv, {date: today(), site: 'youtube', handle: y.handle, followers: y.subscribers, posts_read: y.latest.length, views: y.totals.views, likes: '', replies: '', best_url: y.best[0]?.url});
  const md = [`# Your public numbers, ${today()}`, ''];
  if (x) {
    md.push(`## X @${x.handle}`, '', `${x.followers.toLocaleString('en-US')} followers. ${x.posts} recent posts read: views ${x.totals.views}, likes ${x.totals.likes}, replies ${x.totals.replies}.`, '', '### Best 5', '');
    for (const b of x.best) { md.push(`- ${b.views} views · ${b.likes} likes · ${b.replies} replies · ${b.text.replace(/\s+/g, ' ').slice(0, 140)}`, `  ${b.url}`); const r = x.replies.find((z) => z.url === b.url); for (const z of (r?.replies || []).slice(0, 5)) md.push(`  > ${z.user}: ${z.text.replace(/\s+/g, ' ').slice(0, 140)}`); }
    md.push('');
  }
  if (y) {
    md.push(`## YouTube ${y.handle}`, '', `${y.subscribersText || y.subscribers + ' subscribers'} · ${y.videosText || y.videos + ' videos'}. Latest ${y.latest.length} videos: ${y.totals.views.toLocaleString('en-US')} views together.`, '', '| Video | Views | Uploaded | Length |', '|---|---|---|---|');
    for (const v of y.latest.slice(0, 12)) md.push(`| [${v.title.replace(/\|/g, '/')}](${v.url}) | ${v.viewsText} | ${v.ageText} | ${v.lengthText} |`);
    md.push('');
  }
  for (const [s, e] of Object.entries(errors)) md.push(`${s}: not read this time (${e}).`);
  md.push('Numbers are what each site showed publicly at reading time. Daily history: out/analyst-daily.csv.', 'Next: ask your agent which topics pull views and conversation, and what people asked for.');
  fs.writeFileSync(json.replace(/\.json$/, '.md'), md.join('\n'));
  if (!x && !y) throw new Error('Could not read any site: ' + Object.entries(errors).map(([s, e]) => s + ': ' + e).join('; '));
  return {json, md: json.replace(/\.json$/, '.md'), csv, x: x ? {followers: x.followers, posts: x.posts} : undefined, youtube: y ? {subscribers: y.subscribers, videos: y.latest.length} : undefined, errors: res.errors};
}

export const ready = (cfg, a = {}) => !!(xHandle(cfg, a) || youtubeHandle(cfg)) || 'needs x.handle or youtube.handle in config.json';
