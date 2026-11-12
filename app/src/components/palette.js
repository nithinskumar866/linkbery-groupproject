// Tiny UI store for the command palette. <CommandPalette /> (mounted once in
// Layout) renders it; anything can open it with openPalette().
import { useSyncExternalStore } from 'react'

let state = { open: false, query: '' }
const listeners = new Set()

function set(next) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

/** Open the palette, optionally pre-filled with a query. */
export function openPalette(query = '') {
  set({ open: true, query: typeof query === 'string' ? query : '' })
}

export function closePalette() {
  if (state.open) set({ open: false })
}

export function togglePalette() {
  if (state.open) closePalette()
  else openPalette()
}

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const getSnapshot = () => state
const getServerSnapshot = () => state

/** { open, query } */
export function usePalette() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** true while the palette is open */
export function usePaletteOpen() {
  return usePalette().open
}
