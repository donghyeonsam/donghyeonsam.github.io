// Installed from reactbits.dev (Components/AccordionGallery, TS-CSS variant)
// via https://reactbits.dev/r/AccordionGallery-TS-CSS.json, then adapted:
// panels now take a title/desc/tags/icon item shape (instead of photo-only)
// so a project card can render without an image, using line-art SVG or text.
import { useRef, useEffect, useState, useCallback, CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { gsap } from 'gsap'

import './AccordionGallery.css'

export interface AccordionGalleryItem {
  id: string
  label: string
  desc?: string
  tags?: string[]
  image?: string
  icon?: ReactNode
  link?: string
  alt?: string
}

export interface AccordionGalleryProps {
  items: AccordionGalleryItem[]
  defaultIndex?: number
  accentColor?: string
  overlayColor?: string
  textColor?: string
  height?: number
  gap?: number
  radius?: number
  expandRatio?: number
  orientation?: 'horizontal' | 'vertical'
  duration?: number
  ease?: string
  parallax?: number
  tilt?: number
  stagger?: number
  trigger?: 'hover' | 'click'
  className?: string
}

const AccordionGallery = ({
  items,
  defaultIndex = 0,
  accentColor = 'var(--ink)',
  overlayColor = 'var(--ink)',
  textColor = 'var(--paper)',
  height = 420,
  gap = 0,
  radius = 0,
  expandRatio = 0.56,
  orientation = 'horizontal',
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = 'hover',
  className = ''
}: AccordionGalleryProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<(HTMLElement | null)[]>([])
  const mediaRefs = useRef<(HTMLElement | null)[]>([])
  const barRefs = useRef<(HTMLElement | null)[]>([])
  const revealRefs = useRef<(HTMLElement | null)[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const firstRunRef = useRef(true)
  const mediaSizeRef = useRef(320)

  const vertical = orientation === 'vertical'
  const count = items.length
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1))

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current
      if (!panels.length) return

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9)
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1
      const mediaSize = mediaSizeRef.current

      tlRef.current?.kill()
      const dur = animate && !prefersReduced ? duration : 0
      const tl = gsap.timeline()

      panels.forEach((panel, i) => {
        if (!panel) return
        const isActive = i === active
        const media = mediaRefs.current[i]
        const bar = barRefs.current[i]
        const reveal = revealRefs.current[i]

        const rot = isActive ? 0 : i < active ? tilt : -tilt
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot }

        tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0)

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i))
          const shift = drift * parallax * mediaSize * 0.06
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              duration: dur,
              ease
            },
            0
          )
        }

        if (bar) {
          tl.to(bar, { scaleY: isActive ? 1 : 0, duration: dur, ease }, 0)
        }
        if (reveal) {
          if (isActive) {
            tl.to(reveal, { autoAlpha: 1, y: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0)
          } else {
            tl.to(reveal, { autoAlpha: 0, y: 10, duration: dur * 0.6, ease }, 0)
          }
        }
      })

      tlRef.current = tl
    },
    [active, count, expandRatio, duration, ease, vertical, tilt, parallax, stagger, prefersReduced]
  )

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const measure = () => {
      const rect = el.getBoundingClientRect()
      const total = vertical ? rect.height : rect.width
      const usable = Math.max(total - gap * (count - 1), 120)
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22)
      mediaSizeRef.current = size
      el.style.setProperty('--ag-media-size', `${size}px`)
      applyLayout(!firstRunRef.current)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [applyLayout, gap, count, expandRatio, vertical])

  useEffect(() => {
    applyLayout(!firstRunRef.current)
    firstRunRef.current = false
  }, [applyLayout])

  useEffect(
    () => () => {
      tlRef.current?.kill()
    },
    []
  )

  const handleEnter = (i: number) => {
    if (trigger === 'hover') setActive(i)
  }

  const handleClick = (i: number, e: MouseEvent) => {
    if (i !== active) {
      e.preventDefault()
      setActive(i)
    }
  }

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i + 1) % count)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i - 1 + count) % count)
    }
  }

  const rootStyle = {
    '--ag-accent': accentColor,
    '--ag-overlay': overlayColor,
    '--ag-text': textColor,
    '--ag-gap': `${gap}px`,
    '--ag-radius': `${radius}px`,
    height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px`
  } as CSSProperties

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${vertical ? ' accordion-gallery--vertical' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      role="list"
      aria-label="Project accordion gallery"
    >
      {items.map((item, i) => {
        const isActive = i === active
        const hasImage = Boolean(item.image)
        const Tag = (item.link ? 'a' : 'div') as 'a'
        return (
          <Tag
            key={item.id}
            ref={(el: HTMLElement | null) => {
              panelRefs.current[i] = el
            }}
            className={`ag-panel${isActive ? ' ag-panel--active' : ''}${hasImage ? '' : ' ag-panel--noimage'}`}
            style={{ borderRadius: `${radius}px` }}
            href={item.link || undefined}
            onClick={e => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={e => handleKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.label}
          >
            <span className="ag-panel__title-bar">
              <span
                className="ag-panel__bar"
                ref={(el: HTMLElement | null) => {
                  barRefs.current[i] = el
                }}
              />
              <span className="ag-panel__title">{item.label}</span>
            </span>

            {hasImage ? (
              <span className="ag-panel__frame">
                <span
                  className="ag-panel__media"
                  ref={(el: HTMLElement | null) => {
                    mediaRefs.current[i] = el
                  }}
                >
                  <img src={item.image} alt={item.alt || item.label} draggable={false} />
                </span>
              </span>
            ) : item.icon ? (
              <span className="ag-panel__art" aria-hidden="true">
                {item.icon}
              </span>
            ) : (
              <span className="ag-panel__art ag-panel__art--empty" aria-hidden="true" />
            )}

            {(item.desc || (item.tags && item.tags.length > 0)) && (
              <span
                className="ag-panel__reveal"
                ref={(el: HTMLElement | null) => {
                  revealRefs.current[i] = el
                }}
              >
                {item.desc && <span className="ag-panel__desc">{item.desc}</span>}
                {item.tags && item.tags.length > 0 && (
                  <span className="ag-panel__tags">
                    {item.tags.map(tag => (
                      <span className="ag-panel__tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            )}
          </Tag>
        )
      })}
    </div>
  )
}

export default AccordionGallery
