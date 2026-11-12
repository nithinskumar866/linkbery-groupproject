import { useCallback, useSyncExternalStore } from 'react'
import * as p from '../lib/progress.js'

// progress is a stable object reference between changes and switches with the
// logged-in user (see lib/progress.js). setStatus throws for guests.
export function useProgress() {
  const progress = useSyncExternalStore(p.subscribeProgress, p.getProgress, p.getProgress)
  const getStatus = useCallback((id) => progress[id]?.status ?? null, [progress])
  return { progress, getStatus, setStatus: p.setStatus }
}
