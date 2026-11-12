import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { getCategories, getFacetCounts, getOverallStats, searchCourses } from '../lib/courses.js'
import { getAllPaths } from '../lib/paths.js'
import CourseList from '../components/CourseList.jsx'
import { CategoryIcon } from '../components/icons.js'
import { openPalette } from '../components/palette.js'
import { formatNumber, formatRating, usePageTitle } from '../components/utils.js'
import { Empty, PathRow, SectionHead } from './parts.jsx'
import { ICON } from './iconProps.js'

function HeroSearch() {
  const navigate = useNavigate()
  // When the palette closes it may hand focus back to this field; skip that one
  // focus event so the palette does not reopen straight away.
  const returning = useRef(false)

  const open = () => {
    returning.current = true
    openPalette()
  }
  const onFocus = () => {
    if (returning.current) {
      returning.current = false
      return
    }
    open()
  }
  const onSubmit = (e) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')?.toString().trim() || ''
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/courses')
  }

  return (
    <form className="pg-hero-search" role="search" onSubmit={onSubmit}>
      <label htmlFor="hero-q" className="visually-hidden">
        Search courses
      </label>
      <Search {...ICON} className="pg-hero-search-icon" />
      <input
        id="hero-q"
        name="q"
        type="search"
        className="input pg-hero-input"
        placeholder="Search courses, skills or providers"
        autoComplete="off"
        onFocus={onFocus}
        onClick={open}
      />
      <span className="kbd pg-hero-kbd" aria-hidden="true">
        Ctrl K
      </span>
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  )
}

export default function Home() {
  usePageTitle('Home')
  const stats = getOverallStats()
  const categories = getCategories()
  const catCounts = getFacetCounts({}).categories || {}
  const top = searchCourses({ sort: 'rating' }).slice(0, 5)
  const paths = getAllPaths().slice(0, 3)
  const avg = formatRating(stats?.avgRating)

  return (
    <div className="pg-home">
      <section className="pg-hero" aria-labelledby="hero-h">
        <h1 id="hero-h" className="pg-hero-title">
          Every good course, one search away.
        </h1>
        <p className="pg-hero-sub">
          Courses from Coursera, Udemy, edX, YouTube and more, described the same way so you can filter, compare and
          pick one. You enrol on the provider’s site.
        </p>
        <HeroSearch />
        <p className="pg-hero-stats">
          <span>{formatNumber(stats?.courseCount)} courses</span>
          <span aria-hidden="true"> · </span>
          <span>{formatNumber(stats?.platformCount)} platforms</span>
          <span aria-hidden="true"> · </span>
          <span>{formatNumber(stats?.skillCount)} skills</span>
          {avg && (
            <>
              <span aria-hidden="true"> · </span>
              <span>
                <span className="pg-star" aria-hidden="true">
                  ★
                </span>{' '}
                {avg} average
              </span>
            </>
          )}
        </p>
      </section>

      <section className="pg-section" aria-labelledby="h-cats">
        <SectionHead id="h-cats" label="Browse by category" to="/courses" linkText="All courses" />
        <ul className="pg-cat-grid">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link className="pg-cat-link" to={`/category/${c.slug}`}>
                <CategoryIcon slug={c.slug} size={16} />
                <span className="pg-cat-name">{c.name}</span>
                <span className="pg-mono pg-cat-count">{catCounts[c.slug] ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {paths.length > 0 && (
        <section className="pg-section" aria-labelledby="h-paths">
          <SectionHead id="h-paths" label="Learning paths" to="/paths" linkText="All paths" />
          <ul className="pg-rows">
            {paths.map((p) => (
              <li key={p.id}>
                <PathRow path={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="pg-section" aria-labelledby="h-top">
        <SectionHead id="h-top" label="Top rated" to="/courses?sort=rating" linkText="See all" />
        <CourseList courses={top} empty={<Empty title="No courses yet" />} />
      </section>
    </div>
  )
}
