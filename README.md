# skills

Agent skills by [@iiimabbie](https://github.com/iiimabbie). Each folder is one skill with a `SKILL.md`, usable by any agent that loads skills (Claude Code, Codex and others).

| Skill | Purpose |
|---|---|
| [`read-the-room`](read-the-room/) | Read the air (空気を読む) before replying. Sense mood and unspoken wants, then fit length, tone and whether to speak at all. |
| [`steam-freebies`](steam-freebies/) | Check Steam free-to-keep offers and key giveaways, then announce new items in one batch. |
| [`writing-soul`](writing-soul/) | Write, review or revise an agent's SOUL: its character, voice and relationship with its person. |

## Install

Copy a skill folder into your agent's skills directory, for example:

```sh
git clone https://github.com/iiimabbie/skills
cp -r skills/read-the-room ~/.claude/skills/
```

## License

MIT
