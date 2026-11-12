import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CategoryIcon, ChevronDown, GraduationCap, Route } from './icons.js'
import { categoryGroups } from './nav.js'

/**
 * "Explore" button in the header with a categories menu: Technical and
 * Non-technical columns with course counts, plus All courses and Learning paths.
 * Keyboard: Enter/Space/ArrowDown opens, arrows move, Home/End jump,
 * Esc closes and returns focus; moving focus or clicking outside closes.
 */
export default function ExploreMenu() {
  const uid = useId()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const focusFirst = useRef(false)
  const { pathname } = useLocation()
  const groups = categoryGroups()

  // Close on route change.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    if (open) setOpen(false)
  }

  useEffect(() => {
    if (!open) return undefined
    const items = () => [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])]
    if (focusFirst.current) items()[0]?.focus()
    focusFirst.current = false

    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      const list = items()
      const i = list.indexOf(document.activeElement)
      const inMenu = i !== -1
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
      } else if (e.key === 'ArrowDown' && (inMenu || document.activeElement === buttonRef.current)) {
        e.preventDefault()
        list[(i + 1) % list.length]?.focus()
      } else if (e.key === 'ArrowUp' && inMenu) {
        e.preventDefault()
        list[(i - 1 + list.length) % list.length]?.focus()
      } else if (e.key === 'Home' && inMenu) {
        e.preventDefault()
        list[0]?.focus()
      } else if (e.key === 'End' && inMenu) {
        e.preventDefault()
        list[list.length - 1]?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)
  const menuId = `${uid}-menu`

  const column = (title, list, key) => (
    <div className="explore-col" role="group" aria-labelledby={`${uid}-${key}`}>
      <p className="explore-col-title" id={`${uid}-${key}`}>
        {title}
      </p>
      <ul className="explore-list" role="none">
        {list.map((c) => (
          <li key={c.slug} role="none">
            <Link role="menuitem" className="explore-item" to={`/category/${c.slug}`} onClick={close}>
              <CategoryIcon slug={c.slug} className="explore-item-icon" />
              <span className="explore-item-name">{c.name}</span>
              <span className="explore-item-count" aria-label={`${c.count} courses`}>
                {c.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div
      className="explore"
      ref={rootRef}
      onBlur={(e) => {
        // Close when focus moves outside (Tab past the last item, etc.).
        if (open && e.relatedTarget && !rootRef.current?.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`explore-button ${open ? 'is-open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            // The document listener added on open must not see this same keydown.
            e.stopPropagation()
            focusFirst.current = true
            setOpen(true)
          }
        }}
      >
        Explore
        <ChevronDown size={14} strokeWidth={2.2} className="explore-chevron" />
      </button>

      {open && (
        <div className="explore-pop" id={menuId} role="menu" aria-label="Explore courses" ref={menuRef}>
          <div className="explore-cols">
            {column('Technical', groups.technical, 'tech')}
            {column('Non-technical', groups.nonTechnical, 'non')}
          </div>
          <div className="explore-foot" role="group" aria-label="More">
            <Link role="menuitem" className="explore-foot-link" to="/courses" onClick={close}>
              <GraduationCap />
              <span>All courses</span>
              <ArrowRight size={16} className="explore-foot-arrow" />
            </Link>
            <Link role="menuitem" className="explore-foot-link" to="/paths" onClick={close}>
              <Route />
              <span>Learning paths</span>
              <ArrowRight size={16} className="explore-foot-arrow" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
