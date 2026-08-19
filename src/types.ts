export type Priority = 'low' | 'medium' | 'high'
export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly'
export type ThemeName = 'light' | 'dark'

export interface Category {
  id: string
  name: string
  active: boolean
  order: number
  /** Stable index into the categorical palette, assigned at creation. */
  colorSlot: number
  createdAt: string
  archivedAt?: string
}

export interface DailyEntry {
  /** Local calendar date, YYYY-MM-DD. Exactly one entry per date. */
  date: string
  /** categoryId -> integer score 0..10. Only categories active at entry time. */
  scores: Record<string, number>
  createdAt: string
  updatedAt: string
}

export interface SpendItem {
  /** What / where the money went. May be empty for a quick unlabeled entry. */
  label: string
  /** Rupees, >= 0. */
  amount: number
}

export interface SpendingRecord {
  /** Total rupees spent that day — always the sum of items when items exist. */
  amount: number
  /** Optional breakdown of the day's spending. */
  items?: SpendItem[]
  updatedAt: string
}

export interface Recurrence {
  freq: RecurrenceFreq
}

export interface Task {
  id: string
  title: string
  priority: Priority
  /** Local YYYY-MM-DD. Recurring tasks always have one. */
  deadline?: string
  completed: boolean
  /** Local date key of the day the task was completed. */
  completedOn?: string
  recurrence?: Recurrence
  /** Shared by every occurrence of one recurring task. */
  seriesId?: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  /** null = follow the system preference. */
  theme: ThemeName | null
}

export interface AppData {
  version: 1
  categories: Category[]
  entries: Record<string, DailyEntry>
  spending: Record<string, SpendingRecord>
  tasks: Task[]
  settings: Settings
}

export interface BackupFile extends AppData {
  exportedAt: string
  app: string
}
