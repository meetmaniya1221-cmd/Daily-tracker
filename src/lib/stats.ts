import type { AppData, DailyEntry } from '../types'
import { addDays, startOfMonth, startOfWeek } from './date'
import { round1 } from './format'

export function mean(nums: number[]): number | null {
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

/** Arithmetic average of every score recorded in the entry (exact, unrounded). */
export function overallOf(entry: DailyEntry): number | null {
  return mean(Object.values(entry.scores))
}

/** Entries whose date falls in [start, end], sorted ascending. */
export function entriesInRange(
  entries: Record<string, DailyEntry>,
  start: string,
  end: string,
): DailyEntry[] {
  return Object.values(entries)
    .filter((e) => e.date >= start && e.date <= end)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}

/** Average of daily overall scores across the given entries. */
export function averageOverall(list: DailyEntry[]): number | null {
  const overalls = list
    .map(overallOf)
    .filter((v): v is number => v !== null)
  return mean(overalls)
}

/** Average of one category's scores across entries where it was recorded. */
export function categoryAverage(list: DailyEntry[], categoryId: string): number | null {
  const vals = list
    .map((e) => e.scores[categoryId])
    .filter((v): v is number => typeof v === 'number')
  return mean(vals)
}

export interface LifeScores {
  week: number | null
  month: number | null
  allTime: number | null
}

export function lifeScores(entries: Record<string, DailyEntry>, today: string): LifeScores {
  const all = Object.values(entries)
  return {
    week: averageOverall(all.filter((e) => e.date >= startOfWeek(today) && e.date <= today)),
    month: averageOverall(all.filter((e) => e.date >= startOfMonth(today) && e.date <= today)),
    allTime: averageOverall(all),
  }
}

export interface StreakInfo {
  count: number
  todayDone: boolean
}

/**
 * Consecutive days with a saved entry, ending today (or yesterday when today
 * is still pending — the streak is alive until the day is actually missed).
 */
export function streakInfo(entries: Record<string, DailyEntry>, today: string): StreakInfo {
  const todayDone = Boolean(entries[today])
  let count = 0
  let d = todayDone ? today : addDays(today, -1)
  while (entries[d]) {
    count++
    d = addDays(d, -1)
  }
  return { count, todayDone }
}

/** Total spending across a date range (inclusive). */
export function spendingInRange(data: AppData, start: string, end: string): number {
  let total = 0
  for (const [date, rec] of Object.entries(data.spending)) {
    if (date >= start && date <= end) total += rec.amount
  }
  return total
}

export function spendingAllTime(data: AppData): number {
  return Object.values(data.spending).reduce((a, r) => a + r.amount, 0)
}

/**
 * Score status labels. Boundaries are applied to the *displayed* (rounded)
 * value so the label always matches the number shown next to it.
 */
export const SCORE_LABELS: { min: number; label: string }[] = [
  { min: 9, label: 'Excellent' },
  { min: 8, label: 'Great' },
  { min: 6.5, label: 'Good' },
  { min: 5, label: 'Average' },
  { min: 3, label: 'Low' },
  { min: 0, label: 'Very Low' },
]

export function scoreLabel(score: number): string {
  const shown = round1(score)
  for (const { min, label } of SCORE_LABELS) {
    if (shown >= min) return label
  }
  return SCORE_LABELS[SCORE_LABELS.length - 1].label
}
