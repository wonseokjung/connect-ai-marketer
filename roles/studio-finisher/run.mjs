// 업로드 마무리 담당 v0.1 = verify. "Changes saved" is not proof; a fresh load of the edit page is.
import path from 'node:path';
import {wrap, run} from '../../lib/ego.mjs';
import {writeJson, readJson, today} from '../../lib/paths.mjs';

export const id = 'studio-finisher';

const READ = `
await step('스튜디오 편집 화면 열기');
await page.goto('https://studio.youtube.com/video/' + P.videoId + '/edit', {timeout: 60000}); await W(6000);
const more = await page.$('ytcp-button#toggle-button'); if (more) { await more.click().catch(() => {}); await W(1200); }
await step('저장된 내용 읽기');
done(await page.evaluate(() => {
  const t = (sel) => { const e = document.querySelector(sel); return e ? e.innerText.trim() : null; };
  return {
    title: t('#title-textarea #textbox'),
    description: t('#description-textarea #textbox'),
    playlists: (t('ytcp-video-metadata-playlists ytcp-dropdown-trigger') || '').split(',').map(s => s.trim()).filter(s => s && s !== 'Select'),
    tags: [...document.querySelectorAll('ytcp-chip-bar ytcp-chip')].map(c => c.innerText.trim()).filter(Boolean),
    visibility: (t('ytcp-video-metadata-visibility') || '').split('\\n').filter(Boolean)[1] || t('ytcp-video-metadata-visibility'),
  };
}));
`;

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

export function compare(saved, sheet = {}) {
  const diffs = [];
  if (sheet.title && norm(saved.title) !== norm(sheet.title)) diffs.push({field: 'title', saved: saved.title, want: sheet.title});
  if (sheet.description && norm(saved.description) !== norm(sheet.description)) diffs.push({field: 'description', saved: (saved.description || '').slice(0, 120), want: sheet.description.slice(0, 120)});
  for (const p of sheet.playlists || []) if (!(saved.playlists || []).includes(p)) diffs.push({field: 'playlist', missing: p});
  const have = new Set((saved.tags || []).map((x) => x.toLowerCase()));
  for (const g of sheet.tags || []) if (!have.has(g.toLowerCase())) diffs.push({field: 'tag', missing: g});
  return diffs;
}

export async function check(h, cfg, {videoId, sheet}) {
  if (!videoId) throw new Error('Need --video <videoId>');
  const want = typeof sheet === 'string' ? readJson(sheet, {}) : sheet || {};
  const saved = await run(wrap(READ, {videoId}, {role: id, plan: ['스튜디오 편집 화면 열기', '저장된 내용 읽기']}), {timeoutMs: 120000});
  const diffs = compare(saved, want);
  const file = path.join(h, 'out', `studio-${videoId}-${today()}.json`);
  writeJson(file, {videoId, saved, diffs});
  return {file, saved, diffs};
}

// finish: fill what the sheet asks for (title, description, playlists, tags), press Save, then reload and check.
// Experimental in v0.1: Studio changes its page often. Run check afterwards; never trust "Changes saved".
const FILL = `
await step('스튜디오 편집 화면 열기');
await page.goto('https://studio.youtube.com/video/' + P.videoId + '/edit', {timeout: 60000}); await W(6000);
const did = [];
async function setBox(sel, text) {
  await page.click(sel); await W(300); await page.keyboard.press('ControlOrMeta+a'); await page.keyboard.insertText(text); await W(500);
}
await step('제목, 설명, 재생목록, 태그 채우기');
if (P.sheet.title) { await setBox('#title-textarea #textbox', P.sheet.title); did.push('title'); }
if (P.sheet.description) { await setBox('#description-textarea #textbox', P.sheet.description); did.push('description'); }
if ((P.sheet.playlists || []).length) {
  await page.click('ytcp-video-metadata-playlists ytcp-dropdown-trigger'); await W(1500);
  for (const name of P.sheet.playlists) {
    const ok = await page.evaluate((name) => { const c = [...document.querySelectorAll('ytcp-playlist-dialog ytcp-checkbox-lit')].find(x => (x.closest('li, #items > *') || x.parentElement).innerText.trim().startsWith(name)); if (!c) return 'missing'; if (c.getAttribute('aria-checked') === 'true' || c.hasAttribute('checked')) return 'already'; c.click(); return 'added'; }, name);
    did.push('playlist ' + name + ': ' + ok); await W(500);
  }
  await page.click('ytcp-playlist-dialog ytcp-button.done-button').catch(() => {}); await W(1000);
}
if ((P.sheet.tags || []).length) {
  const more = await page.$('ytcp-button#toggle-button'); if (more) { await more.click().catch(() => {}); await W(1500); }
  const have = await page.evaluate(() => [...document.querySelectorAll('ytcp-chip-bar ytcp-chip')].map(c => c.innerText.trim().toLowerCase()));
  const input = 'ytcp-form-input-container#tags-container input, ytcp-chip-bar input';
  for (const t of P.sheet.tags) {
    if (have.includes(t.toLowerCase())) continue;
    await page.click(input); await page.keyboard.insertText(t); await page.keyboard.press('Enter'); await W(300);
    did.push('tag ' + t);
  }
}
await step('저장');
await page.click('ytcp-button#save'); await W(4000);
done({did});
`;
export async function finish(h, cfg, {videoId, sheet}) {
  if (!videoId) throw new Error('Need --video <videoId>');
  const want = typeof sheet === 'string' ? readJson(sheet, {}) : sheet || {};
  if (!Object.keys(want).length) throw new Error('Need --sheet sheet.json with title, description, playlists or tags');
  const r = await run(wrap(FILL, {videoId, sheet: want}, {role: id, plan: ['스튜디오 편집 화면 열기', '제목, 설명, 재생목록, 태그 채우기', '저장']}), {timeoutMs: 180000});
  const after = await check(h, cfg, {videoId, sheet: want});
  return {did: r.did, diffs: after.diffs, file: after.file};
}

// the browser scripts, for tests on a local page
export const SCRIPTS = {READ, FILL};
