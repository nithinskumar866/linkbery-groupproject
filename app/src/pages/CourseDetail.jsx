import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { getCourseById, getRelatedCourses } from '../lib/courses.js'
import { getPathsForCourse } from '../lib/paths.js'
import CompareButton from '../components/CompareButton.jsx'
import CourseList from '../components/CourseList.jsx'
import { CategoryIcon } from '../components/icons.js'
import PlatformLogo from '../components/PlatformLogo.jsx'
import PriceBadge from '../components/PriceBadge.jsx'
import { StatusControl } from '../components/ProgressStatus.jsx'
import SaveButton from '../components/SaveButton.jsx'
import { categoryName, findPlatform, formatCount, formatNumber, formatRating, usePageTitle } from '../components/utils.js'
import NotFound from './NotFound.jsx'
import { PathRow, SectionHead } from './parts.jsx'
import { ICON } from './iconProps.js'

export default function CourseDetail() {
  const { id } = useParams()
  const course = getCourseById(id)
  usePageTitle(course ? course.title : 'Course not found')

  if (!course) {
    return <NotFound title="Course not found" message="This course is not in the list. It may have been removed." />
  }

  const platform = findPlatform(course.platform)
  const skills = course.skills || []
  const categories = course.categories || []
  const related = getRelatedCourses(course.id, 4)
  const firstCat = categories[0]
  const paths = getPathsForCourse(course.id)
  const rating = formatRating(course.rating)
  // When the provider is the platform itself (Udemy on Udemy), name it once.
  const sameAsPlatform =
    Boolean(course.provider && course.platform) &&
    course.provider.trim().toLowerCase() === course.platform.trim().toLowerCase()

  const platformText = platform?.url ? (
    <a href={platform.url} target="_blank" rel="noopener noreferrer">
      {course.platform}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  ) : (
    course.platform
  )

  const meta = [course.level, course.type, course.duration].filter(Boolean)

  const facts = [
    ['Provider', course.provider],
    ['Platform', course.platform],
    ['Level', course.level],
    ['Type', course.type],
    ['Duration', course.duration],
    ['Rating', rating ? `${rating} / 5` : null],
    ['Reviews', course.reviewCount ? formatNumber(course.reviewCount) : null],
  ]

  return (
    <div className="pg-detail" key={course.id}>
      <nav className="pg-crumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/courses">Courses</Link>
          </li>
          {firstCat && (
            <li>
              <Link to={`/category/${firstCat}`}>{categoryName(firstCat)}</Link>
            </li>
          )}
          <li>
            <span aria-current="page">{course.title}</span>
          </li>
        </ol>
      </nav>

      <div className="pg-detail-grid">
        <div className="pg-detail-main">
          <header className="pg-detail-head">
            <p className="pg-detail-by">
              <PlatformLogo name={course.platform} size={20} decorative />
              {sameAsPlatform ? (
                platformText
              ) : (
                <span>
                  {course.provider || 'Unknown provider'}
                  {course.platform && <> · {platformText}</>}
                </span>
              )}
            </p>
            <h1 className="pg-detail-title">{course.title}</h1>
            <p className="pg-detail-meta">
              {meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
              {rating ? (
                <span>
                  <span className="pg-star" aria-hidden="true">
                    ★
                  </span>{' '}
                  {rating}
                  {course.reviewCount ? (
                    <span className="pg-dim"> ({formatCount(course.reviewCount)} reviews)</span>
                  ) : null}
                </span>
              ) : (
                <span>No rating</span>
              )}
              <PriceBadge price={course.price} />
            </p>
          </header>

          <section className="pg-detail-section" aria-labelledby="h-about">
            <h2 id="h-about" className="section-label">
              About
            </h2>
            {course.description ? (
              <p className="pg-prose">{course.description}</p>
            ) : (
              <p className="pg-dim">
                No description yet. The syllabus is on {course.platform || 'the provider’s site'}.
              </p>
            )}
          </section>

          {skills.length > 0 && (
            <section className="pg-detail-section" aria-labelledby="h-skills">
              <h2 id="h-skills" className="section-label">
                Skills <span className="pg-count">· {skills.length}</span>
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

          {categories.length > 0 && (
            <section className="pg-detail-section" aria-labelledby="h-cats">
              <h2 id="h-cats" className="section-label">
                Categories
              </h2>
              <ul className="pg-tags">
                {categories.map((c) => (
                  <li key={c}>
                    <Link className="tag" to={`/category/${c}`}>
                      <CategoryIcon slug={c} size={12} />
                      {categoryName(c)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {paths.length > 0 && (
            <section className="pg-detail-section" aria-labelledby="h-paths">
              <h2 id="h-paths" className="section-label">
                Part of these paths
              </h2>
              <ul className="pg-rows">
                {paths.map((p) => {
                  const index = p.steps.findIndex((st) => st.courseId === course.id)
                  return (
                    <li key={p.id}>
                      <PathRow path={{ ...p, description: `Step ${index + 1} of ${p.steps.length}: ${p.steps[index]?.title || ''}` }} />
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>

        <aside className="pg-detail-side" aria-label="Course actions">
          <div className="panel pg-side-panel">
            {course.url ? (
              <a className="btn btn-primary pg-btn-block" href={course.url} target="_blank" rel="noopener noreferrer">
                Go to course <ArrowUpRight {...ICON} />
                <span className="visually-hidden"> on {course.platform} (opens in a new tab)</span>
              </a>
            ) : (
              <p className="pg-dim">No link available for this course.</p>
            )}
            <div className="pg-side-actions">
              <SaveButton courseId={course.id} courseTitle={course.title} variant="full" />
              <CompareButton courseId={course.id} courseTitle={course.title} variant="full" />
            </div>
            <StatusControl courseId={course.id} courseTitle={course.title} />

            <dl className="pg-facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v || <span className="pg-dim">Not listed</span>}</dd>
                </div>
              ))}
              <div>
                <dt>Price</dt>
                <dd>
                  <PriceBadge price={course.price} />
                </dd>
              </div>
            </dl>
            <p className="field-hint">
              You enrol on {course.platform || 'the provider’s site'}. Price and availability may have changed since this
              course was listed.
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="pg-section" aria-labelledby="h-related">
          <SectionHead
            id="h-related"
            label="Related courses"
            to={firstCat ? `/category/${firstCat}` : undefined}
            linkText={firstCat ? `More in ${categoryName(firstCat)}` : undefined}
          />
          <CourseList courses={related} variant="cards" />
        </section>
      )}
    </div>
  )
}
