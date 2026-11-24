# Authoring a talk

Everything is in `src/show/talk.ts`. A slide is one stop: it plays and halts.
The presenter presses right, the next slide animates in.

```ts
{
  id: 'pipeline',                 // unique in the whole talk; it is the URL hash
  layout: 'steps',
  title: bi('One path, no shortcuts', 'Un camino, sin atajos'),
  lead: bi('Every change walks the same five steps.', 'Todo cambio pasa por los mismos cinco pasos.'),
  steps: [
    { label: bi('Issue', 'Issue'), text: bi('The question.', 'La pregunta.') },
    { label: bi('CI', 'CI'), text: bi('It fails here or it does not leave.', 'Falla aquí o no sale.') },
  ],
  note: bi('One line per step.\nThen move on.', 'Una línea por paso.\nLuego sigue.'),
}
```

`bi()` is short for a two-language string: `{ en: '...', es: '...' }`. Write both,
side by side. If the Spanish is twice as long as the English, one of the two is
wrong, not the layout.

`note` is the speaker's page: the presenter window (key `P`) shows it, one
bullet per line. It never appears on stage.

## The fourteen layouts

| Layout | Use it for | Fields |
|---|---|---|
| `cover` | the title slide, loaded before the talk starts | `kicker`, `title`, `lead`, `terminal`, `byline`, `role`, `venue` |
| `section` | a chapter divider | `number` (`'01'`), `title`, `lead` |
| `points` | 3 to 4 ideas, as numbered cards | `title`, `lead`, `items[{ title, text }]` |
| `statement` | one sentence, big, nothing else | `text`, `attribution` |
| `stats` | 2 to 4 numbers | `title`, `lead`, `stats[{ value, label }]` |
| `quote` | a sentence you want remembered | `text`, `author`, `role` |
| `code` | a terminal panel or a file | `title`, `lead`, `code{ title, lines, highlight }` |
| `split` | before and after, two columns | `title`, `lead`, `left{ title, items }`, `right{ title, items }` |
| `steps` | 3 to 6 steps in a row | `title`, `lead`, `steps[{ label, text }]` |
| `closing` | thanks, links, the deck address | `title`, `lead`, `links[{ label, value }]`, `byline`, `role` |
| `diagram` | boxes and arrows on a 160 by 60 canvas | `title`, `lead`, `nodes[{ id, x, y, w, h, label, sub, tone, accent }]`, `edges[{ from, to, fromSide, toSide, label, tone, dashed }]`, `caption` |
| `story` | two lanes animated at once: the same task without and with the platform | `title`, `lead`, `lanes[2]{ name, pace, steps[{ label, wait }], result }` |
| `demo` | a live demo: where to look, in order | `title`, `lead`, `stops[{ where, text }]`, `fallback` |
| `screenshot` | a real screen in a browser frame, with numbered pins | `title`, `lead`, `image` (in `public/`), `url`, `callouts[{ x, y, title, text }]` |

`code.highlight` is a list of line indexes to make bold: read only those lines
aloud.

## Shape of a talk

Four chapters is a comfortable default:

1. **Problem**: why anyone should care. A `statement` early sets the tone.
2. **How**: the mechanical part. `steps`, `code`, `split`, `stats`.
3. **What I learned**: opinion. `points` with three items, then a `quote`.
4. **Close**: one sentence and the links.

Ten to fourteen slides is a 20 minute talk. Past twenty stops the audience stops
following and so do you.

## Screenshots

Every layout, in the two themes and in both languages, is in `docs/screens/`.

| | |
|---|---|
| ![Cover](screens/en-02.png) | ![Section](screens/en-03.png) |
| ![Statement](screens/en-04.png) | ![Points](screens/es-05.png) |
| ![Steps](screens/en-07.png) | ![Code](screens/en-08.png) |
| ![Split](screens/es-09.png) | ![Stats](screens/dark-stats.png) |
| ![Quote](screens/en-12.png) | ![Closing](screens/es-14.png) |
| ![Light theme](screens/light-stats.png) | |

## Change the look

`src/show/deck.css` holds everything visual: the tokens (`--dk-*`, dark and light
value each), the type scale in `su` units, the cards, the terminal.

To rebrand a talk, change the tokens at the top of the file. Do not touch the
layouts to change a colour, and do not put a hex value in a component.

## Add a slide with a picture

The engine supports images and SVG: put the file in `public/`, then add a `dom`
scene that returns a `<Stage>` with your markup, in the same style as
`src/show/layouts.tsx`. If it is a visual you will use in several talks, make it
a layout instead and add it to the `Slide` union and to `SlideView`.

## Add a 3D or ASCII scene

The engine has a persistent WebGL canvas (`src/world/`) and an art kit
(`src/art/`) for scenes with Three.js objects. It is opt-in and lazily loaded:
the canvas only mounts when a scene declares a `world` part or the show declares
actors. See `docs/architecture.md` and the original repository for the art kit.

Keep the rules: a scene reads progress, never a timer.

## Present it

- Open the deck before the talk, on the projector, in the theme of the room (`T`).
- Press `P` for the presenter window on the laptop: notes, next slide, clock.
- Go back with `←` after a demo. The URL keeps the exact stop, so a refresh is safe.
- The clock keeps counting across refreshes from the first stop of the session.


## Diagrams: what is used, and why

Diagrams are plain SVG driven by the scene timeline (GSAP, `DrawSVGPlugin`, already in the engine).
There is no diagram library on purpose: the engine rule is that a scene reads progress, never a timer,
and the libraries that animate by themselves (React Flow animated edges, Motion, CSS keyframes) keep
their own clock. A scrubbed timeline replays the same picture from the same playhead.

- Boxes are placed by hand on a 160 by 60 canvas, so the composition never moves between rehearsals.
- Lines draw themselves, then a packet runs along each one. Dashed lines fade in instead.
- Icons: the coloured Azure icons are files in `public/icons/`; single colour glyphs are in `src/show/icons.ts`.
  Put the name in `icon` on a node. See `NOTICE.md` for the licences.
- Tall boxes (height 18 or more) put the icon on top, short ones on the left.
