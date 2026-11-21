// 책상. One page with what the team did today: waiting approvals, replies sent, reports, studio checks.
import fs from 'node:fs';
import path from 'node:path';
import {readJson, today, RUN} from './paths.mjs';
import * as inbox from './inbox.mjs';
import {parseCsv, latest, csvFile} from '../roles/analyst/run.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

const fmt = (v) => (v === '' || v == null ? '' : Number(v).toLocaleString('en-US'));
const delta = (v) => (v == null ? '' : ` <span class="m">(${v >= 0 ? '+' : ''}${Number(v).toLocaleString('en-US')})</span>`);
export function numLine(r) {
  const who = r.site === 'youtube' ? 'subscribers' : 'followers';
  return `${fmt(r.followers)} ${who}${delta(r.change?.followers)} · ${fmt(r.views)} views on ${fmt(r.posts_read)} recent ${r.site === 'youtube' ? 'videos' : 'posts'}${delta(r.change?.views)}${r.since ? ` <span class="m">since ${esc(r.since)}</span>` : ''}`;
}

export function desk(h) {
  const d = today();
  const out = path.join(h, 'out');
  const files = fs.readdirSync(out).filter((f) => f.includes(d));
  const waiting = inbox.list(h).filter((x) => ['waiting', 'typed'].includes(x.status));
  const replies = Object.values(readJson(path.join(h, 'logs', 'comment-replier.json'), {})).filter((x) => x.at && x.at.startsWith(d) && x.reply);
  const listen = files.filter((f) => f.startsWith('listen-') && f.endsWith('.json')).flatMap((f) => readJson(path.join(out, f), []).slice(0, 8));
  const studio = files.filter((f) => f.startsWith('studio-')).map((f) => readJson(path.join(out, f)));
  const nums = fs.existsSync(csvFile(h)) ? latest(parseCsv(fs.readFileSync(csvFile(h), 'utf8'))) : [];
  const benches = files.filter((f) => f.startsWith('bench-') && f.endsWith('.json')).map((f) => readJson(path.join(out, f))).filter(Boolean);
  const card = (t, body) => `<section><h2>${t}</h2>${body}</section>`;
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Marketing desk ${d}</title>
<style>:root{--bg:#0b0a08;--fg:#ece6da;--mute:#9b917f;--gold:#d6892a;--line:#2a251d}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 -apple-system,Inter,sans-serif;padding:32px max(16px,5vw)}
h1{font-weight:300;letter-spacing:.02em;margin:0 0 4px}h1 b{color:var(--gold);font-weight:500}.sub{color:var(--mute);margin-bottom:28px}
section{border-top:1px solid var(--line);padding:18px 0}h2{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);font-weight:600;margin:0 0 10px}
.row{display:flex;gap:12px;padding:6px 0;border-bottom:1px solid var(--line)}.row code{color:var(--gold)}.m{color:var(--mute)}a{color:var(--fg)}</style>
<h1>Marketing desk <b>${d}</b></h1><div class="sub">connect-ai-marketer · ${waiting.length} waiting for you · ${replies.length} replies sent today</div>
${card('Waiting for your approval', waiting.map((x) => `<div class="row"><code>${x.id}</code><span class="m">${esc(x.role)} · ${esc(x.channel)}</span><span>${esc(x.text).slice(0, 220)}</span></div>`).join('') || '<div class="m">Nothing waiting.</div>')}
${card('Replies sent today', replies.map((x) => `<div class="row"><span class="m">@${esc(x.user)}</span><span>${esc(x.reply)}</span></div>`).join('') || '<div class="m">None yet.</div>')}
${card('Upload checks', studio.map((s) => `<div class="row"><code>${esc(s.videoId)}</code><span>${s.diffs.length ? esc(s.diffs.map((x) => x.field + (x.missing ? ' ' + x.missing : '')).join(', ')) : 'matches the sheet'}</span></div>`).join('') || '<div class="m">No checks today.</div>')}
${card('Your numbers', nums.map((r) => `<div class="row"><code>${esc(r.site)}</code><span class="m">${esc(r.handle)} · ${esc(r.date)}</span><span>${numLine(r)}</span></div>`).join('') || '<div class="m">No numbers yet. Set x.handle or youtube.handle, then run analyst read.</div>')}
${card('Benchmark before upload', benches.map((b) => `<div class="row"><code>${esc(b.kw)}</code><span class="m">${b.rows.length} videos, last ${b.days} days</span><span>${b.rows.slice(0, 3).map((r) => `<a href="${esc(r.url)}">${esc(r.title).slice(0, 70)}</a> <span class="m">${esc(r.viewsText)} · ${esc(r.lengthText)}</span>`).join('<br>')}</span></div>`).join('') || '<div class="m">No benchmark today.</div>')}
${card('What people are saying', listen.map((p) => `<div class="row"><span class="m">${esc(p.site)}${p.likes ? ' · ' + p.likes + ' likes' : ''}</span><span><a href="${esc(p.url)}">${esc(p.text.replace(/\s+/g, ' ').slice(0, 180))}</a></span></div>`).join('') || '<div class="m">No listening report today.</div>')}
<p class="m">Approve with <code>${RUN} approve &lt;id&gt;</code>.</p>`;
  const file = path.join(out, `desk-${d}.html`);
  fs.writeFileSync(file, html);
  return file;
}
