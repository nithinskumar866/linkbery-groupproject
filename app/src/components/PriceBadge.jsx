const CLASS = {
  Free: 'badge-free',
  'Free to audit': 'badge-audit',
  Paid: 'badge-paid',
}

export default function PriceBadge({ price }) {
  if (!price) return <span className="badge badge-unknown">Price n/a</span>
  return <span className={`badge ${CLASS[price] || 'badge-paid'}`}>{price}</span>
}
