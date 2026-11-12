import { formatCount, formatRating } from './utils.js'

/** Five stars with half-star precision, the numeric rating and (optionally) the review count. */
export default function RatingStars({ rating, reviewCount, size = 'md', showEmpty = false }) {
  const value = formatRating(rating)
  if (value == null) {
    return showEmpty ? <span className="rating rating-empty muted">No ratings yet</span> : null
  }
  const r = Math.max(0, Math.min(5, Number(rating)))
  const stars = []
  for (let i = 1; i <= 5; i++) {
    let cls = 'fa-regular fa-star'
    if (r >= i - 0.25) cls = 'fa-solid fa-star'
    else if (r >= i - 0.75) cls = 'fa-solid fa-star-half-stroke'
    stars.push(<i key={i} className={cls} aria-hidden="true" />)
  }
  const reviews = reviewCount != null && reviewCount > 0 ? formatCount(reviewCount) : null
  const label = `Rated ${value} out of 5${reviews ? `, ${reviews} reviews` : ''}`
  return (
    <span className={`rating rating-${size}`} role="img" aria-label={label}>
      <span className="rating-value" aria-hidden="true">{value}</span>
      <span className="rating-stars" aria-hidden="true">{stars}</span>
      {reviews && <span className="rating-count" aria-hidden="true">({reviews})</span>}
    </span>
  )
}
