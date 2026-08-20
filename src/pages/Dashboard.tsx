import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LifeRadar } from '../components/charts/LifeRadar'
import { IconFlame, IconPencil, IconRestore } from '../components/Icons'
import { Card, EmptyState, ScoreBar, StatTile } from '../components/ui'
import { formatFull, todayKey } from '../lib/date'
import { formatINR, formatScore } from '../lib/format'
import { seriesColor } from '../lib/palette'
import { activeCategories, categoriesForEntry, categoryDisplayName } from '../lib/selectors'
import { setTaskCompleted, useAppData } from '../lib/store'
import {
  categoryAverage,
  lifeScores,
  overallOf,
  scoreLabel,
  streakInfo,
} from '../lib/stats'
import { anotherQuote, quoteForDate, type Quote } from '../lib/quotes'
import { useCountUp } from '../lib/useCountUp'
import { useEffectiveTheme } from '../lib/theme'

export function Dashboard() {
  const data = useAppData()
  const theme = useEffectiveTheme()
  const today = todayKey()
  const [quote, setQuote] = useState<Quote>(() => quoteForDate(today))
  const entry = data.entries[today]
  const overall = entry ? overallOf(entry) : null
  const animatedOverall = useCountUp(overall)
  const streak = streakInfo(data.entries, today)
  const life = lifeScores(data.entries, today)
  const allEntries = useMemo(() => Object.values(data.entries), [data.entries])

  // Radar: today's entry against the all-time average. Without an entry yet,
  // the average alone (for active categories that have any history).
  const radar = useMemo(() => {
    if (entry) {
      const rows = categoriesForEntry(data, entry.scores)
      const axes = rows.map((r) => ({ id: r.id, name: categoryDisplayName(r.category) }))
      const day: Record<string, number> = {}
      const average: Record<string, number> = {}
      for (const r of rows) {
        day[r.id] = r.score
        const avg = categoryAverage(allEntries, r.id)
        if (avg !== null) average[r.id] = avg
      }
      return { axes, day, average }
    }
    const axes: { id: string; name: string }[] = []
    const average: Record<string, number> = {}
    for (const c of activeCategories(data)) {
      const avg = categoryAverage(allEntries, c.id)
      if (avg !== null) {
        axes.push({ id: c.id, name: c.name })
        average[c.id] = avg
      }
    }
    return { axes, day: null, average }
  }, [data, entry, allEntries])

  const tasksToday = data.tasks.filter((t) => t.deadline === today)
  const tasksDone = tasksToday.filter((t) => t.completed).length
  const overdue = data.tasks.filter((t) => !t.completed && t.deadline && t.deadline < today)
  const todaySpend = data.spending[today]?.amount ?? null

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="page-sub">{formatFull(today)}</p>
        </div>
        <div className={`streak-chip${streak.todayDone ? ' streak-alive' : ''}`}>
          <IconFlame size={16} />
          <span>
            {streak.count} day{streak.count === 1 ? '' : 's'}
          </span>
          <span className="streak-note">{streak.todayDone ? 'tracked today' : 'today pending'}</span>
        </div>
      </header>

      <div className="quote-card">
        <blockquote className="quote-block" key={quote.text}>
          <p className="quote-text">“{quote.text}”</p>
          <footer className="quote-author">— {quote.author}</footer>
        </blockquote>
        <button
          type="button"
          className="icon-btn"
          aria-label="Show another quote"
          onClick={() => setQuote((q) => anotherQuote(q))}
        >
          <IconRestore size={15} />
        </button>
      </div>

      {entry && overall !== null ? (
        <Card className="hero-card">
          <div className="hero-row">
            <div>
              <div className="hero-number">
                {formatScore(animatedOverall ?? overall)}
                <span className="hero-max">/10</span>
              </div>
              <div className="hero-label">{scoreLabel(overall)}</div>
            </div>
            <Link to="/entry" className="btn">
              <IconPencil size={15} /> Edit entry
            </Link>
          </div>
          <div className="cat-score-list">
            {categoriesForEntry(data, entry.scores).map(({ id, score, category }) => (
              <div className="cat-score-row" key={id}>
                <span className="cat-score-name">{categoryDisplayName(category)}</span>
                <ScoreBar
                  score={score}
                  color={
                    category ? seriesColor(category.colorSlot, theme) : 'var(--muted)'
                  }
                />
                <span className="cat-score-value">{score}/10</span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="hero-card">
          <EmptyState title="No entry yet for today">
            <p>Score your day across every category — it takes under two minutes.</p>
            <Link to="/entry" className="btn btn-primary">
              <IconPencil size={15} /> Add today's entry
            </Link>
          </EmptyState>
        </Card>
      )}

      <div className="tile-grid">
        <StatTile
          label="Today"
          value={overall !== null ? formatScore(overall) : '—'}
          hint={overall !== null ? scoreLabel(overall) : 'Not tracked yet'}
        />
        <StatTile
          label="This Week"
          value={life.week !== null ? formatScore(life.week) : '—'}
          hint="Average overall score"
        />
        <StatTile
          label="This Month"
          value={life.month !== null ? formatScore(life.month) : '—'}
          hint="Average overall score"
        />
        <StatTile
          label="All Time"
          value={life.allTime !== null ? formatScore(life.allTime) : '—'}
          hint={`${allEntries.length} entr${allEntries.length === 1 ? 'y' : 'ies'}`}
        />
      </div>

      <Card
        title="Life Radar"
        subtitle={entry ? 'Today against your all-time average' : 'Your all-time average by category'}
      >
        {radar.axes.length >= 3 ? (
          <LifeRadar
            axes={radar.axes}
            day={radar.day}
            average={Object.keys(radar.average).length > 0 ? radar.average : null}
            dayLabel="Today"
          />
        ) : (
          <EmptyState title="The radar needs at least 3 categories with data">
            <p>Keep tracking — the radar appears once there is enough to draw.</p>
          </EmptyState>
        )}
      </Card>

      <div className="two-col">
        <Card
          title="Today's Tasks"
          subtitle={
            tasksToday.length > 0
              ? `${tasksDone} / ${tasksToday.length} completed`
              : undefined
          }
          actions={
            <Link className="link" to="/tasks">
              All tasks
            </Link>
          }
        >
          {tasksToday.length === 0 && overdue.length === 0 ? (
            <EmptyState title="Nothing due today" />
          ) : (
            <ul className="task-mini-list">
              {overdue.slice(0, 3).map((t) => (
                <li key={t.id}>
                  <label className="task-check">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={(e) => setTaskCompleted(t.id, e.target.checked)}
                    />
                    <span className="task-title">{t.title}</span>
                  </label>
                  <span className="task-overdue">Overdue</span>
                </li>
              ))}
              {tasksToday.slice(0, 6).map((t) => (
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
        </Card>

        <Card
          title="Spending"
          actions={
            <Link className="link" to="/spending">
              Details
            </Link>
          }
        >
          <div className="spend-today">
            <div className="stat-label">Today</div>
            <div className="stat-value">{todaySpend !== null ? formatINR(todaySpend) : '—'}</div>
            {todaySpend === null && <div className="stat-hint">Recorded with your daily entry</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}
