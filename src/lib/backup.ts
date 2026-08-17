import type { AppData, BackupFile, Category } from '../types'
import { todayKey } from './date'
import { countData, sanitizeAppData, type DataCounts } from './validate'

export function makeBackup(data: AppData): BackupFile {
  return { ...data, exportedAt: new Date().toISOString(), app: 'daily-tracker' }
}

export function downloadBackup(data: AppData): void {
  const blob = new Blob([JSON.stringify(makeBackup(data), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `daily-tracker-backup-${todayKey()}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export type ParsedBackup =
  | { ok: true; data: AppData; counts: DataCounts; exportedAt: string | null }
  | { ok: false; error: string }

export function parseBackup(text: string): ParsedBackup {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'The file is not valid JSON.' }
  }
  const data = sanitizeAppData(raw)
  if (!data) {
    return {
      ok: false,
      error: 'The file is not a recognizable Daily Tracker backup (missing or invalid structure).',
    }
  }
  const exportedAt =
    raw && typeof raw === 'object' && typeof (raw as Record<string, unknown>).exportedAt === 'string'
      ? ((raw as Record<string, unknown>).exportedAt as string)
      : null
  return { ok: true, data, counts: countData(data), exportedAt }
}

/**
 * Merge a backup into current data without creating duplicates:
 * - Categories match by id, then by name (case-insensitive); unmatched ones
 *   are appended with a fresh order at the end.
 * - Entries and spending: the newer record (by updatedAt) wins per date.
 * - Tasks match by id; unmatched imported tasks are appended.
 * - Settings keep the current values.
 * Entry score keys from imported categories are rewritten when an imported
 * category was matched to an existing one by name.
 */
export function mergeData(current: AppData, imported: AppData): AppData {
  const catIdMap = new Map<string, string>() // imported category id -> resulting id
  const categories: Category[] = current.categories.map((c) => ({ ...c }))
  const byId = new Map(categories.map((c) => [c.id, c]))
  const byName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c]))
  let nextOrder = categories.reduce((m, c) => Math.max(m, c.order), -1) + 1

  for (const imp of imported.categories) {
    const match = byId.get(imp.id) ?? byName.get(imp.name.trim().toLowerCase())
    if (match) {
      catIdMap.set(imp.id, match.id)
    } else {
      const added = { ...imp, order: nextOrder++ }
      categories.push(added)
      byId.set(added.id, added)
      byName.set(added.name.trim().toLowerCase(), added)
      catIdMap.set(imp.id, added.id)
    }
  }

  const entries = { ...current.entries }
  for (const [date, impEntry] of Object.entries(imported.entries)) {
    const remapped = {
      ...impEntry,
      scores: Object.fromEntries(
        Object.entries(impEntry.scores).map(([catId, v]) => [catIdMap.get(catId) ?? catId, v]),
      ),
    }
    const existing = entries[date]
    if (!existing || impEntry.updatedAt > existing.updatedAt) {
      entries[date] = remapped
    }
  }

  const spending = { ...current.spending }
  for (const [date, rec] of Object.entries(imported.spending)) {
    const existing = spending[date]
    if (!existing || rec.updatedAt > existing.updatedAt) {
      spending[date] = { ...rec }
    }
  }

  const taskIds = new Set(current.tasks.map((t) => t.id))
  const tasks = [
    ...current.tasks,
    ...imported.tasks.filter((t) => !taskIds.has(t.id)),
  ]

  return {
    version: 1,
    categories,
    entries,
    spending,
    tasks,
    settings: { ...current.settings },
  }
}
