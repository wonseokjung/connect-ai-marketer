// The only bridge to the browser: we write a short ego-browser script and run `ego-browser nodejs` with it on stdin.
// Ego Lite does the clicking in its own Space; your tabs stay yours. Values go into the script as JSON (env vars do not reach it).
import {spawn, spawnSync} from 'node:child_process';

export const SPACE = 'connect-ai-marketer';
const MARK = '__CAM_RESULT__';

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
    const c = egoCommand();
    const p = spawn(c.file, ['nodejs'], {stdio: ['pipe', 'pipe', 'pipe'], shell: c.shell, windowsHide: true});
    let out = '', err = '';
    const stop = () => (c.shell && process.platform === 'win32' ? spawnSync('taskkill', ['/pid', String(p.pid), '/T', '/F'], {windowsHide: true}) : p.kill()); // a .cmd runs under cmd.exe: end the whole tree
    const t = setTimeout(() => { stop(); reject(new Error('ego-browser timed out')); }, timeoutMs);
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
