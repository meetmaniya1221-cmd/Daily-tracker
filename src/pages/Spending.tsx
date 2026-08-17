import { useMemo, useState } from 'react'
import { SpendingChart, type SpendingPoint } from '../components/charts/SpendingChart'
import { toast } from '../components/Toaster'
import { Card, EmptyState, Modal, Segmented, StatTile } from '../components/ui'
import { IconEdit } from '../components/Icons'
import {
  formatMedium,
  lastNDays,
  relativeLabel,
  startOfMonth,
  startOfWeek,
  todayKey,
  weekdayName,
} from '../lib/date'
import { formatINR } from '../lib/format'
import { setSpending, useAppData } from '../lib/store'
import { spendingAllTime, spendingInRange } from '../lib/stats'

type ChartRange = '14' | '30' | '90'

export function Spending() {
  const data = useAppData()
  const today = todayKey()
  const [chartRange, setChartRange] = useState<ChartRange>('30')
  const [editing, setEditing] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const todayAmount = data.spending[today]?.amount ?? null
  const weekTotal = spendingInRange(data, startOfWeek(today), today)
  const monthTotal = spendingInRange(data, startOfMonth(today), today)
  const allTotal = spendingAllTime(data)

  const chartData = useMemo<SpendingPoint[]>(
    () =>
      lastNDays(Number(chartRange), today).map((date) => ({
        date,
        amount: data.spending[date]?.amount ?? null,
      })),
    [chartRange, today, data.spending],
  )
  const hasChartData = chartData.some((p) => p.amount !== null)

  const records = useMemo(
    () =>
      Object.entries(data.spending)
        .sort(([a], [b]) => (a < b ? 1 : -1))
        .map(([date, rec]) => ({ date, amount: rec.amount })),
    [data.spending],
  )
  const visibleRecords = showAll ? records : records.slice(0, 30)

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Spending</h1>
          <p className="page-sub">One amount per day — nothing more</p>
        </div>
      </header>

      <div className="tile-grid">
        <StatTile label="Today" value={todayAmount !== null ? formatINR(todayAmount) : '—'} />
        <StatTile label="This Week" value={formatINR(weekTotal)} />
        <StatTile label="This Month" value={formatINR(monthTotal)} />
        <StatTile label="All Time" value={formatINR(allTotal)} />
      </div>

      <Card
        title="Daily Spending"
        subtitle={`Last ${chartRange} days`}
        actions={
          <Segmented
            options={[
              { value: '14', label: '14D' },
              { value: '30', label: '30D' },
              { value: '90', label: '90D' },
            ]}
            value={chartRange}
            onChange={setChartRange}
            ariaLabel="Spending chart range"
          />
        }
      >
        {hasChartData ? (
          <SpendingChart data={chartData} />
        ) : (
          <EmptyState title="No spending recorded in this range">
            <p>Record how much you spent from the Daily Entry page, or edit a day below.</p>
          </EmptyState>
        )}
      </Card>

      <Card
        title="Recorded Days"
        actions={
          <button type="button" className="btn btn-small" onClick={() => setEditing(today)}>
            <IconEdit size={14} /> Edit today
          </button>
        }
      >
        {records.length === 0 ? (
          <EmptyState title="No spending recorded yet" />
        ) : (
          <>
            <ul className="record-list">
              {visibleRecords.map((r) => (
                <li key={r.date} className="record-row">
                  <div className="record-date">
                    <span>{formatMedium(r.date)}</span>
                    <span className="record-day">
                      {relativeLabel(r.date, today) ?? weekdayName(r.date)}
                    </span>
                  </div>
                  <span className="record-amount">{formatINR(r.amount)}</span>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Edit spending for ${formatMedium(r.date)}`}
                    onClick={() => setEditing(r.date)}
                  >
                    <IconEdit size={15} />
                  </button>
                </li>
              ))}
            </ul>
            {records.length > 30 && !showAll && (
              <button type="button" className="btn btn-small" onClick={() => setShowAll(true)}>
                Show all {records.length} days
              </button>
            )}
          </>
        )}
      </Card>

      {editing && (
        <SpendEditModal
          date={editing}
          initial={data.spending[editing]?.amount ?? null}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function SpendEditModal({
  date,
  initial,
  onClose,
}: {
  date: string
  initial: number | null
  onClose: () => void
}) {
  const [value, setValue] = useState(initial !== null ? String(initial) : '')
  const [error, setError] = useState<string | null>(null)

  const save = () => {
    const trimmed = value.trim()
    if (trimmed === '') {
      setSpending(date, null)
      toast('Spending removed')
      onClose()
      return
    }
    const n = Number(trimmed)
    if (!Number.isFinite(n) || n < 0) {
      setError('Enter a number of ₹0 or more.')
      return
    }
    setSpending(date, n)
    toast('Spending saved')
    onClose()
  }

  return (
    <Modal title={`Spending — ${formatMedium(date)}`} onClose={onClose}>
      <label className="field-label" htmlFor="spend-edit">
        Amount spent (₹)
      </label>
      <input
        id="spend-edit"
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        className="input input-amount"
        value={value}
        autoFocus
        onChange={(e) => {
          setValue(e.target.value)
          setError(null)
        }}
        onKeyDown={(e) => e.key === 'Enter' && save()}
      />
      {error && <p className="field-error">{error}</p>}
      <p className="field-hint">Leave blank to remove the record for this day.</p>
      <div className="modal-footer">
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={save}>
          Save
        </button>
      </div>
    </Modal>
  )
}
