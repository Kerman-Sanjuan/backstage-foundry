# Architecture, in one page

The whole show is a function of one number: the playhead.

```
keyboard / wheel / URL hash
        |
        v
Presentation: target position + playhead (src/engine/presentation.ts)
        |  one GSAP tween moves the playhead to the target
        v
resolve(playhead) -> chapter, slide, local progress 0..1
        |
        v
mounted scenes get their local progress; a GSAP timeline is scrubbed with it
        |
        v
one frame: DOM, SVG (and WebGL, if the show uses it)
```

If the playhead is at 3.25 the screen is always the same, however the presenter
got there. That is why slides can be scrubbed forwards and backwards without
state bugs.

## Files

| Path | What it does |
|---|---|
| `src/engine/presentation.ts` | the playhead, the stops, the commands |
| `src/engine/show-model.ts` | chapters, scenes, stops, position math |
| `src/engine/Keynote.tsx` | the app shell and the layer stack |
| `src/engine/DomSceneHost.tsx` | mounts the DOM part of the nearby scenes |
| `src/engine/PresenterView.tsx` | the presenter window (key `P`) |
| `src/engine/input.ts` | keyboard and wheel |
| `src/engine/layers.ts` | the only place with stacking order |
| `src/animation/useSceneTimeline.ts` | one paused GSAP timeline, scrubbed by progress |
| `src/show/talk.ts` | the talk |
| `src/show/layouts.tsx` | the layouts |
| `src/show/deck.css` | the look |
| `src/world/` | optional Three.js canvas, lazily loaded |
| `src/i18n/` | the engine chrome in two languages |

## A scene

```ts
defineScene({
  id: 'pipeline',
  parts: { dom: PipelineDom },     // or fx, or world
  duration: 1,                     // units on the global timeline
  stops: [1],                      // where the presenter halts, in local progress
})
```

A scene mounts when it is within one scene of the active one, so the next slide
is ready before it plays. It unmounts two scenes away.

## Two kinds of text

- The talk: bilingual inline in `talk.ts` (`bi(en, es)`). One file, both
  languages visible at once, no key bookkeeping.
- The engine chrome: `src/i18n/locales/*.json`, with the `T` component and the
  `t()` function.

`L` switches both, live.

## The world is optional

`Keynote` loads `src/world/World.tsx` with a dynamic import and only mounts the
canvas when some scene has a `world` part or the show declares actors. A deck of
DOM slides therefore ships 360 kB of JS instead of 1.3 MB, and never creates a
WebGL context.

## Checks

- `scripts/check-talk.mjs`: bilingual strings, ids, required fields per layout,
  dashes.
- `scripts/check-i18n.mjs`: the chrome keys and dashes.
- `tsc`, `eslint`, `vite build`.

There is no test suite. Layout bugs are found in the browser: `npm run dev`,
then the debug panel (`D`) and `window.__checks` for overflow and overlap.
