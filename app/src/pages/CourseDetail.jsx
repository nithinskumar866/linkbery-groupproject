import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCourseById, getRelatedCourses } from '../lib/courses.js'
import CourseGrid from '../components/CourseGrid.jsx'
import PageHeader from '../components/PageHeader.jsx'
import PlatformLogo from '../components/PlatformLogo.jsx'
import PriceBadge from '../components/PriceBadge.jsx'
import RatingStars from '../components/RatingStars.jsx'
import SaveButton from '../components/SaveButton.jsx'
import SkillChip from '../components/SkillChip.jsx'
import { categoryName, findPlatform, formatNumber, formatRating, usePageTitle } from '../components/utils.js'
import NotFound from './NotFound.jsx'

function CourseImage({ course }) {
  const [failed, setFailed] = useState(false)
  if (course.image && !failed) {
    return (
      <img
        className="detail-image"
        src={course.image}
        alt={`${course.title} course banner`}
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <div className="detail-image detail-image-placeholder" aria-hidden="true">
      <PlatformLogo name={course.platform} size={72} decorative />
    </div>
  )
}

export default function CourseDetail() {
  const { id } = useParams()
  const course = getCourseById(id)
  usePageTitle(course ? course.title : 'Course not found')

  if (!course) {
    return <NotFound title="Course not found" message="This course is not in our list. It may have been removed." />
  }

  const platform = findPlatform(course.platform)
  const skills = course.skills || []
  const categories = course.categories || []
  const related = getRelatedCourses(course.id, 4)
  const firstCat = categories[0]

  const details = [
    ['Provider', course.provider],
    ['Platform', course.platform],
    ['Level', course.level],
    ['Type', course.type],
    ['Duration', course.duration],
    ['Price', course.price],
    ['Rating', formatRating(course.rating) ? `${formatRating(course.rating)} / 5` : null],
    ['Reviews', course.reviewCount ? formatNumber(course.reviewCount) : null],
  ]

  return (
    <div className="detail-page" key={course.id}>
      <PageHeader
        title={course.title}
        breadcrumbs={[
          { label: 'Courses', to: '/courses' },
          ...(firstCat ? [{ label: categoryName(firstCat), to: `/category/${firstCat}` }] : []),
          { label: course.title },
        ]}
      />

      <div className="detail-layout">
        <div className="detail-main">
          <section className="card detail-summary">
            <CourseImage course={course} />
            <div className="detail-byline">
              <PlatformLogo name={course.platform} size={44} />
              <div>
                <div className="detail-provider">{course.provider || 'Unknown provider'}</div>
                <div className="muted">
                  on{' '}
                  {platform?.url ? (
                    <a href={platform.url} target="_blank" rel="noopener noreferrer">
                      {course.platform}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    course.platform || 'an unknown platform'
                  )}
                </div>
              </div>
            </div>
            <div className="detail-tags">
              {course.level && <span className="tag"><i className="fa-solid fa-signal" aria-hidden="true" /> {course.level}</span>}
              {course.type && <span className="tag"><i className="fa-solid fa-certificate" aria-hidden="true" /> {course.type}</span>}
              {course.duration && <span className="tag"><i className="fa-regular fa-clock" aria-hidden="true" /> {course.duration}</span>}
              <PriceBadge price={course.price} />
            </div>
            <RatingStars rating={course.rating} reviewCount={course.reviewCount} size="lg" showEmpty />

            <h2 className="detail-h">About this course</h2>
            {course.description ? (
              <p className="detail-description">{course.description}</p>
            ) : (
              <p className="muted">
                No description yet. Visit the course page on {course.platform || 'the provider'} for the full syllabus.
              </p>
            )}

            {skills.length > 0 && (
              <>
                <h2 className="detail-h">Skills you will gain</h2>
                <ul className="chip-list">
                  {skills.map((s) => (
                    <li key={s}>
                      <SkillChip to={`/courses?skill=${encodeURIComponent(s)}`} title={`More courses teaching ${s}`}>
                        {s}
                      </SkillChip>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {categories.length > 0 && (
              <>
                <h2 className="detail-h">Categories</h2>
                <ul className="chip-list">
                  {categories.map((c) => (
                    <li key={c}>
                      <SkillChip to={`/category/${c}`} variant="outline">
                        {categoryName(c)}
                      </SkillChip>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        <aside className="detail-side">
          <div className="card detail-cta">
            {course.url ? (
              <a className="btn btn-primary btn-lg btn-block" href={course.url} target="_blank" rel="noopener noreferrer">
                Go to course <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                <span className="visually-hidden"> on {course.platform} (opens in a new tab)</span>
              </a>
            ) : (
              <p className="muted">No link available for this course.</p>
            )}
            <SaveButton courseId={course.id} courseTitle={course.title} variant="full" />
            <p className="field-hint">
              You enrol on {course.platform || 'the provider’s site'}. Prices and availability may have changed since we
              listed it.
            </p>
          </div>

          <div className="card">
            <h2 className="detail-h detail-h-first">Details</h2>
            <dl className="detail-list">
              {details.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v || <span className="muted">Not listed</span>}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="home-section" aria-labelledby="h-related">
          <div className="section-head">
            <h2 id="h-related">Related courses</h2>
            {firstCat && <Link to={`/category/${firstCat}`}>More in {categoryName(firstCat)}</Link>}
          </div>
          <CourseGrid courses={related} label="Related courses" />
        </section>
      )}
    </div>
  )
}
