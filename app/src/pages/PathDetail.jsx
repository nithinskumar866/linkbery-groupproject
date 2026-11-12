import { Link, useParams } from 'react-router-dom'
import { getCourseById } from '../lib/courses.js'
import { getPathById, getPathProgress } from '../lib/paths.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'
import CourseCard from '../components/CourseCard.jsx'
import { StatusControl } from '../components/ProgressStatus.jsx'
import { categoryName, usePageTitle } from '../components/utils.js'
import NotFound from './NotFound.jsx'
import { Meter, PageHead } from './parts.jsx'

const pad = (n) => String(n).padStart(2, '0')

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
  const optional = steps.filter((s) => s.optional).length
  const prog = user ? getPathProgress(path.id, progress) : null
  const meta = [
    path.level,
    `${steps.length} ${steps.length === 1 ? 'step' : 'steps'}${optional ? ` (${optional} optional)` : ''}`,
    ...(path.categories || []).map(categoryName),
  ].filter(Boolean)

  return (
    <div className="pg-path">
      <PageHead
        title={path.title}
        desc={path.description}
        crumbs={[{ label: 'Learning paths', to: '/paths' }, { label: path.title }]}
      />

      <div className="pg-path-summary">
        <dl className="pg-path-facts">
          {path.goal && (
            <div>
              <dt>Goal</dt>
              <dd>{path.goal}</dd>
            </div>
          )}
          <div>
            <dt>Scope</dt>
            <dd className="pg-mono">{meta.join(' · ')}</dd>
          </div>
        </dl>
        <div className="pg-path-progress">
          {prog ? (
            <>
              <div className="pg-path-progress-head">
                <span className="section-label">Your progress</span>
                <span className="pg-mono">{prog.percent}%</span>
              </div>
              <Meter percent={prog.percent} label={`${path.title} progress`} />
              <p className="field-hint">
                {prog.completed} of {prog.total} required {prog.total === 1 ? 'step' : 'steps'} done
                {prog.inProgress > 0 && `, ${prog.inProgress} in progress`}
              </p>
            </>
          ) : (
            <p className="pg-dim">
              <Link to="/login" state={{ from: `/paths/${path.id}` }}>
                Log in
              </Link>{' '}
              to track your progress on this path.
            </p>
          )}
        </div>
      </div>

      <ol className="pg-timeline" aria-label="Steps">
        {steps.map((step, i) => {
          const course = getCourseById(step.courseId)
          const status = user ? getStatus(step.courseId) : null
          return (
            <li key={`${step.courseId}-${i}`} className={`pg-step pg-step-${status || 'none'}`}>
              <div className="pg-step-rail" aria-hidden="true">
                <span className="pg-step-num">{pad(i + 1)}</span>
                <span className="pg-step-dot" />
              </div>
              <div className="pg-step-body">
                <div className="pg-step-head">
                  <h2 className="pg-step-title">
                    <span className="visually-hidden">Step {i + 1}: </span>
                    {step.title}
                  </h2>
                  {step.optional && <span className="badge">Optional</span>}
                </div>
                {step.note && <p className="pg-step-note">{step.note}</p>}
                {course ? (
                  <div className="pg-step-course">
                    <CourseCard course={course} />
                    <StatusControl courseId={course.id} courseTitle={course.title} variant="compact" />
                  </div>
                ) : (
                  <p className="pg-dim">This course is no longer listed.</p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
