/**
 * All dates in the app are local-calendar date keys: "YYYY-MM-DD".
 * Keys are produced from local time (never toISOString) to avoid timezone bugs,
 * and compare correctly as plain strings.
 */

const pad = (n: number) => String(n).padStart(2, '0')

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Parse a date key to a Date at local midnight. */
export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey(): string {
  return toKey(new Date())
}

export function isValidKey(key: unknown): key is string {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false
  const d = parseKey(key)
  return !Number.isNaN(d.getTime()) && toKey(d) === key
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

/** Whole days from a to b (positive when b is later). */
export function diffDays(a: string, b: string): number {
  return Math.round((parseKey(b).getTime() - parseKey(a).getTime()) / 86_400_000)
}

/** Add months, clamping the day (Jan 31 + 1mo -> Feb 28). */
export function addMonthsClamped(key: string, n: number): string {
  const [y, m, day] = key.split('-').map(Number)
  const first = new Date(y, m - 1 + n, 1)
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  first.setDate(Math.min(day, lastDay))
  return toKey(first)
}

/** Monday of the week containing the key. */
export function startOfWeek(key: string): string {
  const d = parseKey(key)
  const dow = (d.getDay() + 6) % 7 // Mon=0 .. Sun=6
  return addDays(key, -dow)
}

export function startOfMonth(key: string): string {
  return key.slice(0, 8) + '01'
}

export function endOfMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return toKey(new Date(y, m, 0))
}

/** Inclusive list of date keys from start to end. */
export function daysInRange(start: string, end: string): string[] {
  const out: string[] = []
  let k = start
  while (k <= end) {
    out.push(k)
    k = addDays(k, 1)
  }
  return out
}

/** The n date keys ending at (and including) end. */
export function lastNDays(n: number, end: string): string[] {
  return daysInRange(addDays(end, -(n - 1)), end)
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Parse for display: never crash on a malformed key — fall back to raw text. */
function parseSafe(key: string): Date | null {
  const d = parseKey(key)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "17 August 2026" */
export function formatFull(key: string): string {
  const d = parseSafe(key)
  if (!d) return key
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** "17 Aug 2026" */
export function formatMedium(key: string): string {
  const d = parseSafe(key)
  if (!d) return key
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}

/** "17 Aug" */
export function formatShort(key: string): string {
  const d = parseSafe(key)
  if (!d) return key
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`
}

/** "Aug '26" */
export function formatMonthShort(key: string): string {
  const d = parseSafe(key)
  if (!d) return key
  return `${MONTHS[d.getMonth()].slice(0, 3)} '${String(d.getFullYear()).slice(2)}`
}

/** "August 2026" */
export function formatMonthYear(key: string): string {
  const d = parseSafe(key)
  if (!d) return key
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** "Sunday" */
export function weekdayName(key: string): string {
  const d = parseSafe(key)
  if (!d) return ''
  return WEEKDAYS[d.getDay()]
}

/** Local calendar date of an ISO timestamp, as a display string. */
export function timestampToLocalDate(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ''
  return formatMedium(toKey(new Date(t)))
}

/** Human-friendly relative label where it helps. */
export function relativeLabel(key: string, today: string): string | null {
  if (key === today) return 'Today'
  if (key === addDays(today, -1)) return 'Yesterday'
  if (key === addDays(today, 1)) return 'Tomorrow'
  return null
}
