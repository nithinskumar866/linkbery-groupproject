import { Link } from 'react-router-dom'

/**
 * Inner-page header band (--bg-soft, full width): breadcrumb, 36px title and a
 * one-line description. `crumbs` is [{ label, to? }], rendered as given (callers
 * pass "Home" first). The last crumb is the current page.
 * `children` render under the description (search fields, actions, stats).
 * `aside` renders on the right of the title on wide screens.
 */
export default function PageBand({ crumbs, title, desc, children, aside, className = '', titleId }) {
  const trail = crumbs?.length ? crumbs : null

  return (
    <section className={`page-band ${className}`.trim()}>
      <div className="container page-band-inner">
        {trail && (
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              {trail.map((c, i) => {
                const last = i === trail.length - 1
                return (
                  <li key={`${c.label}-${i}`}>
                    {c.to && !last ? <Link to={c.to}>{c.label}</Link> : <span aria-current={last ? 'page' : undefined}>{c.label}</span>}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}
        <div className="page-band-row">
          <div className="page-band-text">
            <h1 className="page-band-title" id={titleId}>
              {title}
            </h1>
            {desc && <p className="page-band-desc">{desc}</p>}
          </div>
          {aside && <div className="page-band-aside">{aside}</div>}
        </div>
        {children && <div className="page-band-body">{children}</div>}
      </div>
    </section>
  )
}
