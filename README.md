# skills

Agent skills by [@iiimabbie](https://github.com/iiimabbie). Each folder is one skill with a `SKILL.md`, usable by any agent that loads skills (Claude Code, Codex and others).

| Skill | Purpose |
|---|---|
| [`read-the-room`](read-the-room/) | Read the air (空気を読む) before replying. Sense mood and unspoken wants, then fit length, tone and whether to speak at all. |
| [`steam-freebies`](steam-freebies/) | Check Steam free-to-keep offers and key giveaways, then announce new items in one batch. |
| [`portrait-prompting`](portrait-prompting/) | Write and check prompts that put a specific person's face into an image: face swaps, character selfies and identity reference sheets. |

## Install

Copy a skill folder into your agent's skills directory, for example:

```sh
git clone https://github.com/iiimabbie/skills
cp -r skills/read-the-room ~/.claude/skills/
```

## Schedule

`read-the-room` and `portrait-prompting` load on demand and need no schedule. `steam-freebies` is meant to run as a recurring job: have your agent's scheduler (or cron) start a run once a day with a prompt like the one below, and post the result where people should see it.

```text
Run the steam-freebies skill: read its SKILL.md, check for new offers with a fixed --state directory, announce new ones in one message, then commit that batch. Stay quiet when there is nothing new.
```

Daily is enough: offers usually last several days, and the state directory keeps already-announced offers from repeating. Keep the same `--state` for every run.

## License

MIT
