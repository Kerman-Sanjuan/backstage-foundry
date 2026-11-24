/**
 * The layouts. One component per layout id in src/show/talk.ts, and nothing else.
 *
 * Every slide is the same shape: the scene root, the 16:9 stage, a padded deck
 * area and the chrome row (talk name left, stop number right). The layout only
 * fills the middle. The look lives in src/show/deck.css, not here.
 *
 * Motion: elements marked `.rv` fade up once, driven by the scene progress
 * (never by a timer), so the same playhead always gives the same picture.
 * With reduced motion the timeline is empty and everything is visible at once.
 */
import { useEffect, type ReactNode, type Ref, type RefObject } from 'react'
import { gsap } from '@/animation/gsap'
import { useSceneTimeline } from '@/animation/useSceneTimeline'
import { useScene } from '@/engine/context'
import { Stage } from '@/engine/Stage'
import type { Bi } from './text'
import { useBi } from './use-text'
import { glyphs } from './icons'
import type { DiagramEdge, DiagramNode, Side, Slide } from './talk'

export interface SlideMeta {
  /** 1-based position of this slide in the whole talk. */
  index: number
  total: number
  short: Bi
}

type CoverSlide = Extract<Slide, { layout: 'cover' }>
type SectionSlide = Extract<Slide, { layout: 'section' }>
type PointsSlide = Extract<Slide, { layout: 'points' }>
type StatementSlide = Extract<Slide, { layout: 'statement' }>
type StatsSlide = Extract<Slide, { layout: 'stats' }>
type QuoteSlide = Extract<Slide, { layout: 'quote' }>
type CodeSlide = Extract<Slide, { layout: 'code' }>
type SplitSlide = Extract<Slide, { layout: 'split' }>
type StepsSlide = Extract<Slide, { layout: 'steps' }>
type ClosingSlide = Extract<Slide, { layout: 'closing' }>
type DiagramSlide = Extract<Slide, { layout: 'diagram' }>
type ScreenshotSlide = Extract<Slide, { layout: 'screenshot' }>
type StorySlide = Extract<Slide, { layout: 'story' }>
type DemoSlide = Extract<Slide, { layout: 'demo' }>
type AboutSlide = Extract<Slide, { layout: 'about' }>
type JourneySlide = Extract<Slide, { layout: 'journey' }>
type AgendaSlide = Extract<Slide, { layout: 'agenda' }>
type EventSlide = Extract<Slide, { layout: 'event' }>

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The one motion rule of the deck: the `.rv` elements rise in, in DOM order.
 * `hidden: false` keeps them opaque from the first frame, which is what the cover
 * needs: the deck is loaded on the projector and the title must already be there.
 */
function useReveal(hidden = true) {
  const { reducedMotion } = useScene()
  return useSceneTimeline(
    (tl) => {
      if (reducedMotion) return
      tl.fromTo(
        '.rv',
        { y: hidden ? 22 : 14, opacity: hidden ? 0 : 1 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' },
        0,
      )
    },
    [reducedMotion, hidden],
  )
}

/** The two small marks, bottom right: the event and the speaker. Replace the files in public/brand/ to change them. */
function Brand() {
  const base = import.meta.env.BASE_URL
  return (
    <div className="brand" aria-hidden="true">
      <img className="brand-event" src={`${base}brand/azure-cloud-labs.svg`} alt="" />
      <span className="brand-sep" />
      <img className="brand-me" src={`${base}brand/k3rman.png`} alt="" />
    </div>
  )
}

function Frame({ children, scope, className }: { children: ReactNode; scope: Ref<HTMLDivElement>; className?: string }) {
  return (
    <div className={`scene-root slide ${className ?? ''}`} ref={scope}>
      <Stage>
        <div className="deck">
          {children}
          {className?.includes('slide--cover') || className?.includes('slide--event') ? null : <Brand />}
        </div>
      </Stage>
    </div>
  )
}

function Chrome({ meta }: { meta: SlideMeta }) {
  const t = useBi()
  return (
    <header className="chrome rv">
      <span className="chrome-mark" aria-hidden="true" />
      <span className="chrome-label">{t(meta.short)}</span>
      <span className="chrome-count">
        {pad(meta.index)}
        <span className="chrome-sep">/</span>
        {pad(meta.total)}
      </span>
    </header>
  )
}

function Title({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={`title ${className ?? ''} rv`}>{children}</h1>
}

function Lead({ text }: { text?: Bi }) {
  const t = useBi()
  return text ? <p className="lead rv">{t(text)}</p> : null
}

/** A big icon in the page: a glyph follows the theme, an Azure icon is an image. */
function BigIcon({ name, className, reveal }: { name: string; className: string; reveal?: boolean }) {
  const glyph = glyphs[name]
  const rv = reveal ? ' rv' : ''
  if (glyph) {
    return (
      <svg className={`${className} ${className}--glyph${rv}`} viewBox="0 0 24 24" aria-hidden="true">
        <path d={glyph.d} />
      </svg>
    )
  }
  return <img className={`${className}${rv}`} src={`${import.meta.env.BASE_URL}icons/${name}.svg`} alt="" />
}

/* ---------------------------------------------------------------- cover --- */

export function CoverLayout({ slide, meta }: { slide: CoverSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal(false)
  return (
    <Frame scope={scope} className="slide--cover">
      <div className="cover-top rv">
        <span className="kicker">{t(slide.kicker)}</span>
        <span className="cover-stop">
          {pad(meta.index)}
          <span className="chrome-sep">/</span>
          {pad(meta.total)}
        </span>
      </div>
      <div className="cover-body">
        <div className="cover-main">
          <h1 className="cover-title rv">{t(slide.title)}</h1>
          {slide.lead ? <p className="cover-lead rv">{t(slide.lead)}</p> : null}
          <div className="cover-foot rv">
            {slide.byline ? <span className="cover-byline">{t(slide.byline)}</span> : null}
            {slide.role ? <span className="cover-role">{t(slide.role)}</span> : null}
            {slide.venue ? <span className="cover-venue">{t(slide.venue)}</span> : null}
          </div>
        </div>
        {slide.terminal ? (
          <aside className="terminal rv">
            <div className="terminal-bar">
              <span className="terminal-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="terminal-title">{t(slide.terminal.title)}</span>
            </div>
            <pre>
              {slide.terminal.lines.map((line) => (
                <span key={line} className={line.startsWith('$') ? 'term-cmd' : 'term-out'}>
                  {line}
                  {'\n'}
                </span>
              ))}
            </pre>
          </aside>
        ) : null}
      </div>
    </Frame>
  )
}

/* -------------------------------------------------------------- section --- */

export function SectionLayout({ slide, meta }: { slide: SectionSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  return (
    <Frame scope={scope} className="slide--section">
      <Chrome meta={meta} />
      <div className="section-body">
        <span className="section-number rv">{slide.number}</span>
        <div className="section-text">
          <Title className="title--section">{t(slide.title)}</Title>
          <Lead text={slide.lead} />
        </div>
        {slide.icon ? <BigIcon name={slide.icon} className="section-icon" reveal /> : null}
      </div>
    </Frame>
  )
}

/* --------------------------------------------------------------- points --- */

export function PointsLayout({ slide, meta }: { slide: PointsSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  const columns = slide.items.length === 3 ? 'points--three' : ''
  return (
    <Frame scope={scope}>
      <Chrome meta={meta} />
      <div className="head">
        <Title>{t(slide.title)}</Title>
        <Lead text={slide.lead} />
      </div>
      <ul className={`points ${columns}`}>
        {slide.items.map((item, i) => (
          <li className="point rv" key={item.text.en}>
            {item.icon ? <BigIcon name={item.icon} className="point-icon" /> : <span className="point-index">{pad(i + 1)}</span>}
            {item.title ? <h2 className="point-title">{t(item.title)}</h2> : null}
            <p className="point-text">{t(item.text)}</p>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

/* ------------------------------------------------------------ statement --- */

export function StatementLayout({ slide, meta }: { slide: StatementSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  return (
    <Frame scope={scope} className="slide--statement">
      <Chrome meta={meta} />
      <div className="statement">
        <p className="statement-text rv">{t(slide.text)}</p>
        {slide.attribution ? <p className="statement-attr rv">{t(slide.attribution)}</p> : null}
      </div>
    </Frame>
  )
}

/* ---------------------------------------------------------------- stats --- */

export function StatsLayout({ slide, meta }: { slide: StatsSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  return (
    <Frame scope={scope}>
      <Chrome meta={meta} />
      <div className="head">
        <Title>{t(slide.title)}</Title>
        <Lead text={slide.lead} />
      </div>
      <dl className="stats">
        {slide.stats.map((stat) => (
          <div className="stat rv" key={stat.label.en}>
            <dt className="stat-label">{t(stat.label)}</dt>
            <dd className="stat-value">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </Frame>
  )
}

/* ---------------------------------------------------------------- quote --- */

export function QuoteLayout({ slide, meta }: { slide: QuoteSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  return (
    <Frame scope={scope} className="slide--quote">
      <Chrome meta={meta} />
      <div className="quote">
        <blockquote className="quote-text rv">{t(slide.text)}</blockquote>
        <div className="quote-by rv">
          <span className="quote-author">{t(slide.author)}</span>
          {slide.role ? <span className="quote-role">{t(slide.role)}</span> : null}
        </div>
      </div>
    </Frame>
  )
}

/* ----------------------------------------------------------------- code --- */

export function CodeLayout({ slide, meta }: { slide: CodeSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  const mark = new Set(slide.code.highlight ?? [])
  return (
    <Frame scope={scope}>
      <Chrome meta={meta} />
      <div className="head head--tight">
        <Title>{t(slide.title)}</Title>
        <Lead text={slide.lead} />
      </div>
      <div className="code-body">
        <div className="terminal terminal--big rv">
          <div className="terminal-bar">
            <span className="terminal-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="terminal-title">{t(slide.code.title)}</span>
          </div>
          <pre>
            {slide.code.lines.map((line, i) => (
              <span key={`${i}-${line}`} className={mark.has(i) ? 'term-hl' : undefined}>
                {line || ' '}
                {'\n'}
              </span>
            ))}
          </pre>
        </div>
      </div>
    </Frame>
  )
}

/* ---------------------------------------------------------------- split --- */

export function SplitLayout({ slide, meta }: { slide: SplitSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  return (
    <Frame scope={scope}>
      <Chrome meta={meta} />
      <div className="head">
        <Title>{t(slide.title)}</Title>
        <Lead text={slide.lead} />
      </div>
      <div className="split">
        {[slide.left, slide.right].map((column, i) => (
          <section className={`panel ${i === 1 ? 'panel--accent' : ''} rv`} key={column.title.en}>
            <h2 className="panel-title">{t(column.title)}</h2>
            <ul className="panel-list">
              {column.items.map((item) => (
                <li key={item.en}>{t(item)}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Frame>
  )
}

/* ---------------------------------------------------------------- steps --- */

export function StepsLayout({ slide, meta }: { slide: StepsSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  return (
    <Frame scope={scope}>
      <Chrome meta={meta} />
      <div className="head">
        <Title>{t(slide.title)}</Title>
        <Lead text={slide.lead} />
      </div>
      <ol className="steps" style={{ gridTemplateColumns: `repeat(${slide.steps.length}, minmax(0, 1fr))` }}>
        {slide.steps.map((step, i) => (
          <li className="step rv" key={step.label.en}>
            <span className="step-num">{i + 1}</span>
            <h2 className="step-label">{t(step.label)}</h2>
            {step.text ? <p className="step-text">{t(step.text)}</p> : null}
          </li>
        ))}
      </ol>
    </Frame>
  )
}

/* -------------------------------------------------------------- closing --- */

export function ClosingLayout({ slide, meta }: { slide: ClosingSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  return (
    <Frame scope={scope} className="slide--closing">
      <Chrome meta={meta} />
      <div className="closing">
        <Title className="title--closing">{t(slide.title)}</Title>
        <Lead text={slide.lead} />
        <ul className="links">
          {slide.links.map((link) => (
            <li className="link rv" key={link.value}>
              <span className="link-label">{t(link.label)}</span>
              <span className="link-value">{link.value}</span>
            </li>
          ))}
        </ul>
        <div className="closing-foot rv">
          {slide.byline ? <span className="cover-byline">{t(slide.byline)}</span> : null}
          {slide.role ? <span className="cover-role">{t(slide.role)}</span> : null}
        </div>
      </div>
    </Frame>
  )
}

/* -------------------------------------------------------------- diagram --- */

type Point = [number, number]

interface Route {
  pts: Point[]
  /** Where the label sits. */
  lx: number
  ly: number
}

const horizontal = (side: Side) => side === 'l' || side === 'r'

function overlap(a0: number, a1: number, b0: number, b1: number): [number, number] | null {
  const lo = Math.max(a0, b0)
  const hi = Math.min(a1, b1)
  return hi - lo > 2 ? [lo, hi] : null
}

/** The sides an edge leaves and enters, when the author did not say. */
function pickSides(a: DiagramNode, b: DiagramNode): [Side, Side] {
  if (overlap(a.x, a.x + a.w, b.x, b.x + b.w)) return a.y < b.y ? ['b', 't'] : ['t', 'b']
  if (overlap(a.y, a.y + a.h, b.y, b.y + b.h)) return a.x < b.x ? ['r', 'l'] : ['l', 'r']
  const dx = b.x + b.w / 2 - (a.x + a.w / 2)
  const dy = b.y + b.h / 2 - (a.y + a.h / 2)
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? ['r', 'l'] : ['l', 'r']
  return dy > 0 ? ['b', 't'] : ['t', 'b']
}

interface End {
  node: DiagramNode
  other: DiagramNode
  side: Side
  /** Where along the side the line attaches: y for l and r, x for t and b. */
  at: number
}

/** Where a line would like to attach: straight across when the two boxes face each other, else the middle. */
function wanted(node: DiagramNode, other: DiagramNode, side: Side): number {
  if (horizontal(side)) {
    const o = overlap(node.y, node.y + node.h, other.y, other.y + other.h)
    return o ? (o[0] + o[1]) / 2 : node.y + node.h / 2
  }
  const o = overlap(node.x, node.x + node.w, other.x, other.x + other.w)
  return o ? (o[0] + o[1]) / 2 : node.x + node.w / 2
}

/**
 * Plans every line of a diagram. Lines that share a side of a box get their own attachment points, so arrows
 * never pile up on one spot; a lone line stays straight when the boxes face each other.
 */
function planRoutes(nodes: Map<string, DiagramNode>, edges: DiagramEdge[]): Array<Route | null> {
  const ends: Array<[End, End] | null> = edges.map((edge) => {
    const a = nodes.get(edge.from)
    const b = nodes.get(edge.to)
    if (!a || !b) return null
    const [fs, ts] = edge.fromSide && edge.toSide ? [edge.fromSide, edge.toSide] : pickSides(a, b)
    return [
      { node: a, other: b, side: fs, at: wanted(a, b, fs) },
      { node: b, other: a, side: ts, at: wanted(b, a, ts) },
    ]
  })
  // Group the ends by box and side, and spread the ones that would sit too close.
  const groups = new Map<string, End[]>()
  for (const pair of ends) {
    if (!pair) continue
    for (const end of pair) {
      const key = `${end.node.id}:${end.side}`
      groups.set(key, [...(groups.get(key) ?? []), end])
    }
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue
    const sorted = [...group].sort((x, y) => (horizontal(x.side) ? x.other.y + x.other.h / 2 - (y.other.y + y.other.h / 2) : x.other.x + x.other.w / 2 - (y.other.x + y.other.w / 2)))
    const ats = sorted.map((e) => e.at).sort((x, y) => x - y)
    const tooClose = ats.some((v, i) => i > 0 && v - ats[i - 1]! < 3.4)
    if (!tooClose) continue
    const node = sorted[0]!.node
    const [lo, len] = horizontal(sorted[0]!.side) ? [node.y, node.h] : [node.x, node.w]
    sorted.forEach((end, i) => {
      end.at = lo + ((i + 1) * len) / (sorted.length + 1)
    })
  }
  // The end points, and which lines would run side by side.
  const geo = ends.map((pair) => {
    if (!pair) return null
    const [from, to] = pair
    const p1: Point = horizontal(from.side) ? [from.side === 'r' ? from.node.x + from.node.w : from.node.x, from.at] : [from.at, from.side === 'b' ? from.node.y + from.node.h : from.node.y]
    const p2: Point = horizontal(to.side) ? [to.side === 'r' ? to.node.x + to.node.w : to.node.x, to.at] : [to.at, to.side === 'b' ? to.node.y + to.node.h : to.node.y]
    const h1 = horizontal(from.side)
    const h2 = horizontal(to.side)
    const axis = h1 && h2 ? 0 : !h1 && !h2 ? 1 : -1
    // How far the line has to bend, across its main direction. A straight line has no channel to share.
    const bend = axis === 0 ? p2[1] - p1[1] : axis === 1 ? p2[0] - p1[0] : 0
    return { p1, p2, h1, h2, axis, bend: Math.abs(bend) < 0.01 ? 0 : bend, srcKey: `${from.node.id}:${from.side}`, dstKey: `${to.node.id}:${to.side}` }
  })
  // Lines that leave (or enter) the same side and bend get a channel each, so no two share a stretch of wire.
  // The line that bends the most takes the channel nearest to where the group starts, which keeps them from crossing.
  const shift = new Map<number, number>()
  for (const kind of ['src', 'dst'] as const) {
    const byKey = new Map<string, number[]>()
    geo.forEach((g, i) => {
      if (!g || g.axis < 0 || g.bend === 0 || shift.has(i)) return
      const key = kind === 'src' ? g.srcKey : g.dstKey
      byKey.set(key, [...(byKey.get(key) ?? []), i])
    })
    for (const members of byKey.values()) {
      if (members.length < 2) continue
      const ranked = [...members].sort((x, y) => Math.abs(geo[y]!.bend) - Math.abs(geo[x]!.bend))
      ranked.forEach((i, r) => {
        const g = geo[i]!
        const main = g.axis === 0 ? [g.p1[0], g.p2[0]] : [g.p1[1], g.p2[1]]
        const gap = Math.abs(main[1]! - main[0]!)
        const step = Math.min(2.4, (gap * 0.7) / members.length)
        const dir = Math.sign(main[1]! - main[0]!) || 1
        const off = (r - (members.length - 1) / 2) * step * dir
        shift.set(i, kind === 'src' ? off : -off)
      })
    }
  }
  return geo.map((g, i) => {
    if (!g) return null
    const { p1, p2, h1, h2 } = g
    const off = shift.get(i) ?? 0
    let pts: Point[]
    if (h1 && h2) {
      const mx = (p1[0] + p2[0]) / 2 + off
      pts = [p1, [mx, p1[1]], [mx, p2[1]], p2]
    } else if (!h1 && !h2) {
      const my = (p1[1] + p2[1]) / 2 + off
      pts = [p1, [p1[0], my], [p2[0], my], p2]
    } else if (h1) {
      pts = [p1, [p2[0], p1[1]], p2]
    } else {
      pts = [p1, [p1[0], p2[1]], p2]
    }
    // The label sits on the longest straight part.
    let best = 0
    let lx = p1[0]
    let ly = p1[1]
    for (let k = 1; k < pts.length; k++) {
      const len = Math.hypot(pts[k]![0] - pts[k - 1]![0], pts[k]![1] - pts[k - 1]![1])
      if (len > best) {
        best = len
        lx = (pts[k]![0] + pts[k - 1]![0]) / 2
        ly = (pts[k]![1] + pts[k - 1]![1]) / 2
      }
    }
    return { pts, lx, ly }
  })
}

/** The path, without repeated points, and the direction of its last segment in degrees. */
function shape(pts: Point[]): { d: string; end: Point; angle: number } {
  const clean = pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1]![0] || p[1] !== pts[i - 1]![1])
  const last = clean[clean.length - 1]!
  const before = clean[clean.length - 2] ?? last
  return {
    d: clean.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(''),
    end: last,
    angle: (Math.atan2(last[1] - before[1], last[0] - before[0]) * 180) / Math.PI,
  }
}

function Lines({ text, x, y, step, className }: { text: string; x: number; y: number; step: number; className: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <text key={`${i}-${line}`} className={className} x={x} y={y + step * i}>
          {line}
        </text>
      ))}
    </>
  )
}

const ICON = 7

function Icon({ name, x, y, size = ICON }: { name: string; x: number; y: number; size?: number }) {
  const glyph = glyphs[name]
  if (glyph) {
    return (
      <svg className="dg-glyph" x={x} y={y} width={size} height={size} viewBox="0 0 24 24">
        <path d={glyph.d} />
      </svg>
    )
  }
  return <image href={`${import.meta.env.BASE_URL}icons/${name}.svg`} x={x} y={y} width={size} height={size} />
}

function DiagramBox({ node }: { node: DiagramNode }) {
  const t = useBi()
  const tone = node.tone ?? 'plain'
  const label = t(node.label)
  if (tone === 'zone') {
    return (
      <g className={`dg-zone dg-zone--${node.accent ?? 'plain'} dg-item`}>
        <rect x={node.x} y={node.y} width={node.w} height={node.h} rx={1.6} />
        {node.icon ? <Icon name={node.icon} x={node.x + 2.2} y={node.y + 1.1} size={5.4} /> : null}
        <text className="dg-zone-label" x={node.x + (node.icon ? 5.4 + 3.6 : 2.2)} y={node.y + 4.6}>
          {label}
        </text>
      </g>
    )
  }
  const sub = node.sub ? t(node.sub) : ''
  const nl = label.split('\n').length
  const ns = sub ? sub.split('\n').length : 0
  const LH = 4.3
  const SH = 3.1
  const total = nl * LH + ns * SH + (ns ? 0.6 : 0)
  // Tall boxes put the icon on top and the text under it; short ones put the icon on the left.
  const stacked = Boolean(node.icon) && node.h >= 18
  const iconY = node.y + 2.4
  const y0 = stacked ? node.y + ICON + 4 + (node.h - ICON - 4 - total) / 2 : node.y + node.h / 2 - total / 2
  const shift = node.icon && !stacked ? (ICON + 2.4) / 2 : 0
  const cx = node.x + node.w / 2 + shift
  return (
    <g className={`dg-node dg-node--${tone} dg-item`}>
      {tone === 'clay' || tone === 'sage' || tone === 'sky' ? <rect className="dg-glow" x={node.x - 0.6} y={node.y - 0.6} width={node.w + 1.2} height={node.h + 1.2} rx={2} /> : null}
      <rect x={node.x} y={node.y} width={node.w} height={node.h} rx={1.4} />
      {node.icon ? (
        <Icon name={node.icon} x={stacked ? node.x + node.w / 2 - ICON / 2 : node.x + 2.4} y={stacked ? iconY : node.y + node.h / 2 - ICON / 2} />
      ) : null}
      <Lines text={label} x={cx} y={y0 + LH * 0.78} step={LH} className="dg-label" />
      {sub ? <Lines text={sub} x={cx} y={y0 + nl * LH + 0.6 + SH * 0.78} step={SH} className="dg-sub" /> : null}
    </g>
  )
}

export function DiagramLayout({ slide, meta }: { slide: DiagramSlide; meta: SlideMeta }) {
  const t = useBi()
  const { reducedMotion } = useScene()
  const scope: RefObject<HTMLDivElement | null> = useSceneTimeline(
    (tl) => {
      if (reducedMotion) return
      tl.fromTo('.rv', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, 0)
      // 1. The boxes come in, the zones first.
      tl.fromTo('.dg-box', { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: { amount: 0.26 }, ease: 'power2.out' }, 0.08)
      // 2. The lines draw themselves, one after the other, and the arrow head lands at the end.
      const edges = Array.from(scope.current?.querySelectorAll<SVGGElement>('.dg-edge-group') ?? [])
      edges.forEach((group, i) => {
        const path = group.querySelector<SVGPathElement>('.dg-edge')
        const head = group.querySelector('.dg-head')
        const label = group.querySelector('.dg-edge-label')
        if (!path) return
        const start = 0.34 + (i * 0.3) / Math.max(edges.length, 1)
        const span = Math.max(0.1, 0.3 / Math.max(edges.length, 1) + 0.05)
        if (path.classList.contains('dg-edge--dashed')) {
          tl.fromTo(group, { opacity: 0 }, { opacity: 1, duration: span }, start)
          return
        }
        tl.fromTo(group, { opacity: 0 }, { opacity: 1, duration: 0.02 }, start)
        tl.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: span, ease: 'power1.inOut' }, start)
        if (head) tl.fromTo(head, { opacity: 0 }, { opacity: 1, duration: 0.03 }, start + span - 0.03)
        if (label) tl.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.05 }, start + span * 0.5)
      })
      // 3. A packet runs along every line, to show the direction of the traffic.
      edges.forEach((group, i) => {
        const path = group.querySelector<SVGPathElement>('.dg-edge')
        const dot = group.querySelector<SVGCircleElement>('.dg-packet')
        if (!path || !dot) return
        const length = path.getTotalLength()
        const state = { t: 0 }
        tl.fromTo(
          state,
          { t: 0 },
          {
            t: 1,
            duration: 0.12,
            ease: 'none',
            onUpdate: () => {
              const point = path.getPointAtLength(state.t * length)
              dot.setAttribute('cx', String(point.x))
              dot.setAttribute('cy', String(point.y))
              dot.style.opacity = state.t > 0 && state.t < 1 ? '1' : '0'
            },
          },
          0.7 + (i * 0.2) / Math.max(edges.length, 1),
        )
      })
    },
    [reducedMotion],
  )
  const { runtime } = useScene()
  // Once the slide has finished drawing, the packets keep running their lines. This is the one thing in the
  // deck that runs on a clock, and it only runs while this slide is on screen and complete.
  useEffect(() => {
    if (reducedMotion) return
    let tweens: gsap.core.Tween[] = []
    const stop = () => {
      if (tweens.length === 0) return
      tweens.forEach((tw) => tw.kill())
      tweens = []
      scope.current?.querySelectorAll<SVGCircleElement>('.dg-packet').forEach((dot) => {
        dot.style.opacity = '0'
      })
    }
    const start = () => {
      if (tweens.length > 0) return
      const groups = Array.from(scope.current?.querySelectorAll<SVGGElement>('.dg-edge-group') ?? [])
      groups.forEach((group, i) => {
        const path = group.querySelector<SVGPathElement>('.dg-edge')
        const dot = group.querySelector<SVGCircleElement>('.dg-packet')
        if (!path || !dot || path.classList.contains('dg-edge--dashed')) return
        const length = path.getTotalLength()
        const state = { t: 0 }
        tweens.push(
          gsap.fromTo(
            state,
            { t: 0 },
            {
              t: 1,
              duration: Math.max(1.2, length / 28),
              ease: 'none',
              repeat: -1,
              repeatDelay: 0.6,
              delay: (i * 0.4) % 1.6,
              onUpdate: () => {
                const point = path.getPointAtLength(state.t * length)
                dot.setAttribute('cx', String(point.x))
                dot.setAttribute('cy', String(point.y))
                dot.style.opacity = state.t > 0.02 && state.t < 0.98 ? '1' : '0'
              },
            },
          ),
        )
      })
    }
    const off = runtime.onProgress((local, outro) => {
      if (runtime.state === 'active' && local >= 0.999 && outro === 0) start()
      else stop()
    })
    return () => {
      off()
      stop()
    }
  }, [runtime, reducedMotion, scope])
  const routes = planRoutes(new Map(slide.nodes.map((n) => [n.id, n])), slide.edges ?? [])
  const zones = slide.nodes.filter((n) => n.tone === 'zone')
  const boxes = slide.nodes.filter((n) => n.tone !== 'zone')
  return (
    <Frame scope={scope}>
      <Chrome meta={meta} />
      <div className="head head--tight">
        <Title>{t(slide.title)}</Title>
        <Lead text={slide.lead} />
      </div>
      <div className="diagram">
        <svg viewBox="0 0 160 60" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t(slide.title)}>
          {[...zones, ...boxes].map((n) => (
            <g key={n.id} className="dg-box">
              <DiagramBox node={n} />
            </g>
          ))}
          {(slide.edges ?? []).map((edge: DiagramEdge, ei) => {
            const r = routes[ei]
            if (!r) return null
            const { d, end, angle } = shape(r.pts)
            const tone = edge.tone ? `dg-edge--${edge.tone}` : ''
            return (
              <g key={`${edge.from}-${edge.to}`} className="dg-edge-group">
                <path className={`dg-edge ${tone} ${edge.dashed ? 'dg-edge--dashed' : ''}`} d={d} />
                <path className={`dg-head ${tone}`} d="M-2 -1.05L0 0L-2 1.05z" transform={`translate(${end[0]} ${end[1]}) rotate(${angle})`} />
                {edge.label ? (
                  <text className="dg-edge-label" x={r.lx} y={r.ly + 0.7}>
                    {t(edge.label)}
                  </text>
                ) : null}
                <circle className="dg-packet" r={1.1} cx={0} cy={0} />
              </g>
            )
          })}
        </svg>
        {slide.caption ? <p className="diagram-caption rv">{t(slide.caption)}</p> : null}
      </div>
    </Frame>
  )
}

/* ----------------------------------------------------------- screenshot --- */

export function ScreenshotLayout({ slide, meta }: { slide: ScreenshotSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  return (
    <Frame scope={scope}>
      <Chrome meta={meta} />
      <div className="head head--tight">
        <Title>{t(slide.title)}</Title>
        <Lead text={slide.lead} />
      </div>
      <div className="shot-body">
        <div className="shot-frame rv">
          <div className="shot-bar">
            <span className="terminal-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="shot-url">{slide.url}</span>
          </div>
          <div className="shot-img">
            <img src={`${import.meta.env.BASE_URL}${slide.image}`} alt="" />
            {slide.callouts.map((c, i) => (
              <span key={c.title.en} className="shot-pin" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
                {i + 1}
              </span>
            ))}
          </div>
        </div>
        <ol className="shot-notes">
          {slide.callouts.map((c, i) => (
            <li className="shot-note rv" key={c.title.en}>
              <span className="shot-note-n">{i + 1}</span>
              <h2 className="shot-note-title">{t(c.title)}</h2>
              <p className="shot-note-text">{t(c.text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </Frame>
  )
}

/* ---------------------------------------------------------------- story --- */

/**
 * Two lanes for the same task. The slow lane fills step by step across the whole slide,
 * the fast lane finishes early and waits. Nobody reads a number: the length is the argument.
 */
export function StoryLayout({ slide, meta }: { slide: StorySlide; meta: SlideMeta }) {
  const t = useBi()
  const { reducedMotion } = useScene()
  const scope: RefObject<HTMLDivElement | null> = useSceneTimeline(
    (tl) => {
      if (reducedMotion) return
      tl.fromTo('.rv', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, 0)
      scope.current?.querySelectorAll<HTMLElement>('.story .lane').forEach((lane) => {
        const fast = lane.classList.contains('lane--fast')
        const span = fast ? 0.34 : 0.78
        const chips = lane.querySelectorAll('.chip')
        const bar = lane.querySelector('.lane-bar i')
        tl.fromTo(chips, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out', stagger: { amount: span - 0.1 } }, 0.16)
        if (bar) tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: span, ease: 'none' }, 0.16)
      })
    },
    [reducedMotion],
  )
  return (
    <Frame scope={scope}>
      <Chrome meta={meta} />
      <div className="head head--tight">
        <Title>{t(slide.title)}</Title>
        <Lead text={slide.lead} />
      </div>
      <div className="story">
        {slide.lanes.map((lane) => {
          const cols = lane.steps.length + 1
          return (
            <section className={`lane lane--${lane.pace}`} key={lane.name.en}>
              <h2 className="lane-name rv">{t(lane.name)}</h2>
              <div className="lane-track" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                <div className="lane-bar" aria-hidden="true">
                  <i />
                </div>
                {lane.steps.map((step, i) => (
                  <div className={`chip ${step.wait ? 'chip--wait' : ''}`} key={step.label.en}>
                    <span className="chip-n">{pad(i + 1)}</span>
                    <span className="chip-text">{t(step.label)}</span>
                  </div>
                ))}
                <div className="chip chip--result">
                  <span className="chip-n">{pad(lane.steps.length + 1)}</span>
                  <span className="chip-text">{t(lane.result)}</span>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </Frame>
  )
}

/* ----------------------------------------------------------------- demo --- */

export function DemoLayout({ slide, meta }: { slide: DemoSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  return (
    <Frame scope={scope}>
      <Chrome meta={meta} />
      <div className="head head--tight">
        <span className="demo-live rv">
          <i aria-hidden="true" />
          {t({ en: 'Live demo', es: 'Demo en vivo' })}
        </span>
        <Title>{t(slide.title)}</Title>
        <Lead text={slide.lead} />
      </div>
      <ol className="demo-list">
        {slide.stops.map((stop, i) => (
          <li className="demo-row rv" key={stop.text.en}>
            <span className="demo-n">{pad(i + 1)}</span>
            <span className="demo-where">{stop.where}</span>
            <span className="demo-text">{t(stop.text)}</span>
          </li>
        ))}
      </ol>
      {slide.fallback ? <p className="demo-fallback rv">{t(slide.fallback)}</p> : null}
    </Frame>
  )
}

/* ---------------------------------------------------------------- about --- */

export function AboutLayout({ slide, meta }: { slide: AboutSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  return (
    <Frame scope={scope} className="slide--about">
      <Chrome meta={meta} />
      <div className="about">
        <div className="about-who rv">
          <img className="about-photo" src={`${import.meta.env.BASE_URL}${slide.photo}`} alt={slide.name} />
          <h1 className="about-name">{slide.name}</h1>
          <p className="about-role">{t(slide.role)}</p>
        </div>
        <div className="about-main">
          <p className="about-bio rv">{t(slide.bio)}</p>
          {slide.facts ? (
            <dl className="about-facts">
              {slide.facts.map((fact) => (
                <div className="about-fact rv" key={fact.label.en}>
                  <dt>{t(fact.label)}</dt>
                  <dd>{t(fact.text)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <ul className="about-tags rv">
            {slide.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <ul className="about-links rv">
            {slide.links.map((link) => (
              <li key={link.value}>
                <span>{t(link.label)}</span>
                {link.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Frame>
  )
}

/* -------------------------------------------------------------- journey --- */

/** A small person, feet on the origin. The same one walks every lane. */
function Doll() {
  return (
    <g className="doll">
      <rect className="doll-pants" x={-1.7} y={-3.2} width={1.4} height={3.2} rx={0.5} />
      <rect className="doll-pants" x={0.3} y={-3.2} width={1.4} height={3.2} rx={0.5} />
      <path className="doll-arm" d="M-2.5 -6.6L-3.7 -4M2.5 -6.6L3.7 -4" />
      <rect className="doll-shirt" x={-2.5} y={-7.6} width={5} height={4.8} rx={1.5} />
      <circle className="doll-skin" cx={0} cy={-9.8} r={2.2} />
      <path className="doll-hair" d="M-2.3 -10a2.3 2.3 0 0 1 4.6 0c-1.2-.9-3.4-.9-4.6 0z" />
      <path className="doll-smile" d="M-0.9 -9a1.2 1.2 0 0 0 1.8 0" />
    </g>
  )
}

/** What stands at a stop. Drawn on a baseline, about nine units tall. */
function Prop({ name }: { name: string }) {
  switch (name) {
    case 'ticket':
      return (
        <g className="prop prop--ticket">
          <rect x={-4.2} y={-7.6} width={8.4} height={5.8} rx={0.8} />
          <path d="M-2.2 -5.6h4.4M-2.2 -4h2.6" />
          <circle cx={-4.2} cy={-4.7} r={0.9} className="prop-cut" />
          <circle cx={4.2} cy={-4.7} r={0.9} className="prop-cut" />
        </g>
      )
    case 'hourglass':
      return (
        <g className="prop prop--glass">
          <g className="hg">
            <path d="M-3 -9h6M-3 0h6M-2.4 -9c0 3 2.4 3.4 2.4 4.5S-2.4-3 -2.4 0M2.4 -9c0 3-2.4 3.4-2.4 4.5S2.4-3 2.4 0" />
            <path className="prop-sand" d="M-1.5 -2h3l-1.5-2.4z" />
          </g>
        </g>
      )
    case 'key':
      return (
        <g className="prop prop--key">
          <circle cx={-2.6} cy={-4.6} r={2} />
          <path d="M-0.6 -4.6h4.6M2.4 -4.6v1.6M4 -4.6v1.2" />
        </g>
      )
    case 'lock':
      return (
        <g className="prop prop--lock">
          <rect x={-3} y={-5} width={6} height={5} rx={1} />
          <path d="M-1.8 -5v-1.6a1.8 1.8 0 0 1 3.6 0V-5" />
          <circle cx={0} cy={-2.6} r={0.6} className="prop-cut" />
        </g>
      )
    case 'coin':
      return (
        <g className="prop prop--coin">
          <circle cx={0} cy={-4.6} r={3.8} />
          <text x={0} y={-3.2}>
            ?
          </text>
        </g>
      )
    case 'check':
      return (
        <g className="prop prop--check">
          <circle cx={0} cy={-4.6} r={4} />
          <path d="M-2 -4.6l1.5 1.6L2.2 -6.2" />
        </g>
      )
    default:
      return (
        <g className="prop prop--icon">
          <Icon name={name} x={-4.3} y={-9.4} size={8.6} />
        </g>
      )
  }
}

const TRIP_Y = [21, 51] as const
const TRIP_FIRST = 28
const TRIP_LAST = 152
const START_X = 9

/**
 * The same person walks the same errand twice. The first trip is a long walk with waiting rooms;
 * the second is a short one. Nobody reads a number: the length of the walk is the argument.
 */
export function JourneyLayout({ slide, meta }: { slide: JourneySlide; meta: SlideMeta }) {
  const t = useBi()
  const { reducedMotion } = useScene()
  const scope: RefObject<HTMLDivElement | null> = useSceneTimeline(
    (tl) => {
      if (reducedMotion) return
      tl.fromTo('.rv', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, 0)
      // Two stops: the first half is the long walk, the second half waits for a click.
      scope.current?.querySelectorAll<SVGGElement>('.trip').forEach((trip, li) => {
        const span = li === 0 ? 0.43 : 0.4
        const start = li === 0 ? 0.04 : 0.55
        if (li === 1) tl.fromTo(trip, { opacity: 0 }, { opacity: 1, duration: 0.04 }, start - 0.04)
        const stations = Array.from(trip.querySelectorAll<SVGGElement>('.station'))
        const mover = trip.querySelector('.doll-move')
        const body = trip.querySelector('.doll-body')
        const line = trip.querySelector('.trip-line')
        const step = span / stations.length
        if (mover) tl.set(mover, { x: 0 }, 0)
        if (line) tl.fromTo(line, { drawSVG: '0%' }, { drawSVG: '100%', duration: span, ease: 'none' }, start)
        if (body) tl.fromTo(body, { y: 0 }, { y: -0.7, duration: 0.018, repeat: Math.floor(span / 0.018) - 1, yoyo: true, ease: 'sine.inOut' }, start)
        stations.forEach((station, k) => {
          const x = Number(station.dataset.x)
          const arrive = start + k * step
          if (mover) tl.to(mover, { x: x - START_X - 8.5, duration: step * 0.62, ease: 'power1.inOut' }, arrive)
          tl.fromTo(station, { opacity: 0, y: -2.5 }, { opacity: 1, y: 0, duration: 0.05, ease: 'back.out(2)' }, arrive + step * 0.3)
          const glass = station.querySelector('.hg')
          if (glass && station.dataset.wait === 'true') {
            tl.to(glass, { rotation: 180, duration: step * 0.9, ease: 'power1.inOut' }, arrive + step * 0.4)
          }
        })
      })
    },
    [reducedMotion],
  )
  return (
    <Frame scope={scope}>
      <Chrome meta={meta} />
      <div className="head head--tight">
        <Title>{t(slide.title)}</Title>
        <Lead text={slide.lead} />
      </div>
      <div className="journey">
        <svg viewBox="0 0 160 60" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t(slide.title)}>
          {slide.trips.map((trip, li) => {
            const y = TRIP_Y[li]!
            const n = trip.stations.length
            const stepX = n > 1 ? (TRIP_LAST - TRIP_FIRST) / (n - 1) : 0
            return (
              <g key={trip.name.en} className={`trip trip--${trip.pace}`}>
                <text className="trip-name" x={2} y={y - 16.5}>
                  {t(trip.name)}
                </text>
                <path className="trip-line" d={`M2 ${y}H158`} />
                {trip.stations.map((station, i) => {
                  const x = TRIP_FIRST + i * stepX
                  return (
                    <g key={station.label.en} className="station" data-x={x} data-wait={station.wait ? 'true' : 'false'}>
                      <g transform={`translate(${x} ${y})`}>
                        <Prop name={station.prop} />
                        <Lines text={t(station.label)} x={0} y={4.4} step={3.1} className="station-label" />
                      </g>
                    </g>
                  )
                })}
                <g transform={`translate(${START_X} ${y})`}>
                  <g className="doll-move">
                    <g className="doll-body">
                      <Doll />
                    </g>
                  </g>
                </g>
              </g>
            )
          })}
        </svg>
      </div>
    </Frame>
  )
}

/* --------------------------------------------------------------- agenda --- */

export function AgendaLayout({ slide, meta }: { slide: AgendaSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal()
  return (
    <Frame scope={scope}>
      <Chrome meta={meta} />
      <div className="head head--tight">
        <Title>{t(slide.title)}</Title>
        <Lead text={slide.lead} />
      </div>
      <ol className="agenda">
        {slide.items.map((item, i) => (
          <li className={`agenda-item rv ${item.live ? 'agenda-item--live' : ''}`} key={item.title.en}>
            <span className="agenda-n">{pad(i + 1)}</span>
            <h2 className="agenda-title">
              {t(item.title)}
              {item.live ? <span className="agenda-live">{t({ en: 'live', es: 'en vivo' })}</span> : null}
            </h2>
            <p className="agenda-text">{t(item.text)}</p>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

/* ---------------------------------------------------------------- event --- */

/** The cover when the talk belongs to an event: the event mark, the title, the date, the speaker and the time zones. */
export function EventLayout({ slide }: { slide: EventSlide; meta: SlideMeta }) {
  const t = useBi()
  const scope = useReveal(false)
  const base = import.meta.env.BASE_URL
  return (
    <Frame scope={scope} className="slide--event">
      <div className="event">
        <img className="event-logo rv" src={`${base}brand/azure-cloud-labs.svg`} alt="Azure Cloud Lab" />
        <h1 className="event-title rv">{t(slide.title)}</h1>
        <p className="event-date rv">{t(slide.date)}</p>
        <div className="event-speaker rv">
          <img className="event-photo" src={`${base}${slide.photo}`} alt={slide.name} />
          <span className="event-name">{slide.name}</span>
        </div>
      </div>
      <div className="event-zones rv">
        {slide.zones.map((zone) => (
          <span className="event-zone" key={zone.flag}>
            <img src={`${base}brand/flag-${zone.flag}.svg`} alt={zone.flag.toUpperCase()} />
            {zone.time}
          </span>
        ))}
        <span className="event-site">{slide.site}</span>
      </div>
      <img className="event-sponsor rv" src={`${base}brand/sevilladotnet.png`} alt="Sevilla DotNet" />
    </Frame>
  )
}

/** Layout id to component. Add a layout here and to `Slide` in talk.ts, and it is done. */
export function SlideView({ slide, meta }: { slide: Slide; meta: SlideMeta }) {
  switch (slide.layout) {
    case 'cover':
      return <CoverLayout slide={slide} meta={meta} />
    case 'section':
      return <SectionLayout slide={slide} meta={meta} />
    case 'points':
      return <PointsLayout slide={slide} meta={meta} />
    case 'statement':
      return <StatementLayout slide={slide} meta={meta} />
    case 'stats':
      return <StatsLayout slide={slide} meta={meta} />
    case 'quote':
      return <QuoteLayout slide={slide} meta={meta} />
    case 'code':
      return <CodeLayout slide={slide} meta={meta} />
    case 'split':
      return <SplitLayout slide={slide} meta={meta} />
    case 'steps':
      return <StepsLayout slide={slide} meta={meta} />
    case 'closing':
      return <ClosingLayout slide={slide} meta={meta} />
    case 'diagram':
      return <DiagramLayout slide={slide} meta={meta} />
    case 'screenshot':
      return <ScreenshotLayout slide={slide} meta={meta} />
    case 'story':
      return <StoryLayout slide={slide} meta={meta} />
    case 'demo':
      return <DemoLayout slide={slide} meta={meta} />
    case 'about':
      return <AboutLayout slide={slide} meta={meta} />
    case 'journey':
      return <JourneyLayout slide={slide} meta={meta} />
    case 'agenda':
      return <AgendaLayout slide={slide} meta={meta} />
    case 'event':
      return <EventLayout slide={slide} meta={meta} />
  }
}

