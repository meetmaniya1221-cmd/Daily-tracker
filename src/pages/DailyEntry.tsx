import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ScorePicker } from '../components/ScorePicker'
import {
  SpendItemsEditor,
  parseSpendRows,
  rowsFromRecord,
  type SpendRow,
} from '../components/SpendItemsEditor'
import { toast } from '../components/Toaster'
import { Card } from '../components/ui'
import {
  IconChevronLeft,
  IconChevronRight,
} from '../components/Icons'
import { addDays, formatFull, isValidKey, relativeLabel, todayKey } from '../lib/date'
import { formatScore } from '../lib/format'
import { seriesColor } from '../lib/palette'
import { categoryMap, activeCategories } from '../lib/selectors'
import { saveEntry, setSpendingItems, useAppData } from '../lib/store'
import { scoreLabel } from '../lib/stats'
import { useEffectiveTheme } from '../lib/theme'

export function DailyEntry() {
  const data = useAppData()
  const theme = useEffectiveTheme()
  const [params, setParams] = useSearchParams()
  const today = todayKey()

  const rawDate = params.get('date')
  const date = rawDate && isValidKey(rawDate) && rawDate <= today ? rawDate : today
  const entry = data.entries[date]
  const active = activeCategories(data)
  const catMap = categoryMap(data)

  const [scores, setScores] = useState<Record<string, number>>({})
  const [spendRows, setSpendRows] = useState<SpendRow[]>([])
  const [spendingError, setSpendingError] = useState<string | null>(null)

  useEffect(() => {
    const existing = data.entries[date]
    setScores(existing ? { ...existing.scores } : {})
    setSpendRows(rowsFromRecord(data.spending[date]))
    setSpendingError(null)
    // Reload the form only when the selected date changes — edits in progress
    // for the same date must not be clobbered by store updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  // Required: for a new entry every active category; for an existing entry the
  // active categories it already tracks (newer categories stay optional so
  // historical entries remain valid).
  const requiredIds = useMemo(() => {
    if (!entry) return active.map((c) => c.id)
    return active.filter((c) => c.id in entry.scores).map((c) => c.id)
  }, [entry, active])

  const optionalCats = entry ? active.filter((c) => !(c.id in entry.scores)) : []

  // Scores recorded on this day for categories that were archived since —
  // shown so history stays visible and editable, never destroyed.
  const archivedRows = useMemo(() => {
    if (!entry) return []
    return Object.keys(entry.scores)
      .filter((id) => !active.some((c) => c.id === id))
      .map((id) => ({ id, category: catMap.get(id) ?? null }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, data.categories])

  const scoredValues = Object.values(scores)
  const missing = requiredIds.filter((id) => scores[id] === undefined)
  const complete = missing.length === 0
  const preview =
    scoredValues.length > 0
      ? scoredValues.reduce((a, b) => a + b, 0) / scoredValues.length
      : null

  const setScore = (id: string, v: number) => setScores((s) => ({ ...s, [id]: v }))

  const onSave = () => {
    if (!complete) return
    const parsed = parseSpendRows(spendRows)
    if (!parsed.ok) {
      setSpendingError(parsed.error)
      return
    }
    saveEntry(date, scores)
    setSpendingItems(date, parsed.items)
    toast(entry ? 'Entry updated' : 'Entry saved')
  }

  const gotoDate = (key: string) => setParams({ date: key })
  const rel = relativeLabel(date, today)

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Daily Entry</h1>
          <p className="page-sub">
            {rel ? `${rel} · ` : ''}
            {formatFull(date)}
          </p>
        </div>
        <div className="date-controls">
          <button
            type="button"
            className="icon-btn"
            aria-label="Previous day"
            onClick={() => gotoDate(addDays(date, -1))}
          >
            <IconChevronLeft size={18} />
          </button>
          <input
            type="date"
            className="input input-date"
            value={date}
            max={today}
            aria-label="Entry date"
            onChange={(e) => {
              const v = e.target.value
              if (isValidKey(v) && v <= today) gotoDate(v)
            }}
          />
          <button
            type="button"
            className="icon-btn"
            aria-label="Next day"
            disabled={date >= today}
            onClick={() => gotoDate(addDays(date, 1))}
          >
            <IconChevronRight size={18} />
          </button>
          {date !== today && (
            <button type="button" className="btn btn-small" onClick={() => gotoDate(today)}>
              Today
            </button>
          )}
        </div>
      </header>

      {entry && (
        <p className="notice">
          This date already has an entry — you are editing it.
        </p>
      )}

      <Card>
        <div className="score-rows">
          {active
            .filter((c) => requiredIds.includes(c.id))
            .map((c) => (
              <div className="score-row" key={c.id}>
                <div className="score-row-head">
                  <span
                    className="cat-dot"
                    style={{ background: seriesColor(c.colorSlot, theme) }}
                  />
                  <span className="score-row-name">{c.name}</span>
                  <span className="score-row-value">
                    {scores[c.id] !== undefined ? `${scores[c.id]}/10` : '—'}
                  </span>
                </div>
                <ScorePicker
                  label={c.name}
                  value={scores[c.id] ?? null}
                  onChange={(v) => setScore(c.id, v)}
                />
              </div>
            ))}

          {optionalCats.length > 0 && (
            <>
              <p className="group-note">
                Added after this entry was created — optional here, required for new entries.
              </p>
              {optionalCats.map((c) => (
                <div className="score-row" key={c.id}>
                  <div className="score-row-head">
                    <span
                      className="cat-dot"
                      style={{ background: seriesColor(c.colorSlot, theme) }}
                    />
                    <span className="score-row-name">{c.name}</span>
                    <span className="score-row-value">
                      {scores[c.id] !== undefined ? `${scores[c.id]}/10` : 'Optional'}
                    </span>
                  </div>
                  <ScorePicker
                    label={c.name}
                    value={scores[c.id] ?? null}
                    onChange={(v) => setScore(c.id, v)}
                  />
                </div>
              ))}
            </>
          )}

          {archivedRows.length > 0 && (
            <>
              <p className="group-note">Archived categories recorded on this day.</p>
              {archivedRows.map(({ id, category }) => (
                <div className="score-row" key={id}>
                  <div className="score-row-head">
                    <span
                      className="cat-dot"
                      style={{
                        background: category
                          ? seriesColor(category.colorSlot, theme)
                          : 'var(--muted)',
                      }}
                    />
                    <span className="score-row-name">
                      {category ? category.name : 'Removed category'}
                    </span>
                    <span className="score-row-value">
                      {scores[id] !== undefined ? `${scores[id]}/10` : '—'}
                    </span>
                  </div>
                  <ScorePicker
                    label={category ? category.name : 'Removed category'}
                    value={scores[id] ?? null}
                    onChange={(v) => setScore(id, v)}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      <Card title="Spending" subtitle="How much went where — labels are optional">
        <SpendItemsEditor
          rows={spendRows}
          onChange={(rows) => {
            setSpendRows(rows)
            setSpendingError(null)
          }}
        />
        {spendingError && <p className="field-error">{spendingError}</p>}
      </Card>

      <div className="save-bar">
        <div className="save-preview">
          {preview !== null ? (
            <>
              <span className="save-score">{formatScore(preview)}/10</span>
              <span className="save-label">{scoreLabel(preview)}</span>
            </>
          ) : (
            <span className="save-label">No scores yet</span>
          )}
          <span className="save-progress">
            {requiredIds.length - missing.length} of {requiredIds.length} scored
          </span>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-large"
          disabled={!complete}
          onClick={onSave}
        >
          {entry ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>
    </div>
  )
}
