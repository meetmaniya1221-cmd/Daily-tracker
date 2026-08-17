import { useSyncExternalStore } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}

let toasts: ToastItem[] = []
let nextId = 1
const listeners = new Set<() => void>()

function emit() {
  for (const fn of listeners) fn()
}

export function toast(message: string, kind: ToastKind = 'success'): void {
  const item = { id: nextId++, message, kind }
  toasts = [...toasts, item]
  emit()
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== item.id)
    emit()
  }, 3500)
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function Toaster() {
  const items = useSyncExternalStore(subscribe, () => toasts)
  if (items.length === 0) return null
  return (
    <div className="toaster" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
