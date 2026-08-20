import { useEffect, useRef, useState } from 'react'

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

/**
 * Animate a number toward its target with an ease-out curve (counts up from
 * 0 on first render). Snaps instantly when the user prefers reduced motion.
 */
export function useCountUp(target: number | null, duration = 750): number | null {
  const [value, setValue] = useState<number | null>(target === null ? null : 0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (target === null) {
      setValue(null)
      return
    }
    if (prefersReducedMotion()) {
      setValue(target)
      fromRef.current = target
      return
    }
    const from = fromRef.current
    if (from === target) {
      setValue(target)
      return
    }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(from + (target - from) * eased)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
