/**
 * The speaker's page, in show order: one entry per slide.
 * Only the presenter window loads this file (P in the show).
 *
 * It is generated from src/show/talk.ts, so the notes always travel with the
 * slide. Edit `note` on the slide, not this file.
 */
import type { StopNote } from '@/engine/PresenterView'
import { talk, titleOf } from './talk'

const empty = { en: '', es: '' }

export const notes: StopNote[] = talk.chapters
  .flatMap((chapter) => chapter.slides)
  .map((slide) => ({
    heading: { en: titleOf(slide), es: 'title' in slide ? slide.title.es : slide.id },
    points: slide.note ?? empty,
  }))
