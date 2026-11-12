/** Explains that accounts are browser-only (no backend). Shown on auth/profile pages. */
export default function DemoNotice() {
  return (
    <div className="alert alert-info demo-notice" role="note">
      <i className="fa-solid fa-circle-info" aria-hidden="true" />
      <div>
        <strong>Demo login:</strong> data stays in this browser. Linkbery has no server, so your account, password
        and saved courses are stored only on this device. Don’t reuse a real password.
      </div>
    </div>
  )
}
