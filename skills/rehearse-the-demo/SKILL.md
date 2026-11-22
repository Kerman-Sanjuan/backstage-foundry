---
name: rehearse-the-demo
description: Prepare, time or repair the live demo of the talk. Use when the user says "rehearse the demo", "the demo broke on stage", "what do I click", "prepare the tabs", "the pull request check is not red anymore", or in the days before NetCoreConf when the two demos have to survive a projector, a slow network and a room full of people.
---

# Rehearse the demo

Two demos, sixty minutes, one speaker. Everything is running before the session starts; nothing is
built or applied on stage.

## The two demos

| # | Minute | What happens | What it proves |
|---|---|---|---|
| 1 | ~18–30 | the template creates a repository from five fields | self-service: the team does not ask permission |
| 2 | ~30–42 | a pull request is blocked by the required check | the criterion executes without the platform team |

Demo 1 is the one most likely to fail on stage: it talks to GitHub. Demo 2 is a browser refresh, and it
is the one that lands the argument.

## Before the session

1. `make demo` green on `main`. Note the scores: you will read them out.
2. `git checkout demo/gate-fails` → `make demo` red, and read *why* it is red. If the branch is green,
   somebody fixed it; regenerate the fixtures with the degraded prompt.
3. The pull request from `demo/gate-fails` is **open and red**. Not merged, not closed.
4. Backstage is running and the catalog shows the components. It takes a few seconds to index after a
   restart: open it once, before the session, not first thing on stage.
5. A 40-second screen recording of each demo, on the desktop, not in a folder.

## On stage

- Never run `terraform apply`. Never run `yarn install`. Nothing that can take a minute.
- If demo 1 fails, say what it would have done and move to demo 2. Demo 2 carries the talk.
- The line to land after the red check: **a check that warns is not a check, it is a comment with better
  formatting.**

## What to say while the template runs

"The interesting thing is not that it creates a repository. It is what it does not let you decide."
Then list the three things: the model comes from the catalog, the dataset is already there, and the
check is already required.

## If something is broken and there is no time

Cut demo 1 entirely and keep demo 2. The talk is about the gate: a red check on a projector with the
thresholds visible on screen is the whole argument, and it does not need the portal to be up.

Do not debug on stage. Do not restart a service. Do not say "it worked a minute ago" — say what the
demo would have shown and keep the pace.
