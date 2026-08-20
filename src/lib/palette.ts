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

// Neumorphic surfaces: charts sit directly on the soft-UI base color.
const LIGHT: ChartTokens = {
  surface: '#e6e9f0',
  ink: '#2b2e33',
  secondary: '#565b64',
  muted: '#8b8f99',
  grid: '#d2d6df',
  baseline: '#b3b9c6',
  accent: '#2a78d6',
  accentSoft: 'rgba(42, 120, 214, 0.12)',
  border: 'rgba(43, 46, 51, 0.12)',
}

const DARK: ChartTokens = {
  surface: '#1c1c1e',
  ink: '#f2f2f5',
  secondary: '#b9b9c0',
  muted: '#7e7e86',
  grid: '#2a2a2e',
  baseline: '#3a3a3f',
  accent: '#3987e5',
  accentSoft: 'rgba(57, 135, 229, 0.14)',
  border: 'rgba(255, 255, 255, 0.08)',
}

export function chartTokens(theme: ThemeName): ChartTokens {
  return theme === 'dark' ? DARK : LIGHT
}
