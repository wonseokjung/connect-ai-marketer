// The only bridge to the browser: we write a short script and run `cab nodejs` (ELDO, ours, first) or
// `ego-browser nodejs` (Ego Lite) with it on stdin. Which one: lib/browser.mjs (CONNECT_AI_BROWSER, config "browser").
// In ELDO the team works as the agent "marketer": every run gets a new space of its own with a clear name,
// the plan panel shows the run's steps while the window is on screen, and only our own tabs are closed at the end.
// In Ego Lite it works in its own Space, as before. Your tabs stay yours. Values go into the script as JSON (env vars do not reach it).
import fs from 'node:fs';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {KIT} from './paths.mjs';
import * as B from './browser.mjs';

export const SPACE = 'connect-ai-marketer';
export const AGENT = 'marketer';
const MARK = '__CAM_RESULT__';
const CAB_FIRST = '// connect-ai-marketer on ELDO';

// macOS: ego-browser is a plain command. Windows: find it with `where`; an .exe runs directly, a .cmd needs the shell
// (we only ever pass it fixed words like "nodejs"; scripts go in on stdin, so nothing user-made reaches the shell).
let found = null;
export function egoCommand(platform = process.platform, where = () => spawnSync('where', ['ego-browser'], {encoding: 'utf8', windowsHide: true}).stdout || '') {
  if (platform !== 'win32') return {file: 'ego-browser', shell: false};
  if (found) return found;
  const hits = where().split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const hit = hits.find((x) => /\.(exe|cmd|bat)$/i.test(x)); // first match in PATH order, like the shell would run
  if (hit && /\.exe$/i.test(hit)) return (found = {file: hit, shell: false});
  if (hit) return (found = {file: '"' + hit + '"', shell: true});
  return {file: 'ego-browser', shell: false}; // not found yet; do not remember, setup waits for the install
}
export function egoSync(args, opts = {}) {
  const c = egoCommand();
  return spawnSync(c.file, args, {encoding: 'utf8', windowsHide: true, shell: c.shell, ...opts});
}

export function egoInstalled() {
  const r = egoSync(['--version'], {timeout: 15000});
  return !r.error && r.status === 0;
}

// The browser for this run: set once from config.json by the CLI (useConfig), CONNECT_AI_BROWSER wins over it.
let CFG = {};
export const useConfig = (cfg = {}) => { CFG = cfg || {}; };
export const browser = (cfg = CFG) => B.choose({config: cfg, egoInstalled}).browser;

const role = (id) => { try { return JSON.parse(fs.readFileSync(path.join(KIT, 'roles', id, 'role.json'), 'utf8')); } catch { return null; } };
const stamp = () => new Date().toTimeString().slice(0, 5);

// body: JS that runs inside the browser's Node runtime. It gets `task`, `page`, `P` (params), `W(ms)`, `step(name)` and `done(value)`.
// opts.role names the role (its Korean name names the space), opts.plan lists the steps the body marks with step(name),
// opts.keep: true leaves the page open for you at the end (a typed post, a filled form). Ego Lite keeps its one Space as before.
// CONNECT_AI_BROWSER_SHOTS=<folder> keeps a picture of each run's last screen there (cab only).
export function wrap(body, params, {pageLabel = 'p1', role: id = null, plan = [], keep = false, browser: which = browser()} = {}) {
  if (which === 'cab') {
    const r = id ? role(id) : null;
    const name = `${r?.name?.ko || '마케팅팀'} ${stamp()}`;
    return `${CAB_FIRST}
const P = ${JSON.stringify({...params, __cab: {...B.cabStatus(), shot: B.shotFile(id || 'marketer')}})};
${B.CAB_SHIM}
let __out = null;
const done = (v) => { __out = v; };
const task = await newTaskSpace(${JSON.stringify(name)});
const page = __fit(task.page(${JSON.stringify(pageLabel)}));
const W = (ms) => page.waitForTimeout(ms);
const step = async (s) => { try { await task.step(s); } catch {} };
${plan.length ? `await task.plan(${JSON.stringify(plan)});` : ''}
try {
${body}
} finally {
  if (P.__cab.shot) try { await page.screenshot({path: P.__cab.shot}); console.log('[shot] ' + P.__cab.shot); } catch {}
  try { await task.done(); } catch {}
  try { await task.finish({keep: ${keep ? "['p1']" : '[]'}}); } catch {}
}
await __print(${JSON.stringify(MARK)} + JSON.stringify(__out));
`;
  }
  return `const P = ${JSON.stringify(params)};
const done = (v) => console.log(${JSON.stringify(MARK)} + JSON.stringify(v));
const step = async () => {};
const task = await taskSpace(${JSON.stringify(SPACE)});
let pages = await task.pages();
if (!pages.length) { const t = (await task.tabs())[0]; if (t) pages = [await task.adopt(t.page)]; }
const page = pages.find(p => p.label === ${JSON.stringify(pageLabel)}) || pages[0] || await task.newPage();
const W = (ms) => page.waitForTimeout(ms);
${body}
`;
}

export function run(script, {timeoutMs = 600000, browser: which = script.startsWith(CAB_FIRST) ? 'cab' : 'ego'} = {}) {
  return new Promise((resolve, reject) => {
    const c = B.command(which, {agent: AGENT, cabPath: CFG.cabPath, ego: egoCommand()});
    if (!c.file) return reject(new Error(c.missing));
    const p = spawn(c.file, c.args, {stdio: ['pipe', 'pipe', 'pipe'], shell: c.shell, windowsHide: true, env: c.env});
    let out = '', err = '';
    const stop = () => (c.shell && process.platform === 'win32' ? spawnSync('taskkill', ['/pid', String(p.pid), '/T', '/F'], {windowsHide: true}) : p.kill()); // a .cmd runs under cmd.exe: end the whole tree
    const t = setTimeout(() => { stop(); reject(new Error(`${c.label} timed out`)); }, timeoutMs);
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.stdin.on('error', () => {});
    p.on('error', () => { clearTimeout(t); reject(new Error(which === 'cab' ? `ELDO could not start (${c.file}). Install it once: ${B.INSTALL_CAB}` : 'ego-browser is not installed or not on PATH. Install Ego Lite first: https://lite.ego.app')); });
    p.on('close', (code) => {
      clearTimeout(t);
      const line = (out + '\n' + err).split('\n').reverse().map((l) => l.slice(Math.max(0, l.indexOf(MARK)))).find((l) => l.startsWith(MARK));
      if (line) return resolve(JSON.parse(line.slice(MARK.length)));
      const plain = which === 'cab' && B.cabError(err);
      reject(new Error(plain ? `ELDO: ${plain}` : `${which === 'cab' ? 'cab' : 'ego-browser'} exited ${code}: ${(err || out).split('\n').filter(l => !l.includes('[ego-browser:notice]')).slice(-6).join('\n')}`));
    });
    p.stdin.end(script);
  });
}
