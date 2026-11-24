// Exports one screenshot per slide and a REVIEW.md with one heading per slide.
// Annotate REVIEW.md with Plannotator: every comment then belongs to one slide.
//
//   npm run dev            (in another terminal)
//   npm run review:export  [-- --lang en] [-- --url http://localhost:5173]
//
// It needs agent-browser on the PATH. The output lives in review/ and is not committed.
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : fallback
}
const lang = arg('lang', 'es')
const base = arg('url', 'http://localhost:5173')
const outDir = resolve('review')
const session = 'deck-review'

const { talk } = await import(pathToFileURL(resolve('src/show/talk.ts')).href)
mkdirSync(outDir, { recursive: true })

const run = (...args) => spawnSync('agent-browser', args, { env: { ...process.env, AGENT_BROWSER_SESSION: session }, encoding: 'utf8' })
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
const pad = (n) => String(n).padStart(2, '0')
const text = (bi) => (bi ? bi[lang] : '')

run('set', 'viewport', '1600', '900')
const lines = [
  `# Revisión: ${text(talk.short)}`,
  '',
  `Idioma de las capturas: ${lang}. Una sección por diapositiva: comenta debajo del título que toca.`,
  '',
]

let n = 0
for (const chapter of talk.chapters) {
  for (const slide of chapter.slides) {
    n += 1
    const file = `${pad(n)}-${slide.id}.png`
    const lastStop = slide.layout === 'journey' ? 1 : 0
    run('open', `${base}/?lang=${lang}#/${chapter.id}/${slide.id}/${lastStop}`)
    run('reload')
    sleep(2800)
    run('screenshot', resolve(outDir, file))
    lines.push(`## ${pad(n)} · ${slide.id}`, '', `Capítulo \`${chapter.id}\` · layout \`${slide.layout}\``, '', `![${slide.id}](${file})`, '')
    if (slide.note) {
      lines.push('Notas del presentador:', '', ...text(slide.note).split('\n').map((l) => `- ${l}`), '')
    }
    lines.push('---', '')
    console.log(`${pad(n)} ${slide.id}`)
  }
}
run('close')
writeFileSync(resolve(outDir, 'REVIEW.md'), lines.join('\n'))
console.log(`\n${n} slides -> review/REVIEW.md`)
