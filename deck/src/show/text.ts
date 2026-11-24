/**
 * Text in the deck is written twice, side by side: English and Spanish.
 *
 * A talk is one file (src/show/talk.ts) and every visible string is a `Bi`:
 * `{ en: 'One line', es: 'Una línea' }`. Writing both at once is the whole point:
 * you see the two lengths together and keep them close, so the layout holds in
 * both languages with no key bookkeeping. The engine chrome (buttons, presenter
 * window) still uses the small JSON files in src/i18n/locales.
 *
 * This file has no imports on purpose: the talk check (scripts/check-talk.mjs)
 * loads it with plain node.
 */
export interface Bi {
  en: string
  es: string
}

/** Builds a bilingual string. `bi('One line', 'Una línea')` reads better than an object. */
export const bi = (en: string, es: string): Bi => ({ en, es })
