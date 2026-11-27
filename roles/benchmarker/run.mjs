// 벤치마크 담당. Read only: before an upload, search YouTube for your keyword and read the top recent results
// (title, channel, views, upload age, length), rank them by views, count title patterns, write one report.
import fs from 'node:fs';
import path from 'node:path';
import {wrap, run} from '../../lib/ego.mjs';
import {writeJson, today} from '../../lib/paths.mjs';
import {count, ageDays, seconds, clock, median, unset} from '../../lib/num.mjs';

export const id = 'benchmarker';
const SEARCH = `
await step('유튜브 검색: ' + P.kw);
await page.goto('https://www.youtube.com/results?search_query=' + encodeURIComponent(P.kw), {timeout: 40000}); await W(4000);
await step('검색 결과 읽기');
for (let s = 0; s < P.screens; s++) { await page.mouse.move(700, 500); await page.mouse.wheel(0, 3000); await W(1400); }
done(await page.evaluate(() => [...document.querySelectorAll('ytd-video-renderer')].map(v => {
  const a = v.querySelector('a#video-title'); const meta = [...v.querySelectorAll('#metadata-line span')].map(s => s.innerText.trim());
  const clock = [...v.querySelectorAll('ytd-thumbnail-overlay-time-status-renderer, badge-shape')].map(e => (e.innerText || '').trim()).find(t => /^\\d{1,2}(:\\d{2}){1,2}$/.test(t)) || '';
  return {title: a ? a.innerText.trim() : '', url: a ? a.href.split('&')[0] : '', channel: ((v.querySelector('ytd-channel-name') || {}).innerText || '').split('\\n').map(x => x.trim()).filter(Boolean)[0] || '',
    viewsText: meta[0] || '', ageText: meta[1] || '', lengthText: clock, thumb: ((v.querySelector('img') || {}).src || '')};
}).filter(x => x.url.includes('watch'))));
`;

export const views = count;
export {ageDays};

export function patterns(titles) {
  const tests = {'has a number': /\d/, 'question': /\?|까요|나요|인가/, 'brackets or quotes': /[\[\]()「」"“”']/, 'how-to': /how to|방법|하는 법|만들기/i, 'vs / comparison': /\bvs\b|비교/i, 'free / 0': /free|무료|0원/i, 'short (under 30 chars)': /^.{1,29}$/u};
  return Object.entries(tests).map(([k, re]) => ({pattern: k, count: titles.filter((t) => re.test(t)).length})).sort((a, b) => b.count - a.count);
}

// raw search results → unique, recent, ranked rows. Pure, so it is tested without a browser.
export function rows(raw, {days = 14, top = 20} = {}) {
  const seen = new Set();
  return raw.filter((r) => r.url && !seen.has(r.url) && seen.add(r.url))
    .map((r) => {
      const v = count(r.viewsText), d = ageDays(r.ageText), sec = seconds(r.lengthText);
      return {...r, views: v, days: d, sec, perDay: Math.round(v / Math.max(1, d))};
    })
    .filter((r) => r.days <= days).sort((a, b) => b.views - a.views).slice(0, top);
}

export function summary(rs) {
  const top = rs.slice(0, 10);
  const lens = top.map((r) => r.sec).filter(Boolean);
  return {videos: rs.length, medianViews: median(top.map((r) => r.views)), medianPerDay: median(top.map((r) => r.perDay)), medianLength: median(lens),
    under5min: lens.filter((s) => s < 300).length, between5and20: lens.filter((s) => s >= 300 && s <= 1200).length, over20min: lens.filter((s) => s > 1200).length};
}

export function report(kw, days, rs, pats, sum = summary(rs)) {
  const cell = (s) => String(s ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ');
  return [`# Benchmark "${kw}", last ${days} days, ${today()}`, '',
    rs.length ? `Top 10 of ${sum.videos}: median ${sum.medianViews.toLocaleString('en-US')} views, ${sum.medianPerDay.toLocaleString('en-US')} views a day, median length ${clock(sum.medianLength) || 'unknown'} (under 5 min ${sum.under5min}, 5 to 20 min ${sum.between5and20}, over 20 min ${sum.over20min}).` : `No videos from the last ${days} days for this keyword. Try a broader keyword or --days 30.`, '',
    '| # | Title | Channel | Views | Uploaded | Length | Views a day |', '|---|---|---|---|---|---|---|',
    ...rs.map((r, i) => `| ${i + 1} | [${cell(r.title)}](${r.url}) | ${cell(r.channel)} | ${cell(r.viewsText)} | ${cell(r.ageText)} | ${r.lengthText || ''} | ${r.perDay.toLocaleString('en-US')} |`), '',
    '## Title patterns', '', ...pats.map((p) => `- ${p.pattern}: ${p.count}/${rs.length}`), '',
    'Numbers are what YouTube showed at search time (rounded, like "24K"). Thumbnail links are in the JSON.',
    'Next: ask your agent to read the top thumbnails and titles and pick the 3 patterns that win most often.'].join('\n');
}

export async function bench(h, cfg, {kw, days} = {}) {
  kw = kw || (cfg.bench?.keywords || []).find((k) => !unset(k));
  if (!kw) throw new Error('Need a keyword: --kw "<keyword>" (or bench.keywords in config.json)');
  days = +days || cfg.bench?.days || 14;
  const raw = await run(wrap(SEARCH, {kw, screens: cfg.bench?.screens || 4}, {role: id, plan: ['유튜브 검색: ' + kw, '검색 결과 읽기']}), {timeoutMs: 120000});
  const rs = rows(raw, {days});
  const pats = patterns(rs.map((r) => r.title));
  const sum = summary(rs);
  const slug = kw.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase() || 'keyword';
  const json = path.join(h, 'out', `bench-${slug}-${today()}.json`);
  writeJson(json, {kw, days, at: new Date().toISOString(), summary: sum, rows: rs, patterns: pats});
  const md = json.replace(/\.json$/, '.md');
  fs.writeFileSync(md, report(kw, days, rs, pats, sum));
  return {json, md, kept: rs.length, seen: raw.length, medianViews: sum.medianViews, medianLength: clock(sum.medianLength)};
}

export const ready = (cfg, a = {}) => !!(a.kw || (cfg.bench?.keywords || []).some((k) => !unset(k))) || 'needs --kw "<keyword>" or bench.keywords in config.json';
