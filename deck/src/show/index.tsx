/**
 * The show, built from the talk. Nothing else lives here: the order of the
 * chapters comes from src/show/talk.ts, and each slide becomes one scene.
 *
 * A slide is one stop: it plays from 0 to 1 and halts. The URL hash keeps the
 * place, so a refresh in the middle of the talk comes back to the same slide.
 */
import { defineChapter, defineScene, defineShow } from '@/engine/define'
import type { ActorDef, ChoreographyDef } from '@/world/actors'
import { SlideView, type SlideMeta } from './layouts'
import { talk, titleOf, type Slide } from './talk'

const allSlides = talk.chapters.flatMap((chapter) => chapter.slides)
const total = allSlides.length
const positionOf = new Map(allSlides.map((slide, i) => [slide.id, i + 1]))

/**
 * Seconds a slide takes to play, per layout. The default stop is 1.1 s, which is right for text and far too
 * fast for a diagram that draws its lines one by one. Animated layouts play at a constant speed.
 */
const PLAY: Partial<Record<Slide['layout'], number>> = { diagram: 5, story: 5 }

/** The journey halts halfway: the first walk plays alone, and the second one waits for a click. */
function stopsFor(slide: Slide) {
  if (slide.layout === 'journey') {
    return [
      { at: 0.5, duration: 5, ease: 'none' },
      { at: 1, duration: 3.5, ease: 'none' },
    ]
  }
  const play = PLAY[slide.layout]
  return [play ? { at: 1, duration: play, ease: 'none' } : 1]
}

function sceneFrom(slide: Slide) {
  const meta: SlideMeta = {
    index: positionOf.get(slide.id) ?? 0,
    total,
    short: talk.short,
  }
  // The engine wants a component with no props, so the slide is closed over here.
  const Dom = () => <SlideView slide={slide} meta={meta} />
  return defineScene({
    id: slide.id,
    title: titleOf(slide),
    duration: slide.duration,
    stops: stopsFor(slide),
    parts: { dom: Dom },
    meta: { layout: slide.layout },
  })
}

export const show = defineShow({
  chapters: talk.chapters.map((chapter) =>
    defineChapter({
      id: chapter.id,
      title: chapter.title.en,
      scenes: chapter.slides.map((slide) => sceneFrom(slide)),
    }),
  ),
  mountWindow: 1,
})

/**
 * The deck is DOM only, so there are no shared actors. The engine still supports
 * Three.js and ASCII world parts: add them as a `world` part in a scene and
 * declare their shared actors here. See docs/authoring.md.
 */
export const actors: ActorDef[] = []
export const choreographies: ChoreographyDef[] = []
