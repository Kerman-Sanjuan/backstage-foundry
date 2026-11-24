# slides

The baseline for my talks: a silent, presenter-driven web deck with the
k3rman.com look (gruvbox, IBM Plex, warm charcoal) and a small set of layouts.

A talk is one file. You write both languages side by side, pick a layout per
slide, and the checks fail the build when something is missing.

![Cover](docs/screens/en-02.png)

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Keys:

| Key | What it does |
|---|---|
| `→` `←` `space` | next and previous stop |
| `Shift` + arrows | jump a chapter |
| `L` | switch English and Spanish, live |
| `T` | switch dark and light, for a bright room |
| `P` | open the presenter window: notes, next slide and a clock |
| `D` | debug panel (development, or `?debug` in production) |
| `1`…`9` then `Enter` | jump to a stop |

The URL keeps the place: `#/flow/pipeline/0` is chapter `flow`, slide
`pipeline`, stop 0. A refresh comes back to it. `?lang=es` starts in Spanish.

## Make a talk

1. Edit `src/show/talk.ts`. That is the whole talk: chapters, slides, text in
   both languages, and the speaker notes of each slide.
2. Pick a layout for each slide (see [docs/authoring.md](docs/authoring.md)).
3. Run the checks:

```bash
npm run talk:check     # bilingual strings, ids, notes, layout fields
npm run i18n:check     # the engine chrome (buttons, presenter window)
npm run typecheck
npm run lint
npm run build
```

To start a new talk from scratch, copy the repo (it is a GitHub template) and
delete the slides in `talk.ts`. Keep one cover and one closing.

## Publish it

Every push to `main` publishes to GitHub Pages (`.github/workflows/deploy-pages.yml`).
The build takes its base path from Pages, so it also works under `/<repo>/`
without a custom domain. To serve it at `slides.k3rman.com`, add a `CNAME` file
with that name in `public/` and point the DNS record at Pages.

## What is inside

```
src/show/talk.ts      the talk: content, order, notes. The only file you edit
src/show/layouts.tsx  one component per layout, no styling
src/show/deck.css     the look: tokens, type, cards, terminal, spacing
src/show/index.ts     talk -> chapters and scenes (generated, do not edit)
src/show/notes.ts     the presenter page, generated from talk.ts
src/engine/           the engine: playhead, scenes, input, layers, presenter
src/world/            optional Three.js layer, loaded only if a slide uses it
src/i18n/locales/     the engine chrome in English and Spanish
```

The engine is silent on purpose: no audio, no video with sound, no analytics,
no third-party requests. Fonts are self-hosted, so the deck works offline at the
venue.

## Where this comes from

The engine is a derivative of [CKGrafico/platform-slides](https://github.com/CKGrafico/platform-slides),
used with the author's permission. See [NOTICE.md](NOTICE.md). The engine keeps
its rules; the content, the look and the layouts are mine.

## Docs

- [docs/authoring.md](docs/authoring.md): layouts, text rules, notes, screenshots
- [docs/architecture.md](docs/architecture.md): how the engine works, in one page
