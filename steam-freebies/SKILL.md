---
name: steam-freebies
description: "Find new Steam free-to-keep games, DLC and third-party Steam key giveaways, then prepare a batch announcement. Use for a scheduled giveaway digest or a request to check current Steam freebies."
---

# Steam freebies

Requires Node.js 20+ with network access. Run the bundled script relative to this skill's directory:

```sh
node bin/check.mjs
```

Options: `--state <dir>` selects persistent state outside the skill folder (default: `$XDG_STATE_HOME/steam-freebies`, or `~/.local/state/steam-freebies`). `--cc <country>` defaults to `tw`; `--lang <language>` defaults to `tchinese`. These apply to every Steam request and link. Use the same state directory for checks and commits. The script keeps `seen.json` and one overwritten `pending.json`; seen offers expire after 30 days without appearing again.

## Read the result

- `new`: offers not announced before. Sources are Steam store 100% discounts and GamerPower Steam key giveaways; matching third-party titles are suppressed when the store has the same offer.
- `already_pushed_still_active`: count of active entries omitted from `new`, including same-title duplicates.
- `errors`: source or individual-item fetch failures. Report available new offers even if another source fails. If `new` is empty, stay quiet unless both sources failed and no usable data could be fetched; then briefly report the failure.

## Prepare one message per batch

Put offers ending within 24 hours first and flag their urgency. `ends` is already formatted in Taiwan time (`Asia/Taipei`); state that timezone, and treat a missing deadline or price as unknown.

For each item include:

- Title, game or DLC, base game for DLC, original price (`worth`) and deadline (`ends`).
- Two or three natural sentences in Taiwan Traditional Chinese about the genre, gameplay and distinctive features, using `intro` and `genres`, or `gp_description` when no intro is available. Explain the base game before describing DLC. Paraphrase rather than copying or translating word for word.
- Claim instructions: Steam store offers are claimed directly on the store and kept permanently. Third-party offers require obtaining a key on another site and redeeming it on Steam; summarize `how_to_claim`, including newsletter, points or other conditions.
- Claim URL (`url`); also include `steam_url` for a third-party offer when available.

Use no opening or closing filler. Once the batch announcement is drafted and selected for delivery, before emitting the final reply, mark that pending batch as announced:

```sh
node bin/check.mjs --commit
```

Repeat any custom `--state` argument. This returns `{ "committed": <count> }` and clears the pending batch; it does not fetch offers. Commit only the batch being announced, and avoid another check between drafting and committing because it replaces `pending.json`. If commit fails, report the failure; a later run may repeat the offers.
