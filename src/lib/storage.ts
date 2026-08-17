import type { AppData, Category } from '../types'
import { sanitizeAppData } from './validate'
import { uid } from './id'

export const STORAGE_KEY = 'daily-tracker.data.v1'

export const storageAvailable: boolean = (() => {
  try {
    const probe = '__daily_tracker_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
})()

const DEFAULT_CATEGORIES = ['Fitness', 'Relationship', 'Social', 'Business', 'Study', 'Personal']

export function seedData(): AppData {
  const now = new Date().toISOString()
  const categories: Category[] = DEFAULT_CATEGORIES.map((name, i) => ({
    id: uid(),
    name,
    active: true,
    order: i,
    colorSlot: i,
    createdAt: now,
  }))
  return {
    version: 1,
    categories,
    entries: {},
    spending: {},
    tasks: [],
    settings: { theme: null },
  }
}

export function loadData(): AppData {
  if (!storageAvailable) return seedData()
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return seedData()
  }
  if (!raw) return seedData()
  try {
    const parsed = JSON.parse(raw)
    const clean = sanitizeAppData(parsed)
    if (clean) return clean
  } catch {
    // fall through to preserve + seed
  }
  // Existing data is unreadable: preserve the raw payload before starting fresh
  // so nothing is silently destroyed.
  try {
    localStorage.setItem(`${STORAGE_KEY}.corrupt-${Date.now()}`, raw)
  } catch {
    // best effort only
  }
  return seedData()
}

export type SaveResult = { ok: true } | { ok: false; reason: 'unavailable' | 'quota' }

export function saveData(data: AppData): SaveResult {
  if (!storageAvailable) return { ok: false, reason: 'unavailable' }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { ok: true }
  } catch {
    return { ok: false, reason: 'quota' }
  }
}
