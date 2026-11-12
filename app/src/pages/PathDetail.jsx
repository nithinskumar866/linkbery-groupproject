import { Link, useParams } from 'react-router-dom'
import { getCourseById } from '../lib/courses.js'
import { getPathById, getPathProgress } from '../lib/paths.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'
import CourseThumb from '../components/CourseThumb.jsx'
import PageBand from '../components/PageBand.jsx'
import PriceBadge from '../components/PriceBadge.jsx'
import { StatusControl } from '../components/ProgressStatus.jsx'
import { STATUS_META } from '../components/statusMeta.js'
import { categoryName, formatCount, formatRating, usePageTitle } from '../components/utils.js'
import NotFound from './NotFound.jsx'
import { Meter, Wrap } from './parts.jsx'
import { byline } from './format.js'

function StepCourse({ course }) {
  const r = formatRating(course.rating)
  const meta = [course.type, course.level, course.duration].filter(Boolean).join(' · ')
  return (
    <article className="card pg-step-card">
      <div className="pg-step-thumb">
        <CourseThumb course={course} size="sm" />
      </div>
      <div className="pg-step-info">
        <span className="pg-step-by">{byline(course)}</span>
        <Link className="pg-step-course-title" to={`/courses/${encodeURIComponent(course.id)}`}>
          {course.title}
        </Link>
        <span className="pg-step-meta">
          {r ? (
            <>
              <strong>
                <span className="pg-star" aria-hidden="true">
                  ★
                </span>{' '}
                {r}
              </strong>
              {course.reviewCount ? ` (${formatCount(course.reviewCount)} reviews)` : ''}
            </>
          ) : (
            'No rating yet'
          )}
          {meta && <> · {meta}</>}
        </span>
      </div>
      <div className="pg-step-side">
        <PriceBadge price={course.price} />
        <StatusControl courseId={course.id} courseTitle={course.title} variant="compact" />
      </div>
    </article>
  )
}

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

  return (
    <div className="pg-path">
      <PageBand
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Learning paths', to: '/paths' }, { label: path.title }]}
        title={path.title}
        desc={path.description}
      >
        <div className="pg-path-summary">
          <dl className="pg-path-facts">
            {path.goal && (
              <div className="pg-path-goal">
                <dt>Goal</dt>
                <dd>{path.goal}</dd>
              </div>
            )}
            {path.level && (
              <div>
                <dt>Level</dt>
                <dd>{path.level}</dd>
              </div>
            )}
            <div>
              <dt>Steps</dt>
              <dd>
                {steps.length}
                {optional > 0 && ` (${optional} optional)`}
              </dd>
            </div>
            {path.categories?.length > 0 && (
              <div>
                <dt>Topic</dt>
                <dd>
                  {path.categories.map((c, i) => (
                    <span key={c}>
                      {i > 0 && ', '}
                      <Link to={`/category/${c}`}>{categoryName(c)}</Link>
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          <div className="card pg-path-progress">
            {prog ? (
              <>
                <div className="pg-path-progress-head">
                  <span className="pg-path-progress-label">Your progress</span>
                  <span className="pg-path-progress-pct">{prog.percent}%</span>
                </div>
                <Meter percent={prog.percent} label={`${path.title} progress`} />
                <p className="pg-path-progress-text">
                  {prog.completed} of {prog.total} required {prog.total === 1 ? 'step' : 'steps'} done
                  {prog.inProgress > 0 && `, ${prog.inProgress} in progress`}
                </p>
              </>
            ) : (
              <p className="pg-path-progress-text">
                <Link to="/login" state={{ from: `/paths/${path.id}` }}>
                  Log in
                </Link>{' '}
                to track your progress on this path.
              </p>
            )}
          </div>
        </div>
      </PageBand>

      <Wrap className="pg-page-body">
        <ol className="pg-steps" aria-label="Steps">
          {steps.map((step, i) => {
            const course = getCourseById(step.courseId)
            const status = user ? getStatus(step.courseId) : null
            return (
              <li key={`${step.courseId}-${i}`} className={`pg-step pg-step-${status || 'none'}`}>
                <div className="pg-step-rail" aria-hidden="true">
                  <span className="pg-step-ring">{i + 1}</span>
                </div>
                <div className="pg-step-body">
                  <div className="pg-step-head">
                    <h2 className="pg-step-title">
                      <span className="visually-hidden">Step {i + 1}: </span>
                      {step.title}
                    </h2>
                    {step.optional && <span className="badge pg-badge-quiet">Optional</span>}
                    {status && (
                      <span className={`badge badge-${STATUS_META[status]?.tone || 'blue'}`}>
                        {STATUS_META[status]?.label || status}
                      </span>
                    )}
                  </div>
                  {step.note && <p className="pg-step-note">{step.note}</p>}
                  {course ? <StepCourse course={course} /> : <p className="pg-dim">This course is no longer listed.</p>}
                </div>
              </li>
            )
          })}
        </ol>
      </Wrap>
    </div>
  )
}
