/**
 * Previous and next arrows, bottom centre. They wake up when the pointer moves
 * and fade out after a quiet moment, so they never sit on the projector.
 * Keyboard stays the main input: a click gives focus back to the page, so Space still advances.
 */
import { useEffect, useRef } from 'react'
import { useI18n } from '@/i18n'
import { usePresentation } from './context'

const EPS = 1e-4
const IDLE_MS = 2500

export function NavArrows() {
  const p = usePresentation()
  const { t } = useI18n()
  const root = useRef<HTMLDivElement>(null)
  const prev = useRef<HTMLButtonElement>(null)
  const next = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const update = (position: number) => {
      if (prev.current) prev.current.disabled = position <= EPS
      if (next.current) next.current.disabled = position >= p.model.total - EPS
    }
    update(p.position)
    return p.onFrame(update)
  }, [p])

  useEffect(() => {
    let timer = 0
    const wake = () => {
      root.current?.setAttribute('data-awake', 'true')
      window.clearTimeout(timer)
      timer = window.setTimeout(() => root.current?.setAttribute('data-awake', 'false'), IDLE_MS)
    }
    window.addEventListener('pointermove', wake)
    return () => {
      window.removeEventListener('pointermove', wake)
      window.clearTimeout(timer)
    }
  }, [])

  const press = (go: () => void) => (e: React.MouseEvent<HTMLButtonElement>) => {
    go()
    e.currentTarget.blur()
  }

  return (
    <div ref={root} className="nav-arrows" data-awake="false">
      <button ref={prev} type="button" aria-label={t('show.nav.prev')} onClick={press(() => p.prev())}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M10 3 5 8l5 5" />
        </svg>
      </button>
      <button ref={next} type="button" aria-label={t('show.nav.next')} onClick={press(() => p.next())}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m6 3 5 5-5 5" />
        </svg>
      </button>
    </div>
  )
}
