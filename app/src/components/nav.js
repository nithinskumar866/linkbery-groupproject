// Primary navigation shared by the top bar, the mobile sheet and the palette.
export const PRIMARY_NAV = [
  { to: '/courses', label: 'Courses', match: ['/courses', '/category', '/search'] },
  { to: '/paths', label: 'Paths', match: ['/paths'] },
  { to: '/recommend', label: 'Recommend', match: ['/recommend'] },
  { to: '/insights', label: 'Insights', match: ['/insights'] },
]

export function isNavActive(item, pathname) {
  return item.match.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/** "Ctrl K" or "⌘K" depending on the platform. */
export function modKeyLabel() {
  if (typeof navigator === 'undefined') return 'Ctrl'
  const p = navigator.userAgentData?.platform || navigator.platform || ''
  return /mac|iphone|ipad/i.test(p) ? '⌘' : 'Ctrl'
}
