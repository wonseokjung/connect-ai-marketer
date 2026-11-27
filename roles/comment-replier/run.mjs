// 댓글 담당. scan: read instagram.com/notifications, keep only "commented" items not in the log, read each comment on its permalink.
// send: open each permalink, press that commenter's Reply, check the box starts with @user, type, Post, confirm it appears.
import path from 'node:path';
import {wrap, run} from '../../lib/ego.mjs';
import * as log from '../../lib/log.mjs';
import {writeJson, today} from '../../lib/paths.mjs';

export const id = 'comment-replier';

const SCAN = `
await step('인스타 알림 읽기');
await page.goto('https://www.instagram.com/notifications/', {timeout: 40000}); await W(4000);
if (/\\/accounts\\/login/.test(await page.url())) throw new Error('Instagram is signed out in this browser. Sign in yourself in its window, then run scan again. Nothing was read.');
const rows = await page.evaluate(() => [...document.querySelectorAll('main a[href*="/c/"]')].map(a => {
  let r = a; for (let i = 0; i < 8 && r && !/commented|replied|liked your comment|mentioned/.test(r.innerText || ''); i++) r = r.parentElement;
  const t = (r && r.innerText || '').replace(/\\s+/g, ' ');
  return {url: a.href.split('?')[0], kind: /liked your comment/.test(t) ? 'like' : /commented/.test(t) ? 'comment' : /replied/.test(t) ? 'reply' : 'other', line: t.slice(0, 220)};
}));
const seen = new Set(); const fresh = [];
for (const r of rows) { const m = r.url.match(/\\/p\\/([^/]+)\\/c\\/(\\d+)/); if (!m || seen.has(m[2]) || P.done.includes(m[2])) continue; seen.add(m[2]); fresh.push({...r, post: m[1], commentId: m[2]}); }
await step('새 댓글 읽기');
for (const f of fresh.filter(x => x.kind === 'comment' || x.kind === 'reply')) {
  await page.goto(f.url, {timeout: 40000}); await W(3000);
  Object.assign(f, await page.evaluate((me) => {
    const main = document.querySelector('main'); if (!main) return {};
    const a = [...main.querySelectorAll('a[href^="/"]')].find(x => /^\\/[^/]+\\/$/.test(x.getAttribute('href')) && x.innerText.trim() && x.innerText.trim() !== me && x.closest('li, ul'));
    if (!a) return {};
    let el = a; for (let i = 0; i < 6 && el && !/Reply/.test(el.innerText); i++) el = el.parentElement;
    const lines = (el && el.innerText || '').split('\\n').map(s => s.trim()).filter(Boolean);
    const user = a.innerText.trim();
    const text = lines.filter(l => l !== user && !/^\\d+[smhdw]/.test(l) && !/^(Reply|See translation|View replies.*|Hide replies|\\d+ likes?)$/.test(l)).join(' ');
    const caption = (main.innerText.split('\\n').slice(0, 14).join(' ')).slice(0, 400);
    return {user, text, caption};
  }, P.me));
}
done(fresh);
`;

const SEND = `
const results = [];
for (const [i, j] of P.jobs.entries()) {
  await step('답글 ' + (i + 1) + ' 올리기: @' + j.user);
  await page.goto(j.url, {timeout: 40000}); await W(3500);
  const ok = await page.evaluate((user) => {
    const a = [...document.querySelectorAll('main a[href="/' + user + '/"]')].find(x => x.innerText.trim() === user);
    let el = a; for (let i = 0; i < 10 && el; i++) { el = el.parentElement; const b = [...(el ? el.querySelectorAll('span,div[role=button],button') : [])].find(x => x.textContent.trim() === 'Reply'); if (b) { b.click(); return true; } }
    return false;
  }, j.user);
  if (!ok) { results.push({...j, status: 'no-reply-button'}); continue; }
  await W(800);
  const pre = await page.evaluate(() => document.querySelector('main textarea') && document.querySelector('main textarea').value);
  if (!pre || !pre.includes('@' + j.user)) { results.push({...j, status: 'wrong-target'}); continue; }
  await page.focus('main textarea'); await page.keyboard.press('End'); await page.keyboard.insertText(j.reply); await W(500);
  await page.click("loc=role:button[name='Post']").catch(() => page.click('text="Post"'));
  await W(4000);
  const posted = await page.evaluate((r) => (document.querySelector('main') && document.querySelector('main').innerText || '').includes(r.slice(0, 20)), j.reply);
  results.push({...j, status: posted ? 'sent' : 'unsure'});
  await W(15000 + Math.floor(Math.random() * 15000));
}
done(results);
`;

export async function scan(h, cfg) {
  const done = Object.keys(log.read(h, id));
  const found = await run(wrap(SCAN, {done, me: cfg.instagram?.handle || ''}, {role: id, plan: ['인스타 알림 읽기', '새 댓글 읽기']}));
  for (const f of found.filter((x) => x.kind === 'like' || x.kind === 'other' || x.user === cfg.instagram?.handle)) log.mark(h, id, f.commentId, {skip: f.kind === 'like' ? 'like on our reply' : 'own or other'});
  const comments = found.filter((x) => (x.kind === 'comment' || x.kind === 'reply') && x.user !== cfg.instagram?.handle);
  const file = path.join(h, 'out', `comments-${today()}.json`);
  writeJson(file, comments);
  return {file, comments};
}

// jobs: [{commentId, url, user, reply}]
export async function send(h, cfg, jobs) {
  const sig = cfg.replies?.signature ? ' ' + cfg.replies.signature : '';
  const todo = jobs.filter((j) => !log.read(h, id)[j.commentId]).map((j) => ({...j, reply: j.reply.trim() + sig}));
  if (!todo.length) return [];
  const res = await run(wrap(SEND, {jobs: todo}, {role: id, plan: todo.map((j, i) => '답글 ' + (i + 1) + ' 올리기: @' + j.user)}), {timeoutMs: 60000 * (2 + todo.length)});
  for (const r of res) if (r.status === 'sent') log.mark(h, id, r.commentId, {user: r.user, url: r.url, reply: r.reply});
  return res;
}

// Replies go out on their own only when config.autoSend lists this role; otherwise each waits in the inbox.
import * as inbox from '../../lib/inbox.mjs';
export async function queueOrSend(h, cfg, jobs) {
  if ((cfg.autoSend || []).includes(id)) return send(h, cfg, jobs);
  return jobs.filter((j) => !log.read(h, id)[j.commentId]).map((j) => inbox.add(h, {role: id, channel: 'instagram', text: j.reply, job: j}));
}
export async function sendApproved(h, cfg, item) {
  inbox.setStatus(h, item.id, 'approved');
  const [r] = await send(h, cfg, [item.job]);
  inbox.setStatus(h, item.id, r?.status === 'sent' ? 'sent' : 'failed', {result: r?.status || 'already-replied'});
  return r || {status: 'already-replied'};
}

// the browser scripts, for tests on a local page
export const SCRIPTS = {SCAN, SEND};
