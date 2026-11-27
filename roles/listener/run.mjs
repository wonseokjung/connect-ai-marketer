// 리스닝 담당. Read only. X: search?f=top and f=live, scroll a few screens, read each article.
// Threads: search?q=, read each post block. Then keep posts whose text really contains the keyword.
import fs from 'node:fs';
import path from 'node:path';
import {wrap, run} from '../../lib/ego.mjs';
import {writeJson, today} from '../../lib/paths.mjs';

export const id = 'listener';

const SEARCH = `
const out = [];
async function scroll(n) { for (let i = 0; i < n; i++) { await page.mouse.wheel(0, 2200); await W(1500); } }
for (const q of P.queries) {
  for (const mode of ['top', 'live']) {
    await step((mode === 'top' ? 'X 인기 글 읽기: ' : 'X 최신 글 읽기: ') + q);
    await page.goto('https://x.com/search?q=' + encodeURIComponent(q) + '&src=typed_query&f=' + mode, {timeout: 40000}); await W(4000);
    for (let s = 0; s < P.screens; s++) {
      out.push(...await page.evaluate((q) => [...document.querySelectorAll('article[data-testid="tweet"]')].map(a => {
        const link = [...a.querySelectorAll('a[href*="/status/"]')].find(x => x.querySelector('time'));
        const g = a.querySelector('[role="group"]');
        return {site: 'x', q, url: link ? link.href.split('?')[0] : '', user: (a.querySelector('[data-testid="User-Name"]') || {}).innerText || '',
          text: (a.querySelector('[data-testid="tweetText"]') || {}).innerText || '', time: (a.querySelector('time') || {}).dateTime || '',
          stats: g ? g.getAttribute('aria-label') || '' : ''};
      }), q));
      await scroll(1);
    }
  }
  await step('스레드 검색 읽기: ' + q);
  await page.goto('https://www.threads.com/search?q=' + encodeURIComponent(q) + '&serp_type=default', {timeout: 40000}); await W(4000);
  for (let s = 0; s < P.screens; s++) {
    out.push(...await page.evaluate((q) => [...document.querySelectorAll('a[href*="/post/"]')].filter(a => a.querySelector('time')).map(a => {
      let b = a; for (let i = 0; i < 8 && b && (b.innerText || '').length < 80; i++) b = b.parentElement;
      return {site: 'threads', q, url: a.href.split('?')[0], user: (a.getAttribute('href').match(/@([^/]+)/) || [])[1] || '',
        text: (b && b.innerText || '').slice(0, 1200), time: (a.querySelector('time') || {}).dateTime || '', stats: ''};
    }), q));
    await scroll(1);
  }
}
done(out);
`;

const num = (s, k) => { const m = (s || '').match(new RegExp('([\\d,.]+)\\s*' + k)); return m ? +m[1].replace(/,/g, '') : 0; };

// the steps the plan panel shows in CONNECT AI Browser, in the order the search runs
export const plan = (keywords) => keywords.flatMap((q) => ['X 인기 글 읽기: ' + q, 'X 최신 글 읽기: ' + q, '스레드 검색 읽기: ' + q]);

export function rank(posts, keywords) {
  const seen = new Set();
  const flat = (t) => ' ' + (t || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim() + ' ';
  const kws = keywords.map((k) => flat(k));
  return posts
    .filter((p) => p.url && !seen.has(p.url) && seen.add(p.url))
    .filter((p) => kws.some((k) => flat(p.text).includes(k)))
    .map((p) => {
      const tail = p.site === 'threads' ? (p.text.match(/(\d[\d,.]*K?)\s*\n(\d[\d,.]*K?)\s*\n?(\d[\d,.]*K?)?\s*\n?(\d[\d,.]*K?)?\s*$/) || []) : [];
      const k = (v) => !v ? 0 : /K$/.test(v) ? parseFloat(v) * 1000 : +v.replace(/,/g, '');
      const likes = p.site === 'x' ? num(p.stats, 'like') : k(tail[1]);
      const views = p.site === 'x' ? num(p.stats, 'view') : 0;
      return {...p, likes, views, score: likes * 10 + views / 100};
    })
    .sort((a, b) => b.score - a.score);
}

export function report(rows, keywords) {
  const lines = [`# Listening report ${today()}`, '', `Keywords: ${keywords.join(', ')}. Posts kept: ${rows.length} (X ${rows.filter(r => r.site === 'x').length}, Threads ${rows.filter(r => r.site === 'threads').length}).`, '', '## Top posts', ''];
  for (const r of rows.slice(0, 20)) {
    const t = r.text.replace(/\s+/g, ' ').slice(0, 160);
    lines.push(`- **${r.site}** ${r.likes ? r.likes + ' likes ' : ''}${r.views ? r.views + ' views ' : ''}· ${t}`, `  ${r.url}`);
  }
  lines.push('', 'Numbers are what each site showed at collection time. Claims inside posts are the authors\' own.');
  return lines.join('\n');
}

export async function listen(h, cfg, {keywords, screens} = {}) {
  keywords = keywords || cfg.listen?.keywords || [];
  if (!keywords.length) throw new Error('No keywords. Add listen.keywords to config.json or pass --kw');
  const raw = await run(wrap(SEARCH, {queries: keywords, screens: screens || cfg.listen?.screens || 3}, {role: id, plan: plan(keywords)}), {timeoutMs: 120000 * keywords.length});
  const rows = rank(raw, keywords);
  const slug = keywords[0].replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase();
  const json = path.join(h, 'out', `listen-${slug}-${today()}.json`);
  const md = path.join(h, 'out', `listen-${today()}.md`);
  writeJson(json, rows);
  fs.writeFileSync(md, report(rows, keywords));
  return {json, md, kept: rows.length, raw: raw.length};
}
