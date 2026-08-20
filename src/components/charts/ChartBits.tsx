import type { ReactNode } from 'react'
import { chartTokens, type ChartTokens } from '../../lib/palette'
import { useEffectiveTheme } from '../../lib/theme'

export function useChartTokens(): ChartTokens {
  return chartTokens(useEffectiveTheme())
}

/**
 * Series animations stay OFF: recharts' draw-in intermittently leaves series
 * unrendered under React StrictMode double-mounts — data must never vanish.
 * Charts get their entrance from the page's card rise-in instead.
 */
export function chartAnimation(): { isAnimationActive: boolean } {
  return { isAnimationActive: false }
}

interface TipEntry {
  dataKey?: string | number
  name?: string | number
  value?: number | string | null
  color?: string
  stroke?: string
}

/**
 * Shared tooltip content: the value is the strong element, the series name
 * secondary, each row keyed by a short stroke of the series color.
 */
export function ChartTip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: {
  active?: boolean
  payload?: TipEntry[]
  label?: string | number
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number) => ReactNode
}) {
  if (!active || !payload || payload.length === 0) return null
  const rows = payload.filter((p) => p.value !== null && p.value !== undefined)
  if (rows.length === 0) return null
  return (
    <div className="chart-tip">
      {label !== undefined && (
        <div className="chart-tip-label">
          {labelFormatter ? labelFormatter(String(label)) : String(label)}
        </div>
      )}
      {rows.map((p, i) => (
        <div className="chart-tip-row" key={`${String(p.dataKey ?? p.name)}-${i}`}>
          <span className="chart-tip-key" style={{ background: p.color ?? p.stroke }} />
          <span className="chart-tip-value">
            {valueFormatter ? valueFormatter(Number(p.value)) : String(p.value)}
          </span>
          <span className="chart-tip-name">{String(p.name ?? '')}</span>
        </div>
      ))}
    </div>
  )
}

interface LegendEntry {
  value?: string
  color?: string
}

/** Legend with text in text tokens; identity carried by the mark beside it. */
export function ChartLegend({ payload }: { payload?: LegendEntry[] }) {
  if (!payload || payload.length === 0) return null
  return (
    <ul className="chart-legend">
      {payload.map((entry, i) => (
        <li key={`${entry.value}-${i}`}>
          <span className="legend-key" style={{ background: entry.color }} />
          {entry.value}
        </li>
      ))}
    </ul>
  )
}
