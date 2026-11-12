import { Link } from 'react-router-dom'
import { getOverallStats, getPlatforms } from '../lib/courses.js'
import PlatformLogo from '../components/PlatformLogo.jsx'
import { formatNumber, formatRating, usePageTitle } from '../components/utils.js'
import { PageHead } from './parts.jsx'

export default function About() {
  usePageTitle('About')
  const stats = getOverallStats()
  const platforms = getPlatforms()
  const avg = formatRating(stats?.avgRating)

  return (
    <div className="pg-text">
      <PageHead title="About" desc="What Linkbery is, and what it is not." />

      <section className="pg-text-section" aria-labelledby="h-what">
        <h2 id="h-what" className="pg-text-h">
          A list of courses, not a course provider
        </h2>
        <p>
          Online courses are spread across Coursera, Udemy, edX, Guvi, Simplilearn, YouTube and others, and each describes
          levels, prices and skills differently. Linkbery keeps a curated list of those courses with the same fields for
          every one, so you can search, filter, compare and save them in one place.
        </p>
        <p>
          It does not host or sell anything. “Go to course” opens the provider’s page, where you enrol, pay if needed and
          learn.
        </p>
      </section>

      <section className="pg-text-section" aria-labelledby="h-how">
        <h2 id="h-how" className="pg-text-h">
          What you can do
        </h2>
        <dl className="pg-deflist">
          <div>
            <dt>
              <Link to="/courses">Courses</Link>
            </dt>
            <dd>Filter by category, level, platform, rating, price and skill.</dd>
          </div>
          <div>
            <dt>
              <Link to="/compare">Compare</Link>
            </dt>
            <dd>Put up to three courses side by side and share the comparison as a link.</dd>
          </div>
          <div>
            <dt>
              <Link to="/paths">Paths</Link>
            </dt>
            <dd>Follow an ordered set of courses towards one goal and track each step.</dd>
          </div>
          <div>
            <dt>
              <Link to="/recommend">Recommend</Link>
            </dt>
            <dd>Describe a goal and get courses ranked by skill match, rating and level. Plain keyword matching, run in your browser.</dd>
          </div>
          <div>
            <dt>
              <Link to="/insights">Insights</Link>
            </dt>
            <dd>See course counts, ratings and common skills per platform.</dd>
          </div>
        </dl>
      </section>

      <section className="pg-text-section" aria-labelledby="h-know">
        <h2 id="h-know" className="pg-text-h">
          Good to know
        </h2>
        <ul className="pg-text-list">
          <li>
            Ratings, review counts and prices were copied from public listings when they were collected and may be out of
            date. Check the provider’s page before you enrol.
          </li>
          <li>Accounts are a demo. There is no server: your login, saved courses and progress stay in this browser.</li>
          <li>Linkbery is a student group project and is not affiliated with any platform listed.</li>
        </ul>
      </section>

      <section className="pg-text-section" aria-labelledby="h-numbers">
        <h2 id="h-numbers" className="pg-text-h">
          The catalogue
        </h2>
        <p className="pg-mono pg-text-stats">
          {formatNumber(stats?.courseCount)} courses · {formatNumber(stats?.platformCount)} platforms ·{' '}
          {formatNumber(stats?.skillCount)} skills{avg ? ` · ${avg} avg rating` : ''}
        </p>
        {platforms.length > 0 && (
          <ul className="pg-plat-list">
            {platforms.map((p) => (
              <li key={p.slug || p.name}>
                <PlatformLogo name={p.name} size={20} decorative />
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.name}
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <span>{p.name}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
