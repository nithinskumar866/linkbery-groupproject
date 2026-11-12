// UI labels/icons for the lib's progress STATUSES (CONTRACT §12). null = not started.
import { CalendarClock, CircleCheck, CircleDashed, CirclePlay } from './icons.js'

export const STATUS_META = {
  planning: { label: 'Planning', icon: CalendarClock, tone: 'blue' },
  'in-progress': { label: 'In progress', icon: CirclePlay, tone: 'amber' },
  completed: { label: 'Completed', icon: CircleCheck, tone: 'green' },
}
export const NOT_STARTED = { label: 'Not started', icon: CircleDashed, tone: 'none' }

export const statusLabel = (s) => (s ? STATUS_META[s]?.label || s : NOT_STARTED.label)
