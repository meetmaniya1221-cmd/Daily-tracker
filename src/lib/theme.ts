import { useEffect, useState } from 'react'
import type { ThemeName } from '../types'
import { useAppData } from './store'

function systemTheme(): ThemeName {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

/** The theme actually in effect: the user's choice, or the system preference. */
export function useEffectiveTheme(): ThemeName {
  const data = useAppData()
  const [sys, setSys] = useState<ThemeName>(systemTheme)

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const onChange = () => setSys(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return data.settings.theme ?? sys
}
