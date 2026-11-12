// Tiny UI-only toast store (no data here). <Toaster /> in Layout renders it.
import { useSyncExternalStore } from 'react'

let toasts = []
let nextId = 1
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

/** showToast("Saved", { type: "success" | "error" | "info", timeout: ms }) */
export function showToast(text, { type = 'info', timeout = 4500 } = {}) {
  // Same message already showing: don't stack duplicates.
  if (toasts.some((t) => t.text === text)) return
  const id = nextId++
  toasts = [...toasts, { id, text, type }].slice(-3)
  emit()
  if (timeout) setTimeout(() => dismissToast(id), timeout)
}

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const getSnapshot = () => toasts

export function useToasts() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
