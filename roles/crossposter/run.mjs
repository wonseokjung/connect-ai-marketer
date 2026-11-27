// 게시 담당. Words come from you or your agent (post.json). This role checks, queues, and types.
import * as inbox from '../../lib/inbox.mjs';
import {xLength, X_LIMIT} from '../../lib/xcount.mjs';
import {wrap, run} from '../../lib/ego.mjs';

export const id = 'crossposter';

const COMPOSE = {
  x: 'https://x.com/compose/post',
  threads: 'https://www.threads.com/',
  linkedin: 'https://www.linkedin.com/feed/?shareActive=true',
};

export function draft(h, cfg, post) {
  const made = [];
  for (const [ch, text] of Object.entries(post.channels || {})) {
    if (!COMPOSE[ch]) throw new Error('Unknown channel ' + ch + ' (x, threads, linkedin)');
    const body = text.includes(post.url || '\u0000') || !post.url ? text : text + '\n' + post.url;
    const check = ch === 'x' ? {xLength: xLength(body), limit: X_LIMIT, fits: xLength(body) <= X_LIMIT} : {};
    if (ch === 'x' && !check.fits) throw new Error(`X post is ${check.xLength}/${X_LIMIT} weighted characters. Shorten it first.`);
    const auto = (cfg.autoSend || []).includes(id);
    made.push(inbox.add(h, {role: id, channel: ch, text: body, check, status: auto ? 'approved' : 'waiting'}));
  }
  return made;
}

const TYPE = `
await step('작성 창 열기');
await page.goto(P.url, {timeout: 40000}); await W(4500);
if (P.channel === 'threads') { await page.click('text="What\\'s new?"').catch(() => {}); await W(1500); }
if (P.channel === 'linkedin') { await W(1500); }
const box = await page.$('[data-testid="tweetTextarea_0"], div[contenteditable="true"][role="textbox"], div[contenteditable="true"]');
if (!box) { done({status: 'no-composer'}); } else {
  await step('글 입력');
  await box.click(); await W(400); await page.keyboard.insertText(P.text); await W(1200);
  const typed = await page.evaluate(() => (document.activeElement && document.activeElement.innerText) || '');
  if (!typed.includes(P.text.slice(0, 15))) { done({status: 'typing-failed'}); }
  else if (!P.finalClick) { await step('게시 버튼 앞에서 멈춤'); done({status: 'typed-waiting-for-you'}); }
  else {
    const btn = await page.$('[data-testid="tweetButton"], div[role="dialog"] div[role="button"]:has-text("Post"), button:has-text("Post")');
    if (!btn) done({status: 'no-post-button'}); else { await step('게시'); await btn.click(); await W(4000); done({status: 'posted'}); }
  }
}
`;

export async function send(h, cfg, approvalId) {
  const item = inbox.list(h).find((x) => x.id === approvalId);
  if (!item) throw new Error('No approval ' + approvalId);
  if (item.role !== id) throw new Error(approvalId + ' belongs to ' + item.role);
  if (!['approved', 'waiting'].includes(item.status)) throw new Error(approvalId + ' is ' + item.status);
  inbox.setStatus(h, approvalId, 'approved');
  const finalClick = !!cfg.crossposter?.finalClick;
  const r = await run(wrap(TYPE, {url: COMPOSE[item.channel], channel: item.channel, text: item.text, finalClick}, {role: id, plan: ['작성 창 열기', '글 입력', finalClick ? '게시' : '게시 버튼 앞에서 멈춤'], keep: !finalClick}), {timeoutMs: 120000});
  inbox.setStatus(h, approvalId, r.status === 'posted' ? 'sent' : r.status === 'typed-waiting-for-you' ? 'typed' : 'failed', {result: r.status});
  return r;
}

// the browser script, for tests on a local page
export const SCRIPTS = {TYPE};
