import { Link, useParams } from 'react-router-dom'
import { getCourseById } from '../lib/courses.js'
import { getPathById, getPathProgress } from '../lib/paths.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'
import CourseMini from '../components/CourseMini.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SkillChip from '../components/SkillChip.jsx'
import { ProgressBar, StatusControl } from '../components/ProgressStatus.jsx'
import { categoryName, usePageTitle } from '../components/utils.js'
import NotFound from './NotFound.jsx'

export default function PathDetail() {
  const { id } = useParams()
  const path = getPathById(id)
  const { user } = useAuth()
  const { progress, getStatus } = useProgress()
  usePageTitle(path ? path.title : 'Path not found')

  if (!path) {
    return <NotFound title="Learning path not found" message="This learning path does not exist or was removed." />
  }

  const steps = path.steps || []
  const prog = user ? getPathProgress(path.id, progress) : null

  return (
    <div className="path-page">
      <PageHeader
        title={path.title}
        icon={path.icon || 'fa-route'}
        subtitle={path.description}
        breadcrumbs={[{ label: 'Learning paths', to: '/paths' }, { label: path.title }]}
      />

      <section className="card path-overview" aria-label="Path overview">
        <div className="path-overview-info">
          {path.goal && (
            <p className="path-goal">
              <i className="fa-solid fa-bullseye" aria-hidden="true" /> <strong>Goal:</strong> {path.goal}
            </p>
          )}
          <ul className="chip-list">
            {path.level && (
              <li>
                <span className="tag">
                  <i className="fa-solid fa-signal" aria-hidden="true" /> {path.level}
                </span>
              </li>
            )}
            <li>
              <span className="tag">
                <i className="fa-solid fa-list-ol" aria-hidden="true" /> {steps.length}{' '}
                {steps.length === 1 ? 'step' : 'steps'}
              </span>
            </li>
            {(path.categories || []).map((c) => (
              <li key={c}>
                <SkillChip to={`/category/${c}`} variant="outline">
                  {categoryName(c)}
                </SkillChip>
              </li>
            ))}
          </ul>
        </div>
        <div className="path-overview-progress">
          {prog ? (
            <>
              <div className="path-progress-head">
                <strong>Your progress</strong>
                <span>{prog.percent}%</span>
              </div>
              <ProgressBar percent={prog.percent} label={`${path.title} progress`} />
              <p className="muted path-progress-text">
                {prog.completed} of {prog.total} required {prog.total === 1 ? 'step' : 'steps'} completed
                {prog.inProgress > 0 && `, ${prog.inProgress} in progress`}
              </p>
            </>
          ) : (
            <p className="muted">
              <Link to="/login" state={{ from: `/paths/${path.id}` }}>
                Log in
              </Link>{' '}
              to track your progress on this path.
            </p>
          )}
        </div>
      </section>

      <ol className="timeline" aria-label="Steps">
        {steps.map((step, i) => {
          const course = getCourseById(step.courseId)
          const status = user ? getStatus(step.courseId) : null
          return (
            <li key={`${step.courseId}-${i}`} className={`timeline-step status-${status || 'none'}`}>
              <span className="timeline-marker" aria-hidden="true">
                {status === 'completed' ? <i className="fa-solid fa-check" /> : i + 1}
              </span>
              <div className="timeline-body card">
                <div className="timeline-head">
                  <h2 className="timeline-title">
                    <span className="visually-hidden">Step {i + 1}: </span>
                    {step.title}
                  </h2>
                  {step.optional && <span className="badge badge-unknown">Optional</span>}
                </div>
                {step.note && <p className="timeline-note">{step.note}</p>}
                <CourseMini course={course}>
                  {course && <StatusControl courseId={course.id} courseTitle={course.title} variant="compact" />}
                </CourseMini>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
