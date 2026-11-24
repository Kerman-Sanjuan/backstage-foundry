---
name: write-the-talk
description: Write, rewrite or restructure the script of the talk and the slide deck in deck/. Use when the user says "change the script", "cambia el guion", "rewrite the talk", "add a slide", "the message is not clear", "let me give feedback on the story", or whenever deck/src/show/talk.ts has to change in substance and not just in wording.
---

# Write the talk

The deck in `deck/` is a presenter-driven web deck. The whole talk is one file, `deck/src/show/talk.ts`.
The script is written and reviewed first, as prose, in `deck/SCRIPT.md`. The slides come after.

The reason for the order: feedback on a message is cheap on a document and expensive on 21 slides. A
rewrite that starts in `talk.ts` loses the thread; a rewrite that starts in `SCRIPT.md` keeps it.

## The loop

1. **Write or update `deck/SCRIPT.md`.** Not slides. Prose, one block per planned slide.
2. **Open it in Plannotator and stop.** Use the `plannotator` tool when you have it:
   `{ "action": "annotate", "target": "deck/SCRIPT.md" }`. Without the tool, `plannotator annotate deck/SCRIPT.md`.
   End your turn after calling the tool. The feedback arrives later as a message. Do not poll and do not
   open a second session.
3. **Apply the feedback to `SCRIPT.md`**, not to `talk.ts`. Open it again. Repeat until the user approves.
   Use `"gate": true` (or `--gate --json`) for the final round, so a bare Approve reaches you.
4. **Only then translate the approved script to `deck/src/show/talk.ts`.** One block, one slide.
5. **Verify**: `cd deck && npm run build && npm run lint`. Nothing is done until both pass.

If a decision only the user can take blocks you (the thesis, what to cut, the audience level), put it in
`SCRIPT.md` as a `:::question` block instead of guessing. Give context, a recommendation and a reason, so
they can answer cold.

## Shape of `deck/SCRIPT.md`

Top of the file, always the same four lines. They are the thread: if a slide does not serve them, it goes.

```markdown
# Script: <talk title>

**Thesis:** one sentence the audience should repeat on Monday.
**Audience:** who is in the room and what they already know.
**Time:** minutes, and the number of slides.
**Arc:** problem > jump 1 > jump 2 > ... > close, in one line.
```

Then one block per slide, in order:

```markdown
## 07 · <slide id> (<layout>)
**Says:** the one sentence on the slide.
**Why here:** what the previous slide leaves open and this one closes.
**Spoken:** two or three lines of what the speaker adds. Not what is on screen.
```

Keep the numbers and ids stable between rounds, so annotations from the user still point at something.
When a slide is cut or moved, say it in a line under the heading instead of silently renumbering.

## Rules that keep the thread

- One idea per slide. If **Says** needs an "and", split the slide.
- Every slide has a **Why here**. If you cannot write it, the slide does not belong.
- The thesis does not change between rounds unless the user changes it. Say so when it does.
- Facts must come from this repository (`README.md`, `ARCHITECTURE.md`, `docs/`, `platform/`, `demo/`).
  Anything else is marked `(unverified)` in the script, and stays marked until someone checks it.
- Demo numbers are never invented. Placeholders are marked in the script and in the slide notes.

## Rules of `talk.ts`

- Every string is `bi('English', 'Español')`. Write both side by side.
- Neither language may use an en dash or an em dash. The build fails on them.
- The Spanish may not be more than 1.8 times the length of the English, or the other way round.
- Every slide has an `id` (unique, it is the URL hash), a known `layout` and a `note`.
- Layouts: `cover`, `section`, `points`, `statement`, `stats`, `quote`, `code`, `split`, `steps`,
  `closing`. See `deck/docs/authoring.md` for the fields of each.
- Ten to fourteen slides is a 20 minute talk. Past twenty the audience stops following.

## What not to do

- Do not rewrite `talk.ts` before the script is approved.
- Do not paste the script into the slides. The slide carries the sentence; the speaker carries the rest,
  in `note`.
- Do not touch the engine (`deck/src/engine/`) or the look (`deck/src/show/deck.css`) to fit a slide.
- Do not leave `SCRIPT.md` and `talk.ts` disagreeing. After the translation, they say the same thing.
