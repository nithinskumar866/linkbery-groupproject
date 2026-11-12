import { useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Columns2, Search } from 'lucide-react'
import { getCategories, getCourseById, getOverallStats, getPlatforms, searchCourses } from '../lib/courses.js'
import { getAllPaths, getPathProgress } from '../lib/paths.js'
import { useAuth } from '../hooks/useAuth.js'
import { useProgress } from '../hooks/useProgress.js'
import { useSaved } from '../hooks/useSaved.js'
import CourseList from '../components/CourseList.jsx'
import CourseThumb from '../components/CourseThumb.jsx'
import { formatNumber, usePageTitle } from '../components/utils.js'
import { Empty, PathTile, SectionHead, Wrap } from './parts.jsx'
import { byline } from './format.js'
import { ICON } from './iconProps.js'

const POPULAR = ['Python', 'SQL', 'UI/UX design', 'Machine learning']

// Topic tabs: each one runs a real query against the course list.
const TABS = [
  { key: 'data-science', label: 'Data science', options: { categories: ['data-science'] } },
  { key: 'development', label: 'Development', options: { categories: ['development'] } },
  { key: 'ai-ml', label: 'AI & machine learning', options: { categories: ['ai-ml'] } },
  { key: 'design', label: 'Design', options: { categories: ['design'] } },
  { key: 'business', label: 'Business', options: { categories: ['business'] } },
  { key: 'free', label: 'Free courses', options: { price: ['Free'] } },
]
const tabHref = (t) => (t.options.categories ? `/category/${t.options.categories[0]}?sort=rating` : '/courses?price=Free&sort=rating')

const WHY = [
  {
    icon: Search,
    title: 'Every platform, one search',
    text: 'Coursera, Udemy, edX, YouTube and more, described with the same fields so results are comparable.',
  },
  {
    icon: Columns2,
    title: 'Compare before you commit',
    text: 'Put up to three courses side by side on price, length, level, rating and the skills they teach.',
  },
  {
    icon: Check,
    title: 'A plan, not just a list',
    text: 'Learning paths order courses from first steps to job-ready, and track what you have finished.',
  },
]

function HeroSearch() {
  const navigate = useNavigate()
  const uid = useId()
  const categories = getCategories()
  const technical = categories.filter((c) => c.group === 'technical')
  const other = categories.filter((c) => c.group !== 'technical')

  const onSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const q = fd.get('q')?.toString().trim() || ''
    const category = fd.get('category')?.toString() || ''
    if (!q && !category) {
      navigate('/courses')
      return
    }
    // /search reads `q` and `category` (components/filterParams.js).
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (category) sp.set('category', category)
    navigate(`/search?${sp}`)
  }

  return (
    <form className="pg-hero-search" role="search" onSubmit={onSubmit}>
      <label htmlFor={`${uid}-q`} className="visually-hidden">
        Course, skill or provider
      </label>
      <input
        id={`${uid}-q`}
        name="q"
        type="search"
        className="input pg-hero-input"
        placeholder="Course, skill or provider"
        autoComplete="off"
        enterKeyHint="search"
      />
      <label htmlFor={`${uid}-cat`} className="visually-hidden">
        Category
      </label>
      <select id={`${uid}-cat`} name="category" className="select pg-hero-select" defaultValue="">
        <option value="">All categories</option>
        <optgroup label="Technical">
          {technical.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="Non-technical">
          {other.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </optgroup>
      </select>
      <button type="submit" className="btn btn-primary pg-hero-submit">
        Search
      </button>
    </form>
  )
}

function PopularCourses({ total }) {
  const uid = useId()
  const [active, setActive] = useState(TABS[0].key)
  const tabRefs = useRef({})
  const tab = TABS.find((t) => t.key === active) || TABS[0]
  const courses = searchCourses({ ...tab.options, sort: 'rating' }).slice(0, 8)

  const onKeyDown = (e) => {
    const i = TABS.findIndex((t) => t.key === active)
    let next = null
    if (e.key === 'ArrowRight') next = TABS[(i + 1) % TABS.length]
    if (e.key === 'ArrowLeft') next = TABS[(i - 1 + TABS.length) % TABS.length]
    if (e.key === 'Home') next = TABS[0]
    if (e.key === 'End') next = TABS[TABS.length - 1]
    if (next) {
      e.preventDefault()
      setActive(next.key)
      tabRefs.current[next.key]?.focus()
    }
  }

  return (
    <section className="pg-section" aria-labelledby={`${uid}-h`}>
      <Wrap>
        <SectionHead
          id={`${uid}-h`}
          title="Popular courses"
          desc="Rated and reviewed on the platforms that run them."
          to="/courses"
          linkText={`View all ${formatNumber(total)} courses`}
        />
        <div className="pg-topic-tabs" role="tablist" aria-label="Course topics" onKeyDown={onKeyDown}>
          {TABS.map((t) => {
            const selected = t.key === tab.key
            return (
              <button
                key={t.key}
                ref={(el) => {
                  tabRefs.current[t.key] = el
                }}
                type="button"
                role="tab"
                id={`${uid}-tab-${t.key}`}
                aria-selected={selected}
                aria-controls={`${uid}-panel`}
                tabIndex={selected ? 0 : -1}
                className={`pg-topic-tab ${selected ? 'is-active' : ''}`}
                onClick={() => setActive(t.key)}
              >
                {t.label}
              </button>
            )
          })}
        </div>
        <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${tab.key}`}>
          <CourseList
            courses={courses}
            variant="grid"
            label={`${tab.label}: top rated`}
            empty={<Empty title="No courses in this topic yet" />}
          />
          <p className="pg-tab-more">
            <Link className="pg-more" to={tabHref(tab)}>
              See all {tab.label.toLowerCase()} <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </Wrap>
    </section>
  )
}

/** Logged in: path progress, or saved courses when nothing is tracked yet. */
function ContinueLearning() {
  const uid = useId()
  const { progress } = useProgress()
  const { savedIds } = useSaved()
  const started = getAllPaths()
    .map((p) => ({ path: p, prog: getPathProgress(p.id, progress) }))
    .filter(({ path }) => path.steps.some((s) => progress?.[s.courseId]?.status))
    .sort((a, b) => b.prog.percent - a.prog.percent)
    .slice(0, 4)
  const saved = (savedIds || [])
    .map((id) => getCourseById(id))
    .filter(Boolean)
    .slice(0, 4)

  return (
    <section className="pg-section" aria-labelledby={`${uid}-h`}>
      <Wrap>
        {started.length > 0 ? (
          <>
            <SectionHead
              id={`${uid}-h`}
              title="Continue learning"
              desc="Your learning paths, with the steps you have finished."
              to="/profile?tab=paths"
              linkText="Your profile"
            />
            <ul className="pg-path-grid">
              {started.map(({ path }) => (
                <li key={path.id}>
                  <PathTile path={path} />
                </li>
              ))}
            </ul>
          </>
        ) : saved.length > 0 ? (
          <>
            <SectionHead
              id={`${uid}-h`}
              title="Continue learning"
              desc="Courses you saved. Set a status on a course to track it in its learning path."
              to="/profile"
              linkText="All saved courses"
            />
            <CourseList courses={saved} variant="grid" label="Saved courses" />
          </>
        ) : (
          <div className="pg-cta">
            <div className="pg-cta-text">
              <h2 id={`${uid}-h`} className="pg-cta-title">
                Continue learning
              </h2>
              <p>Pick a learning path or save a few courses, and your progress shows up here.</p>
            </div>
            <div className="pg-cta-actions">
              <Link className="btn btn-primary pg-btn-lg" to="/paths">
                Choose a learning path
              </Link>
              <Link className="btn btn-secondary pg-btn-lg" to="/courses">
                Browse courses
              </Link>
            </div>
          </div>
        )}
      </Wrap>
    </section>
  )
}

function SignUpCta() {
  return (
    <section className="pg-section" aria-labelledby="home-cta-h">
      <Wrap>
        <div className="pg-cta">
          <div className="pg-cta-text">
            <h2 id="home-cta-h" className="pg-cta-title">
              Save courses and track your progress
            </h2>
            <p>A free account keeps your shortlist, comparisons and learning paths in one place.</p>
          </div>
          <div className="pg-cta-actions">
            <Link className="btn btn-primary pg-btn-lg" to="/register">
              Create a free account
            </Link>
            <Link className="btn btn-secondary pg-btn-lg" to="/courses">
              Browse courses
            </Link>
          </div>
        </div>
      </Wrap>
    </section>
  )
}

export default function Home() {
  usePageTitle('')
  const { user } = useAuth()
  const stats = getOverallStats()
  const platforms = getPlatforms()
  const paths = getAllPaths()
  const heroCourses = searchCourses({ sort: 'rating' })
    .filter((c) => c.image)
    .slice(0, 4)
  const platformNames = platforms.map((p) => p.name)
  const named = platformNames.slice(0, 3)
  const rest = Math.max(0, platformNames.length - named.length)

  return (
    <div className="pg-home">
      <section className="pg-band pg-hero" aria-labelledby="home-hero-h">
        <Wrap className="pg-hero-inner">
          <div className="pg-hero-text">
            <h1 id="home-hero-h" className="pg-hero-title">
              Find the right online course before you pay for one
            </h1>
            <p className="pg-hero-sub">
              Linkbery lists courses from {named.join(', ')}
              {rest > 0 ? ` and ${rest} more platforms` : ''} with the same details side by side: level, length, price,
              rating and skills.
            </p>
            <HeroSearch />
            <p className="pg-hero-popular">
              Popular:{' '}
              {POPULAR.map((s, i) => (
                <span key={s}>
                  {i > 0 && <span aria-hidden="true"> · </span>}
                  <Link to={`/search?q=${encodeURIComponent(s)}`}>{s}</Link>
                </span>
              ))}
            </p>
          </div>
          {heroCourses.length > 0 && (
            <ul className="pg-hero-cards" aria-label="Featured courses">
              {heroCourses.map((c) => (
                <li key={c.id}>
                  <article className="card pg-hero-card">
                    <CourseThumb course={c} />
                    <div className="pg-hero-card-body">
                      <span className="pg-hero-card-by">{byline(c)}</span>
                      <Link className="pg-hero-card-title pg-stretch" to={`/courses/${encodeURIComponent(c.id)}`}>
                        {c.title}
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </Wrap>
      </section>

      {platforms.length > 0 && (
        <section className="pg-platforms" aria-label="Platforms">
          <Wrap className="pg-platforms-inner">
            <span className="pg-platforms-label">Courses from</span>
            <ul className="pg-platforms-list">
              {platforms.map((p) => (
                <li key={p.slug || p.name}>
                  <Link to={`/courses?platform=${encodeURIComponent(p.name)}`}>{p.name}</Link>
                </li>
              ))}
            </ul>
          </Wrap>
        </section>
      )}

      <PopularCourses total={stats?.courseCount} />

      <section className="pg-why" aria-label="Why Linkbery">
        <Wrap className="pg-why-grid">
          {WHY.map((w) => (
            <div key={w.title} className="pg-why-item">
              <span className="pg-why-icon">
                <w.icon {...ICON} size={22} />
              </span>
              <h2 className="pg-why-title">{w.title}</h2>
              <p>{w.text}</p>
            </div>
          ))}
        </Wrap>
      </section>

      {paths.length > 0 && (
        <section className="pg-band pg-section" aria-labelledby="home-paths-h">
          <Wrap>
            <SectionHead
              id="home-paths-h"
              title="Learning paths"
              desc="Not sure where to start? Follow courses in an order that makes sense."
              to="/paths"
              linkText={`All ${paths.length} paths`}
            />
            <ul className="pg-path-grid">
              {paths.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <PathTile path={p} />
                </li>
              ))}
            </ul>
          </Wrap>
        </section>
      )}

      <section className="pg-stats-band" aria-label="Linkbery in numbers">
        <Wrap as="dl" className="pg-stats-grid">
          <div>
            <dt>courses listed</dt>
            <dd>{formatNumber(stats?.courseCount)}</dd>
          </div>
          <div>
            <dt>learning platforms</dt>
            <dd>{formatNumber(stats?.platformCount)}</dd>
          </div>
          <div>
            <dt>skills covered</dt>
            <dd>{formatNumber(stats?.skillCount)}</dd>
          </div>
          <div>
            <dt>learning paths</dt>
            <dd>{formatNumber(paths.length)}</dd>
          </div>
        </Wrap>
      </section>

      {user ? <ContinueLearning /> : <SignUpCta />}
    </div>
  )
}
