import { formatCount, formatRating } from './utils.js'

/**
 * Rating line: "★ 4.8 (140K)" with the star in --star, or "No rating yet".
 * `long` adds the word "reviews". `size` ("sm" | "md" | "lg") only changes the font size.
 * `showEmpty` is accepted for compatibility (the empty text is always shown).
 */
export default function RatingStars({ rating, reviewCount, size = 'md', long = false, className = '' }) {
  const value = formatRating(rating)
  const cls = `rating rating-${size} ${className}`.trim()
  if (value == null) {
    return <span className={`${cls} rating-empty`}>No rating yet</span>
  }
  const reviews = reviewCount != null && reviewCount > 0 ? formatCount(reviewCount) : null
  const label = `Rated ${value} out of 5${reviews ? `, ${reviews} reviews` : ''}`
  return (
    <span className={cls} role="img" aria-label={label}>
      <span className="rating-star" aria-hidden="true">
        ★
      </span>
      <strong className="rating-value" aria-hidden="true">
        {value}
      </strong>
      {reviews && (
        <span className="rating-count" aria-hidden="true">
          ({reviews}
          {long ? ' reviews' : ''})
        </span>
      )}
    </span>
  )
}
