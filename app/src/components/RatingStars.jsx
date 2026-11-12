import { formatCount, formatRating } from './utils.js'

/**
 * Number-based rating: a small amber ★, the value in mono and the review count.
 * Shows a dash when there is no rating ("No ratings yet" with showEmpty).
 * The name is kept for compatibility; no star rows are drawn.
 */
export default function RatingStars({ rating, reviewCount, size = 'md', showEmpty = false }) {
  const value = formatRating(rating)
  if (value == null) {
    return (
      <span className={`rating rating-${size} rating-empty`} aria-label="No ratings yet">
        {showEmpty ? 'No ratings yet' : '—'}
      </span>
    )
  }
  const reviews = reviewCount != null && reviewCount > 0 ? formatCount(reviewCount) : null
  const label = `Rated ${value} out of 5${reviews ? `, ${reviews} reviews` : ''}`
  return (
    <span className={`rating rating-${size}`} role="img" aria-label={label}>
      <span className="rating-star" aria-hidden="true">
        ★
      </span>
      <span className="rating-value" aria-hidden="true">
        {value}
      </span>
      {reviews && (
        <span className="rating-count" aria-hidden="true">
          {reviews}
        </span>
      )}
    </span>
  )
}
