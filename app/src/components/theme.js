// Light/dark theme, persisted in localStorage under "linkbery.theme".
// index.html applies the saved value before first paint.
export const THEME_KEY = 'linkbery.theme'

export function getInitialTheme() {
  const current = document.documentElement.dataset.theme
  if (current === 'dark' || current === 'light') return current
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    // storage unavailable
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // storage unavailable: theme still applies for this session
  }
}
