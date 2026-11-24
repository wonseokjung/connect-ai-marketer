# connect-ai-marketer

**The marketing team of your unmanned AI autonomous company: on duty 24 hours a day, 7 days a week, in your own logged-in browser.**
Source available by CONNECT AI LAB · MIT + Commons Clause (free to use, not for resale) · runs on [Ego Lite](https://lite.ego.app)

```bash
npx github:wonseokjung/connect-ai-marketer setup
```

[![connect-ai-marketer](docs/hero.webp)](docs/index.html)

Eight AI teammates, built one by one and wired by a work schedule (`team.json`): comments every 10 minutes, listening every morning, finishing and posting every upload. `npx connect-ai-marketer watch` puts the team on duty around the clock. Your agent (Claude Code, Codex, Antigravity) writes the words; the kit scans, checks, queues and types in Ego Lite, so your own tabs stay yours.

| Teammate | What it does | Status |
|---|---|---|
| comment-replier | collect new Instagram comments, post replies in each commenter's language | v0.1 |
| listener | search X and Threads for your keywords, rank by reach, write a report | v0.1 |
| studio-finisher | fill title, description, playlists, tags from your sheet, save, reload and diff | v0.1 |
| crossposter | per-channel drafts, X weighted length check, approval inbox, types the post | v0.1 |
| analyst | read your own X numbers: recent posts, best 5, what people replied | v0.1 |
| benchmarker | YouTube search for your keyword, last 2 weeks ranked by views, title patterns | v0.1 |
| breakdown | one post or video that took off: text, numbers, frames from the first seconds | v0.1 |
| form-filler | read a creator-program form, fill it from your profile, stop before Submit | v0.1 |
| tagger | shopping tags | next |

## How the team works

```
team new-video ─▶ studio-finisher ─▶ crossposter (drafts → inbox) ─▶ comment-replier
team daily     ─▶ listener ─▶ comment-replier ─▶ desk
```

- **Roles** live in `roles/<id>/` (`role.json` + `run.mjs`) and pass work as JSON files in your work folder.
- **Team plan** `team.json` is the order. Copy it to your work folder and change it to make your own team.
- **Approval inbox**: every post and reply waits until you run `approve <id>`. List a role in `config.autoSend` only when you trust it to send alone.
- **Desk**: `desk` opens one page with today's approvals, replies, upload checks and what people are saying.
- **Human gates**: your logins, every post, and the final Post click (unless you turn on `crossposter.finalClick`).

## Commands

```bash
npx connect-ai-marketer roles
npx connect-ai-marketer watch            # on duty 24/7
npx connect-ai-marketer run listener listen --kw "your product"
npx connect-ai-marketer run benchmarker bench --kw "your topic"
npx connect-ai-marketer run breakdown grab --url <post>
npx connect-ai-marketer run analyst read
npx connect-ai-marketer run comment-replier scan
npx connect-ai-marketer run comment-replier send --file replies.json
npx connect-ai-marketer team new-video --video <id> --sheet sheet.json --post post.json
npx connect-ai-marketer inbox
npx connect-ai-marketer approve a3
npx connect-ai-marketer desk
npx connect-ai-marketer xcount "새 영상 올렸어요 https://youtu.be/..."
```

Work folder: `~/.connect-ai-marketer` (`config.json`, `team.json`, `out/`, `logs/`, `inbox/`). Nothing is written inside the kit.

## Add your own role
Copy `roles/listener/`, edit `role.json` and `run.mjs`, register it in `lib/team.mjs`, add a step to `team.json`. The agent skill (`skill/SKILL.md`) tells your agent how the team works.

## License
MIT with the Commons Clause. Use it, change it, share it, and use it to market your own business. Do not sell it, sell access to it, or sell a paid course or service built mainly on it. See LICENSE.

## Requirements
Node 18+, macOS or Windows, Ego Lite installed and signed in to the sites you use. See NOTICE.md.

<!-- team:start -->
## CONNECT AI LAB's AI employees

I'm building AI employees one by one, in the open. Grab the one you need first.

<table>
<tr><td width="34%" valign="top"><b>Business analyst</b><br><a href="https://github.com/wonseokjung/reversebusiness"><code>reversebusiness</code></a></td><td valign="top">Give it a website, and it breaks down how that business makes money.</td></tr>
<tr><td width="34%" valign="top"><b>Video editor</b><br><a href="https://github.com/wonseokjung/connect-ai-video-motion"><code>connect-ai-video-motion</code></a></td><td valign="top">Give it your video, and it puts motion graphics in the empty space around you.</td></tr>
<tr><td width="34%" valign="top"><b>Motion designer</b><br><a href="https://github.com/wonseokjung/connect-ai-motion"><code>connect-ai-motion</code></a></td><td valign="top">Give it a few lines of text, and it makes a motion graphics video. No footage needed.</td></tr>
<tr><td width="34%" valign="top"><b>Marketing team</b> · <b>this one</b><br><a href="https://github.com/wonseokjung/connect-ai-marketer"><code>connect-ai-marketer</code></a></td><td valign="top">Replies, social listening and uploads, 24/7 in your own browser.</td></tr>
</table>
<!-- team:end -->
