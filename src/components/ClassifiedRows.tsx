// Cursor-proximity list effect, ported from reactbits.dev's LineSidebar
// (fetched its source directly: https://reactbits.dev/r/LineSidebar-TS-CSS.json)
// and restyled with this site's ink/paper palette. The original computes,
// per list item, a 0..1 "effect" from the pointer's vertical distance to
// that item's center, then eases every item toward its target in one rAF
// loop (exponential smoothing) so nothing stutters when the pointer jumps
// rows — same mechanics here, just applied to a two-column classified row
// (index/title/date) instead of a plain nav label, and a vertical accent
// bar instead of LineSidebar's horizontal tick.
import { Link } from 'react-router-dom'
import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { ClassifiedItem } from '../data/types'

interface ClassifiedRowsProps {
  items: ClassifiedItem[]
  basePath: 'til' | 'techlogs'
  startIndex?: number
}

const PROXIMITY_RADIUS = 90
const SMOOTHING_MS = 90
const smoothstep = (p: number) => p * p * (3 - 2 * p)

function ClassifiedRows({ items, basePath, startIndex = 0 }: ClassifiedRowsProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const targets = useRef<number[]>([])
  const current = useRef<number[]>([])
  const rafId = useRef<number | null>(null)
  const lastTime = useRef(0)

  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastTime.current) / 1000, 0.05)
    lastTime.current = now
    const tau = SMOOTHING_MS / 1000
    const k = 1 - Math.exp(-dt / tau)

    let moving = false
    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const target = targets.current[i] || 0
      const cur = current.current[i] || 0
      const next = cur + (target - cur) * k
      const settled = Math.abs(target - next) < 0.0015
      const value = settled ? target : next
      current.current[i] = value
      el.style.setProperty('--effect', value.toFixed(4))
      if (!settled) moving = true
    })

    rafId.current = moving ? requestAnimationFrame(runFrame) : null
  }, [])

  const startLoop = useCallback(() => {
    if (rafId.current != null) cancelAnimationFrame(rafId.current)
    lastTime.current = performance.now()
    rafId.current = requestAnimationFrame(runFrame)
  }, [runFrame])

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLUListElement>) => {
      if (e.pointerType === 'touch') return
      const list = listRef.current
      if (!list) return
      const pointerY = e.clientY - list.getBoundingClientRect().top
      itemRefs.current.forEach((el, i) => {
        if (!el) return
        const center = el.offsetTop + el.offsetHeight / 2
        const distance = Math.abs(pointerY - center)
        targets.current[i] = smoothstep(Math.max(0, 1 - distance / PROXIMITY_RADIUS))
      })
      startLoop()
    },
    [startLoop]
  )

  const handlePointerLeave = useCallback(() => {
    targets.current = targets.current.map(() => 0)
    startLoop()
  }, [startLoop])

  // Stop a stray rAF loop if the list unmounts mid-animation (route change).
  useEffect(
    () => () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current)
    },
    []
  )

  return (
    <ul className="classified-list" ref={listRef} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      {items.map((item, i) => {
        const index = startIndex + i
        return (
          <li
            key={item.id}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
          >
            <span className="classified-list__bar" aria-hidden="true" />
            <Link to={`/${basePath}/${item.id}`}>
              <span className="idx">{String(index + 1).padStart(2, '0')}</span>
              <span className="classified-list__title">{item.title}</span>
              <span className="dt">{item.date}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default ClassifiedRows
