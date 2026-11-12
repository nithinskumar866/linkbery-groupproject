import { useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourseById } from '../lib/courses.js'
import { getAllPaths } from '../lib/paths.js'
import { STATUSES } from '../lib/progress.js'
import { useProgress } from '../hooks/useProgress.js'
import CourseList from './CourseList.jsx'
import EmptyState from './EmptyState.jsx'
import PathCard from './PathCard.jsx'
import { STATUS_META } from './statusMeta.js'

const EMPTY_TEXT = {
  planning: 'Set a course to “Planning” to line it up here.',
  'in-progress': 'Courses you are taking show up here.',
  completed: 'Finished courses show up here.',
}

const EMPTY_TITLE = {
  planning: 'Nothing planned yet',
  'in-progress': 'Nothing in progress',
  completed: 'Nothing completed yet',
}

/** Profile section: courses by progress status (tabs with counts) and started learning paths. */
export default function MyLearning() {
  const uid = useId()
  const { progress } = useProgress()
  // Start on "In progress" if it has courses, else the first tab that does.
  const [tab, setTab] = useState(() => {
    const has = (s) => Object.values(progress || {}).some((v) => v?.status === s)
    return ['in-progress', ...STATUSES].find(has) || 'in-progress'
  })
  const tabRefs = useRef({})

  // Newest first within each status.
  const entries = Object.entries(progress || {}).sort((a, b) =>
    String(b[1]?.updatedAt || '').localeCompare(String(a[1]?.updatedAt || '')),
  )
  const byStatus = Object.fromEntries(
    STATUSES.map((s) => [
      s,
      entries
        .filter(([, v]) => v?.status === s)
        .map(([id]) => getCourseById(id))
        .filter(Boolean),
    ]),
  )

  const startedPaths = getAllPaths().filter((p) => p.steps.some((st) => progress?.[st.courseId]?.status))

  const onKeyDown = (e) => {
    const i = STATUSES.indexOf(tab)
    let next = null
    if (e.key === 'ArrowRight') next = STATUSES[(i + 1) % STATUSES.length]
    if (e.key === 'ArrowLeft') next = STATUSES[(i - 1 + STATUSES.length) % STATUSES.length]
    if (e.key === 'Home') next = STATUSES[0]
    if (e.key === 'End') next = STATUSES[STATUSES.length - 1]
    if (next) {
      e.preventDefault()
      setTab(next)
      tabRefs.current[next]?.focus()
    }
  }

  return (
    <section className="my-learning" aria-labelledby={`${uid}-h`}>
      <div className="section-head">
        <h2 id={`${uid}-h`} className="section-title">
          My learning
        </h2>
        <Link to="/paths" className="section-link">
          Learning paths
        </Link>
      </div>

      <div className="tabs" role="tablist" aria-label="Courses by progress" onKeyDown={onKeyDown}>
        {STATUSES.map((s) => {
          const selected = tab === s
          return (
            <button
              key={s}
              ref={(el) => {
                tabRefs.current[s] = el
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${s}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              className={`tab ${selected ? 'is-active' : ''}`}
              onClick={() => setTab(s)}
            >
              {STATUS_META[s]?.label || s}
              <span className="tab-count">{byStatus[s].length}</span>
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${tab}`} className="tab-panel">
        <CourseList
          courses={byStatus[tab]}
          label={STATUS_META[tab]?.label}
          empty={
            <EmptyState
              icon={STATUS_META[tab]?.icon}
              title={EMPTY_TITLE[tab]}
              actions={
                <Link className="btn btn-sm" to="/courses">
                  Browse courses
                </Link>
              }
            >
              <p>{EMPTY_TEXT[tab]}</p>
            </EmptyState>
          }
        />
      </div>

      <h3 className="section-label my-paths-label">Your learning paths · {startedPaths.length}</h3>
      {startedPaths.length === 0 ? (
        <p className="muted my-paths-empty">
          No path started yet. <Link to="/paths">Pick one</Link> and set a status on its first course.
        </p>
      ) : (
        <ul className="path-list">
          {startedPaths.map((p) => (
            <li key={p.id}>
              <PathCard path={p} variant="row" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
