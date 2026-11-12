import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Check, GitCompareArrows, Link2, Share2, X } from 'lucide-react'
import { getCompareSummary } from '../lib/courses.js'
import { useCompare } from '../hooks/useCompare.js'
import PlatformLogo from '../components/PlatformLogo.jsx'
import PriceBadge from '../components/PriceBadge.jsx'
import { showToast } from '../components/toast.js'
import { formatNumber, formatRating, usePageTitle } from '../components/utils.js'
import { Empty, Note, PageHead } from './parts.jsx'
import { ICON } from './iconProps.js'

const parseIds = (raw) => [...new Set((raw || '').split(',').map((s) => s.trim()).filter(Boolean))]

function Best({ show, children }) {
  if (!show) return children
  return (
    <span className="pg-best">
      {children}
      <span className="badge badge-accent">Best</span>
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
  const sameAsStored =
    shared && courses.length === compareIds.length && courses.every((c) => compareIds.includes(c.id))

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
    <PageHead
      title="Compare"
      desc={`Up to ${max} courses side by side.`}
      crumbs={[{ label: 'Courses', to: '/courses' }, { label: 'Compare' }]}
    >
      {!shared && courses.length > 0 && (
        <>
          <button type="button" className="btn btn-sm" onClick={copyLink}>
            {copied ? <Check {...ICON} /> : <Link2 {...ICON} />}
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearCompare}>
            Clear
          </button>
        </>
      )}
    </PageHead>
  )

  if (courses.length === 0) {
    return (
      <div className="pg-compare">
        {header}
        <Empty
          icon={GitCompareArrows}
          title={shared ? 'None of these courses were found' : 'Nothing to compare yet'}
          hint={`Use Compare on any course to add it here. You can compare up to ${max}.`}
        >
          <Link className="btn btn-primary" to="/courses">
            Browse courses
          </Link>
        </Empty>
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
              <span className="pg-star" aria-hidden="true">
                ★
              </span>{' '}
              {formatRating(c.rating)}
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
    <div className="pg-compare">
      {header}

      {shared && (
        <div className="pg-note pg-note-info pg-compare-shared">
          <Share2 {...ICON} />
          <span>
            Shared comparison.
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
        <Note type="warn">
          Add at least one more course to compare. <Link to="/courses">Browse courses</Link>
        </Note>
      )}

      {courses.length > 1 && (
        <section className="pg-compare-common" aria-labelledby="h-common">
          <h2 id="h-common" className="section-label">
            Skills in common <span className="pg-count">· {sharedSkills.length}</span>
          </h2>
          {sharedSkills.length > 0 ? (
            <ul className="pg-tags">
              {sharedSkills.map((s) => (
                <li key={s}>
                  <span className="tag tag-green">{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="pg-dim">None. These courses teach different things.</p>
          )}
        </section>
      )}

      <div className="pg-compare-scroll" role="region" aria-label="Comparison table" tabIndex={0}>
        <table className="pg-compare-table">
          <thead>
            <tr>
              <th scope="col" className="pg-compare-attr">
                <span className="visually-hidden">Attribute</span>
              </th>
              {courses.map((c) => (
                <th key={c.id} scope="col" className="pg-compare-course">
                  <div className="pg-compare-course-top">
                    <PlatformLogo name={c.platform} size={20} decorative />
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => remove(c.id)}
                      aria-label={`Remove ${c.title} from comparison`}
                      title="Remove"
                    >
                      <X {...ICON} />
                    </button>
                  </div>
                  <Link to={`/courses/${encodeURIComponent(c.id)}`} className="pg-compare-title">
                    {c.title}
                  </Link>
                  {c.url && (
                    <a className="pg-compare-go" href={c.url} target="_blank" rel="noopener noreferrer">
                      Go to course <ArrowUpRight {...ICON} size={14} />
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
                <th scope="row" className="pg-compare-attr">
                  {label}
                </th>
                {courses.map((c) => {
                  const v = get(c)
                  return <td key={c.id}>{v ?? <span className="pg-dim">-</span>}</td>
                })}
              </tr>
            ))}
            <tr>
              <th scope="row" className="pg-compare-attr">
                Skills
              </th>
              {courses.map((c) => (
                <td key={c.id}>
                  {c.skills?.length ? (
                    <ul className="pg-tags">
                      {c.skills.map((s) => (
                        <li key={s}>
                          {sharedSet.has(s) ? (
                            <span className="tag tag-green" title="Every course here teaches this">
                              {s}
                            </span>
                          ) : (
                            <span className="tag">{s}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="pg-dim">-</span>
                  )}
                </td>
              ))}
            </tr>
            {courses.length > 2 && (
              <tr>
                <th scope="row" className="pg-compare-attr">
                  Only here
                </th>
                {courses.map((c) => {
                  const only = uniqueSkills[c.id] || []
                  return (
                    <td key={c.id}>
                      {only.length ? (
                        <span className="pg-compare-only">{only.join(', ')}</span>
                      ) : (
                        <span className="pg-dim">None</span>
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
        <p className="field-hint pg-compare-legend">
          <span className="tag tag-green">Green</span> skills are taught by every course in the table.{' '}
          <span className="badge badge-accent">Best</span> marks the highest rating and review count.
        </p>
      )}
    </div>
  )
}
