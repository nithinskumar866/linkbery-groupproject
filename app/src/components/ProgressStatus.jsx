import { useEffect, useId, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { STATUSES } from '../lib/progress.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'
import { Check } from './icons.js'
import { NOT_STARTED, STATUS_META, statusLabel } from './statusMeta.js'

const LOGIN_MESSAGE = 'Log in to track your progress.'
const TONE_BADGE = { blue: 'badge-blue', amber: 'badge-amber', green: 'badge-green', none: '' }

const metaFor = (s) => (s ? STATUS_META[s] || { label: s, icon: NOT_STARTED.icon, tone: 'none' } : NOT_STARTED)

/** Small status badge; renders nothing when no status is set (unless showEmpty). */
export function StatusBadge({ status, showEmpty = false }) {
  if (!status && !showEmpty) return null
  const meta = metaFor(status)
  const Icon = meta.icon
  return (
    <span className={`badge status-badge status-${status || 'none'} ${TONE_BADGE[meta.tone] || ''}`}>
      <Icon aria-hidden="true" /> {meta.label}
    </span>
  )
}

function useStatus(courseId) {
  const { user } = useAuth()
  const { getStatus, setStatus } = useProgress()
  const navigate = useNavigate()
  const location = useLocation()
  const current = user ? getStatus(courseId) : null
  const goLogin = (message) => navigate('/login', { state: { from: location, message: message || LOGIN_MESSAGE } })
  const choose = (status) => {
    if (!user) {
      goLogin()
      return false
    }
    try {
      setStatus(courseId, status)
      return true
    } catch (err) {
      goLogin(err?.message)
      return false
    }
  }
  return { user, current, choose, goLogin }
}

/**
 * Status selector.
 * - "full": segmented control (course detail page)
 * - "compact": a small select (path steps)
 * - "icon": an icon button with a small menu (course rows)
 * Guests are sent to /login with a message.
 */
export function StatusControl({ courseId, courseTitle, variant = 'full' }) {
  const uid = useId()
  const { user, current, choose, goLogin } = useStatus(courseId)
  const options = [null, ...STATUSES]

  if (variant === 'icon') return <StatusMenu courseId={courseId} courseTitle={courseTitle} />

  if (variant === 'compact') {
    return (
      <div className="status-select">
        <label htmlFor={`${uid}-st`} className="visually-hidden">
          Progress{courseTitle ? ` for ${courseTitle}` : ''}
        </label>
        <select
          id={`${uid}-st`}
          className={`select select-sm status-${current || 'none'}`}
          value={current || ''}
          onChange={(e) => choose(e.target.value || null)}
          onMouseDown={(e) => {
            // Guests: go to login instead of opening the list.
            if (!user) {
              e.preventDefault()
              goLogin()
            }
          }}
        >
          {options.map((s) => (
            <option key={s || 'none'} value={s || ''}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <fieldset className="status-control">
      <legend className="section-label">Your progress</legend>
      <div className="segmented" role="group" aria-label={`Progress${courseTitle ? ` for ${courseTitle}` : ''}`}>
        {options.map((s) => {
          const meta = metaFor(s)
          const Icon = meta.icon
          const active = (current || null) === s
          return (
            <button
              key={s || 'none'}
              type="button"
              className={`segmented-item status-${s || 'none'} ${active ? 'is-active' : ''}`}
              aria-pressed={active}
              onClick={() => choose(s)}
            >
              <Icon aria-hidden="true" />
              <span>{meta.label}</span>
            </button>
          )
        })}
      </div>
      {!user && <p className="field-hint">Log in to track courses you are planning, taking or have finished.</p>}
    </fieldset>
  )
}

/** Icon button showing the current status; opens a small menu to change it. */
function StatusMenu({ courseId, courseTitle }) {
  const { user, current, choose, goLogin } = useStatus(courseId)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const btnRef = useRef(null)
  const meta = metaFor(current)
  const Icon = meta.icon

  useEffect(() => {
    if (!open) return undefined
    const items = () => [...(ref.current?.querySelectorAll('[role="menuitemradio"]') || [])]
    ;(items().find((el) => el.getAttribute('aria-checked') === 'true') || items()[0])?.focus()
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = (e) => {
      const list = items()
      const i = list.indexOf(document.activeElement)
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
        btnRef.current?.focus()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        list[(i + 1) % list.length]?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        list[(i - 1 + list.length) % list.length]?.focus()
      } else if (e.key === 'Tab') {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const label = `Progress: ${meta.label}${courseTitle ? ` (${courseTitle})` : ''}`

  return (
    <div className="status-menu" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        className={`btn btn-ghost btn-icon btn-sm action-btn status-trigger status-${current || 'none'} ${current ? 'is-set' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        data-tip={current ? meta.label : 'Track progress'}
        onClick={(e) => {
          e.stopPropagation()
          if (!user) {
            goLogin()
            return
          }
          setOpen((o) => !o)
        }}
      >
        <Icon />
      </button>
      {open && (
        <div className="menu status-menu-pop" role="menu" aria-label="Set progress">
          {[null, ...STATUSES].map((s) => {
            const m = metaFor(s)
            const ItemIcon = m.icon
            const checked = (current || null) === s
            return (
              <button
                key={s || 'none'}
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                className={`menu-item status-${s || 'none'}`}
                onClick={(e) => {
                  e.stopPropagation()
                  choose(s)
                  setOpen(false)
                  btnRef.current?.focus()
                }}
              >
                <ItemIcon className="status-icon" /> {m.label}
                {checked && <Check className="menu-item-check" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Thin horizontal progress meter. */
export function ProgressBar({ percent = 0, label }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div
      className="meter"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={p}
      aria-label={label || 'Progress'}
    >
      <span className="meter-fill" style={{ width: `${p}%` }} />
    </div>
  )
}
