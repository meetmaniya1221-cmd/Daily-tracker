import type {
  AppData, Category, DailyEntry, Priority, RecurrenceFreq, SpendItem, SpendingRecord, Task,
} from '../types'
import { isValidKey, todayKey } from './date'
import { uid } from './id'

const EPOCH = '1970-01-01T00:00:00.000Z'

/** Parseable timestamp normalized to canonical UTC ISO, else null. */
function isoNorm(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = Date.parse(v)
  if (Number.isNaN(t)) return null
  return new Date(t).toISOString()
}

/**
 * Structural sanitizer shared by storage load and backup import.
 * Tolerates unknown extra fields, drops invalid items, and returns null only
 * when the value is not recognizably app data at all.
 */
export function sanitizeAppData(raw: unknown): AppData | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  if (obj.version !== 1) return null
  if (!Array.isArray(obj.categories) || typeof obj.entries !== 'object' || obj.entries === null) {
    return null
  }

  const categories: Category[] = []
  const seenIds = new Set<string>()
  for (const c of obj.categories as unknown[]) {
    const cat = sanitizeCategory(c)
    if (cat && !seenIds.has(cat.id)) {
      seenIds.add(cat.id)
      categories.push(cat)
    }
  }
  // Daily tracking needs at least one active category — an all-archived or
  // empty set would break entry creation, so such data is not accepted.
  if (categories.length === 0 || !categories.some((c) => c.active)) return null

  // Normalize display order: imports may carry duplicate or defaulted order
  // values, which would make reordering a silent no-op.
  categories
    .slice()
    .sort((a, b) => a.order - b.order || (a.createdAt < b.createdAt ? -1 : 1))
    .forEach((c, i) => {
      c.order = i
    })

  const entries: Record<string, DailyEntry> = {}
  for (const [key, value] of Object.entries(obj.entries as Record<string, unknown>)) {
    const entry = sanitizeEntry(key, value)
    if (entry) entries[key] = entry
  }

  const spending: Record<string, SpendingRecord> = {}
  if (obj.spending && typeof obj.spending === 'object') {
    for (const [key, value] of Object.entries(obj.spending as Record<string, unknown>)) {
      const rec = sanitizeSpending(key, value)
      if (rec) spending[key] = rec
    }
  }

  const tasks: Task[] = []
  if (Array.isArray(obj.tasks)) {
    const seenTaskIds = new Set<string>()
    for (const t of obj.tasks as unknown[]) {
      const task = sanitizeTask(t)
      if (task && !seenTaskIds.has(task.id)) {
        seenTaskIds.add(task.id)
        tasks.push(task)
      }
    }
  }

  const rawSettings = (obj.settings ?? {}) as Record<string, unknown>
  const theme = rawSettings.theme === 'light' || rawSettings.theme === 'dark' ? rawSettings.theme : null

  return { version: 1, categories, entries, spending, tasks, settings: { theme } }
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v : null
}

function isoOrNow(v: unknown): string {
  return isoNorm(v) ?? new Date().toISOString()
}

/**
 * updatedAt for imported records: never default to "now" — merge resolves
 * conflicts by newer-wins, and a record of unknown age must not beat genuine
 * current data. Fall back to createdAt, then the epoch.
 */
function isoUpdatedAt(updatedAt: unknown, createdAt: unknown): string {
  return isoNorm(updatedAt) ?? isoNorm(createdAt) ?? EPOCH
}

function sanitizeCategory(raw: unknown): Category | null {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Record<string, unknown>
  const name = str(c.name)
  if (!name) return null
  return {
    id: str(c.id) ?? uid(),
    name: name.trim().slice(0, 60),
    active: c.active !== false,
    order: typeof c.order === 'number' && Number.isFinite(c.order) ? c.order : 0,
    colorSlot: typeof c.colorSlot === 'number' && Number.isFinite(c.colorSlot)
      ? Math.abs(Math.trunc(c.colorSlot))
      : 0,
    createdAt: isoOrNow(c.createdAt),
    ...(isoNorm(c.archivedAt) ? { archivedAt: isoNorm(c.archivedAt) as string } : {}),
  }
}

function sanitizeEntry(key: string, raw: unknown): DailyEntry | null {
  if (!isValidKey(key) || !raw || typeof raw !== 'object') return null
  const e = raw as Record<string, unknown>
  if (!e.scores || typeof e.scores !== 'object') return null
  const scores: Record<string, number> = {}
  for (const [catId, v] of Object.entries(e.scores as Record<string, unknown>)) {
    if (typeof v === 'number' && Number.isFinite(v)) {
      const n = Math.round(v)
      if (n >= 0 && n <= 10) scores[catId] = n
    }
  }
  if (Object.keys(scores).length === 0) return null
  return {
    date: key,
    scores,
    createdAt: isoOrNow(e.createdAt),
    updatedAt: isoUpdatedAt(e.updatedAt, e.createdAt),
  }
}

const MAX_SPEND_ITEMS = 50

function sanitizeSpending(key: string, raw: unknown): SpendingRecord | null {
  if (!isValidKey(key) || !raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>

  // Itemized record: the items are authoritative, the total is their sum.
  const items: SpendItem[] = []
  if (Array.isArray(s.items)) {
    for (const rawItem of (s.items as unknown[]).slice(0, MAX_SPEND_ITEMS)) {
      if (!rawItem || typeof rawItem !== 'object') continue
      const it = rawItem as Record<string, unknown>
      if (
        typeof it.amount !== 'number' ||
        !Number.isFinite(it.amount) ||
        it.amount < 0 ||
        it.amount > 1e12
      ) {
        continue
      }
      items.push({
        label: typeof it.label === 'string' ? it.label.trim().slice(0, 80) : '',
        amount: Math.round(it.amount * 100) / 100,
      })
    }
  }
  if (items.length > 0) {
    const total = Math.round(items.reduce((a, b) => a + b.amount, 0) * 100) / 100
    if (total > 1e12) return null
    return { amount: total, items, updatedAt: isoUpdatedAt(s.updatedAt, null) }
  }

  // Plain daily total (records from before itemization, or without detail).
  if (typeof s.amount !== 'number' || !Number.isFinite(s.amount) || s.amount < 0) return null
  if (s.amount > 1e12) return null // absurd values would overflow formatting
  return { amount: Math.round(s.amount * 100) / 100, updatedAt: isoUpdatedAt(s.updatedAt, null) }
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high']
const FREQS: RecurrenceFreq[] = ['daily', 'weekly', 'monthly']

function sanitizeTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== 'object') return null
  const t = raw as Record<string, unknown>
  const title = str(t.title)
  if (!title) return null
  let deadline = isValidKey(t.deadline) ? (t.deadline as string) : undefined
  const rec = t.recurrence as Record<string, unknown> | undefined
  const freq = rec && FREQS.includes(rec.freq as RecurrenceFreq) ? (rec.freq as RecurrenceFreq) : null
  // Recurring tasks always carry a deadline — it anchors the schedule.
  if (freq && !deadline) deadline = todayKey()
  return {
    id: str(t.id) ?? uid(),
    title: title.trim().slice(0, 200),
    priority: PRIORITIES.includes(t.priority as Priority) ? (t.priority as Priority) : 'medium',
    ...(deadline ? { deadline } : {}),
    completed: t.completed === true,
    ...(isValidKey(t.completedOn) ? { completedOn: t.completedOn as string } : {}),
    ...(freq ? { recurrence: { freq } } : {}),
    ...(str(t.seriesId) ? { seriesId: t.seriesId as string } : {}),
    createdAt: isoOrNow(t.createdAt),
    updatedAt: isoUpdatedAt(t.updatedAt, t.createdAt),
  }
}

export interface DataCounts {
  categories: number
  entries: number
  spending: number
  tasks: number
  firstEntry: string | null
  lastEntry: string | null
}

export function countData(data: AppData): DataCounts {
  const dates = Object.keys(data.entries).sort()
  return {
    categories: data.categories.length,
    entries: dates.length,
    spending: Object.keys(data.spending).length,
    tasks: data.tasks.length,
    firstEntry: dates[0] ?? null,
    lastEntry: dates[dates.length - 1] ?? null,
  }
}
