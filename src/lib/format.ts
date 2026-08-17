const inrWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
const inrPaise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) return inrWhole.format(0)
  return Number.isInteger(amount) ? inrWhole.format(amount) : inrPaise.format(amount)
}

/** Compact rupee figure for chart axes: ₹1.2k, ₹85k, ₹1.2L */
export function formatINRCompact(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0'
  const abs = Math.abs(amount)
  if (abs >= 100_000) return `₹${trim1(amount / 100_000)}L`
  if (abs >= 1_000) return `₹${trim1(amount / 1_000)}k`
  return `₹${Math.round(amount)}`
}

function trim1(n: number): string {
  const s = (Math.round(n * 10) / 10).toFixed(1)
  return s.endsWith('.0') ? s.slice(0, -2) : s
}

/** Round to one decimal for display, keeping underlying math exact. */
export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** "7.2" — averages always show one decimal. */
export function formatScore(n: number): string {
  return round1(n).toFixed(1)
}

/** Signed change: "+0.6" / "−0.6" / "0.0" */
export function formatChange(n: number): string {
  const r = round1(n)
  if (r > 0) return `+${r.toFixed(1)}`
  if (r < 0) return `−${Math.abs(r).toFixed(1)}`
  return '0.0'
}
