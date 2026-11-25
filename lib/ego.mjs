// The only bridge to the browser: we write a short ego-browser script and run `ego-browser nodejs` with it on stdin.
// Ego Lite does the clicking in its own Space; your tabs stay yours. Values go into the script as JSON (env vars do not reach it).
import {spawn, spawnSync} from 'node:child_process';

export const SPACE = 'connect-ai-marketer';
const MARK = '__CAM_RESULT__';

export function getEgoBin() {
  if (process.platform !== 'win32') return 'ego-browser';
  for (const bin of ['ego-browser.cmd', 'ego-browser.exe', 'ego-browser']) {
    const r = spawnSync(bin, ['--version'], {encoding: 'utf8'});
    if (!r.error) return bin;
  }
  return 'ego-browser.cmd';
}

export function egoInstalled() {
  const bin = getEgoBin();
  const r = spawnSync(bin, ['--version'], {encoding: 'utf8'});
  return !r.error;
}

// body: JS that runs inside ego-browser's Node runtime. It gets `task`, `page`, `P` (params) and `done(value)`.
export function wrap(body, params, {pageLabel = 'p1'} = {}) {
  return `const P = ${JSON.stringify(params)};
const done = (v) => console.log(${JSON.stringify(MARK)} + JSON.stringify(v));
const task = await taskSpace(${JSON.stringify(SPACE)});
let pages = await task.pages();
if (!pages.length) { const t = (await task.tabs())[0]; if (t) pages = [await task.adopt(t.page)]; }
const page = pages.find(p => p.label === ${JSON.stringify(pageLabel)}) || pages[0] || await task.newPage();
const W = (ms) => page.waitForTimeout(ms);
${body}
`;
}

export function run(script, {timeoutMs = 600000} = {}) {
  return new Promise((resolve, reject) => {
    const bin = getEgoBin();
    const p = spawn(bin, ['nodejs'], {stdio: ['pipe', 'pipe', 'pipe']});
    let out = '', err = '';
    const t = setTimeout(() => { p.kill(); reject(new Error('ego-browser timed out')); }, timeoutMs);
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('error', (e) => { clearTimeout(t); reject(new Error('ego-browser is not installed or not on PATH. Install Ego Lite first: https://lite.ego.app')); });
    p.on('close', (code) => {
      clearTimeout(t);
      const line = (out + '\n' + err).split('\n').reverse().map((l) => l.slice(Math.max(0, l.indexOf(MARK)))).find((l) => l.startsWith(MARK));
      if (line) return resolve(JSON.parse(line.slice(MARK.length)));
      reject(new Error(`ego-browser exited ${code}: ${(err || out).split('\n').filter(l => !l.includes('[ego-browser:notice]')).slice(-6).join('\n')}`));
    });
    p.stdin.end(script);
  });
}
