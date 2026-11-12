// UI labels/icons for the lib's progress STATUSES (CONTRACT §12). null = not started.
export const STATUS_META = {
  planning: { label: 'Planning', icon: 'fa-regular fa-calendar' },
  'in-progress': { label: 'In progress', icon: 'fa-solid fa-person-running' },
  completed: { label: 'Completed', icon: 'fa-solid fa-circle-check' },
}
export const NOT_STARTED = { label: 'Not started', icon: 'fa-regular fa-circle' }

export const statusLabel = (s) => (s ? STATUS_META[s]?.label || s : NOT_STARTED.label)
