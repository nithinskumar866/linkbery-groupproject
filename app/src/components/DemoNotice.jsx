/** Explains that accounts are browser-only (no backend). Shown on auth/profile pages. */
export default function DemoNotice() {
  return (
    <p className="demo-notice" role="note">
      <span className="badge badge-amber">Demo login</span>
      <span>
        Data stays in this browser. There is no server, so don’t reuse a real password.
      </span>
    </p>
  )
}
