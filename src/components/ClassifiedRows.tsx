// Shared row list used by both the homepage's ClassifiedList (top N) and the
// "전체보기" full-list pages (all items) — same reactbits LineSidebar-style
// reveal + hover accent line either way.
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { motion } from 'motion/react'
import type { ClassifiedItem } from '../data/types'

interface ClassifiedRowsProps {
  items: ClassifiedItem[]
  basePath: 'til' | 'techlogs'
  startIndex?: number
}

const rowVariants = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0 },
}

const barVariants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1 },
}

function ClassifiedRows({ items, basePath, startIndex = 0 }: ClassifiedRowsProps) {
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  )

  return (
    <ul className="classified-list">
      {items.map((item, i) => {
        const index = startIndex + i
        // Cap the stagger delay so long lists don't leave later rows
        // waiting a full second to animate in.
        const delay = (index % 8) * 0.06
        return (
          <motion.li
            key={item.id}
            variants={rowVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
          >
            <motion.span
              className="classified-list__bar"
              variants={barVariants}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: delay + 0.08 }}
              aria-hidden="true"
            />
            <Link to={`/${basePath}/${item.id}`}>
              <span className="idx">{String(index + 1).padStart(2, '0')}</span>
              <span className="classified-list__title">{item.title}</span>
              <span className="dt">{item.date}</span>
            </Link>
          </motion.li>
        )
      })}
    </ul>
  )
}

export default ClassifiedRows
