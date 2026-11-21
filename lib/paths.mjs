// Where the kit lives and where your team keeps its work (never inside the kit).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const NAME = 'connect-ai-marketer';
// How people run the kit today. Becomes `npx connect-ai-marketer` once the package is on npm.
export const RUN = 'npx github:wonseokjung/connect-ai-marketer';

export function home(opt) {
  const h = opt || process.env.CONNECT_AI_MARKETER_HOME || path.join(os.homedir(), '.connect-ai-marketer');
  for (const d of ['', 'logs', 'out', 'inbox']) fs.mkdirSync(path.join(h, d), {recursive: true});
  return h;
}
export const readJson = (p, d = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } };
export const writeJson = (p, v) => { fs.mkdirSync(path.dirname(p), {recursive: true}); fs.writeFileSync(p, JSON.stringify(v, null, 1)); };
export const today = () => new Date().toISOString().slice(0, 10);
export function config(h) {
  const c = readJson(path.join(h, 'config.json'));
  if (!c) throw new Error(`No config yet. Run: ${RUN} setup`);
  return c;
}
