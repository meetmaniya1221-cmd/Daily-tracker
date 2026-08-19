import { useMemo, useState } from 'react'
import { SpendingChart, type SpendingPoint } from '../components/charts/SpendingChart'
import {
  SpendItemsEditor,
  parseSpendRows,
  rowsFromRecord,
  spendBreakdown,
  type SpendRow,
} from '../components/SpendItemsEditor'
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
import { setSpendingItems, useAppData } from '../lib/store'
import { spendingAllTime, spendingInRange } from '../lib/stats'
import type { SpendingRecord } from '../types'

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
        .map(([date, rec]) => ({ date, rec })),
    [data.spending],
  )
  const visibleRecords = showAll ? records : records.slice(0, 30)

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Spending</h1>
          <p className="page-sub">What you spent each day — with optional what-and-where detail</p>
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
              {visibleRecords.map((r) => {
                const breakdown = spendBreakdown(r.rec)
                return (
                  <li key={r.date} className="record-row">
                    <div className="record-date">
                      <span>{formatMedium(r.date)}</span>
                      <span className="record-day">
                        {relativeLabel(r.date, today) ?? weekdayName(r.date)}
                      </span>
                    </div>
                    <span className="record-amount">{formatINR(r.rec.amount)}</span>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Edit spending for ${formatMedium(r.date)}`}
                      onClick={() => setEditing(r.date)}
                    >
                      <IconEdit size={15} />
                    </button>
                    {breakdown && <div className="record-items">{breakdown}</div>}
                  </li>
                )
              })}
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
          initial={data.spending[editing]}
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
  initial: SpendingRecord | undefined
  onClose: () => void
}) {
  const [rows, setRows] = useState<SpendRow[]>(() => rowsFromRecord(initial))
  const [error, setError] = useState<string | null>(null)

  const save = () => {
    const parsed = parseSpendRows(rows)
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }
    setSpendingItems(date, parsed.items)
    toast(parsed.items.length === 0 ? 'Spending removed' : 'Spending saved')
    onClose()
  }

  return (
    <Modal title={`Spending — ${formatMedium(date)}`} onClose={onClose}>
      <SpendItemsEditor
        rows={rows}
        onChange={(next) => {
          setRows(next)
          setError(null)
        }}
      />
      {error && <p className="field-error">{error}</p>}
      <p className="field-hint">Remove every item to clear the record for this day.</p>
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
