import { useMemo, useState } from 'react'
import { Card, ChangeArrow, EmptyState, Segmented, StatTile } from '../components/ui'
import { IconChevronLeft, IconChevronRight } from '../components/Icons'
import {
  addDays,
  addMonthsClamped,
  diffDays,
  endOfMonth,
  formatMonthYear,
  formatShort,
  startOfMonth,
  startOfWeek,
  todayKey,
} from '../lib/date'
import { formatChange, formatINR, formatScore } from '../lib/format'
import { activeCategories, categoryMap } from '../lib/selectors'
import { useAppData } from '../lib/store'
import {
  averageOverall,
  categoryAverage,
  entriesInRange,
  scoreLabel,
  spendingInRange,
} from '../lib/stats'

type Mode = 'weekly' | 'monthly'

interface Period {
  start: string
  end: string // full period end (may be in the future for the current period)
  label: string
}

function weekPeriod(today: string, offset: number): Period {
  const start = addDays(startOfWeek(today), offset * 7)
  const end = addDays(start, 6)
  return { start, end, label: `${formatShort(start)} – ${formatShort(end)}` }
}

function monthPeriod(today: string, offset: number): Period {
  const start = addMonthsClamped(startOfMonth(today), offset)
  return { start, end: endOfMonth(start), label: formatMonthYear(start) }
}

export function Summary() {
  const data = useAppData()
  const today = todayKey()
  const [mode, setMode] = useState<Mode>('weekly')
  const [offset, setOffset] = useState(0)

  const period = mode === 'weekly' ? weekPeriod(today, offset) : monthPeriod(today, offset)
  const prev = mode === 'weekly' ? weekPeriod(today, offset - 1) : monthPeriod(today, offset - 1)

  const stats = useMemo(() => {
    const clipEnd = (p: Period) => (p.end > today ? today : p.end)
    const cur = entriesInRange(data.entries, period.start, clipEnd(period))
    const before = entriesInRange(data.entries, prev.start, clipEnd(prev))

    const curOverall = averageOverall(cur)
    const prevOverall = averageOverall(before)

    const totalDays =
      period.end > today ? diffDays(period.start, today) + 1 : diffDays(period.start, period.end) + 1

    const catMap = categoryMap(data)
    const actives = activeCategories(data)
    const withData = new Set<string>()
    for (const e of [...cur, ...before]) {
      for (const id of Object.keys(e.scores)) withData.add(id)
    }
    // Active categories first (always shown), then archived ones that have
    // data in either period so history stays visible.
    const ids = [
      ...actives.map((c) => c.id),
      ...[...withData].filter((id) => !actives.some((c) => c.id === id)),
    ]
    const categories = ids.map((id) => {
      const cat = catMap.get(id) ?? null
      const curAvg = categoryAverage(cur, id)
      const prevAvg = categoryAverage(before, id)
      return {
        id,
        name: cat ? cat.name : 'Removed category',
        archived: cat ? !cat.active : true,
        curAvg,
        prevAvg,
        change: curAvg !== null && prevAvg !== null ? curAvg - prevAvg : null,
      }
    })

    return {
      entries: cur.length,
      totalDays: Math.max(1, totalDays),
      curOverall,
      prevOverall,
      overallChange:
        curOverall !== null && prevOverall !== null ? curOverall - prevOverall : null,
      spending: spendingInRange(data, period.start, period.end),
      prevSpending: spendingInRange(data, prev.start, prev.end),
      tasksDone: data.tasks.filter(
        (t) => t.completedOn && t.completedOn >= period.start && t.completedOn <= period.end,
      ).length,
      categories,
    }
  }, [data, period.start, period.end, prev.start, prev.end, today])

  const isCurrent = offset === 0
  const prevName = mode === 'weekly' ? 'previous week' : 'previous month'

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Summary</h1>
          <p className="page-sub">Purely mathematical — every number traces back to your entries</p>
        </div>
        <Segmented
          options={[
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
          value={mode}
          onChange={(m) => {
            setMode(m)
            setOffset(0)
          }}
          ariaLabel="Summary mode"
        />
      </header>

      <div className="filter-row period-nav">
        <button
          type="button"
          className="icon-btn"
          aria-label={`Previous ${mode === 'weekly' ? 'week' : 'month'}`}
          onClick={() => setOffset((o) => o - 1)}
        >
          <IconChevronLeft size={18} />
        </button>
        <span className="month-label">
          {period.label}
          {isCurrent && <span className="period-current"> · current</span>}
        </span>
        <button
          type="button"
          className="icon-btn"
          aria-label={`Next ${mode === 'weekly' ? 'week' : 'month'}`}
          disabled={isCurrent}
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
        >
          <IconChevronRight size={18} />
        </button>
      </div>

      {stats.entries === 0 && stats.spending === 0 && stats.tasksDone === 0 ? (
        <Card>
          <EmptyState title={`Nothing recorded in this ${mode === 'weekly' ? 'week' : 'month'}`}>
            <p>Summaries appear once days in this period are tracked.</p>
          </EmptyState>
        </Card>
      ) : (
        <>
          <div className="tile-grid">
            <StatTile
              label="Overall Average"
              value={stats.curOverall !== null ? formatScore(stats.curOverall) : '—'}
              hint={stats.curOverall !== null ? scoreLabel(stats.curOverall) : undefined}
              delta={
                stats.overallChange !== null ? { value: stats.overallChange, vs: prevName } : null
              }
            />
            <StatTile
              label="Consistency"
              value={`${stats.entries} / ${stats.totalDays}`}
              hint={`days tracked${period.end > today ? ' so far' : ''}`}
            />
            <StatTile
              label="Spending"
              value={formatINR(stats.spending)}
              hint={`${prevName}: ${formatINR(stats.prevSpending)}`}
            />
            <StatTile label="Tasks Completed" value={stats.tasksDone} />
          </div>

          <Card title="Category Averages" subtitle={`Compared with the ${prevName}`}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>This period</th>
                    <th>Previous</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.categories.map((c) => (
                    <tr key={c.id}>
                      <td>
                        {c.name}
                        {c.archived && <span className="archived-tag"> archived</span>}
                      </td>
                      <td>{c.curAvg !== null ? formatScore(c.curAvg) : '—'}</td>
                      <td>{c.prevAvg !== null ? formatScore(c.prevAvg) : '—'}</td>
                      <td>
                        {c.change !== null ? (
                          <span className="change-cell">
                            <ChangeArrow value={c.change} />
                            {formatChange(c.change)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
