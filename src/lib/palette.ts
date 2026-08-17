import type { ThemeName } from '../types'

/**
 * Validated categorical palette (8 slots), stepped separately for light and
 * dark surfaces. Slot order is the CVD-safety mechanism — never reorder or
 * cycle past 8. A category keeps its slot for life (color follows the entity).
 */
export const SERIES_LIGHT = [
  '#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948',
]
export const SERIES_DARK = [
  '#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767',
]

export const SERIES_COUNT = SERIES_LIGHT.length

export function seriesColor(slot: number, theme: ThemeName): string {
  const list = theme === 'dark' ? SERIES_DARK : SERIES_LIGHT
  return list[((slot % list.length) + list.length) % list.length]
}

export interface ChartTokens {
  surface: string
  ink: string
  secondary: string
  muted: string
  grid: string
  baseline: string
  accent: string
  accentSoft: string
  border: string
}

const LIGHT: ChartTokens = {
  surface: '#fcfcfb',
  ink: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  baseline: '#c3c2b7',
  accent: '#2a78d6',
  accentSoft: 'rgba(42, 120, 214, 0.10)',
  border: 'rgba(11, 11, 11, 0.10)',
}

const DARK: ChartTokens = {
  surface: '#1a1a19',
  ink: '#ffffff',
  secondary: '#c3c2b7',
  muted: '#898781',
  grid: '#2c2c2a',
  baseline: '#383835',
  accent: '#3987e5',
  accentSoft: 'rgba(57, 135, 229, 0.12)',
  border: 'rgba(255, 255, 255, 0.10)',
}

export function chartTokens(theme: ThemeName): ChartTokens {
  return theme === 'dark' ? DARK : LIGHT
}
