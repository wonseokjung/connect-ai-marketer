// doctor: checks the things that stopped real beginners, and says the exact fix in English and Korean.
// Every probe is passed in, so tests can play a Windows PC without Node 18, Ego Lite, or any agent.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {egoSync} from './ego.mjs';
import {KIT, NAME, RUN, readJson} from './paths.mjs';
import {agentTable} from './install.mjs';
import {ROLES, plan} from './team.mjs';
import * as inbox from './inbox.mjs';
import {unset} from './num.mjs';

const MARKER = '.connect-ai-marketer.json';
const exists = (p) => { try { fs.statSync(p); return true; } catch { return false; } };

// ---- real probes (replaced in tests). Read only: a version, the list of task spaces, the PowerShell policy. ----
const text = (r) => ((r.stdout || '') + (r.stderr || '')).trim();
export const realProbe = {
  egoVersion: () => { const r = egoSync(['--version'], {timeout: 15000}); return !r.error && r.status === 0 ? text(r).split('\n')[0] : ''; },
  egoAlive: () => {
    const r = egoSync(['nodejs'], {timeout: 30000, input: 'const s = await listTaskSpaces();\nconsole.log("CAM_EGO_OK " + s.length);\n'});
    const o = text(r);
    return o.includes('CAM_EGO_OK') ? '' : (o.split('\n').filter((l) => l.trim() && !l.includes('[ego-browser:notice]')).slice(-2).join(' ') || r.error?.code || 'no answer');
  },
  psPolicy: () => { const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', 'Get-ExecutionPolicy'], {encoding: 'utf8', timeout: 15000, windowsHide: true}); return !r.error && r.status === 0 ? text(r) : ''; },
};

// Where Ego Lite puts ego-browser when onboarding finishes (on PATH only in terminals opened afterwards).
export function egoCandidates({home = os.homedir(), platform = process.platform, env = process.env} = {}) {
  const local = path.join(home, '.local', 'bin');
  if (platform === 'win32') {
    const la = env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
    return [path.join(local, 'ego-browser.exe'), path.join(local, 'ego-browser.cmd'), path.join(la, 'Programs', 'ego lite', 'ego-browser.exe'), path.join(la, 'ego lite', 'ego-browser.exe')];
  }
  return [path.join(local, 'ego-browser')];
}

const T = (en, ko) => ({en, ko});

export function checks({h, home = os.homedir(), env = process.env, platform = process.platform, node = process.versions.node, probe = realProbe} = {}) {
  const out = [];
  const add = (status, label, detail, fix) => out.push({status, label, detail, fix});
  const win = platform === 'win32';
  const newTerm = win ? T('Close this PowerShell window and open a new one', 'PowerShell 창을 닫고 새로 여세요') : T('Close this terminal and open a new one', '터미널을 닫고 새로 여세요');

  // 1. Node.js
  const major = +String(node).split('.')[0];
  if (major >= 18) add('ok', 'Node.js', 'v' + node);
  else add('fail', 'Node.js', 'v' + node + ' (needs 18 or newer)', T(
    `Install the LTS from https://nodejs.org, then ${newTerm.en.toLowerCase()} and check: node -v`,
    `https://nodejs.org 에서 LTS를 설치하고, ${newTerm.ko}. 그다음 node -v 가 v18 이상인지 확인하세요.`));

  // 2. Windows: PowerShell may block npx.ps1
  if (win) {
    const pol = probe.psPolicy();
    if (/^(Restricted|AllSigned|Undefined)$/i.test(pol)) add('warn', 'PowerShell scripts', 'execution policy ' + pol + ' (npx may be blocked)', T(
      `Run npx.cmd instead of npx (for example: npx.cmd github:wonseokjung/${NAME} doctor), or use Command Prompt (cmd). To allow scripts for your user only: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned. On a company PC this may be locked; ask your IT team.`,
      `npx 대신 npx.cmd 로 실행하세요(예: npx.cmd github:wonseokjung/${NAME} doctor). 명령 프롬프트(cmd)에서 해도 됩니다. 내 계정에서만 스크립트를 허용하려면: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned. 회사 PC는 잠겨 있을 수 있으니 IT 담당자에게 문의하세요.`));
    else if (pol) add('ok', 'PowerShell scripts', pol);
    else add('note', 'PowerShell scripts', 'could not read the execution policy', T(
      'If PowerShell says running scripts is disabled, use npx.cmd instead of npx, or Command Prompt (cmd).',
      'PowerShell 이 스크립트 실행을 막으면 npx 대신 npx.cmd 를 쓰거나 명령 프롬프트(cmd)에서 실행하세요.'));
  }

  // 3. Ego Lite
  const ver = probe.egoVersion();
  if (ver) {
    add('ok', 'Ego Lite (ego-browser)', ver);
    const dead = probe.egoAlive();
    if (!dead) add('ok', 'Ego Lite running', 'answers');
    else add('fail', 'Ego Lite running', dead.slice(0, 160), T(
      'Open the Ego Lite app and leave it open (finish its first-run steps if it asks). Then run doctor again.',
      '에고라이트 앱을 열어 둔 채로 두세요(첫 안내가 나오면 끝까지 마치세요). 그다음 doctor 를 다시 실행하세요.'));
  } else {
    const there = egoCandidates({home, platform, env}).find(exists);
    if (there) add('fail', 'Ego Lite (ego-browser)', 'installed at ' + there + ', but this terminal does not see it yet', T(
      `${newTerm.en} (it reads the new PATH only when it starts). Then run doctor again.${win ? '' : ' Or, for this window only: export PATH="$HOME/.local/bin:$PATH"'}`,
      `${newTerm.ko}. 새 창이어야 바뀐 PATH를 읽습니다. 그다음 doctor 를 다시 실행하세요.${win ? '' : ' 이 창에서만 바로 쓰려면: export PATH="$HOME/.local/bin:$PATH"'}`));
    else add('fail', 'Ego Lite (ego-browser)', 'not found', T(
      `Install Ego Lite from https://lite.ego.app, open it and finish its first-run steps (that step adds the ego-browser command). ${win ? 'If Windows SmartScreen stops the installer: More info > Run anyway. ' : 'If macOS will not open it: System Settings > Privacy & Security > Open Anyway. '}Then ${newTerm.en.toLowerCase()} and run doctor again.`,
      `https://lite.ego.app 에서 에고라이트를 받아 열고 첫 안내를 끝까지 마치세요(이때 ego-browser 명령이 생깁니다). ${win ? '윈도우 PC 보호 창이 뜨면: 추가 정보 > 실행. ' : '맥에서 열리지 않으면: 시스템 설정 > 개인정보 보호 및 보안 > 그래도 열기. '}그다음 ${newTerm.ko}. 그리고 doctor 를 다시 실행하세요.`));
  }

  // 4. the skill, per agent found on this computer
  const ver0 = readJson(path.join(KIT, 'package.json'), {}).version;
  const table = agentTable({home, env}).filter((a) => a.key !== 'gemini');
  const found = table.filter((a) => a.detect.some(exists));
  if (!found.length) add('warn', 'Agent skill', 'no Claude Code, Codex or Antigravity found on this computer', T(
    `Install one vibe-coding tool (Claude Code, ChatGPT Codex or Antigravity), open it once, then run: ${RUN} skill`,
    `바이브코딩 도구 하나(Claude Code, ChatGPT Codex, Antigravity)를 설치해 한 번 열고, 다음을 실행하세요: ${RUN} skill`));
  for (const a of found) {
    const dest = path.join(a.skills, NAME);
    const mark = readJson(path.join(dest, MARKER));
    if (!exists(path.join(dest, 'SKILL.md'))) add('fail', 'Skill for ' + a.label, 'not installed (' + dest + ')', T(
      `Run: ${RUN} skill --agent ${a.key}. Then restart ${a.label} so it sees the new skill.`,
      `다음을 실행하세요: ${RUN} skill --agent ${a.key}. 그다음 ${a.label}을(를) 다시 시작해야 새 스킬이 보입니다.`));
    else if (mark && mark.version !== ver0) add('warn', 'Skill for ' + a.label, `version ${mark.version}, kit is ${ver0}`, T(
      `Update it: ${RUN} skill --agent ${a.key}`, `업데이트하세요: ${RUN} skill --agent ${a.key}`));
    else add('ok', 'Skill for ' + a.label, dest);
  }

  // 5. config + team plan (only after setup made the work folder)
  const c = h ? readJson(path.join(h, 'config.json')) : null;
  if (!c) add('fail', 'Config', 'no config.json yet' + (h ? ' in ' + h : ''), T(`Run: ${RUN} setup`, `다음을 실행하세요: ${RUN} setup`));
  else {
    const todo = [['instagram.handle', c.instagram?.handle], ['x.handle', c.x?.handle], ['youtube.handle', c.youtube?.handle], ['listen.keywords', (c.listen?.keywords || []).find((k) => !unset(k))]].filter(([, v]) => unset(v)).map(([k]) => k);
    if (todo.length) add('warn', 'Config', 'still example values: ' + todo.join(', '), T(
      `Open ${path.join(h, 'config.json')} and put in your own handles and keywords (roles without them are skipped).`,
      `${path.join(h, 'config.json')} 을 열어 내 아이디와 키워드를 넣으세요(비어 있는 역할은 건너뜁니다).`));
    else add('ok', 'Config', path.join(h, 'config.json'));
    const p = plan(h);
    const bad = Object.entries(p.events).flatMap(([ev, steps]) => steps.filter((s) => !ROLES[s.role]?.actions[s.action]).map((s) => `${ev}: ${s.role} ${s.action}`));
    if (bad.length) add('fail', 'Team plan', 'unknown steps: ' + bad.join('; '), T(
      `Fix or remove those steps in ${path.join(h, 'team.json')} (roles: ${Object.keys(ROLES).join(', ')}).`,
      `${path.join(h, 'team.json')} 에서 그 단계를 고치거나 지우세요.`));
    else add('ok', 'Team plan', Object.keys(p.events).join(', '));
    const w = inbox.list(h).filter((x) => x.status === 'waiting').length;
    if (w) add('note', 'Approvals', `${w} waiting`, T(`See them: ${RUN} inbox`, `확인: ${RUN} inbox`));
  }
  return out;
}

export function render(list, {color = (s) => s} = {}) {
  const tag = {ok: 'ok  ', warn: 'warn', fail: 'FIX ', note: 'note'};
  const lines = ['', `  ${NAME} doctor`, ''];
  for (const c of list) {
    lines.push(`  ${color(tag[c.status], c.status)}  ${c.label}: ${c.detail}`);
    if (c.fix) lines.push(`        EN  ${c.fix.en}`, `        KO  ${c.fix.ko}`);
  }
  const fail = list.filter((c) => c.status === 'fail').length, warn = list.filter((c) => c.status === 'warn').length;
  lines.push('');
  if (!fail && !warn) lines.push('  All good. Your team can go on duty.', '  모두 통과. 팀이 근무를 시작할 수 있습니다.');
  else lines.push(`  ${fail} to fix, ${warn} to look at. Fix from the top, then run doctor again.`, `  고칠 것 ${fail}개, 볼 것 ${warn}개. 위에서부터 고치고 doctor 를 다시 실행하세요.`,
    '  Stuck? Paste these lines into your vibe-coding tool and ask it to fix them.', '  막히면 이 내용을 바이브코딩 도구에 붙여 넣고 고쳐 달라고 하세요.');
  return lines.join('\n');
}
