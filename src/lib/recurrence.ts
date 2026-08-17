import type { RecurrenceFreq, Task } from '../types'
import { addDays, addMonthsClamped } from './date'
import { uid } from './id'

function step(key: string, freq: RecurrenceFreq): string {
  switch (freq) {
    case 'daily':
      return addDays(key, 1)
    case 'weekly':
      return addDays(key, 7)
    case 'monthly':
      return addMonthsClamped(key, 1)
  }
}

/**
 * Next occurrence date for a recurring task completed "today": advance from
 * the occurrence's own deadline (keeping weekly/monthly anchors) until the
 * result is strictly in the future, so completing an overdue task never
 * spawns another overdue copy.
 */
export function nextOccurrenceDate(deadline: string, freq: RecurrenceFreq, today: string): string {
  let next = step(deadline, freq)
  let guard = 0
  while (next <= today && guard < 5000) {
    next = step(next, freq)
    guard++
  }
  return next
}

export function makeNextOccurrence(occurrence: Task, today: string): Task | null {
  if (!occurrence.recurrence) return null
  const anchor = occurrence.deadline ?? today
  const now = new Date().toISOString()
  return {
    id: uid(),
    title: occurrence.title,
    priority: occurrence.priority,
    deadline: nextOccurrenceDate(anchor, occurrence.recurrence.freq, today),
    completed: false,
    recurrence: { freq: occurrence.recurrence.freq },
    seriesId: occurrence.seriesId ?? occurrence.id,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * A recurring series must always have exactly one pending occurrence.
 * Returns the tasks to append so that holds (normally empty — completion
 * spawns the next occurrence — but imports or edits can leave a series
 * fully completed). Never backfills missed periods.
 */
export function catchUpRecurring(tasks: Task[], today: string): Task[] {
  const bySeries = new Map<string, Task[]>()
  for (const t of tasks) {
    if (!t.recurrence) continue
    const key = t.seriesId ?? t.id
    const list = bySeries.get(key) ?? []
    list.push(t)
    bySeries.set(key, list)
  }
  const additions: Task[] = []
  for (const series of bySeries.values()) {
    if (series.some((t) => !t.completed)) continue
    const latest = series.reduce((a, b) =>
      (a.deadline ?? a.createdAt) >= (b.deadline ?? b.createdAt) ? a : b,
    )
    const next = makeNextOccurrence(latest, today)
    if (next) additions.push(next)
  }
  return additions
}
