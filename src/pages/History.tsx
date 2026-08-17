import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, EmptyState } from '../components/ui'
import {
  formatMonthYear,
  formatShort,
  relativeLabel,
  todayKey,
  weekdayName,
} from '../lib/date'
import { formatINR, formatScore } from '../lib/format'
import { categoriesForEntry, categoryDisplayName } from '../lib/selectors'
import { useAppData } from '../lib/store'
import { overallOf, scoreLabel } from '../lib/stats'

const PAGE_SIZE = 30

export function History() {
  const data = useAppData()
  const today = todayKey()
  const [limit, setLimit] = useState(PAGE_SIZE)

  const entries = useMemo(
    () => Object.values(data.entries).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [data.entries],
  )
  const visible = entries.slice(0, limit)

  // Group by month for scannable headers.
  const groups = useMemo(() => {
    const out: { month: string; items: typeof visible }[] = []
    for (const e of visible) {
      const month = formatMonthYear(e.date)
      const last = out[out.length - 1]
      if (last && last.month === month) last.items.push(e)
      else out.push({ month, items: [e] })
    }
    return out
  }, [visible])

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>History</h1>
          <p className="page-sub">
            {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} recorded
          </p>
        </div>
      </header>

      {entries.length === 0 ? (
        <Card>
          <EmptyState title="No entries yet">
            <p>Your tracked days will appear here, newest first.</p>
            <Link to="/entry" className="btn btn-primary">
              Add today's entry
            </Link>
          </EmptyState>
        </Card>
      ) : (
        <>
          {groups.map((g) => (
            <Card key={g.month} title={g.month}>
              <ul className="history-list">
                {g.items.map((e) => {
                  const overall = overallOf(e)
                  const spend = data.spending[e.date]?.amount
                  return (
                    <li key={e.date}>
                      <Link to={`/entry?date=${e.date}`} className="history-row">
                        <div className="history-date">
                          <span className="history-day">{formatShort(e.date)}</span>
                          <span className="history-weekday">
                            {relativeLabel(e.date, today) ?? weekdayName(e.date)}
                          </span>
                        </div>
                        <div className="history-score">
                          {overall !== null && (
                            <>
                              <span className="history-overall">{formatScore(overall)}</span>
                              <span className="history-label">{scoreLabel(overall)}</span>
                            </>
                          )}
                        </div>
                        <div className="history-cats">
                          {categoriesForEntry(data, e.scores).map(({ id, score, category }) => (
                            <span className="history-cat" key={id}>
                              {categoryDisplayName(category)}
                              <b>{score}</b>
                            </span>
                          ))}
                        </div>
                        <div className="history-spend">
                          {spend !== undefined ? formatINR(spend) : ''}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </Card>
          ))}
          {entries.length > limit && (
            <button
              type="button"
              className="btn"
              onClick={() => setLimit((n) => n + PAGE_SIZE)}
            >
              Show more
            </button>
          )}
        </>
      )}
    </div>
  )
}
