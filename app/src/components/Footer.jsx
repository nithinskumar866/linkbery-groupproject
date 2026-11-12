import { Link } from 'react-router-dom'
import { LogoMark } from './Wordmark.jsx'

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { to: '/courses', label: 'All courses' },
      { to: '/paths', label: 'Learning paths' },
      { to: '/compare', label: 'Compare' },
      { to: '/recommend', label: 'Recommendations' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { to: '/category/data-science', label: 'Data science' },
      { to: '/category/development', label: 'Development' },
      { to: '/category/ai-ml', label: 'AI and machine learning' },
      { to: '/category/design', label: 'Design' },
    ],
  },
  {
    title: 'Linkbery',
    links: [
      { to: '/about', label: 'About' },
      { to: '/insights', label: 'Platform insights' },
      { to: '/contact', label: 'Contact' },
    ],
  },
]

/** Navy site footer: brand blurb, three link columns and the bottom line. */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo" aria-label="Linkbery home">
              <LogoMark size={26} />
              <span>Linkbery</span>
            </Link>
            <p>Compare online courses from every major platform, then enrol with the provider.</p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} className="footer-col" aria-label={col.title}>
              <p className="footer-col-title">{col.title}</p>
              <ul>
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2026 Linkbery</span>
          <span>Course details come from each provider and may change.</span>
        </div>
      </div>
    </footer>
  )
}
