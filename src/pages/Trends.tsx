import { useMemo, useState } from 'react'
import { TrendChart, type TrendPoint, type TrendSeries } from '../components/charts/TrendChart'
import { toast } from '../components/Toaster'
import { Card, Chip, EmptyState, Segmented } from '../components/ui'
import {
  addDays,
  addMonthsClamped,
  formatMonthShort,
  formatShort,
  todayKey,
} from '../lib/date'
import { seriesColor } from '../lib/palette'
import { activeCategories } from '../lib/selectors'
import { useAppData } from '../lib/store'
import { overallOf } from '../lib/stats'
import { useEffectiveTheme } from '../lib/theme'

type RangeKey = '7d' | '30d' | '3m' | '6m' | '1y' | 'all'

const RANGES: { value: RangeKey; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
]

const MAX_COMPARED = 8

export function Trends() {
  const data = useAppData()
  const theme = useEffectiveTheme()
  const today = todayKey()
  const [range, setRange] = useState<RangeKey>('30d')
  const active = activeCategories(data)
  const [selected, setSelected] = useState<string[]>(() =>
    active.slice(0, MAX_COMPARED).map((c) => c.id),
  )

  const startKey = useMemo(() => {
    const dates = Object.keys(data.entries).sort()
    switch (range) {
      case '7d':
        return addDays(today, -6)
      case '30d':
        return addDays(today, -29)
      case '3m':
        return addMonthsClamped(today, -3)
      case '6m':
        return addMonthsClamped(today, -6)
      case '1y':
        return addMonthsClamped(today, -12)
      case 'all':
        return dates[0] ?? today
    }
  }, [range, today, data.entries])

  const entriesInWindow = useMemo(
    () =>
      Object.values(data.entries)
        .filter((e) => e.date >= startKey && e.date <= today)
        .sort((a, b) => (a.date < b.date ? -1 : 1)),
    [data.entries, startKey, today],
  )

  // One point per tracked day — the chart connects across missed days.
  const points = useMemo<TrendPoint[]>(
    () =>
      entriesInWindow.map((e) => {
        const p: TrendPoint = { date: e.date }
        const overall = overallOf(e)
        p.overall = overall !== null ? overall : null
        for (const c of active) {
          p[c.id] = e.scores[c.id] ?? null
        }
        return p
      }),
    [entriesInWindow, active],
  )

  const xFormatter = range === '1y' || range === 'all' ? formatMonthShort : formatShort

  const toggleCategory = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_COMPARED) {
        toast(`Compare up to ${MAX_COMPARED} categories at once — deselect one first.`, 'info')
        return prev
      }
      return [...prev, id]
    })
  }

  const categorySeries: TrendSeries[] = active
    .filter((c) => selected.includes(c.id))
    .map((c) => ({ key: c.id, name: c.name, color: seriesColor(c.colorSlot, theme) }))

  const overallSeries: TrendSeries[] = [
    { key: 'overall', name: 'Overall', color: seriesColor(0, theme) },
  ]

  const enough = points.length >= 2

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Score Trends</h1>
          <p className="page-sub">How your scores move over time</p>
        </div>
      </header>

      <div className="filter-row">
        <Segmented options={RANGES} value={range} onChange={setRange} ariaLabel="Time range" />
      </div>

      <Card title="Overall Daily Score">
        {enough ? (
          <TrendChart data={points} series={overallSeries} xTickFormatter={xFormatter} />
        ) : (
          <EmptyState title="Not enough data in this range">
            <p>
              {points.length === 0
                ? 'No entries here yet — pick a wider range or start tracking.'
                : 'Only one entry in this range — a trend needs at least two.'}
            </p>
          </EmptyState>
        )}
      </Card>

      <Card
        title="Category Trends"
        subtitle="Focus on one category or compare several"
      >
        <div className="chip-row">
          <Chip
            selected={
              selected.length === Math.min(active.length, MAX_COMPARED) &&
              active.slice(0, MAX_COMPARED).every((c) => selected.includes(c.id))
            }
            onClick={() => setSelected(active.slice(0, MAX_COMPARED).map((c) => c.id))}
          >
            All
          </Chip>
          {active.map((c) => (
            <Chip
              key={c.id}
              selected={selected.includes(c.id)}
              onClick={() => toggleCategory(c.id)}
              swatch={seriesColor(c.colorSlot, theme)}
            >
              {c.name}
            </Chip>
          ))}
        </div>
        {active.length > MAX_COMPARED && (
          <p className="field-hint">
            Up to {MAX_COMPARED} categories can be compared at once so the chart stays readable.
          </p>
        )}
        {enough && categorySeries.length > 0 ? (
          <TrendChart data={points} series={categorySeries} xTickFormatter={xFormatter} />
        ) : enough ? (
          <EmptyState title="Select at least one category" />
        ) : (
          <EmptyState title="Not enough data in this range">
            <p>Trends appear once this range has two or more entries.</p>
          </EmptyState>
        )}
      </Card>
    </div>
  )
}
