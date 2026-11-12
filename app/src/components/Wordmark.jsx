import { Link } from 'react-router-dom'

/** "linkbery" wordmark with the small berry square. Links home. */
export default function Wordmark({ onClick }) {
  return (
    <Link to="/" className="wordmark" aria-label="Linkbery home" onClick={onClick}>
      <span className="wordmark-mark" aria-hidden="true" />
      <span className="wordmark-text">linkbery</span>
    </Link>
  )
}
