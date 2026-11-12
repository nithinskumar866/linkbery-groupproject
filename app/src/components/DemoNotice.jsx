import { Info } from './icons.js'

/** Amber-tint note: accounts are browser-only (no backend). Shown on auth and profile pages. */
export default function DemoNotice({ className = '' }) {
  return (
    <div className={`demo-notice ${className}`.trim()} role="note">
      <Info aria-hidden="true" />
      <p>
        <strong>Demo login.</strong> Your account and saved courses stay in this browser. There is no server, so
        don’t reuse a real password.
      </p>
    </div>
  )
}
