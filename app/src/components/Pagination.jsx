import { ChevronLeft, ChevronRight } from './icons.js'
import { pageItems } from './utils.js'

/** Numbered pagination: ← Previous, 1 2 … 7, Next →. Renders nothing for a single page. */
export default function Pagination({ page = 1, pageCount = 1, onChange, label = 'Pagination', className = '' }) {
  if (!pageCount || pageCount <= 1) return null
  const current = Math.min(Math.max(1, page), pageCount)
  const go = (p) => {
    if (p >= 1 && p <= pageCount && p !== current) onChange?.(p)
  }

  return (
    <nav className={`pagination ${className}`.trim()} aria-label={label}>
      <button
        type="button"
        className="pagination-btn pagination-step"
        onClick={() => go(current - 1)}
        disabled={current === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
        <span className="pagination-step-text">Previous</span>
      </button>
      <ul className="pagination-pages">
        {pageItems(current, pageCount).map((p) =>
          typeof p === 'number' ? (
            <li key={p}>
              <button
                type="button"
                className={`pagination-btn ${p === current ? 'is-current' : ''}`}
                aria-current={p === current ? 'page' : undefined}
                aria-label={`Page ${p}`}
                onClick={() => go(p)}
              >
                {p}
              </button>
            </li>
          ) : (
            <li key={p} className="pagination-gap" aria-hidden="true">
              …
            </li>
          ),
        )}
      </ul>
      <button
        type="button"
        className="pagination-btn pagination-step"
        onClick={() => go(current + 1)}
        disabled={current === pageCount}
        aria-label="Next page"
      >
        <span className="pagination-step-text">Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
