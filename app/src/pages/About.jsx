import { Link } from 'react-router-dom'
import { getOverallStats, getPlatforms } from '../lib/courses.js'
import PageHeader from '../components/PageHeader.jsx'
import PlatformLogo from '../components/PlatformLogo.jsx'
import { formatNumber, formatRating, usePageTitle } from '../components/utils.js'

export default function About() {
  usePageTitle('About')
  const stats = getOverallStats()
  const platforms = getPlatforms()
  const avg = formatRating(stats?.avgRating)

  return (
    <div className="about-page">
      <PageHeader title="About Linkbery" icon="fa-circle-info" subtitle="What this site is, and what it is not." />

      <div className="about-grid">
        <section className="card prose">
          <h2>What is Linkbery?</h2>
          <p>
            Linkbery is a course aggregator. Online courses are spread across many platforms, such as Coursera, Udemy,
            edX, Guvi, Simplilearn and YouTube, and each one has its own search and its own way of describing levels,
            prices and skills. Linkbery puts a curated list of those courses in one place, with the same fields for
            every course, so you can search, filter, compare and save them side by side.
          </p>
          <p>
            We do <strong>not</strong> host or sell any course content. When you choose a course, the “Go to course”
            button takes you to the provider’s own page, where you enrol, pay (if needed) and learn.
          </p>

          <h2>How it works</h2>
          <ul className="about-list">
            <li>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <span>
                <Link to="/courses">Browse and filter</Link> by category, level, platform, rating, price and skill.
              </span>
            </li>
            <li>
              <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
              <span>
                <Link to="/recommend">Describe a goal</Link> and get matching courses ranked by skill match, rating
                and level. This runs in your browser using simple keyword matching, not an AI service.
              </span>
            </li>
            <li>
              <i className="fa-solid fa-chart-column" aria-hidden="true" />
              <span>
                <Link to="/insights">Compare platforms</Link> by number of courses, average rating and common skills.
              </span>
            </li>
            <li>
              <i className="fa-solid fa-bookmark" aria-hidden="true" />
              <span>Save courses to your profile to come back to them later.</span>
            </li>
          </ul>

          <h2>Things to know</h2>
          <ul className="about-list">
            <li>
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
              <span>
                Ratings, review counts and prices were copied from public listings at the time they were collected and
                may be out of date. Always check the provider’s page before enrolling.
              </span>
            </li>
            <li>
              <i className="fa-solid fa-lock" aria-hidden="true" />
              <span>
                Accounts are a demo: there is no server. Your login and saved courses are kept only in this browser’s
                storage.
              </span>
            </li>
            <li>
              <i className="fa-solid fa-users" aria-hidden="true" />
              <span>Linkbery is a student group project and is not affiliated with any of the platforms listed.</span>
            </li>
          </ul>
        </section>

        <aside className="about-side">
          <div className="card">
            <h2>The catalogue right now</h2>
            <dl className="stat-tiles stat-tiles-compact">
              <div className="stat-tile">
                <dt>Courses</dt>
                <dd>{formatNumber(stats?.courseCount)}</dd>
              </div>
              <div className="stat-tile">
                <dt>Platforms</dt>
                <dd>{formatNumber(stats?.platformCount)}</dd>
              </div>
              <div className="stat-tile">
                <dt>Skills</dt>
                <dd>{formatNumber(stats?.skillCount)}</dd>
              </div>
              <div className="stat-tile">
                <dt>Avg. rating</dt>
                <dd>{avg ?? 'n/a'}</dd>
              </div>
            </dl>
            <p className="field-hint">Counted live from the course list.</p>
          </div>
          {platforms.length > 0 && (
            <div className="card">
              <h2>Platforms</h2>
              <ul className="about-platforms">
                {platforms.map((p) => (
                  <li key={p.slug || p.name}>
                    <PlatformLogo name={p.name} size={28} decorative />
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
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
