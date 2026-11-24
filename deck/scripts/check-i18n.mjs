// Checks the engine chrome (src/i18n/locales): the buttons, the presenter window.
// The talk itself is bilingual inline (src/show/talk.ts) and is checked by
// scripts/check-talk.mjs.
//
// Errors (they fail the build):
// - a key missing in one of the two locales, or an extra key
// - an en dash or an em dash in the text on screen
//
// Warnings (they do not fail the build):
// - a translation much longer or shorter than the English one. That matters in
//   fixed boxes, and the deck has none, so it is only a hint. Run
//   `npm run i18n:check -- --strict` to turn it into an error.
import { readFileSync } from 'node:fs'

const MAX_RATIO = 0.3
const MIN_SLACK = 4
const LOCALES = ['en', 'es']
const strict = process.argv.includes('--strict')

const load = (l) => JSON.parse(readFileSync(new URL(`../src/i18n/locales/${l}.json`, import.meta.url), 'utf8'))
const messages = Object.fromEntries(LOCALES.map((l) => [l, load(l)]))
const source = messages.en
const problems = []
const warnings = []

for (const l of LOCALES) {
  for (const key of Object.keys(messages[l])) {
    if (!(key in source)) problems.push(`${l}: extra key "${key}"`)
  }
}

for (const [key, text] of Object.entries(source)) {
  const base = [...text].length
  for (const l of LOCALES.filter((x) => x !== 'en')) {
    const other = messages[l][key]
    if (other === undefined) {
      problems.push(`${l}: missing key "${key}"`)
      continue
    }
    const len = [...other].length
    const diff = Math.abs(len - base)
    if (diff > MIN_SLACK && diff / base > MAX_RATIO) {
      const pct = Math.round(((len - base) / base) * 100)
      warnings.push(`${l}: "${key}" is ${len} chars vs ${base} in en (${pct > 0 ? '+' : ''}${pct}%)`)
    }
  }
}

for (const l of LOCALES) {
  for (const [key, text] of Object.entries(messages[l])) {
    if (/[–—]/.test(text)) problems.push(`${l}: "${key}" has an en dash or an em dash. Rewrite it.`)
  }
}

for (const warning of warnings) console.warn(`  warning: ${warning}`)
if (strict && warnings.length) problems.push(`${warnings.length} length mismatches (--strict)`)

if (problems.length) {
  console.error(`i18n check failed:\n  ${problems.join('\n  ')}`)
  process.exit(1)
}
console.log(`i18n check passed: ${Object.keys(source).length} keys, ${LOCALES.join(', ')}`)
