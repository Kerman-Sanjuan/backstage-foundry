---
name: rehearse-the-demo
description: Prepare, time or repair the live demos of the talk. Use when the user says "rehearse the demo", "the demo broke on stage", "what do I click", "prepare the tabs", "the pull request check is not red anymore", or in the days before Azure Cloud Lab when the three demos have to survive a screen share and a compressed stream.
---

# Rehearse the demo

Three demos, sixty minutes, one speaker, and it is **online**: YouTube and LinkedIn Live, no room, no
projector, no faces to read. Everything runs before the session starts; nothing is built or applied on
stage.

Event: Azure Cloud Lab 2026, Thursday 3 December, 19:00 CET.

## The three demos

| # | Minute | What happens | What it proves | Survives? |
|---|---|---|---|---|
| 1 | ~18–30 | the template creates a repository from five fields | self-service: the team does not ask permission | needs GitHub, plus Azure for the last two stops |
| 2 | ~30–36 | two keys, one gets 429, the other keeps working | the counter the form left behind | needs a real gateway and one deployment |
| 3 | ~42–52 | a pull request blocked by the required check | the criterion executes without the platform team | no network at all: it is a browser refresh |

Demo 3 is the one that carries the talk and the only one that cannot fail. Demo 1 is the one most likely
to fail. Demo 2 is the first one that goes if the clock runs.

## Before the session

1. `make demo` green on `main`. Note the scores: they are read out loud, and the slides carry them.
2. `git checkout demo/gate-fails` → `make demo` red, and read *why* it is red. If the branch is green,
   somebody fixed it: regenerate the fixtures with the degraded prompt.
3. The pull request from `demo/gate-fails` is **open and red**, and the merge is blocked by branch
   protection. Not merged, not closed. If the merge button is not blocked, the required check is not
   wired: verify `evaluation gate (replay)` is the required context on `main`.
4. Backstage is up and **warm**: run the template once ten minutes before. The portal serves the template
   from its catalog database, so a freshly deployed image can still answer with the previous version for
   about a minute.
5. The Azure side is up (the `demo azure` workflow, action `status`) or the recordings are ready.
6. A 40–60 second screen recording of each demo, open in a tab, not in a folder.
7. Every tab in the order it will be used, and nothing else: Backstage form, GitHub PR, terminal, Azure.
8. The key never on screen: in a shell variable, no `echo`, no `set -x`.

## On stage, with a screen share

- Share one window, not the desktop. Close notifications, mail and anything with a name in the title bar.
- Legibility at 1080p after compression: terminal font large, browser zoom around 125 %, and never a
  table of 30 rows.
- Narrate before acting: "I am going to fill five fields" beats silence while you type.
- Never run `terraform apply`. Never run `yarn install`. Nothing that can take a minute.
- If a demo fails, switch to its recording without apologising twice, and say what it would have shown.
- Questions come in the chat, not in the room: leave room for them at the end, and read one out loud
  before answering it.

## What to say while the template runs

"The interesting thing is not that it creates a repository. It is what it does not let you decide."
Then list the three things: the model comes from the catalog, the dataset is already there, and the
check is already required.

## If something is broken and there is no time

Cut demo 2 first, then demo 1, and keep demo 3. The talk is about the gate: a red check with the
thresholds on screen is the whole argument, and it does not need the portal to be up.

Known blocker, 24 November: the portal's GitHub token has no `workflow` scope, so the publish step
creates the repository empty and fails. Until that is fixed, demo 1 stops at the fetch step and the rest
is told with the code on screen.

Do not debug on stage. Do not restart a service. Do not say "it worked a minute ago": say what the demo
would have shown and keep the pace.
