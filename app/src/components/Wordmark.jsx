import { Link } from 'react-router-dom'

/** The berry mark on its own: rounded square with two circles. */
export function LogoMark({ size = 28 }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <rect width="28" height="28" rx="7" fill="var(--brand)" />
      <circle cx="11" cy="16" r="5" fill="var(--on-brand)" />
      <circle cx="18" cy="13" r="4" fill="var(--on-brand)" opacity="0.75" />
    </svg>
  )
}

/** "Linkbery" logo (mark + name). Links home. */
export default function Wordmark({ onClick, className = '' }) {
  return (
    <Link to="/" className={`logo ${className}`.trim()} aria-label="Linkbery home" onClick={onClick}>
      <LogoMark />
      <span className="logo-text">Linkbery</span>
    </Link>
  )
}
