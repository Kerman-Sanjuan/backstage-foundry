# Notice

This project is a derivative work of [CKGrafico/platform-slides](https://github.com/CKGrafico/platform-slides)
(Carlos, CKGrafico), used with the author's permission.

What comes from that repository:

- The keynote engine under `src/engine/`, `src/world/`, `src/animation/`,
  `src/svg/`, `src/shaders/`, `src/procedural/`, `src/perf/`, `src/debug/` and the
  base styles, with small changes: the world layer is loaded only when a show
  uses it, the presenter window takes bilingual notes, and the consent banner
  and analytics were removed.
- The writing and design skills under `.claude/skills/` (`simple-english`,
  `humanizer`, `design-taste-frontend`).
- The GitHub Pages workflow, adapted.

What is new here:

- The k3rman.com look (`src/show/deck.css`), the layout set
  (`src/show/layouts.tsx`), the talk format (`src/show/talk.ts`), the bilingual
  inline text and the checks (`scripts/check-talk.mjs`).

The original repository has no LICENSE file, so it is not open source in the
legal sense. Do not redistribute this baseline beyond the use the author
allowed. Self-hosted fonts are IBM Plex, SIL Open Font License 1.1
(`public/fonts/LICENSE.txt`).

## Icons

- The coloured Azure service icons in `public/icons/` come from Microsoft's Azure Architecture Icons set,
  which Microsoft allows in architecture diagrams and documentation.
- The Backstage and GitHub glyphs come from simple-icons (CC0). Their marks belong to their owners.
- The user and application glyphs come from Material Design Icons (Apache-2.0).
- `public/brand/azure-cloud-labs.svg` is the Azure Cloud Lab logo, taken from azurecloudlab.net. It belongs to the event.
- `public/brand/k3rman.png` is the k3rman mark.
