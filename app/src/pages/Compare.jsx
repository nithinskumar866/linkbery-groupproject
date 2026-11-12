import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getCompareSummary } from '../lib/courses.js'
import { useCompare } from '../hooks/useCompare.js'
import EmptyState from '../components/EmptyState.jsx'
import PageHeader from '../components/PageHeader.jsx'
import PlatformLogo from '../components/PlatformLogo.jsx'
import PriceBadge from '../components/PriceBadge.jsx'
import { showToast } from '../components/toast.js'
import { formatNumber, formatRating, usePageTitle } from '../components/utils.js'

const parseIds = (raw) => [...new Set((raw || '').split(',').map((s) => s.trim()).filter(Boolean))]

function Best({ show, children }) {
  if (!show) return children
  return (
    <span className="compare-best">
      {children}
      <span className="badge badge-free">
        <i className="fa-solid fa-trophy" aria-hidden="true" />
        &nbsp;Best
      </span>
    </span>
  )
}

export default function Compare() {
  usePageTitle('Compare courses')
  const [sp, setSp] = useSearchParams()
  const navigate = useNavigate()
  const { compareIds, removeFromCompare, clearCompare, addToCompare, max } = useCompare()
  const [copied, setCopied] = useState(false)

  const shared = sp.has('ids')
  const ids = shared ? parseIds(sp.get('ids')).slice(0, max) : compareIds
  const { courses, sharedSkills = [], uniqueSkills = {}, best = {} } = getCompareSummary(ids)
  const sharedSet = new Set(sharedSkills)
  const sameAsStored = shared && courses.length === compareIds.length && courses.every((c) => compareIds.includes(c.id))

  const remove = (id) => {
    if (shared) {
      const next = courses.map((c) => c.id).filter((x) => x !== id)
      // Removing the last shared course falls back to the user's own stored list.
      setSp(next.length ? { ids: next.join(',') } : {}, { replace: true })
    } else {
      removeFromCompare(id)
    }
  }

  const useThisList = () => {
    clearCompare()
    try {
      courses.forEach((c) => addToCompare(c.id))
      showToast('Comparison list updated.', { type: 'success' })
    } catch (err) {
      showToast(err?.message || 'Could not use this list.', { type: 'error' })
    }
    navigate('/compare', { replace: true })
  }

  const shareUrl = `${window.location.origin}/compare?ids=${courses.map((c) => encodeURIComponent(c.id)).join(',')}`
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      showToast(`Copy this link: ${shareUrl}`, { type: 'info', timeout: 10000 })
    }
  }

  const header = (
    <PageHeader
      title="Compare courses"
      icon="fa-code-compare"
      subtitle={`Put up to ${max} courses side by side.`}
      breadcrumbs={[{ label: 'Courses', to: '/courses' }, { label: 'Compare' }]}
    >
      {!shared && courses.length > 0 && (
        <>
          <button type="button" className="btn btn-outline" onClick={copyLink}>
            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-link'}`} aria-hidden="true" />
            {copied ? 'Link copied' : 'Copy share link'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={clearCompare}>
            <i className="fa-solid fa-xmark" aria-hidden="true" /> Clear all
          </button>
        </>
      )}
    </PageHeader>
  )

  if (courses.length === 0) {
    return (
      <div className="compare-page">
        {header}
        <EmptyState
          icon="fa-code-compare"
          title={shared ? 'None of these courses were found' : 'Nothing to compare yet'}
          actions={
            <Link className="btn btn-primary" to="/courses">
              Browse courses
            </Link>
          }
        >
          <p>
            Use <strong>Compare</strong> on any course card or course page to add up to {max} courses here.
          </p>
        </EmptyState>
      </div>
    )
  }

  const rows = [
    ['Platform', (c) => c.platform],
    ['Provider', (c) => c.provider],
    ['Level', (c) => c.level],
    ['Type', (c) => c.type],
    ['Duration', (c) => c.duration],
    ['Price', (c) => (c.price ? <PriceBadge price={c.price} /> : null)],
    [
      'Rating',
      (c) =>
        formatRating(c.rating) ? (
          <Best show={best.rating === c.id}>
            <span>
              <i className="fa-solid fa-star compare-star" aria-hidden="true" /> {formatRating(c.rating)} / 5
            </span>
          </Best>
        ) : null,
    ],
    [
      'Reviews',
      (c) =>
        c.reviewCount ? (
          <Best show={best.reviews === c.id}>
            <span>{formatNumber(c.reviewCount)}</span>
          </Best>
        ) : null,
    ],
  ]

  return (
    <div className="compare-page">
      {header}

      {shared && (
        <div className="alert alert-info compare-shared">
          <i className="fa-solid fa-share-nodes" aria-hidden="true" />
          <span>
            You are viewing a shared comparison.
            {sameAsStored ? ' It matches your list.' : ''}
          </span>
          {!sameAsStored && (
            <button type="button" className="btn btn-primary btn-sm" onClick={useThisList}>
              Use this list
            </button>
          )}
        </div>
      )}

      {courses.length === 1 && (
        <p className="alert alert-warn">
          <i className="fa-solid fa-circle-info" aria-hidden="true" />
          <span>
            Add at least one more course to compare. <Link to="/courses">Browse courses</Link>
          </span>
        </p>
      )}

      {courses.length > 1 && (
        <section className="card compare-shared-skills" aria-labelledby="h-shared-skills">
          <h2 id="h-shared-skills" className="detail-h detail-h-first">
            Skills in common
          </h2>
          {sharedSkills.length > 0 ? (
            <ul className="chip-list">
              {sharedSkills.map((s) => (
                <li key={s}>
                  <span className="chip chip-match">{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">These courses have no skills in common.</p>
          )}
        </section>
      )}

      <div className="compare-scroll" role="region" aria-label="Comparison table" tabIndex={0}>
        <table className="compare-table" style={{ '--cols': courses.length }}>
          <thead>
            <tr>
              <th scope="col" className="compare-corner">
                <span className="visually-hidden">Attribute</span>
              </th>
              {courses.map((c) => (
                <th key={c.id} scope="col" className="compare-course">
                  <div className="compare-course-head">
                    <PlatformLogo name={c.platform} size={36} />
                    <button
                      type="button"
                      className="icon-btn compare-remove"
                      onClick={() => remove(c.id)}
                      aria-label={`Remove ${c.title} from comparison`}
                      title="Remove"
                    >
                      <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>
                  </div>
                  <Link to={`/courses/${encodeURIComponent(c.id)}`} className="compare-course-title">
                    {c.title}
                  </Link>
                  {c.url && (
                    <a className="compare-go" href={c.url} target="_blank" rel="noopener noreferrer">
                      Go to course <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, get]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {courses.map((c) => {
                  const v = get(c)
                  return <td key={c.id}>{v ?? <span className="muted">Not listed</span>}</td>
                })}
              </tr>
            ))}
            <tr>
              <th scope="row">Skills</th>
              {courses.map((c) => (
                <td key={c.id}>
                  {c.skills?.length ? (
                    <ul className="chip-list">
                      {c.skills.map((s) => (
                        <li key={s}>
                          <span
                            className={`chip ${sharedSet.has(s) ? 'chip-match' : ''}`}
                            title={sharedSet.has(s) ? 'All compared courses teach this' : undefined}
                          >
                            {s}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="muted">Not listed</span>
                  )}
                </td>
              ))}
            </tr>
            {courses.length > 1 && (
              <tr>
                <th scope="row">Only in this course</th>
                {courses.map((c) => {
                  const only = uniqueSkills[c.id] || []
                  return (
                    <td key={c.id}>
                      {only.length ? (
                        <ul className="chip-list">
                          {only.map((s) => (
                            <li key={s}>
                              <span className="chip chip-active">{s}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="muted">None</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {courses.length > 1 && (
        <p className="field-hint compare-legend">
          <span className="chip chip-match">Green</span> skills are taught by every course here;{' '}
          <span className="chip chip-active">orange</span> ones only by that course.
        </p>
      )}
    </div>
  )
}
