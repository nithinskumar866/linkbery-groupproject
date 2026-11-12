import { useId } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { STATUSES } from '../lib/progress.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'

import { NOT_STARTED, STATUS_META, statusLabel } from './statusMeta.js'

const LOGIN_MESSAGE = 'Log in to track your progress.'

/** Small pill showing a status; renders nothing when no status is set. */
export function StatusBadge({ status, showEmpty = false }) {
  if (!status && !showEmpty) return null
  const meta = status ? STATUS_META[status] || { label: status, icon: 'fa-regular fa-circle' } : NOT_STARTED
  return (
    <span className={`status-badge status-${status || 'none'}`}>
      <i className={meta.icon} aria-hidden="true" /> {meta.label}
    </span>
  )
}

/**
 * Status selector. variant "full" = segmented buttons (course detail page),
 * "compact" = a small select (path steps). Guests are sent to /login with a message.
 */
export function StatusControl({ courseId, courseTitle, variant = 'full' }) {
  const uid = useId()
  const { user } = useAuth()
  const { getStatus, setStatus } = useProgress()
  const navigate = useNavigate()
  const location = useLocation()
  const current = user ? getStatus(courseId) : null

  const goLogin = (message) => navigate('/login', { state: { from: location, message: message || LOGIN_MESSAGE } })

  const choose = (status) => {
    if (!user) {
      goLogin()
      return
    }
    try {
      setStatus(courseId, status)
    } catch (err) {
      goLogin(err?.message)
    }
  }

  const options = [null, ...STATUSES]

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
      <legend>Your progress</legend>
      <div className="status-options" role="group">
        {options.map((s) => {
          const meta = s ? STATUS_META[s] : NOT_STARTED
          const active = (current || null) === s
          return (
            <button
              key={s || 'none'}
              type="button"
              className={`status-option ${active ? 'is-active' : ''} status-${s || 'none'}`}
              aria-pressed={active}
              onClick={() => choose(s)}
            >
              <i className={meta.icon} aria-hidden="true" /> {meta.label}
            </button>
          )
        })}
      </div>
      {!user && <p className="field-hint">Log in to track which courses you are planning, taking or have finished.</p>}
    </fieldset>
  )
}

/** Horizontal progress bar. */
export function ProgressBar({ percent = 0, label, small = false }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div
      className={`progress ${small ? 'progress-sm' : ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={p}
      aria-label={label || 'Progress'}
    >
      <span className="progress-fill" style={{ width: `${p}%` }} />
    </div>
  )
}
