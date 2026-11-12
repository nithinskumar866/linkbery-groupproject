import { Link, useParams } from 'react-router-dom'
import { getCourseById, getRelatedCourses } from '../lib/courses.js'
import { getPathsForCourse } from '../lib/paths.js'
import CompareButton from '../components/CompareButton.jsx'
import CourseThumb from '../components/CourseThumb.jsx'
import PriceBadge from '../components/PriceBadge.jsx'
import { StatusControl } from '../components/ProgressStatus.jsx'
import SaveButton from '../components/SaveButton.jsx'
import { categoryName, formatCount, formatNumber, formatRating, usePageTitle } from '../components/utils.js'
import NotFound from './NotFound.jsx'
import { SectionHead, Wrap } from './parts.jsx'
import { byline } from './format.js'

const PRICE_NOTE = {
  Free: 'Free on',
  'Free to audit': 'Free to audit on',
  Paid: 'Price set by',
}

function PathSteps({ path, course }) {
  const index = path.steps.findIndex((s) => s.courseId === course.id)
  const href = `/paths/${encodeURIComponent(path.id)}`
  return (
    <div className="pg-detail-path">
      <p className="pg-detail-path-intro">
        This course is step {index + 1} of {path.steps.length} in{' '}
        <Link to={href} className="pg-link-strong">
          {path.title}
        </Link>
        .
      </p>
      <ol className="pg-detail-steps" aria-label={`${path.title} steps`}>
        {path.steps.map((s, i) => {
          const here = s.courseId === course.id
          const c = getCourseById(s.courseId)
          const title = c?.title || s.title
          return (
            <li key={`${s.courseId}-${i}`} className={here ? 'is-here' : undefined} aria-current={here ? 'step' : undefined}>
              <span className="pg-step-ring" aria-hidden="true">
                {i + 1}
              </span>
              <span className="pg-detail-step-title">
                {here || !c ? title : <Link to={`/courses/${encodeURIComponent(c.id)}`}>{title}</Link>}
              </span>
              <span className="pg-detail-step-note">
                {here ? 'You are here' : s.optional ? 'Optional' : c?.platform || ''}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function CourseDetail() {
  const { id } = useParams()
  const course = getCourseById(id)
  usePageTitle(course ? course.title : 'Course not found')

  if (!course) {
    return (
      <NotFound
        title="Course not found"
        message="This course is not in our list. It may have been removed, or the link is wrong."
      />
    )
  }

  const skills = course.skills || []
  const categories = course.categories || []
  const firstCat = categories[0]
  const related = getRelatedCourses(course.id, 3)
  const paths = getPathsForCourse(course.id)
  const rating = formatRating(course.rating)
  const platform = course.platform || 'the provider’s site'
  const sameAsPlatform =
    Boolean(course.provider && course.platform) &&
    course.provider.trim().toLowerCase() === course.platform.trim().toLowerCase()
  const reviews = course.reviewCount ? formatNumber(course.reviewCount) : null

  const facts = [
    ['Provider', course.provider],
    ['Platform', course.platform],
    ['Level', course.level],
    ['Type', course.type],
    ['Duration', course.duration],
    ['Rating', rating ? `${rating} out of 5${reviews ? ` (${reviews} reviews)` : ''}` : 'No rating yet'],
    ['Price', course.price],
  ]

  const crumbs = [
    { label: 'Home', to: '/' },
    firstCat ? { label: categoryName(firstCat), to: `/category/${firstCat}` } : { label: 'Courses', to: '/courses' },
  ]

  return (
    <div className="pg-detail" key={course.id}>
      <section className="pg-detail-hero" aria-labelledby="detail-title">
        <Wrap>
          <nav className="pg-crumbs pg-crumbs-navy" aria-label="Breadcrumb">
            <ol>
              {crumbs.map((c) => (
                <li key={c.label}>
                  <Link to={c.to}>{c.label}</Link>
                </li>
              ))}
              <li>
                <span aria-current="page">{course.title}</span>
              </li>
            </ol>
          </nav>
          <div className="pg-detail-hero-text">
            <p className="pg-detail-by">
              {sameAsPlatform || !course.provider ? (
                course.platform || 'Unknown provider'
              ) : (
                <>
                  {course.provider}
                  {course.platform && <> · offered on {course.platform}</>}
                </>
              )}
            </p>
            <h1 id="detail-title" className="pg-detail-title">
              {course.title}
            </h1>
            {course.description ? (
              <p className="pg-detail-desc">{course.description}</p>
            ) : (
              <p className="pg-detail-desc pg-detail-desc-empty">
                No summary from the provider yet. The full syllabus is on {platform}.
              </p>
            )}
            <ul className="pg-detail-meta" aria-label="Course summary">
              <li>
                {rating ? (
                  <>
                    <strong className="pg-detail-star">
                      <span aria-hidden="true">★</span> {rating}
                      <span className="visually-hidden"> out of 5</span>
                    </strong>
                    {course.reviewCount ? ` (${formatNumber(course.reviewCount)} reviews)` : ''}
                  </>
                ) : (
                  'No rating yet'
                )}
              </li>
              {[course.level, course.type, course.duration].filter(Boolean).map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        </Wrap>
      </section>

      <Wrap className="pg-detail-body">
        <aside className="pg-detail-side" aria-label="Enrol and track">
          <div className="pg-side-card">
            <CourseThumb course={course} size="lg" />
            <div className="pg-side-body">
              <div className="pg-side-price">
                <span className="pg-side-price-value">{course.price || 'Price not listed'}</span>
                {course.platform && (
                  <span className="pg-side-price-note">
                    {PRICE_NOTE[course.price] || 'See price on'} {course.platform}
                  </span>
                )}
              </div>
              {course.url ? (
                <a className="btn btn-primary pg-btn-block pg-btn-lg" href={course.url} target="_blank" rel="noopener noreferrer">
                  Go to course on {platform} <span aria-hidden="true">↗</span>
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              ) : (
                <p className="pg-dim">No link is listed for this course.</p>
              )}
              <div className="pg-side-actions">
                <SaveButton courseId={course.id} courseTitle={course.title} variant="full" />
                <CompareButton courseId={course.id} courseTitle={course.title} variant="full" />
              </div>
              <div className="pg-side-status">
                <p className="pg-side-label" aria-hidden="true">
                  Your progress
                </p>
                <StatusControl courseId={course.id} courseTitle={course.title} variant="compact" />
              </div>
              <p className="pg-side-note">
                You enrol and pay on {platform}. Linkbery does not sell courses.
              </p>
            </div>
          </div>
        </aside>

        <div className="pg-detail-main">
          {skills.length > 0 && (
            <section aria-labelledby="detail-skills">
              <h2 id="detail-skills" className="pg-h3">
                Skills you will gain
              </h2>
              <ul className="pg-tags">
                {skills.map((s) => (
                  <li key={s}>
                    <Link className="tag" to={`/courses?skill=${encodeURIComponent(s)}`} title={`Courses teaching ${s}`}>
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card pg-facts-card" aria-labelledby="detail-facts">
            <h2 id="detail-facts" className="pg-h3">
              Course details
            </h2>
            <dl className="pg-facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{k === 'Price' && v ? <PriceBadge price={v} /> : v || <span className="pg-dim">Not listed</span>}</dd>
                </div>
              ))}
              {categories.length > 0 && (
                <div>
                  <dt>{categories.length === 1 ? 'Category' : 'Categories'}</dt>
                  <dd>
                    {categories.map((c, i) => (
                      <span key={c}>
                        {i > 0 && ', '}
                        <Link to={`/category/${c}`}>{categoryName(c)}</Link>
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {paths.length > 0 && (
            <section aria-labelledby="detail-paths">
              <h2 id="detail-paths" className="pg-h3">
                {paths.length === 1 ? 'Part of a learning path' : `Part of ${paths.length} learning paths`}
              </h2>
              <div className="pg-detail-paths">
                {paths.map((p) => (
                  <PathSteps key={p.id} path={p} course={course} />
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="detail-similar">
              <SectionHead
                id="detail-similar"
                level={3}
                title="Similar courses"
                to={firstCat ? `/category/${firstCat}` : '/courses'}
                linkText={firstCat ? `More in ${categoryName(firstCat).toLowerCase()}` : 'All courses'}
              />
              <ul className="pg-similar">
                {related.map((c) => {
                  const r = formatRating(c.rating)
                  return (
                    <li key={c.id}>
                      <article className="card pg-mini-card">
                        <CourseThumb course={c} />
                        <div className="pg-mini-body">
                          <span className="pg-mini-by">{byline(c)}</span>
                          <Link className="pg-mini-title pg-stretch" to={`/courses/${encodeURIComponent(c.id)}`}>
                            {c.title}
                          </Link>
                          <span className="pg-mini-meta">
                            {r && (
                              <>
                                <span className="pg-star" aria-hidden="true">
                                  ★
                                </span>{' '}
                                {r}
                                {c.reviewCount ? ` (${formatCount(c.reviewCount)})` : ''}
                                {c.price ? ' · ' : ''}
                              </>
                            )}
                            {c.price}
                          </span>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      </Wrap>
    </div>
  )
}
