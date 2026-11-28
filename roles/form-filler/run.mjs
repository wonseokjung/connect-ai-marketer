// 신청서 담당. read: list the form's questions. fill: type answers by label, stop before Submit, screenshot.
import path from 'node:path';
import fs from 'node:fs';
import {wrap, run, browser} from '../../lib/ego.mjs';
import {writeJson, readJson, today} from '../../lib/paths.mjs';

export const id = 'form-filler';
const NEVER = /password|비밀번호|card|카드|bank|계좌|routing|ssn|주민|passport|여권|cvc|cvv|otp|인증 ?번호/i;
const QUESTIONS = `
await step('신청서 열기');
await page.goto(P.url, {timeout: 45000}); await W(4500);
await step('질문 읽기');
done(await page.evaluate(() => {
  const out = []; let i = 0;
  for (const el of document.querySelectorAll('input, textarea, select, [role="textbox"], [role="radiogroup"], [role="listbox"]')) {
    if (el.type === 'hidden' || el.type === 'submit' || el.type === 'button' || el.offsetParent === null) continue;
    let label = (el.labels && el.labels[0] && el.labels[0].innerText) || el.getAttribute('aria-label') || el.placeholder || '';
    if (!label) { let p = el; for (let k = 0; k < 6 && p && !label; k++) { p = p.parentElement; const h = p && p.querySelector('[role="heading"], label, legend'); if (h) label = h.innerText; } }
    el.setAttribute('data-cam-field', String(i));
    out.push({field: i++, label: (label || '').trim().slice(0, 200), type: el.type || el.getAttribute('role') || el.tagName.toLowerCase(), required: !!el.required || el.getAttribute('aria-required') === 'true'});
  }
  return out;
}));
`;
const FILL = `
await step('신청서 열기');
await page.goto(P.url, {timeout: 45000}); await W(4500);
const qs = await page.evaluate(() => { let i = 0; const out = []; for (const el of document.querySelectorAll('input, textarea, select, [role="textbox"]')) { if (el.type === 'hidden' || el.type === 'submit' || el.type === 'button' || el.offsetParent === null) continue; el.setAttribute('data-cam-field', String(i)); let label = (el.labels && el.labels[0] && el.labels[0].innerText) || el.getAttribute('aria-label') || el.placeholder || ''; if (!label) { let p = el; for (let k = 0; k < 6 && p && !label; k++) { p = p.parentElement; const h = p && p.querySelector('[role="heading"], label, legend'); if (h) label = h.innerText; } } out.push({field: i++, label: label.trim(), tag: el.tagName.toLowerCase(), type: el.type || ''}); } return out; });
const filled = [], skipped = [];
await step('답 채우기');
for (const [q, a] of Object.entries(P.answers)) {
  const hit = qs.find(x => x.label && x.label.toLowerCase().includes(q.toLowerCase()));
  if (!hit) { skipped.push(q); continue; }
  const sel = '[data-cam-field="' + hit.field + '"]';
  try { if (hit.tag === 'select') await page.selectOption(sel, {label: String(a)}); else await page.fill(sel, String(a)); filled.push(q); } catch (e) { skipped.push(q); }
}
await W(800);
await step('제출 앞에서 멈추고 화면 찍기');
try { await page.screenshot({path: P.shot, fullPage: true}); } catch (e) { try { await page.screenshot({path: P.shot}); } catch {} }
done({filled, skipped, stoppedBeforeSubmit: true});
`;
export async function questions(h, cfg, {url} = {}) {
  if (!url) throw new Error('Need --url <form link>');
  const qs = await run(wrap(QUESTIONS, {url}, {role: id, plan: ['신청서 열기', '질문 읽기']}), {timeoutMs: 90000});
  const file = path.join(h, 'out', `form-questions-${today()}.json`);
  writeJson(file, {url, questions: qs, profile: cfg.profile || {}});
  return {file, questions: qs.length};
}
export async function fill(h, cfg, {url, file} = {}) {
  if (!url || !file) throw new Error('Need --url <form link> --file answers.json');
  const answers = {...(cfg.profile || {}), ...readJson(file, {})};
  for (const k of Object.keys(answers)) if (NEVER.test(k)) { delete answers[k]; }
  let n = 1; while (fs.existsSync(path.join(h, 'out', `form-${today()}-${n}.png`))) n++;
  const shot = path.join(h, 'out', `form-${today()}-${n}.png`);
  const r = await run(wrap(FILL, {url, answers, shot}, {role: id, plan: ['신청서 열기', '답 채우기', '제출 앞에서 멈추고 화면 찍기'], keep: true}), {timeoutMs: 120000});
  writeJson(shot.replace(/\.png$/, '.json'), {url, ...r});
  return {...r, screenshot: shot, next: browser(cfg) === 'cab' ? 'The form stays open for you in ELDO. Check it and press Submit yourself.' : 'Check the form in Ego Lite and press Submit yourself.'};
}

// the browser scripts, for tests on a local page
export const SCRIPTS = {QUESTIONS, FILL};
