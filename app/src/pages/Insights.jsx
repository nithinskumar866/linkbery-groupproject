import { Link } from 'react-router-dom'
import { getAllSkills, getOverallStats, getPlatformInsights } from '../lib/courses.js'
import EmptyState from '../components/EmptyState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import PlatformLogo from '../components/PlatformLogo.jsx'
import SkillChip from '../components/SkillChip.jsx'
import { LEVELS, formatCount, formatNumber, formatRating, usePageTitle } from '../components/utils.js'

/** Horizontal CSS bar chart. rows: [{ key, label, value, display, to? }] */
function BarChart({ title, caption, rows, max }) {
  const top = max ?? Math.max(0, ...rows.map((r) => r.value || 0))
  return (
    <figure className="card bar-chart">
      <figcaption>
        <h2>{title}</h2>
        {caption && <p className="field-hint">{caption}</p>}
      </figcaption>
      {rows.length === 0 ? (
        <p className="muted">No data yet.</p>
      ) : (
        <ul>
          {rows.map((r) => {
            const pct = top > 0 && r.value ? Math.max(1, (r.value / top) * 100) : 0
            return (
              <li key={r.key} className="bar-row">
                <span className="bar-label" title={r.label}>
                  {r.to ? <Link to={r.to}>{r.label}</Link> : r.label}
                </span>
                <span className="bar-track" aria-hidden="true">
                  <span className="bar-fill" style={{ width: `${pct}%` }} />
                </span>
                <span className="bar-value">{r.display}</span>
              </li>
            )
          })}
        </ul>
      )}
    </figure>
  )
}

function LevelBar({ levels }) {
  const entries = Object.entries(levels || {}).filter(([, n]) => n > 0)
  const total = entries.reduce((s, [, n]) => s + n, 0)
  if (total === 0) return null
  const order = (k) => {
    const i = LEVELS.indexOf(k)
    return i === -1 ? 99 : i
  }
  entries.sort((a, b) => order(a[0]) - order(b[0]))
  return (
    <div className="level-bar-wrap">
      <div className="level-bar" aria-hidden="true">
        {entries.map(([k, n]) => (
          <span key={k} className={`level-seg level-${k.toLowerCase()}`} style={{ width: `${(n / total) * 100}%` }} />
        ))}
      </div>
      <ul className="level-legend">
        {entries.map(([k, n]) => (
          <li key={k}>
            <span className={`level-dot level-${k.toLowerCase()}`} aria-hidden="true" /> {k}: {n}
          </li>
        ))}
      </ul>
    </div>
  )
}

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
    <div className="insights-page">
      <PageHeader
        title="Platform insights"
        icon="fa-chart-column"
        subtitle="How the platforms we list compare, computed live from the courses in Linkbery. Ratings are the providers' own public ratings."
      />

      <dl className="stat-tiles">
        <div className="stat-tile">
          <dt>Courses</dt>
          <dd>{formatNumber(stats?.courseCount)}</dd>
        </div>
        <div className="stat-tile">
          <dt>Platforms</dt>
          <dd>{formatNumber(stats?.platformCount)}</dd>
        </div>
        <div className="stat-tile">
          <dt>Distinct skills</dt>
          <dd>{formatNumber(stats?.skillCount)}</dd>
        </div>
        <div className="stat-tile">
          <dt>Average rating</dt>
          <dd>{avg ? <>{avg}<small> / 5</small></> : 'n/a'}</dd>
        </div>
      </dl>

      {insights.length === 0 ? (
        <EmptyState icon="fa-chart-column" title="No platform data yet" />
      ) : (
        <>
          <div className="chart-grid">
            <BarChart title="Courses per platform" rows={countRows} />
            <BarChart
              title="Average rating per platform"
              caption="Out of 5. Platforms without rated courses show n/a."
              rows={ratingRows}
              max={5}
            />
            <BarChart title="Most common skills" caption="Number of courses teaching each skill." rows={skillRows} />
          </div>

          <h2 className="results-heading">Platforms</h2>
          <ul className="platform-cards">
            {insights.map((p) => {
              const r = formatRating(p.avgRating)
              return (
                <li key={p.platform.name} className="card platform-card">
                  <div className="platform-card-head">
                    <PlatformLogo name={p.platform.name} size={48} />
                    <div>
                      <h3>{p.platform.name}</h3>
                      {p.platform.url && (
                        <a href={p.platform.url} target="_blank" rel="noopener noreferrer" className="small-link">
                          Visit site <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                          <span className="visually-hidden"> (opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <dl className="platform-card-stats">
                    <div>
                      <dt>Courses</dt>
                      <dd>{formatNumber(p.courseCount)}</dd>
                    </div>
                    <div>
                      <dt>Avg. rating</dt>
                      <dd>{r ?? 'n/a'}</dd>
                    </div>
                    <div>
                      <dt>Reviews</dt>
                      <dd>{p.totalReviews ? formatCount(p.totalReviews) : '-'}</dd>
                    </div>
                  </dl>
                  <LevelBar levels={p.levels} />
                  {p.topSkills?.length > 0 && (
                    <>
                      <h4 className="platform-card-sub">Top skills</h4>
                      <ul className="chip-list">
                        {p.topSkills.map((s) => (
                          <li key={s.name}>
                            <SkillChip to={`/courses?platform=${encodeURIComponent(p.platform.name)}&skill=${encodeURIComponent(s.name)}`}>
                              {s.name}
                            </SkillChip>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <Link className="btn btn-outline btn-sm platform-card-cta" to={`/courses?platform=${encodeURIComponent(p.platform.name)}`}>
                    Browse {formatNumber(p.courseCount)} {p.courseCount === 1 ? 'course' : 'courses'}
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
