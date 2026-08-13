// Row reveal + hover accent line adapted from reactbits.dev's LineSidebar /
// AnimatedList patterns (motion/react stagger + IntersectionObserver
// infinite scroll), restyled with this site's own ink/paper palette & fonts.
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { ClassifiedItem } from '../data/types'

interface ClassifiedListProps {
  id: string
  title: string
  desc: string
  items: ClassifiedItem[]
  basePath: 'til' | 'techlogs'
  seeAllHref: string
  pageSize?: number
}

const rowVariants = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0 },
}

const barVariants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1 },
}

function ClassifiedList({ id, title, desc, items, basePath, seeAllHref, pageSize = 10 }: ClassifiedListProps) {
  const [visibleCount, setVisibleCount] = useState(Math.min(pageSize, items.length))
  const sentinelRef = useRef<HTMLLIElement | null>(null)

  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  )

  useEffect(() => {
    setVisibleCount(Math.min(pageSize, items.length))
  }, [items, pageSize])

  const hasMore = visibleCount < items.length

  // Infinite scroll: reveal the next page once the sentinel row nears the
  // viewport, so pages load a little before the user hits bottom.
  useEffect(() => {
    if (!hasMore) return
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + pageSize, items.length))
        }
      },
      { rootMargin: '200px 0px', threshold: 0 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, pageSize, items.length])

  // IntersectionObserver only fires on true/false transitions, so if a
  // loaded page still leaves the sentinel on-screen (short lists, tall
  // viewports) it never refires on its own. Re-check geometry after every
  // load and keep pulling in pages until the sentinel actually scrolls
  // out of range or the list is exhausted.
  useEffect(() => {
    if (!hasMore) return
    const node = sentinelRef.current
    if (!node) return
    const frame = requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect()
      if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
        setVisibleCount((count) => Math.min(count + pageSize, items.length))
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [visibleCount, hasMore, pageSize, items.length])

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount])

  return (
    <div className="classified-box" id={id}>
      <div className="cap-bar">{title}</div>
      <div className="desc">{desc}</div>
      <ul className="classified-list">
        {visibleItems.map((item, index) => (
          <motion.li
            key={item.id}
            variants={rowVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: (index % pageSize) * 0.05 }}
          >
            <motion.span
              className="classified-list__bar"
              variants={barVariants}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: (index % pageSize) * 0.05 + 0.08 }}
              aria-hidden="true"
            />
            <Link to={`/${basePath}/${item.id}`}>
              <span className="idx">{String(index + 1).padStart(2, '0')}</span>
              <span className="classified-list__title">{item.title}</span>
              <span className="dt">{item.date}</span>
            </Link>
          </motion.li>
        ))}
        {hasMore && <li className="classified-sentinel" ref={sentinelRef} aria-hidden="true" />}
      </ul>
      <div className="see-all-row">
        <Link to={seeAllHref}>전체보기 →</Link>
      </div>
    </div>
  )
}

export default ClassifiedList
