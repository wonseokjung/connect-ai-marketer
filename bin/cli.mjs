#!/usr/bin/env node
// connect-ai-marketer: a marketing team of AI employees on Ego Lite. One role = one job; the team lead runs them in order.
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {KIT, NAME, home, config, readJson, writeJson} from '../lib/paths.mjs';
import {egoInstalled} from '../lib/ego.mjs';
import {xLength, X_LIMIT} from '../lib/xcount.mjs';
import * as inbox from '../lib/inbox.mjs';
import {ROLES, roleInfo, runEvent, plan} from '../lib/team.mjs';
import {desk} from '../lib/desk.mjs';
import {installSkill, removeSkill} from '../lib/install.mjs';
import {watch, once} from '../lib/watch.mjs';
import {banner, gold, dimmed, tint} from '../lib/banner.mjs';

const argv = process.argv.slice(2);
const VALUED = ['home', 'agent', 'dir', 'video', 'sheet', 'post', 'file', 'kw', 'id', 'every', 'url', 'handle'];
const opt = (n, d = null) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const flag = (n) => argv.includes('--' + n);
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && VALUED.includes(argv[i - 1].slice(2))));
const cmd = pos[0] || 'help';
const log = (...a) => console.log(...a);
const args = Object.fromEntries(VALUED.map((k) => [k, opt(k)]).filter(([, v]) => v));
const H = () => home(opt('home'));
const RUN = 'npx github:wonseokjung/connect-ai-marketer'; // becomes `npx connect-ai-marketer` once it is on npm

export function openFile(f) {
  if (process.platform === 'darwin') {
    spawn('open', [f], {detached: true, stdio: 'ignore'}).unref();
  } else if (process.platform === 'win32') {
    const escaped = f.replace(/"/g, '""');
    spawn('cmd.exe', ['/c', `start "" "${escaped}"`], {windowsVerbatimArguments: true, detached: true, stdio: 'ignore'}).unref();
  } else {
    spawn('xdg-open', [f], {detached: true, stdio: 'ignore'}).unref();
  }
}

const HELP = `${NAME}: the marketing team of your unmanned AI company, on duty 24/7 in Ego Lite.

  setup                      make your work folder + config, install the skill for your agents
  doctor                     check Ego Lite, config, and the team plan
  roles                      list the AI teammates and what each one does
  team <event>               run an event from team.json (new-video, daily)
                             new-video takes --video <id> --sheet <sheet.json> --post <post.json>
  run <role> <action>        run one role, e.g. run listener listen --kw "ego lite"
                             run comment-replier scan | send --file replies.json
                             run studio-finisher finish|check --video <id> --sheet sheet.json
                             run crossposter draft --post post.json
                             run analyst read            run benchmarker bench --kw "keyword"
                             run breakdown grab --url <post>
                             run form-filler questions --url <form>   then fill --url <form> --file answers.json
  watch [--every 10] [--once] on duty 24/7: comments every 10 min, daily duties once a day
  inbox                      what is waiting for your approval
  approve <id>               let one waiting item go out
  reject <id>                drop one waiting item
  desk                       today's page: approvals, replies, checks, what people say
  xcount "<text>"            X weighted length (Korean, Japanese, Chinese count 2, links 23)
  skill [--agent claude|codex|antigravity] [--remove]

  Work folder: ~/.connect-ai-marketer (or --home, or CONNECT_AI_MARKETER_HOME). Nothing is kept inside the kit.
  Every post and reply waits in the inbox unless you list that role in config.autoSend.`;

async function main() {
  if (cmd === 'help' || flag('help')) { log(banner()); return log(HELP); }
  if (cmd === 'xcount') { const t = pos.slice(1).join(' ') || fs.readFileSync(0, 'utf8'); const n = xLength(t); return log(`${n}/${X_LIMIT} ${n <= X_LIMIT ? 'fits' : 'too long by ' + (n - X_LIMIT)}`); }
  if (cmd === 'roles') { for (const r of roleInfo()) log(`  ${r.id.padEnd(16)} ${r.name.en} · ${r.name.ko}\n  ${''.padEnd(16)} ${r.duty.en}\n  ${''.padEnd(16)} human gates: ${r.humanGates.join('; ')}\n`); return; }
  if (cmd === 'skill') { return flag('remove') ? removeSkill({agent: opt('agent', 'all'), dir: opt('dir'), dryRun: flag('dry-run')}) : installSkill({agent: opt('agent', 'all'), dir: opt('dir'), dryRun: flag('dry-run')}); }
  const h = H();
  if (cmd === 'setup') {
    const G = gold, D = dimmed;
    log(banner());
    log('  ' + 'The marketing team of your unmanned AI company. On duty ' + G('24/7') + '.\n');
    const team = roleInfo();
    team.forEach((r, i) => log('  ' + tint(i, team.length, '●') + ' ' + r.name.en.padEnd(17) + D(r.name.ko)));
    log('');
    const c = path.join(h, 'config.json');
    if (!fs.existsSync(c)) { fs.copyFileSync(path.join(KIT, 'config.example.json'), c); log(`  config: ${c} (edit your handle and keywords)`); } else log(`  config: kept ${c}`);
    const t = path.join(h, 'team.json');
    if (!fs.existsSync(t)) { fs.copyFileSync(path.join(KIT, 'team.json'), t); log(`  team plan: ${t} (change the order to make it your team)`); }
    log('  skill:'); installSkill({agent: opt('agent', 'all'), dir: opt('dir'), dryRun: flag('dry-run')});
    if (egoInstalled()) {
      log('  Ego Lite: found. Sign in to Instagram, X, Threads and YouTube Studio inside Ego Lite once.');
      log('\n  ' + G('Your team is hired.') + ' Next:');
      log('    1. edit ' + c + ' (your handles and keywords)');
      log('    2. ' + RUN + ' doctor');
      log('    3. ' + RUN + ' watch     ' + D('# on duty 24/7') + '\n');
      return;
    }
    log('  Ego Lite: not found. Opening the download page: https://lite.ego.app');
    log('  Install it, open it, finish its first-run steps, then sign in to your sites inside it. Waiting here (Ctrl+C to stop)...');
    if (!flag('no-open')) openFile('https://lite.ego.app');
    const PATHS = [path.join(process.env.HOME || process.env.USERPROFILE || '', '.local', 'bin')];
    for (let i = 0; i < 180; i++) {
      process.env.PATH = PATHS.join(path.delimiter) + path.delimiter + process.env.PATH;
      if (egoInstalled()) { log('  Ego Lite: ready. Your marketing team can start: npx connect-ai-marketer doctor'); return; }
      await new Promise((r) => setTimeout(r, 10000));
    }
    log('  Still no ego-browser command. Open a new terminal after Ego Lite finishes its first-run steps, then run setup again.');
    return;
  }
  if (cmd === 'doctor') {
    log(`  Ego Lite (ego-browser): ${egoInstalled() ? 'ok' : 'missing, see https://lite.ego.app'}`);
    let c = null; try { c = config(h); log(`  config: ok (${path.join(h, 'config.json')})`); } catch (e) { log('  config: ' + e.message); }
    const p = plan(h); log(`  team plan: ${Object.keys(p.events).join(', ')}`);
    for (const [ev, steps] of Object.entries(p.events)) for (const s of steps) if (!ROLES[s.role]?.actions[s.action]) log(`  WARNING ${ev}: ${s.role} ${s.action} does not exist`);
    if (c && !(c.listen?.keywords || []).length) log('  note: listen.keywords is empty');
    log(`  waiting approvals: ${inbox.list(h).filter((x) => x.status === 'waiting').length}`);
    return;
  }
  if (cmd === 'inbox') { const w = inbox.list(h).filter((x) => ['waiting', 'typed'].includes(x.status)); if (!w.length) return log('  nothing waiting'); for (const x of w) log(`  ${x.id}  ${x.status.padEnd(7)} ${x.role} · ${x.channel}\n      ${x.text.replace(/\n/g, '\n      ')}`); return; }
  if (cmd === 'reject') { const r = inbox.setStatus(h, pos[1], 'rejected'); return log(`  ${r.id} rejected`); }
  if (cmd === 'desk') { const f = desk(h); log('  ' + f); if (!flag('no-open')) openFile(f); return; }
  const cfg = config(h);
  if (cmd === 'approve') {
    const item = inbox.list(h).find((x) => x.id === pos[1]);
    if (!item) throw new Error('No approval ' + pos[1] + '. See: inbox');
    const fn = ROLES[item.role]?.approve;
    if (!fn) throw new Error('Role ' + item.role + ' has no approve step');
    const r = await fn(h, cfg, item);
    return log(`  ${item.id}: ${r.status}${r.status === 'typed-waiting-for-you' ? ' (the post is typed in Ego Lite; press Post yourself)' : ''}`);
  }
  if (cmd === 'watch') { return flag('once') ? once(h, cfg, log) : watch(h, cfg, {every: +(opt('every', 10)) || 10, log}); }
  if (cmd === 'team') { const r = await runEvent(h, cfg, pos[1], args, log); return log('  log: ' + r.file); }
  if (cmd === 'run') {
    const [, role, action] = pos;
    const fn = ROLES[role]?.actions[action];
    if (!fn) throw new Error(`Unknown: ${role} ${action}. Roles: ${Object.entries(ROLES).map(([k, v]) => k + ' (' + Object.keys(v.actions).join('|') + ')').join(', ')}`);
    const r = await fn(h, cfg, args);
    return log(JSON.stringify(r, null, 1).slice(0, 4000));
  }
  log(HELP);
}

main().catch((e) => { console.error('  ' + e.message); process.exit(1); });
