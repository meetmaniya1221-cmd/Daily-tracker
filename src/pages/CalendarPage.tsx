import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, EmptyState, ScoreBar } from '../components/ui'
import { IconChevronLeft, IconChevronRight, IconPencil } from '../components/Icons'
import { spendBreakdown } from '../components/SpendItemsEditor'
import {
  addDays,
  addMonthsClamped,
  daysInRange,
  endOfMonth,
  formatFull,
  formatMonthYear,
  startOfMonth,
  startOfWeek,
  todayKey,
} from '../lib/date'
import { formatINR, formatScore } from '../lib/format'
import { seriesColor } from '../lib/palette'
import { categoriesForEntry, categoryDisplayName } from '../lib/selectors'
import { setTaskCompleted, useAppData } from '../lib/store'
import { overallOf, scoreLabel } from '../lib/stats'
import { useEffectiveTheme } from '../lib/theme'

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function CalendarPage() {
  const data = useAppData()
  const theme = useEffectiveTheme()
  const today = todayKey()
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(today))
  const [selected, setSelected] = useState(today)

  const monthStart = startOfMonth(monthAnchor)
  const monthEnd = endOfMonth(monthAnchor)

  // Full weeks covering the month (Mon-start grid).
  const gridDays = useMemo(() => {
    const gridStart = startOfWeek(monthStart)
    const gridEnd = addDays(startOfWeek(monthEnd), 6)
    return daysInRange(gridStart, gridEnd)
  }, [monthStart, monthEnd])

  const tasksByDay = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of data.tasks) {
      if (t.deadline) map.set(t.deadline, (map.get(t.deadline) ?? 0) + 1)
    }
    return map
  }, [data.tasks])

  const entry = data.entries[selected]
  const overall = entry ? overallOf(entry) : null
  const spendRec = data.spending[selected]
  const dayTasks = data.tasks
    .filter((t) => t.deadline === selected)
    .sort((a, b) => Number(a.completed) - Number(b.completed))

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Calendar</h1>
          <p className="page-sub">Days with a dot have a saved entry</p>
        </div>
        <div className="date-controls">
          <button
            type="button"
            className="icon-btn"
            aria-label="Previous month"
            onClick={() => setMonthAnchor((m) => addMonthsClamped(m, -1))}
          >
            <IconChevronLeft size={18} />
          </button>
          <span className="month-label">{formatMonthYear(monthAnchor)}</span>
          <button
            type="button"
            className="icon-btn"
            aria-label="Next month"
            onClick={() => setMonthAnchor((m) => addMonthsClamped(m, 1))}
          >
            <IconChevronRight size={18} />
          </button>
          {monthStart !== startOfMonth(today) && (
            <button
              type="button"
              className="btn btn-small"
              onClick={() => {
                setMonthAnchor(startOfMonth(today))
                setSelected(today)
              }}
            >
              Today
            </button>
          )}
        </div>
      </header>

      <Card>
        <div className="cal-grid" role="grid" aria-label={formatMonthYear(monthAnchor)}>
          {WEEKDAY_HEADERS.map((w) => (
            <div key={w} className="cal-head" role="columnheader">
              {w}
            </div>
          ))}
          {gridDays.map((day) => {
            const inMonth = day >= monthStart && day <= monthEnd
            const hasEntry = Boolean(data.entries[day])
            const taskCount = tasksByDay.get(day) ?? 0
            const hasSpend = data.spending[day] !== undefined
            return (
              <button
                key={day}
                type="button"
                className={[
                  'cal-cell',
                  inMonth ? '' : 'cal-outside',
                  day === today ? 'cal-today' : '',
                  day === selected ? 'cal-selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={`${formatFull(day)}${hasEntry ? ', has entry' : ''}${
                  taskCount > 0 ? `, ${taskCount} task${taskCount === 1 ? '' : 's'}` : ''
                }`}
                aria-pressed={day === selected}
                onClick={() => setSelected(day)}
              >
                <span className="cal-daynum">{Number(day.slice(8))}</span>
                <span className="cal-marks">
                  {hasEntry && <span className="cal-dot" />}
                  {hasSpend && <span className="cal-spend-mark">₹</span>}
                  {taskCount > 0 && <span className="cal-task-count">{taskCount}</span>}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card
        title={formatFull(selected)}
        actions={
          selected <= today ? (
            <Link className="btn btn-small" to={`/entry?date=${selected}`}>
              <IconPencil size={14} />
              {entry ? 'Edit entry' : 'Add entry'}
            </Link>
          ) : (
            <span className="field-hint">Future date</span>
          )
        }
      >
        {entry && overall !== null ? (
          <>
            <div className="day-overall">
              <span className="day-overall-score">{formatScore(overall)}/10</span>
              <span className="day-overall-label">{scoreLabel(overall)}</span>
            </div>
            <div className="cat-score-list">
              {categoriesForEntry(data, entry.scores).map(({ id, score, category }) => (
                <div className="cat-score-row" key={id}>
                  <span className="cat-score-name">{categoryDisplayName(category)}</span>
                  <ScoreBar
                    score={score}
                    color={category ? seriesColor(category.colorSlot, theme) : 'var(--muted)'}
                  />
                  <span className="cat-score-value">{score}/10</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState title="No daily entry for this date" />
        )}

        <div className="day-extras">
          <div className="day-extra">
            <span className="stat-label">Spending</span>
            <span>{spendRec ? formatINR(spendRec.amount) : 'Not recorded'}</span>
            {spendRec && spendBreakdown(spendRec) && (
              <span className="record-items">{spendBreakdown(spendRec)}</span>
            )}
          </div>
          <div className="day-extra">
            <span className="stat-label">
              Tasks due{' '}
              {dayTasks.length > 0 &&
                `· ${dayTasks.filter((t) => t.completed).length} / ${dayTasks.length} completed`}
            </span>
            {dayTasks.length === 0 ? (
              <span>None</span>
            ) : (
              <ul className="task-mini-list">
                {dayTasks.map((t) => (
                  <li key={t.id}>
                    <label className="task-check">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={(e) => setTaskCompleted(t.id, e.target.checked)}
                      />
                      <span className={`task-title${t.completed ? ' task-done' : ''}`}>
                        {t.title}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
