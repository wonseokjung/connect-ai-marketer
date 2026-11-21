# connect-ai-marketer

**The marketing team of your unmanned AI company, on duty 24 hours a day, 7 days a week, in your own logged-in browser.**
CONNECT AI LAB · AI education for everyone · source available under MIT + Commons Clause (free to use, not for resale) · runs on [Ego Lite](https://lite.ego.app)

```bash
npx github:wonseokjung/connect-ai-marketer setup
```

The short form `npx connect-ai-marketer` is coming with the npm release. Until then, use the `github:` line above everywhere.

[![connect-ai-marketer](docs/hero.webp)](docs/index.html)

## First time? In this order

1. **Install Ego Lite**: download it for your computer (macOS or Windows) at [lite.ego.app](https://lite.ego.app), open it and finish the first-run steps.
   - macOS will not open it: System Settings > Privacy & Security > Open Anyway
   - Windows: run the installer, finish the first-run steps, then open a new PowerShell.
2. **Install Node.js**: get the LTS from [nodejs.org](https://nodejs.org). Open a new terminal (PowerShell on Windows); `node -v` should be v18 or newer.
3. **One vibe-coding tool**: Claude Code, ChatGPT Codex or Antigravity (Gemini). It writes the words.
4. **One install line** in the terminal (or ask your vibe-coding tool to run it):
   ```bash
   npx github:wonseokjung/connect-ai-marketer setup
   ```
5. **Sign in inside Ego Lite** to the sites the team works on (Instagram, X, Threads, YouTube Studio). Passwords and 2-step codes are yours to type.
6. **Check, then go on duty**:
   ```bash
   npx github:wonseokjung/connect-ai-marketer doctor
   npx github:wonseokjung/connect-ai-marketer watch
   ```

## The team

Eight AI teammates, built one by one and wired by a work schedule (`team.json`). Your agent (Claude Code, Codex, Antigravity) writes the words; the kit scans, checks, queues and types inside Ego Lite, so your own tabs stay yours.

| Teammate | What it does | Status |
|---|---|---|
| comment-replier | collects new Instagram comments, posts replies in each commenter's language | v0.1 |
| listener | searches X and Threads for your keywords, ranks by reach, writes a report | v0.1 |
| studio-finisher | fills title, description, playlists, tags from your sheet, saves, reloads and diffs | v0.1 |
| crossposter | per-channel drafts, X weighted length check, approval inbox, types the post | v0.1 |
| benchmarker | before an upload: top recent YouTube results for a keyword with views, upload age, length and views a day | v0.1 |
| analyst | your own public X and YouTube numbers into a daily CSV and a desk card | v0.1 |
| breakdown | one post or video that took off: text, numbers, frames from the first seconds | v0.1 |
| form-filler | reads a creator-program form, fills it from your profile, stops before Submit | v0.1 |
| tagger | shopping tags | next |

## How the team works

```
team before-upload ─▶ benchmarker (report)
team new-video     ─▶ studio-finisher ─▶ crossposter (drafts → inbox) ─▶ comment-replier
team daily         ─▶ listener ─▶ analyst ─▶ comment-replier ─▶ desk
watch              ─▶ comments every 10 min, the daily event once a day
```

- **Roles** live in `roles/<id>/` (`role.json` + `run.mjs`) and pass work as files in your work folder.
- **Team plan** `team.json` is the order. Setup copies it to your work folder; change it to make your own team. Optional steps (analyst, benchmarker) run once their handle or keyword is set in `config.json`.
- **Approval inbox**: every post and reply waits until you run `approve <id>`. List a role in `config.autoSend` only when you trust it to send alone.
- **Read only by default**: listener, benchmarker, analyst and breakdown only read public pages. They never like, follow, subscribe or reply.
- **Desk**: `desk` opens one page with today's approvals, replies, upload checks, your numbers, the benchmark and what people are saying.
- **Human gates**: your logins, every post, and the final Post click (unless you turn on `crossposter.finalClick`).

## Commands

```bash
npx github:wonseokjung/connect-ai-marketer doctor            # what is missing, and the exact fix
npx github:wonseokjung/connect-ai-marketer roles
npx github:wonseokjung/connect-ai-marketer watch             # on duty 24/7
npx github:wonseokjung/connect-ai-marketer run benchmarker bench --kw "your topic" --days 14
npx github:wonseokjung/connect-ai-marketer run analyst read  # x.handle and youtube.handle in config.json
npx github:wonseokjung/connect-ai-marketer run listener listen --kw "your product"
npx github:wonseokjung/connect-ai-marketer run breakdown grab --url <post>
npx github:wonseokjung/connect-ai-marketer run comment-replier scan
npx github:wonseokjung/connect-ai-marketer run comment-replier send --file replies.json
npx github:wonseokjung/connect-ai-marketer team before-upload --kw "your topic"
npx github:wonseokjung/connect-ai-marketer team new-video --video <id> --sheet sheet.json --post post.json
npx github:wonseokjung/connect-ai-marketer inbox
npx github:wonseokjung/connect-ai-marketer approve a3
npx github:wonseokjung/connect-ai-marketer desk
npx github:wonseokjung/connect-ai-marketer xcount "새 영상 올렸어요 https://youtu.be/..."
```

Work folder: `~/.connect-ai-marketer` (`config.json`, `team.json`, `out/`, `logs/`, `inbox/`). Nothing is written inside the kit.

## Troubleshooting

Start with `doctor`. Every failing line comes with the fix in English and Korean. Still stuck? Paste the doctor output into your vibe-coding tool and ask it to fix it.

**Windows: "running scripts is disabled on this system"**
PowerShell is blocking `npx`. Type `npx.cmd` instead of `npx` (for example `npx.cmd github:wonseokjung/connect-ai-marketer setup`), or run the same line in Command Prompt (cmd). To allow scripts for your own user only: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

**"node", "npx" or "ego-browser" is not recognized / command not found**
A terminal reads the PATH only when it opens. After installing Node.js, or after finishing Ego Lite's first-run steps, close the terminal and open a new one. On macOS, `export PATH="$HOME/.local/bin:$PATH"` fixes the current window for ego-browser.

**npm prints "1 vulnerability" (or a similar audit notice)**
That is npm's audit notice, not an error, and the install has finished. This kit has no npm dependencies. Run `doctor` to confirm, and do not run `npm audit fix --force` for it.

**Windows stops the Ego Lite installer ("Windows protected your PC")**
Choose More info, then Run anyway. Finish the first-run steps, then open a new PowerShell.

**Mac or Windows?**
Both. Ego Lite has a build for each; Node.js 18 or newer on either.

**Does it work with Antigravity (Gemini) or Codex?**
Yes. Setup installs the team's skill for every agent it finds: Claude Code, Codex and Antigravity. In Antigravity you can run the install line in its terminal, or ask the agent to run it for you.

**Where is the skill?**
Setup copies `skill/SKILL.md` to `~/.claude/skills/connect-ai-marketer` (Claude Code), `~/.agents/skills/connect-ai-marketer` (Codex) and `~/.gemini/config/skills/connect-ai-marketer` (Antigravity). Reinstall with `skill`, then restart the agent so it sees the new skill.

**Company computer**
Many company PCs block new browsers or scripts by policy. Use a personal computer, or ask your IT team to allow Ego Lite and Node.js. Do not work around the policy.

**Every `npx github:` run is slow**
npx fetches the kit from GitHub each time. To keep it installed: `npm install -g github:wonseokjung/connect-ai-marketer`, then run `connect-ai-marketer doctor`.

## Add your own role
Copy `roles/listener/`, edit `role.json` and `run.mjs`, register it in `lib/team.mjs`, add a step to `team.json`. The agent skill (`skill/SKILL.md`) tells your agent how the team works.

## License
MIT with the Commons Clause. Use it, change it, share it, and use it to market your own business. Do not sell it, sell access to it, or sell a paid course or service built mainly on it. See LICENSE.

## Requirements
Node 18+, macOS or Windows, Ego Lite installed and signed in to the sites you use. Ego Lite is a separate free browser by its own company with its own terms. See NOTICE.md.
