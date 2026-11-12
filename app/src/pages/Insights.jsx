import { Link } from 'react-router-dom'
import { ArrowUpRight, ChartColumn } from 'lucide-react'
import { getAllSkills, getOverallStats, getPlatformInsights } from '../lib/courses.js'
import PlatformLogo from '../components/PlatformLogo.jsx'
import { LEVELS, formatCount, formatNumber, formatRating, usePageTitle } from '../components/utils.js'
import { Empty, PageHead } from './parts.jsx'
import { ICON } from './iconProps.js'

/** Thin horizontal CSS bars. rows: [{ key, label, value, display, to? }] */
function Bars({ id, title, caption, rows, max }) {
  const top = max ?? Math.max(0, ...rows.map((r) => r.value || 0))
  return (
    <figure className="pg-chart" aria-labelledby={id}>
      <figcaption>
        <h2 id={id} className="section-label">
          {title}
        </h2>
        {caption && <p className="field-hint">{caption}</p>}
      </figcaption>
      {rows.length === 0 ? (
        <p className="pg-dim">No data yet.</p>
      ) : (
        <ul className="pg-bars">
          {rows.map((r) => {
            const pct = top > 0 && r.value ? Math.max(1, (r.value / top) * 100) : 0
            return (
              <li key={r.key} className="pg-bar">
                <span className="pg-bar-label" title={r.label}>
                  {r.to ? <Link to={r.to}>{r.label}</Link> : r.label}
                </span>
                <span className="pg-bar-track" aria-hidden="true">
                  <span className="pg-bar-fill" style={{ width: `${pct}%` }} />
                </span>
                <span className="pg-bar-value">{r.display}</span>
              </li>
            )
          })}
        </ul>
      )}
    </figure>
  )
}

const LEVEL_ABBR = { Beginner: 'B', Intermediate: 'I', Advanced: 'A', Mixed: 'M' }

export default function Insights() {
  usePageTitle('Platform insights')
  const insights = getPlatformInsights() || []
  const stats = getOverallStats()
  const topSkills = getAllSkills().slice(0, 10)
  const avg = formatRating(stats?.avgRating)

  const countRows = insights.map((p) => ({
    key: p.platform.name,
    label: p.platform.name,
    value: p.courseCount,
    display: formatNumber(p.courseCount),
    to: `/courses?platform=${encodeURIComponent(p.platform.name)}`,
  }))
  const ratingRows = [...insights]
    .sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1))
    .map((p) => ({
      key: p.platform.name,
      label: p.platform.name,
      value: p.avgRating ?? 0,
      display: p.avgRating != null ? formatRating(p.avgRating) : 'n/a',
    }))
  const skillRows = topSkills.map((s) => ({
    key: s.name,
    label: s.name,
    value: s.count,
    display: formatNumber(s.count),
    to: `/courses?skill=${encodeURIComponent(s.name)}`,
  }))

  return (
    <div className="pg-insights">
      <PageHead
        title="Insights"
        desc="How the listed platforms compare, computed from the course list. Ratings are the providers’ own."
      />

      <dl className="pg-stats">
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
          <dt>Avg rating</dt>
          <dd>{avg ?? 'n/a'}</dd>
        </div>
      </dl>

      {insights.length === 0 ? (
        <Empty icon={ChartColumn} title="No platform data yet" />
      ) : (
        <>
          <div className="pg-chart-grid">
            <Bars id="h-count" title="Courses per platform" rows={countRows} />
            <Bars id="h-rating" title="Average rating" caption="Out of 5." rows={ratingRows} max={5} />
            <Bars id="h-skills" title="Most common skills" caption="Courses teaching each skill." rows={skillRows} />
          </div>

          <section className="pg-section" aria-labelledby="h-platforms">
            <div className="pg-section-head">
              <h2 id="h-platforms" className="section-label">
                Platforms <span className="pg-count">· {insights.length}</span>
              </h2>
            </div>
            <div className="pg-table-scroll" role="region" aria-labelledby="h-platforms" tabIndex={0}>
              <table className="pg-table">
                <thead>
                  <tr>
                    <th scope="col">Platform</th>
                    <th scope="col" className="pg-num">
                      Courses
                    </th>
                    <th scope="col" className="pg-num">
                      Rating
                    </th>
                    <th scope="col" className="pg-num">
                      Reviews
                    </th>
                    <th scope="col">
                      <abbr title="Beginner / Intermediate / Advanced / Mixed">Levels</abbr>
                    </th>
                    <th scope="col">Top skills</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.map((p) => {
                    const r = formatRating(p.avgRating)
                    const levels = LEVELS.filter((l) => p.levels?.[l] > 0)
                      .map((l) => `${LEVEL_ABBR[l]} ${p.levels[l]}`)
                      .join(' · ')
                    return (
                      <tr key={p.platform.name}>
                        <th scope="row">
                          <span className="pg-plat">
                            <PlatformLogo name={p.platform.name} size={20} decorative />
                            <Link to={`/courses?platform=${encodeURIComponent(p.platform.name)}`}>
                              {p.platform.name}
                            </Link>
                            {p.platform.url && (
                              <a
                                className="pg-plat-ext"
                                href={p.platform.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${p.platform.name} website (opens in a new tab)`}
                              >
                                <ArrowUpRight {...ICON} size={14} />
                              </a>
                            )}
                          </span>
                        </th>
                        <td className="pg-num">{formatNumber(p.courseCount)}</td>
                        <td className="pg-num">{r ?? '-'}</td>
                        <td className="pg-num">{p.totalReviews ? formatCount(p.totalReviews) : '-'}</td>
                        <td className="pg-mono pg-nowrap">{levels || '-'}</td>
                        <td className="pg-skills-cell">
                          {(p.topSkills || []).slice(0, 3).map((s, i) => (
                            <span key={s.name}>
                              {i > 0 && ', '}
                              <Link
                                to={`/courses?platform=${encodeURIComponent(p.platform.name)}&skill=${encodeURIComponent(s.name)}`}
                              >
                                {s.name}
                              </Link>
                            </span>
                          ))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
