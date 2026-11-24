import { useI18n } from '@/i18n'
import type { Bi } from './text'

/** Returns the string in the language the show is in now. Re-renders when L is pressed. */
export function useBi(): (text: Bi | undefined) => string {
  const { locale } = useI18n()
  return (text) => (text ? (text[locale] ?? text.en) : '')
}
