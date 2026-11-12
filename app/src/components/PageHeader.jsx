import PageBand from './PageBand.jsx'

/**
 * Page title block, kept for existing callers: renders a PageBand.
 * `breadcrumbs` ([{ label, to }]) -> crumbs, `subtitle` -> desc, `children`
 * are actions shown to the right of the title. `icon` is accepted and ignored.
 */
export default function PageHeader({ title, subtitle, breadcrumbs, children }) {
  return <PageBand crumbs={breadcrumbs} title={title} desc={subtitle} aside={children} />
}
