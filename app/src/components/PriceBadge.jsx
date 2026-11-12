const CLASS = {
  Free: 'badge-green badge-free',
  'Free to audit': 'badge-blue badge-audit',
  Paid: 'badge-paid',
}

/** Price as a .badge: Free green, Free to audit blue, Paid neutral. */
export default function PriceBadge({ price }) {
  if (!price) return <span className="badge badge-unknown">Price n/a</span>
  return <span className={`badge ${CLASS[price] || 'badge-paid'}`}>{price}</span>
}
