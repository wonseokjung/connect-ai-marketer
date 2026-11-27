// 잘 된 글 뜯어보기. Read only: text, numbers, and frames at 0, 1, 2, 3, 5, 8 s of the first video on the page.
import fs from 'node:fs';
import path from 'node:path';
import {wrap, run} from '../../lib/ego.mjs';
import {writeJson, today} from '../../lib/paths.mjs';

export const id = 'breakdown';
const GRAB = `
await step('글 열기');
await page.goto(P.url, {timeout: 45000}); await W(5000);
const info = await page.evaluate(() => {
  const art = document.querySelector('article') || document.querySelector('main') || document.body;
  const g = document.querySelector('[role="group"]');
  return {title: document.title, text: (art.innerText || '').slice(0, 3000), stats: g ? g.getAttribute('aria-label') || '' : '', hasVideo: !!document.querySelector('video')};
});
const frames = [];
await step(info.hasVideo ? '첫 장면 저장' : '화면 저장');
if (info.hasVideo) {
  await page.evaluate(() => { const v = document.querySelector('video'); v.muted = true; v.pause(); });
  for (const t of P.times) {
    await page.evaluate((t) => new Promise(r => { const v = document.querySelector('video'); v.addEventListener('seeked', () => r(), {once: true}); v.currentTime = t; setTimeout(r, 2500); }), t);
    await W(400);
    const box = await page.evaluate(() => { const r = document.querySelector('video').getBoundingClientRect(); return {x: r.x, y: r.y, width: r.width, height: r.height}; });
    const f = P.dir + '/frame_' + String(t).padStart(2, '0') + 's.png';
    try { await page.screenshot({path: f, clip: box}); frames.push(f); } catch (e) { try { await page.screenshot({path: f}); frames.push(f); } catch {} }
  }
} else { const f = P.dir + '/page.png'; try { await page.screenshot({path: f}); frames.push(f); } catch {} }
done({...info, frames});
`;
export async function grab(h, cfg, {url} = {}) {
  if (!url) throw new Error('Need --url <post or video link>');
  const base = path.join(h, 'out', `breakdown-${today()}`);
  let n = 1; while (fs.existsSync(`${base}-${n}`)) n++;
  const dir = `${base}-${n}`; fs.mkdirSync(dir, {recursive: true});
  const r = await run(wrap(GRAB, {url, dir, times: [0, 1, 2, 3, 5, 8]}, {role: id, plan: ['글 열기', '첫 장면 저장']}), {timeoutMs: 120000});
  writeJson(path.join(dir, 'post.json'), {url, ...r});
  fs.writeFileSync(path.join(dir, 'ask-your-agent.md'), `Look at post.json and the frames in this folder (${r.frames.length}).\nWrite down: what happens in the first 3 seconds, how it is structured, the words on screen, and what it asks the viewer to do.\nThen suggest how to use the same structure for my topic: <your topic>.\n`);
  return {dir, frames: r.frames.length, video: r.hasVideo};
}
