import { useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourseById } from '../lib/courses.js'
import { getAllPaths, getPathProgress } from '../lib/paths.js'
import { STATUSES } from '../lib/progress.js'
import { useProgress } from '../hooks/useProgress.js'
import CourseGrid from './CourseGrid.jsx'
import EmptyState from './EmptyState.jsx'
import { ProgressBar } from './ProgressStatus.jsx'
import { STATUS_META } from './statusMeta.js'

const EMPTY_TEXT = {
  planning: 'Mark a course as “Planning” on its page to line it up here.',
  'in-progress': 'Courses you are currently taking will show up here.',
  completed: 'Finished courses will show up here.',
}

/** Profile section: courses by progress status (tabs) + progress of started learning paths. */
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

  const startedPaths = getAllPaths()
    .filter((p) => p.steps.some((st) => progress?.[st.courseId]?.status))
    .map((p) => ({ path: p, prog: getPathProgress(p.id, progress) }))

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
    <section className="home-section my-learning" aria-labelledby={`${uid}-h`}>
      <div className="section-head">
        <h2 id={`${uid}-h`}>
          <i className="fa-solid fa-person-chalkboard" aria-hidden="true" /> My learning
        </h2>
        <Link to="/paths">Learning paths</Link>
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
              <i className={STATUS_META[s]?.icon} aria-hidden="true" /> {STATUS_META[s]?.label || s}
              <span className="tab-count">{byStatus[s].length}</span>
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${tab}`} className="tab-panel">
        <CourseGrid
          courses={byStatus[tab]}
          label={STATUS_META[tab]?.label}
          empty={
            <EmptyState
              icon={STATUS_META[tab]?.icon.replace(/^fa-(solid|regular) /, '') || 'fa-book'}
              title={`No courses ${tab === 'planning' ? 'planned' : tab === 'completed' ? 'completed' : 'in progress'} yet`}
              actions={
                <Link className="btn btn-outline" to="/courses">
                  Browse courses
                </Link>
              }
            >
              <p>{EMPTY_TEXT[tab]}</p>
            </EmptyState>
          }
        />
      </div>

      <h3 className="my-paths-h">Your learning paths</h3>
      {startedPaths.length === 0 ? (
        <p className="muted">
          You have not started a learning path yet. <Link to="/paths">Pick one</Link> and set a status on its first
          course.
        </p>
      ) : (
        <ul className="my-paths">
          {startedPaths.map(({ path, prog }) => (
            <li key={path.id} className="card my-path">
              <span className="path-icon path-icon-sm" aria-hidden="true">
                <i className={`fa-solid ${path.icon || 'fa-route'}`} />
              </span>
              <div className="my-path-body">
                <Link to={`/paths/${encodeURIComponent(path.id)}`} className="my-path-title">
                  {path.title}
                </Link>
                <ProgressBar percent={prog.percent} label={`${path.title} progress`} small />
                <span className="muted my-path-text">
                  {prog.completed}/{prog.total} done ({prog.percent}%)
                  {prog.inProgress > 0 && ` · ${prog.inProgress} in progress`}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
