import { Link, useNavigate } from 'react-router-dom'
import { getAllSkills, getCategories, getOverallStats, getPlatforms, searchCourses } from '../lib/courses.js'
import CourseGrid from '../components/CourseGrid.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PlatformLogo from '../components/PlatformLogo.jsx'
import SkillChip from '../components/SkillChip.jsx'
import { formatNumber, formatRating, usePageTitle } from '../components/utils.js'

function CategoryTiles({ list }) {
  return (
    <ul className="category-tiles">
      {list.map((c) => (
        <li key={c.slug}>
          <Link className="category-tile" to={`/category/${c.slug}`}>
            <i className={`fa-solid ${c.icon || 'fa-book'}`} aria-hidden="true" />
            <span>{c.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Home() {
  usePageTitle('Home')
  const navigate = useNavigate()
  const stats = getOverallStats()
  const categories = getCategories()
  const skills = getAllSkills().slice(0, 14)
  const featured = searchCourses({ sort: 'rating' }).slice(0, 6)
  const platforms = getPlatforms()
  const avg = formatRating(stats?.avgRating)

  const onSearch = (e) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')?.toString().trim() || ''
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/courses')
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">Course aggregator</p>
          <h1>Find the right online course, from every platform, in one place.</h1>
          <p className="hero-lead">
            Linkbery lists courses from Coursera, Udemy, edX, Guvi, Simplilearn, YouTube and more. Search, filter,
            compare and save them, then enrol directly with the provider.
          </p>
          <form className="hero-search" role="search" onSubmit={onSearch}>
            <label htmlFor="hero-q" className="visually-hidden">
              What do you want to learn?
            </label>
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input id="hero-q" name="q" type="search" placeholder="What do you want to learn?" />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
          <div className="hero-actions">
            <Link to="/courses" className="btn btn-outline">
              <i className="fa-solid fa-graduation-cap" aria-hidden="true" /> Browse all courses
            </Link>
            <Link to="/recommend" className="btn btn-ghost">
              <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" /> Not sure? Get recommendations
            </Link>
          </div>
        </div>
        <dl className="hero-stats">
          <div>
            <dt>Courses</dt>
            <dd>{formatNumber(stats?.courseCount)}</dd>
          </div>
          <div>
            <dt>Platforms</dt>
            <dd>{formatNumber(stats?.platformCount)}</dd>
          </div>
          <div>
            <dt>Skills</dt>
            <dd>{formatNumber(stats?.skillCount)}</dd>
          </div>
          <div>
            <dt>Avg. rating</dt>
            <dd>{avg ?? '-'}</dd>
          </div>
        </dl>
      </section>

      <section className="home-section" aria-labelledby="h-tech">
        <div className="section-head">
          <h2 id="h-tech">Technical</h2>
          <Link to="/courses">All courses</Link>
        </div>
        <CategoryTiles list={categories.filter((c) => c.group === 'technical')} />
      </section>

      <section className="home-section" aria-labelledby="h-nontech">
        <div className="section-head">
          <h2 id="h-nontech">Non-technical</h2>
        </div>
        <CategoryTiles list={categories.filter((c) => c.group !== 'technical')} />
      </section>

      {skills.length > 0 && (
        <section className="home-section" aria-labelledby="h-skills">
          <div className="section-head">
            <h2 id="h-skills">Popular skills</h2>
          </div>
          <ul className="chip-list">
            {skills.map((s) => (
              <li key={s.name}>
                <SkillChip to={`/courses?skill=${encodeURIComponent(s.name)}`}>
                  {s.name} <span className="chip-count">{s.count}</span>
                </SkillChip>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="home-section" aria-labelledby="h-featured">
        <div className="section-head">
          <h2 id="h-featured">Top rated courses</h2>
          <Link to="/courses?sort=rating">See all</Link>
        </div>
        <CourseGrid
          courses={featured}
          label="Top rated courses"
          empty={<EmptyState title="No courses yet" icon="fa-book-open" />}
        />
      </section>

      {platforms.length > 0 && (
        <section className="home-section" aria-labelledby="h-platforms">
          <div className="section-head">
            <h2 id="h-platforms">Platforms we list</h2>
            <Link to="/insights">Compare platforms</Link>
          </div>
          <ul className="platform-strip">
            {platforms.map((p) => (
              <li key={p.slug || p.name}>
                <Link to={`/courses?platform=${encodeURIComponent(p.name)}`} className="platform-pill">
                  <PlatformLogo name={p.name} size={28} decorative />
                  <span>{p.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
