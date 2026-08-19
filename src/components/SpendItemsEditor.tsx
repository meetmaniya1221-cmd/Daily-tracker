import type { SpendingRecord } from '../types'
import type { SpendItemInput } from '../lib/store'
import { formatINR } from '../lib/format'
import { uid } from '../lib/id'
import { IconPlus, IconX } from './Icons'

export interface SpendRow {
  key: string
  label: string
  amount: string
  /** The number input holds unparseable text (reported as '' by the browser). */
  badInput?: boolean
}

export function rowsFromRecord(rec: SpendingRecord | undefined): SpendRow[] {
  if (!rec) return []
  if (rec.items && rec.items.length > 0) {
    return rec.items.map((i) => ({ key: uid(), label: i.label, amount: String(i.amount) }))
  }
  return [{ key: uid(), label: '', amount: String(rec.amount) }]
}

export type ParsedRows =
  | { ok: true; items: SpendItemInput[] }
  | { ok: false; error: string }

export function parseSpendRows(rows: SpendRow[]): ParsedRows {
  const items: SpendItemInput[] = []
  for (const row of rows) {
    const label = row.label.trim()
    const amountStr = row.amount.trim()
    if (row.badInput) {
      return { ok: false, error: 'Each amount must be a number of ₹0 or more.' }
    }
    if (label === '' && amountStr === '') continue // fully empty row — ignore
    if (amountStr === '') {
      return { ok: false, error: `"${label}" needs an amount.` }
    }
    const amount = Number(amountStr)
    if (!Number.isFinite(amount) || amount < 0) {
      return { ok: false, error: 'Each amount must be a number of ₹0 or more.' }
    }
    items.push({ label, amount })
  }
  return { ok: true, items }
}

export function rowsTotal(rows: SpendRow[]): number {
  return rows.reduce((sum, r) => {
    const n = Number(r.amount)
    return Number.isFinite(n) && n >= 0 ? sum + n : sum
  }, 0)
}

/**
 * Line-item editor for a day's spending: how much went where. Labels are
 * optional so a single quick "just the total" entry stays one field.
 */
export function SpendItemsEditor({
  rows,
  onChange,
}: {
  rows: SpendRow[]
  onChange: (rows: SpendRow[]) => void
}) {
  const update = (key: string, patch: Partial<SpendRow>) =>
    onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const total = rowsTotal(rows)

  return (
    <div className="spend-items">
      {rows.length === 0 && (
        <p className="field-hint spend-items-empty">
          Nothing recorded for this day — add what you spent, item by item or as one total.
        </p>
      )}
      {rows.map((row, i) => (
        <div className="spend-item-row" key={row.key}>
          <input
            type="text"
            className="input spend-item-label"
            placeholder="What / where? (optional)"
            aria-label={`Spending item ${i + 1} description`}
            maxLength={80}
            value={row.label}
            onChange={(e) => update(row.key, { label: e.target.value })}
          />
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            className="input spend-item-amount"
            placeholder="₹0"
            aria-label={`Spending item ${i + 1} amount in rupees`}
            value={row.amount}
            onChange={(e) =>
              update(row.key, { amount: e.target.value, badInput: e.target.validity.badInput })
            }
          />
          <button
            type="button"
            className="icon-btn"
            aria-label={`Remove spending item ${i + 1}`}
            onClick={() => onChange(rows.filter((r) => r.key !== row.key))}
          >
            <IconX size={16} />
          </button>
        </div>
      ))}
      <div className="spend-items-foot">
        <button
          type="button"
          className="btn btn-small"
          onClick={() => onChange([...rows, { key: uid(), label: '', amount: '' }])}
        >
          <IconPlus size={14} /> Add item
        </button>
        {rows.length > 0 && (
          <span className="spend-total">
            Total <b>{formatINR(Math.round(total * 100) / 100)}</b>
          </span>
        )}
      </div>
    </div>
  )
}

/** "Groceries ₹450 · Auto ₹120" — compact one-line breakdown for lists. */
export function spendBreakdown(rec: SpendingRecord): string | null {
  if (!rec.items || rec.items.length === 0) return null
  if (rec.items.length === 1 && !rec.items[0].label) return null
  return rec.items
    .map((i) => `${i.label || 'Other'} ${formatINR(i.amount)}`)
    .join(' · ')
}
