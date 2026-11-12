// Light/dark theme, persisted in localStorage under "linkbery.theme".
// Light is the default; dark only when the user picked it. index.html applies
// the saved value before first paint.
export const THEME_KEY = 'linkbery.theme'

export function getInitialTheme() {
  const current = document.documentElement.dataset.theme
  if (current === 'dark' || current === 'light') return current
  try {
    if (localStorage.getItem(THEME_KEY) === 'dark') return 'dark'
  } catch {
    // storage unavailable
  }
  return 'light'
}

export function applyTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem(THEME_KEY, next)
  } catch {
    // storage unavailable: theme still applies for this session
  }
}
