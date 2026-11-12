import { Link } from 'react-router-dom'
import { getOverallStats, getPlatforms } from '../lib/courses.js'
import { getAllPaths } from '../lib/paths.js'
import PageBand from '../components/PageBand.jsx'
import PlatformLogo from '../components/PlatformLogo.jsx'
import { formatNumber, formatRating, usePageTitle } from '../components/utils.js'
import { Wrap } from './parts.jsx'

const FEATURES = [
  ['/courses', 'Browse and filter', 'Filter every course by category, level, platform, rating, price and skill.'],
  ['/compare', 'Compare', 'Put up to three courses side by side and share the comparison as a link.'],
  ['/paths', 'Learning paths', 'Follow an ordered set of courses towards one goal and track each step.'],
  [
    '/recommend',
    'Recommendations',
    'Describe a goal and get courses ranked by skill match, rating and level. Plain keyword matching, run in your browser.',
  ],
  ['/insights', 'Platform insights', 'See course counts, ratings and common skills for each platform.'],
]

export default function About() {
  usePageTitle('About')
  const stats = getOverallStats()
  const platforms = getPlatforms()
  const pathCount = getAllPaths().length
  const avg = formatRating(stats?.avgRating)

  return (
    <div className="pg-about">
      <PageBand
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        title="About Linkbery"
        desc="A catalogue of online courses from many platforms, described the same way so you can choose well."
      />

      <Wrap className="pg-page-body pg-text-layout">
        <div className="pg-prose">
          <section aria-labelledby="about-what">
            <h2 id="about-what" className="pg-h3">
              A list of courses, not a course provider
            </h2>
            <p>
              Online courses are spread across Coursera, Udemy, edX, Guvi, Simplilearn, YouTube and others, and each
              describes levels, prices and skills differently. Linkbery keeps a curated list of those courses with the same
              fields for every one, so you can search, filter, compare and save them in one place.
            </p>
            <p>
              We do not host or sell anything. “Go to course” opens the provider’s page, where you enrol, pay if needed and
              learn.
            </p>
          </section>

          <section aria-labelledby="about-how">
            <h2 id="about-how" className="pg-h3">
              What you can do
            </h2>
            <ul className="pg-feature-list">
              {FEATURES.map(([to, title, text]) => (
                <li key={to}>
                  <Link to={to} className="pg-link-strong">
                    {title}
                  </Link>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="about-know">
            <h2 id="about-know" className="pg-h3">
              Good to know
            </h2>
            <ul className="pg-bullets">
              <li>
                Ratings, review counts and prices were copied from public listings when they were collected and may be out
                of date. Check the provider’s page before you enrol.
              </li>
              <li>Accounts are a demo. There is no server: your login, saved courses and progress stay in this browser.</li>
              <li>Linkbery is a student group project and is not affiliated with any platform listed.</li>
            </ul>
          </section>
        </div>

        <aside className="pg-text-side" aria-labelledby="about-numbers">
          <div className="card pg-side-facts">
            <h2 id="about-numbers" className="pg-h3">
              The catalogue
            </h2>
            <dl className="pg-side-stats">
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
                <dt>Learning paths</dt>
                <dd>{formatNumber(pathCount)}</dd>
              </div>
              {avg && (
                <div>
                  <dt>Average rating</dt>
                  <dd>{avg}</dd>
                </div>
              )}
            </dl>
            {platforms.length > 0 && (
              <ul className="pg-plat-list" aria-label="Platforms">
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
          </div>
        </aside>
      </Wrap>
    </div>
  )
}
