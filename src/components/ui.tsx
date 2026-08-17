import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Priority } from '../types'
import { formatChange } from '../lib/format'
import { IconArrowDown, IconArrowUp, IconX } from './Icons'

// ---------------------------------------------------------------- cards

export function Card({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`card${className ? ` ${className}` : ''}`}>
      {(title || actions) && (
        <header className="card-head">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

export function StatTile({
  label,
  value,
  hint,
  delta,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  delta?: { value: number; vs: string } | null
}) {
  return (
    <div className="stat-tile">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {delta != null && (
        <div className="stat-delta">
          <ChangeArrow value={delta.value} />
          <span>
            {formatChange(delta.value)} vs {delta.vs}
          </span>
        </div>
      )}
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  )
}

/** Neutral direction indicator — shows the mathematical change, no judgement. */
export function ChangeArrow({ value }: { value: number }) {
  if (Math.abs(value) < 0.05) return <span className="delta-flat">—</span>
  return value > 0 ? (
    <IconArrowUp size={14} className="delta-arrow" />
  ) : (
    <IconArrowDown size={14} className="delta-arrow" />
  )
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <p className="empty-title">{title}</p>
      {children && <div className="empty-body">{children}</div>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  )
}

// ---------------------------------------------------------------- controls

export function Chip({
  selected,
  onClick,
  children,
  swatch,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
  swatch?: string
}) {
  return (
    <button
      type="button"
      className={`chip${selected ? ' chip-selected' : ''}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      {swatch && <span className="chip-swatch" style={{ background: swatch }} />}
      {children}
    </button>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div className="seg" role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`seg-item${opt.value === value ? ' seg-selected' : ''}`}
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/** Horizontal meter: filled part carries the color, track is a soft step of it. */
export function ScoreBar({ score, max = 10, color }: { score: number; max?: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100))
  return (
    <div className="score-bar" role="img" aria-label={`${score} out of ${max}`}>
      <div className="score-bar-track" style={{ background: color, opacity: 0.18 }} />
      <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

const PRIORITY_LABEL: Record<Priority, string> = { low: 'Low', medium: 'Medium', high: 'High' }

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`priority priority-${priority}`}>{PRIORITY_LABEL[priority]}</span>
}

// ---------------------------------------------------------------- modal

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // Move focus into the dialog so keyboard users land inside it.
    const first = ref.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea',
    )
    first?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={`modal${wide ? ' modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
      >
        <header className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <IconX size={18} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string
  body: ReactNode
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="confirm-body">{body}</div>
      <div className="modal-footer">
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
