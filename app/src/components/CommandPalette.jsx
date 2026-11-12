import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories, searchCourses } from '../lib/courses.js'
import { getAllPaths } from '../lib/paths.js'
import PlatformLogo from './PlatformLogo.jsx'
import {
  ArrowRight,
  BookOpen,
  CategoryIcon,
  ChartColumn,
  CornerDownLeft,
  FileText,
  GitCompareArrows,
  GraduationCap,
  House,
  Info,
  LogIn,
  Mail,
  PathIcon,
  Route,
  Search,
  User,
  UserPen,
  UserPlus,
  WandSparkles,
  X,
} from './icons.js'
import { closePalette, openPalette, togglePalette, usePalette } from './palette.js'
import { formatRating } from './utils.js'

const PAGES = [
  { to: '/', label: 'Home', icon: House, keywords: 'start landing' },
  { to: '/courses', label: 'All courses', icon: GraduationCap, keywords: 'browse catalog list filter' },
  { to: '/paths', label: 'Learning paths', icon: Route, keywords: 'roadmap track career' },
  { to: '/recommend', label: 'Recommend', icon: WandSparkles, keywords: 'suggest goal advice what to learn' },
  { to: '/insights', label: 'Platform insights', icon: ChartColumn, keywords: 'stats charts data platforms' },
  { to: '/compare', label: 'Compare courses', icon: GitCompareArrows, keywords: 'side by side versus vs' },
  { to: '/profile', label: 'Profile and saved', icon: User, keywords: 'account bookmarks saved my learning progress' },
  { to: '/profile/edit', label: 'Edit profile', icon: UserPen, keywords: 'settings password avatar account' },
  { to: '/login', label: 'Log in', icon: LogIn, keywords: 'sign in account' },
  { to: '/register', label: 'Create account', icon: UserPlus, keywords: 'sign up register' },
  { to: '/about', label: 'About', icon: Info, keywords: 'info what is linkbery' },
  { to: '/contact', label: 'Contact', icon: Mail, keywords: 'email support feedback' },
]

const words = (q) => q.toLowerCase().split(/\s+/).filter(Boolean)
const matches = (text, ws) => {
  const hay = text.toLowerCase()
  return ws.every((w) => hay.includes(w))
}

function buildGroups(query) {
  const q = query.trim()
  const ws = words(q)
  const groups = []

  if (!q) {
    groups.push({ id: 'pages', label: 'Go to', items: PAGES.slice(0, 6).map(pageItem) })
    groups.push({ id: 'paths', label: 'Learning paths', items: getAllPaths().slice(0, 4).map(pathItem) })
    return groups
  }

  const courses = searchCourses({ query: q, sort: 'relevance' }).slice(0, 8)
  if (courses.length) {
    groups.push({
      id: 'courses',
      label: 'Courses',
      items: courses.map((c) => ({
        id: `course-${c.id}`,
        to: `/courses/${encodeURIComponent(c.id)}`,
        label: c.title,
        sub: c.provider && c.provider !== c.platform ? `${c.provider} · ${c.platform}` : c.platform,
        meta: formatRating(c.rating) ? `★ ${formatRating(c.rating)}` : '',
        icon: <PlatformLogo name={c.platform} size={20} decorative />,
      })),
    })
  }

  const cats = getCategories().filter((c) => matches(`${c.name} ${c.slug}`, ws))
  if (cats.length) {
    groups.push({
      id: 'categories',
      label: 'Categories',
      items: cats.slice(0, 4).map((c) => ({
        id: `cat-${c.slug}`,
        to: `/category/${c.slug}`,
        label: c.name,
        meta: 'Category',
        icon: <CategoryIcon slug={c.slug} />,
      })),
    })
  }

  const paths = getAllPaths().filter((p) => matches(`${p.title} ${p.goal || ''} ${p.description || ''}`, ws))
  if (paths.length) groups.push({ id: 'paths', label: 'Learning paths', items: paths.slice(0, 4).map(pathItem) })

  const pages = PAGES.filter((p) => matches(`${p.label} ${p.keywords}`, ws))
  if (pages.length) groups.push({ id: 'pages', label: 'Pages', items: pages.slice(0, 5).map(pageItem) })

  groups.push({
    id: 'all',
    label: null,
    items: [
      {
        id: 'search-all',
        to: `/search?q=${encodeURIComponent(q)}`,
        label: `Search all courses for “${q}”`,
        icon: <Search />,
        meta: '',
      },
    ],
  })
  return groups
}

/** Number every item in display order (used for the active option). */
function withIndex(groups) {
  const offsets = groups.map((g, gi) => groups.slice(0, gi).reduce((sum, x) => sum + x.items.length, 0))
  return groups.map((g, gi) => ({ ...g, items: g.items.map((item, ii) => ({ ...item, index: offsets[gi] + ii })) }))
}

function pageItem(p) {
  const Icon = p.icon || FileText
  return { id: `page-${p.to}`, to: p.to, label: p.label, icon: <Icon /> }
}

function pathItem(p) {
  const n = p.steps?.length || 0
  return {
    id: `path-${p.id}`,
    to: `/paths/${encodeURIComponent(p.id)}`,
    label: p.title,
    sub: p.level,
    meta: `${n} ${n === 1 ? 'step' : 'steps'}`,
    icon: <PathIcon path={p} />,
  }
}

function isTypingTarget(el) {
  if (!el) return false
  const tag = el.tagName
  return el.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/** Global shortcuts: Ctrl/Cmd+K toggles, "/" opens when not typing. */
function useShortcuts() {
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        togglePalette()
      } else if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget(e.target)) {
        e.preventDefault()
        openPalette()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
}

export default function CommandPalette() {
  const { open, query: initialQuery } = usePalette()
  useShortcuts()
  if (!open) return null
  return <PaletteDialog initialQuery={initialQuery} />
}

function PaletteDialog({ initialQuery }) {
  const uid = useId()
  const navigate = useNavigate()
  const [query, setQuery] = useState(initialQuery || '')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const groups = useMemo(() => withIndex(buildGroups(query)), [query])
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups])
  const current = Math.min(active, Math.max(flat.length - 1, 0))

  // Focus, scroll lock and focus return.
  useEffect(() => {
    const previous = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      if (previous && typeof previous.focus === 'function' && document.contains(previous)) previous.focus()
    }
  }, [])

  // Keep the active option visible.
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${current}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [current, flat])

  const choose = (item) => {
    if (!item) return
    closePalette()
    navigate(item.to)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((current + 1) % Math.max(flat.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((current - 1 + flat.length) % Math.max(flat.length, 1))
    } else if (e.key === 'Home' && e.ctrlKey) {
      e.preventDefault()
      setActive(0)
    } else if (e.key === 'End' && e.ctrlKey) {
      e.preventDefault()
      setActive(flat.length - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(flat[current])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      closePalette()
    } else if (e.key === 'Tab') {
      // Focus trap: the input is the only tab stop inside the dialog.
      e.preventDefault()
      inputRef.current?.focus()
    }
  }

  const listId = `${uid}-list`
  const optionId = (i) => `${uid}-opt-${i}`

  return (
    <div className="palette-root" onKeyDown={onKeyDown}>
      <div className="palette-overlay" onMouseDown={closePalette} aria-hidden="true" />
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search Linkbery">
        <div className="palette-input-row">
          <Search className="palette-input-icon" />
          <input
            ref={inputRef}
            className="palette-input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={flat.length ? optionId(current) : undefined}
            aria-label="Search courses, paths and pages"
            placeholder="Search courses, paths and pages…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            autoComplete="off"
            spellCheck="false"
          />
          <button type="button" className="palette-close" onClick={closePalette} tabIndex={-1} aria-label="Close search">
            <X size={18} />
          </button>
        </div>

        <div className="palette-list" id={listId} role="listbox" ref={listRef} aria-label="Results">
          {groups.map((g) => (
            <div key={g.id} role="group" aria-labelledby={g.label ? `${uid}-g-${g.id}` : undefined} aria-label={g.label ? undefined : 'More'} className="palette-group">
              {g.label && (
                <div className="palette-group-label" id={`${uid}-g-${g.id}`} role="presentation">
                  {g.label}
                </div>
              )}
              {g.items.map((item) => {
                const i = item.index
                const selected = i === current
                return (
                  <div
                    key={item.id}
                    id={optionId(i)}
                    data-index={i}
                    role="option"
                    aria-selected={selected}
                    className={`palette-item ${selected ? 'is-active' : ''}`}
                    onMouseMove={() => i !== current && setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(item)}
                  >
                    <span className="palette-item-icon">{item.icon || <BookOpen />}</span>
                    <span className="palette-item-text">
                      <span className="palette-item-label">{item.label}</span>
                      {item.sub && <span className="palette-item-sub">{item.sub}</span>}
                    </span>
                    {item.meta && <span className="palette-item-meta">{item.meta}</span>}
                    <span className="palette-item-enter" aria-hidden="true">
                      {item.id === 'search-all' ? <ArrowRight size={14} /> : <CornerDownLeft size={14} />}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
          {flat.length === 0 && <p className="palette-none">No results</p>}
        </div>

        <div className="palette-foot" aria-hidden="true">
          <span>
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd> to navigate
          </span>
          <span>
            <kbd className="kbd">↵</kbd> to open
          </span>
          <span>
            <kbd className="kbd">esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  )
}
