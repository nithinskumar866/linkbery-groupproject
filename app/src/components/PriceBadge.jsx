const CLASS = {
  Free: 'badge badge-green price-free',
  'Free to audit': 'badge badge-blue price-audit',
}

/** Price label: Free = green tint, Free to audit = blue tint, Paid = plain bold text. */
export default function PriceBadge({ price, className = '' }) {
  if (!price) return <span className={`price price-unknown ${className}`.trim()}>Price not listed</span>
  const cls = CLASS[price] || 'price price-paid'
  return <span className={`${cls} ${className}`.trim()}>{price}</span>
}
