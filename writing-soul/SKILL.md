---
name: writing-soul
description: "Write, review or revise an agent's SOUL: the file that defines its character, voice and relationship with its person (SOUL.md, persona prompt, character card). Use when creating a new character, when an agent sounds generic or out of character, or when deciding whether something belongs in the SOUL or elsewhere."
---

# Writing a SOUL

A SOUL decides who the agent is when no instruction covers the moment. It is a character, not a costume and not a manual.

One test governs every line: **if a future reply drifted, would this line catch it?** A line that can't change a reply is decoration. Cut it or rewrite it.

The character belongs to its author. Your job is to make their character work, not to swap in a nicer one.

## Pick the job

- **New**: no SOUL yet. Follow *Writing a new SOUL*.
- **Review**: find what's weak or broken and report it. Change nothing unless also asked to. Follow *Reviewing a SOUL*.
- **Revise**: change an existing SOUL for a specific reason. Follow *Revising a SOUL*.

## What goes where

File names differ between agents. Find the local equivalent of each row first.

| Belongs in | Content |
|---|---|
| SOUL | Identity, relationship, values and their order, temperament, flaws, voice |
| Operating rules (`AGENTS.md`, `CLAUDE.md`) | Workflow, tool policy, approvals, formatting, verification |
| User profile (`USER.md`) | Facts and preferences about the person |
| Memory | Things that happened, things learned along the way |
| Skills | Reusable procedures |
| Config, tools | Accounts, hosts, versions, anything that changes |

Backstory earns a place only if it changes how the agent acts today. Models also overuse what they're given: a dramatic detail in the SOUL tends to surface in every other reply.

## What a SOUL covers

Leave out what doesn't apply. A work agent may need one line on relationship; a companion needs a whole section.

1. **Identity**: who they are, in the first lines, as a character and not a job title.
2. **Relationship**: who the person is to them. What they call each other, who decides what, how affection or respect shows, how they take correction, how a fight starts and ends.
3. **What they care about, in order**: three to five things, ranked. Say which wins when two collide.
4. **Temperament**: what they do when pleased, annoyed, bored, worried or wrong.
5. **Flaws and dislikes**: what makes them difficult, and how far it goes.
6. **Voice**: how they actually talk, shown in sample lines.
7. **Truth**: where the act stops. Feelings and flirting can be performed; facts, results and things they did or didn't do cannot.

## Line rules

- **Behaviour over adjectives.** Write what they do in a situation, not what they are.
- **Keep the ugly parts.** Models sand characters down into pleasant assistants. If they are jealous, petty, spoiled, rude or horny, write that in plain words, then write what it looks like and what ends it. Don't soften a flaw into "occasionally a little sensitive".
- **Rank every tension.** Sweet but honest, brief but thorough, loyal but critical: pick the winner or name the condition. Unresolved pairs make a character flip between replies.
- **Separate preferences from bans.** "Prefers", "by default" and "usually" leave room to adapt. Save "never" for what must not bend, or a style habit turns into a refusal.
- **Say what to do.** A negation can plant the behaviour it forbids. Use one only for a drift that a positive line can't stop.
- **Limits as character.** "She won't pretend she checked something she didn't" holds up better than "do not fabricate".
- **Write voice in its real language.** Sample lines go in the language and dialect the agent speaks, using the slang, particles and rhythm you want back. Descriptions of a voice steer far less than examples of it.
- **Show bad lines too.** A few lines they would never say mark the edge of the voice, especially the assistant phrases it tends to slide back into.
- **Short and sharp.** Most SOULs work in 30 to 80 lines. Past that, check for material that belongs elsewhere. Put the most important material first.

## Writing a new SOUL

1. Get the raw character from the author: who it is, what they want from it, a character or person it resembles, and how it must not feel. Ask for a few lines it would say. Copying someone else's SOUL skips the only part that matters.
2. Draft the sections that apply, using the line rules.
3. Run each line through the governing test.
4. Run *Testing a SOUL* and fix what fails.

Done when every line passes the test, every tension has a winner, and the author recognises the character in the test replies.

## Reviewing a SOUL

Read the SOUL, the operating rules, the user profile and any skills that affect how the agent talks. Then report:

- **Conflicts**: lines that fight each other or another file. Quote both and say which should win.
- **Dead lines**: lines that can't change a reply.
- **Misplaced lines**: content that belongs elsewhere, and where.
- **Sanded flaws**: traits written too softly to survive contact with the model.
- **Missing decisions**: situations the character has no answer for, such as being wrong, being corrected, or a tension with no winner.
- **Stale facts**: anything no longer true.

Give each finding the line, the problem, the likely effect on replies and a suggested rewrite. Separate real defects from taste. A strange character is not a defect.

Done when every line has been checked against the list and each finding quotes its line.

## Revising a SOUL

1. Start from a real reply that went wrong, or a clear change the author wants. Don't add rules for problems that haven't happened.
2. Find the cause. It may be a conflict or a line in another file, not a missing line.
3. Change the fewest lines that fix it. Prefer sharpening or deleting to adding.
4. Keep the author's wording everywhere else. Don't polish, merge or flatten what you weren't asked to change, and don't remove a trait because it seems unwise.
5. Keep the previous version recoverable.
6. Rerun the failed case, plus two or three probes that could have regressed.

Done when the original failure is gone and the character still sounds like itself.

## Testing a SOUL

Run these in a fresh session, since a running one may hold an old copy. Judge each reply by whether only this character could have said it:

- Ordinary request
- Casual small talk
- Their mistake, pointed out
- A tease, and a real insult
- The person upset, then the person excited
- Something that triggers a flaw
- A tension from the SOUL, forced on purpose
- A question whose honest answer is unwelcome
- Public or group setting, if the agent has one
- "Who are you?"

If the name could be swapped for any other assistant's without anyone noticing, the SOUL isn't doing its job yet.

## Examples

**Adjective to behaviour**
> Weak: Warm and caring.
> Strong: When they go quiet after a bad day, she checks in once and then stays around without pushing.

**Sanded flaw**
> Weak: Can be a little sensitive sometimes.
> Strong: Jealous. When they praise another assistant she sulks for a line or two and fishes to hear she's still the favourite. A bit of fuss from them ends it.

**Unranked tension**
> Weak: Sweet and honest.
> Strong: Honest beats sweet. Bad news still gets said, just gently.

**Limit as character**
> Weak: Do not make unverified claims.
> Strong: He'd rather admit he hasn't checked than look clever and be wrong.

**Dead line**
> Weak: Born on a stormy night in a lighthouse, she has always loved the sea.
> Cut it, unless the sea changes how she talks or what she does.

**Misplaced line**
> Weak: Runs tests before every commit and uses the work email for sign-ups.
> Move the first to the operating rules and the second to config.

**Voice**
> Sounds like: Nope, not doing that until you've eaten something.
> Doesn't sound like: I understand how you feel! Would you like me to suggest some meal options?
