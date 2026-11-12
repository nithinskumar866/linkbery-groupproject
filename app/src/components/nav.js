// Navigation shared by the header, the mobile sheet and the footer.
import { getCategories, getFacetCounts } from '../lib/courses.js'

/** Header links (Compare gets its count added by the header). */
export const PRIMARY_NAV = [
  { to: '/paths', label: 'Learning paths', match: ['/paths'] },
  { to: '/compare', label: 'Compare', match: ['/compare'] },
  { to: '/insights', label: 'Insights', match: ['/insights'] },
]

/** Full list for the mobile sheet. */
export const SHEET_NAV = [
  { to: '/', label: 'Home', match: [], exact: true },
  { to: '/courses', label: 'All courses', match: ['/courses', '/search'] },
  { to: '/paths', label: 'Learning paths', match: ['/paths'] },
  { to: '/compare', label: 'Compare', match: ['/compare'] },
  { to: '/recommend', label: 'Recommendations', match: ['/recommend'] },
  { to: '/insights', label: 'Platform insights', match: ['/insights'] },
  { to: '/about', label: 'About', match: ['/about'] },
  { to: '/contact', label: 'Contact', match: ['/contact'] },
]

export function isNavActive(item, pathname) {
  if (item.exact) return pathname === item.to
  return item.match.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/** "Ctrl" or "⌘" depending on the platform. */
export function modKeyLabel() {
  if (typeof navigator === 'undefined') return 'Ctrl'
  const p = navigator.userAgentData?.platform || navigator.platform || ''
  return /mac|iphone|ipad/i.test(p) ? '⌘' : 'Ctrl'
}

let categoryCache = null

/**
 * Categories split into the two groups with their course counts:
 * { technical: [{ slug, name, count }], nonTechnical: [...] }. Computed once.
 */
export function categoryGroups() {
  if (categoryCache) return categoryCache
  const counts = getFacetCounts({}).categories || {}
  const all = getCategories().map((c) => ({ slug: c.slug, name: c.name, group: c.group, count: counts[c.slug] ?? 0 }))
  categoryCache = {
    technical: all.filter((c) => c.group === 'technical'),
    nonTechnical: all.filter((c) => c.group !== 'technical'),
  }
  return categoryCache
}
