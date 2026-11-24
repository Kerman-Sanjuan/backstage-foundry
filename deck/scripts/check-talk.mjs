// Checks the talk before every build. Run it alone with `npm run talk:check`.
//
// What it enforces:
// - Every bilingual string has both languages, non-empty, and no en dash or em dash.
// - The two languages are not wildly different in length (one more than 1.8x the other),
//   which is the practical sign that one of them was written as an afterthought.
// - Slide and chapter ids are unique and URL safe: they become the URL hash.
// - Every slide has an id, a known layout and speaker notes.
//
// It reads src/show/talk.ts directly with node's type stripping: no build needed.
import { pathToFileURL } from 'node:url'

const URL_BASE = new URL('../src/show/talk.ts', import.meta.url)
const LAYOUTS = ['cover', 'section', 'points', 'statement', 'stats', 'quote', 'code', 'split', 'steps', 'closing', 'diagram', 'screenshot', 'story', 'demo', 'about', 'journey', 'agenda', 'event']
const MAX_RATIO = 1.8
const problems = []
const warnings = []

let talk
try {
  ;({ talk } = await import(pathToFileURL(URL_BASE.pathname).href))
} catch (error) {
  console.error(`talk check failed: cannot load src/show/talk.ts\n  ${error.message}`)
  process.exit(1)
}

const isBi = (value) =>
  value !== null && typeof value === 'object' && typeof value.en === 'string' && typeof value.es === 'string'

/** Walks anything and calls fn on each bilingual string, with the path for the message. */
function walk(value, path, fn) {
  if (isBi(value)) return fn(value, path)
  if (Array.isArray(value)) return value.forEach((item, i) => walk(item, `${path}[${i}]`, fn))
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) walk(child, path ? `${path}.${key}` : key, fn)
  }
}

let strings = 0
walk(talk, '', (text, path) => {
  strings += 1
  const { en, es } = text
  if (!en.trim() || !es.trim()) problems.push(`${path}: one of the languages is empty`)
  for (const [locale, value] of Object.entries(text)) {
    if (/[–—]/.test(value)) problems.push(`${path}.${locale}: has an en dash or an em dash. Write a hyphen or a comma.`)
  }
  const short = Math.min(en.length, es.length)
  const long = Math.max(en.length, es.length)
  if (short > 12 && long / short > MAX_RATIO) {
    warnings.push(`${path}: en ${en.length} chars, es ${es.length} chars. Keep them closer (max ${MAX_RATIO}x).`)
  }
})

if (!talk || !Array.isArray(talk.chapters) || talk.chapters.length === 0) problems.push('talk.chapters is empty')
if (talk && !isBi(talk.short)) problems.push('talk.short must be bilingual')

const slideIds = new Set()
const chapterIds = new Set()
let slides = 0
let notes = 0

for (const chapter of talk?.chapters ?? []) {
  if (!chapter.id) problems.push('a chapter has no id')
  if (chapterIds.has(chapter.id)) problems.push(`chapter id "${chapter.id}" is used twice`)
  chapterIds.add(chapter.id)
  if (!/^[a-z0-9-]+$/.test(chapter.id ?? '')) problems.push(`chapter id "${chapter.id}" must be lowercase letters, digits and hyphens`)
  if (!Array.isArray(chapter.slides) || chapter.slides.length === 0) problems.push(`chapter "${chapter.id}" has no slides`)

  for (const slide of chapter.slides ?? []) {
    slides += 1
    const where = `${chapter.id}/${slide.id}`
    if (!slide.id) problems.push(`a slide in "${chapter.id}" has no id`)
    if (slideIds.has(slide.id)) problems.push(`slide id "${slide.id}" is used twice: it must be unique in the whole talk`)
    slideIds.add(slide.id)
    if (!/^[a-z0-9-]+$/.test(slide.id ?? '')) problems.push(`${where}: id must be lowercase letters, digits and hyphens`)
    if (!LAYOUTS.includes(slide.layout)) problems.push(`${where}: unknown layout "${slide.layout}"`)
    if (slide.note) notes += 1
    else warnings.push(`${where}: no speaker notes (note). The presenter window will be empty here.`)

    // Layout specific basics: a slide with a list and no items is a blank slide.
    if (slide.layout === 'points' && !(slide.items?.length > 0)) problems.push(`${where}: points needs items`)
    if (slide.layout === 'stats' && !(slide.stats?.length > 0)) problems.push(`${where}: stats needs stats`)
    if (slide.layout === 'steps' && !(slide.steps?.length > 0)) problems.push(`${where}: steps needs steps`)
    if (slide.layout === 'split' && !(slide.left?.items?.length && slide.right?.items?.length)) {
      problems.push(`${where}: split needs items on both sides`)
    }
    if (slide.layout === 'code' && !(slide.code?.lines?.length > 0)) problems.push(`${where}: code needs lines`)
    if (slide.layout === 'diagram') {
      const ids = new Set((slide.nodes ?? []).map((n) => n.id))
      if (ids.size === 0) problems.push(`${where}: diagram needs nodes`)
      for (const n of slide.nodes ?? []) {
        if (n.x < 0 || n.y < 0 || n.x + n.w > 160 || n.y + n.h > 60) problems.push(`${where}: node "${n.id}" is outside the 160 by 60 canvas`)
      }
      for (const e of slide.edges ?? []) {
        if (!ids.has(e.from) || !ids.has(e.to)) problems.push(`${where}: edge ${e.from} to ${e.to} points at a node that does not exist`)
      }
    }
    if (slide.layout === 'story' && !(slide.lanes?.length === 2)) problems.push(`${where}: story needs exactly two lanes`)
    if (slide.layout === 'agenda' && !(slide.items?.length > 0)) problems.push(`${where}: agenda needs items`)
    if (slide.layout === 'journey' && !(slide.trips?.length === 2)) problems.push(`${where}: journey needs exactly two trips`)
    if (slide.layout === 'demo' && !(slide.stops?.length > 0)) problems.push(`${where}: demo needs stops`)
    if (slide.layout === 'screenshot') {
      if (!slide.image) problems.push(`${where}: screenshot needs an image`)
      if (!(slide.callouts?.length > 0)) problems.push(`${where}: screenshot needs callouts`)
    }
    if (slide.layout === 'closing' && !(slide.links?.length > 0)) problems.push(`${where}: closing needs links`)
  }
}

// The cover is the slide everybody photographs. Keep the stop count honest.
if (slides > 40) warnings.push(`${slides} stops: a talk of that size is hard to keep in one head.`)

for (const warning of warnings) console.warn(`  warning: ${warning}`)

if (problems.length) {
  console.error(`talk check failed:\n  ${problems.join('\n  ')}`)
  process.exit(1)
}

console.log(`talk check passed: ${slides} slides, ${chapterIds.size} chapters, ${strings} bilingual strings, ${notes} with notes`)
