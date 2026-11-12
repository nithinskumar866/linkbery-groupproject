// Small text helpers shared by the pages.

/** "Provider · Platform", or the platform once when they are the same. */
export function byline(course) {
  if (!course) return ''
  const { provider, platform } = course
  if (provider && platform && provider.trim().toLowerCase() === platform.trim().toLowerCase()) return platform
  return [provider, platform].filter(Boolean).join(' · ')
}

/** "Beginner · 5 courses" */
export function pathMeta(path) {
  const n = path?.steps?.length || 0
  return [path?.level, `${n} ${n === 1 ? 'course' : 'courses'}`].filter(Boolean).join(' · ')
}
