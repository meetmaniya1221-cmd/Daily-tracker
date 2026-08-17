import { useRef } from 'react'

const SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/**
 * Compact 0–10 whole-number selector. Behaves as a radio group: arrow keys
 * move the selection, click/tap sets it directly.
 */
export function ScorePicker({
  value,
  onChange,
  label,
}: {
  value: number | null
  onChange: (v: number) => void
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(10, (value ?? -1) + 1)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(0, (value ?? 1) - 1)
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = 10
    if (next !== null) {
      e.preventDefault()
      onChange(next)
      ref.current
        ?.querySelector<HTMLButtonElement>(`[data-score="${next}"]`)
        ?.focus()
    }
  }

  return (
    <div
      className="score-picker"
      role="radiogroup"
      aria-label={`${label} score, 0 to 10`}
      onKeyDown={onKeyDown}
      ref={ref}
    >
      {SCORES.map((n) => {
        const selected = value === n
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected}
            data-score={n}
            tabIndex={selected || (value === null && n === 0) ? 0 : -1}
            className={`score-cell${selected ? ' score-cell-selected' : ''}`}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}
