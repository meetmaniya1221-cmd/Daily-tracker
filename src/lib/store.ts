import { useSyncExternalStore } from 'react'
import type { AppData, Priority, RecurrenceFreq, Task, ThemeName } from '../types'
import { loadData, saveData, seedData, storageAvailable } from './storage'
import { todayKey } from './date'
import { uid } from './id'
import { catchUpRecurring, makeNextOccurrence } from './recurrence'
import { mergeData } from './backup'
import { SERIES_COUNT } from './palette'

let data: AppData = loadData()
const listeners = new Set<() => void>()

export type PersistState = 'ok' | 'unavailable' | 'quota'
let persistState: PersistState = storageAvailable ? 'ok' : 'unavailable'

function emit() {
  for (const fn of listeners) fn()
}

function commit(next: AppData) {
  data = next
  const result = saveData(next)
  persistState = result.ok ? 'ok' : result.reason
  emit()
}

export function getData(): AppData {
  return data
}

export function getPersistState(): PersistState {
  return persistState
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, getData)
}

export function usePersistState(): PersistState {
  return useSyncExternalStore(subscribe, getPersistState)
}

// ---------------------------------------------------------------- entries

export function saveEntry(date: string, scores: Record<string, number>): void {
  const now = new Date().toISOString()
  const existing = data.entries[date]
  const clean: Record<string, number> = {}
  for (const [catId, v] of Object.entries(scores)) {
    const n = Math.round(v)
    if (Number.isFinite(n) && n >= 0 && n <= 10) clean[catId] = n
  }
  commit({
    ...data,
    entries: {
      ...data.entries,
      [date]: {
        date,
        scores: clean,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      },
    },
  })
}

// ---------------------------------------------------------------- spending

export function setSpending(date: string, amount: number | null): void {
  const spending = { ...data.spending }
  if (amount === null || !Number.isFinite(amount)) {
    delete spending[date]
  } else {
    const clean = Math.round(Math.max(0, amount) * 100) / 100
    spending[date] = { amount: clean, updatedAt: new Date().toISOString() }
  }
  commit({ ...data, spending })
}

// ---------------------------------------------------------------- categories

function nextColorSlot(): number {
  const used = new Map<number, number>()
  for (const c of data.categories) {
    const slot = c.colorSlot % SERIES_COUNT
    used.set(slot, (used.get(slot) ?? 0) + 1)
  }
  let best = 0
  let bestCount = Infinity
  for (let s = 0; s < SERIES_COUNT; s++) {
    const count = used.get(s) ?? 0
    if (count < bestCount) {
      best = s
      bestCount = count
    }
  }
  return best
}

export type CategoryError = 'empty' | 'duplicate' | 'last-active'

export function addCategory(name: string): CategoryError | null {
  const trimmed = name.trim()
  if (!trimmed) return 'empty'
  const exists = data.categories.some(
    (c) => !c.archivedAt && c.name.trim().toLowerCase() === trimmed.toLowerCase(),
  )
  if (exists) return 'duplicate'
  const maxOrder = data.categories.reduce((m, c) => Math.max(m, c.order), -1)
  commit({
    ...data,
    categories: [
      ...data.categories,
      {
        id: uid(),
        name: trimmed.slice(0, 60),
        active: true,
        order: maxOrder + 1,
        colorSlot: nextColorSlot(),
        createdAt: new Date().toISOString(),
      },
    ],
  })
  return null
}

export function renameCategory(id: string, name: string): CategoryError | null {
  const trimmed = name.trim()
  if (!trimmed) return 'empty'
  const exists = data.categories.some(
    (c) => c.id !== id && !c.archivedAt && c.name.trim().toLowerCase() === trimmed.toLowerCase(),
  )
  if (exists) return 'duplicate'
  commit({
    ...data,
    categories: data.categories.map((c) =>
      c.id === id ? { ...c, name: trimmed.slice(0, 60) } : c,
    ),
  })
  return null
}

export function archiveCategory(id: string): CategoryError | null {
  const activeCount = data.categories.filter((c) => c.active).length
  const target = data.categories.find((c) => c.id === id)
  if (!target || !target.active) return null
  if (activeCount <= 1) return 'last-active'
  commit({
    ...data,
    categories: data.categories.map((c) =>
      c.id === id ? { ...c, active: false, archivedAt: new Date().toISOString() } : c,
    ),
  })
  return null
}

export function restoreCategory(id: string): void {
  const maxOrder = data.categories.reduce((m, c) => Math.max(m, c.order), -1)
  commit({
    ...data,
    categories: data.categories.map((c) => {
      if (c.id !== id) return c
      const { archivedAt: _dropped, ...rest } = c
      return { ...rest, active: true, order: maxOrder + 1 }
    }),
  })
}

/** Move a category one step up or down among the active, ordered categories. */
export function moveCategory(id: string, direction: -1 | 1): void {
  const active = data.categories.filter((c) => c.active).sort((a, b) => a.order - b.order)
  const idx = active.findIndex((c) => c.id === id)
  const swapWith = active[idx + direction]
  if (idx === -1 || !swapWith) return
  const a = active[idx]
  commit({
    ...data,
    categories: data.categories.map((c) => {
      if (c.id === a.id) return { ...c, order: swapWith.order }
      if (c.id === swapWith.id) return { ...c, order: a.order }
      return c
    }),
  })
}

// ---------------------------------------------------------------- tasks

export interface TaskInput {
  title: string
  priority: Priority
  deadline?: string
  recurrence?: RecurrenceFreq | null
}

export function addTask(input: TaskInput): string | null {
  const title = input.title.trim()
  if (!title) return null
  const now = new Date().toISOString()
  const id = uid()
  const recurring = Boolean(input.recurrence)
  const task: Task = {
    id,
    title: title.slice(0, 200),
    priority: input.priority,
    // Recurring tasks always carry a deadline — it anchors the schedule.
    ...(input.deadline || recurring ? { deadline: input.deadline || todayKey() } : {}),
    completed: false,
    ...(recurring ? { recurrence: { freq: input.recurrence as RecurrenceFreq }, seriesId: id } : {}),
    createdAt: now,
    updatedAt: now,
  }
  commit({ ...data, tasks: [...data.tasks, task] })
  return id
}

export function updateTask(
  id: string,
  patch: Partial<Pick<Task, 'title' | 'priority' | 'deadline'>> & {
    recurrence?: RecurrenceFreq | null
  },
): void {
  commit({
    ...data,
    tasks: data.tasks.map((t) => {
      if (t.id !== id) return t
      const next: Task = { ...t, updatedAt: new Date().toISOString() }
      if (patch.title !== undefined) {
        const title = patch.title.trim()
        if (title) next.title = title.slice(0, 200)
      }
      if (patch.priority !== undefined) next.priority = patch.priority
      if (patch.deadline !== undefined) {
        if (patch.deadline) next.deadline = patch.deadline
        else if (!next.recurrence) delete next.deadline
      }
      if (patch.recurrence !== undefined) {
        if (patch.recurrence) {
          next.recurrence = { freq: patch.recurrence }
          next.seriesId = next.seriesId ?? next.id
          next.deadline = next.deadline ?? todayKey()
        } else {
          delete next.recurrence
        }
      }
      return next
    }),
  })
}

export function setTaskCompleted(id: string, completed: boolean): void {
  const target = data.tasks.find((t) => t.id === id)
  if (!target || target.completed === completed) return
  const now = new Date().toISOString()
  const today = todayKey()

  let tasks = data.tasks.map((t) =>
    t.id === id
      ? {
          ...t,
          completed,
          updatedAt: now,
          ...(completed ? { completedOn: today } : {}),
        }
      : t,
  )
  if (!completed) {
    tasks = tasks.map((t) => {
      if (t.id !== id) return t
      const { completedOn: _dropped, ...rest } = t
      return rest
    })
  }

  // Completing a recurring occurrence spawns the next one — unless the series
  // already has a pending occurrence (re-completing after an undo, imports).
  if (completed && target.recurrence) {
    const seriesId = target.seriesId ?? target.id
    const hasPending = tasks.some(
      (t) => t.id !== id && (t.seriesId ?? t.id) === seriesId && t.recurrence && !t.completed,
    )
    if (!hasPending) {
      const next = makeNextOccurrence({ ...target, seriesId }, today)
      if (next) tasks = [...tasks, next]
    }
  }

  commit({ ...data, tasks })
}

export function deleteTask(id: string): void {
  commit({ ...data, tasks: data.tasks.filter((t) => t.id !== id) })
}

/** Ensure every recurring series has a pending occurrence (run at startup). */
export function runRecurringCatchUp(): void {
  const additions = catchUpRecurring(data.tasks, todayKey())
  if (additions.length > 0) {
    commit({ ...data, tasks: [...data.tasks, ...additions] })
  }
}

// ---------------------------------------------------------------- settings & data

export function setTheme(theme: ThemeName | null): void {
  commit({ ...data, settings: { ...data.settings, theme } })
}

export function replaceAllData(next: AppData): void {
  // Keep the current theme choice unless the import explicitly carries one.
  commit({ ...next, settings: { theme: next.settings.theme ?? data.settings.theme } })
}

export function mergeImportedData(imported: AppData): void {
  commit(mergeData(data, imported))
}

export function clearAllData(): void {
  const fresh = seedData()
  commit({ ...fresh, settings: { theme: data.settings.theme } })
}
