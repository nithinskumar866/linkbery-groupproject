import { CircleAlert, CircleCheck, Info, X } from './icons.js'
import { dismissToast, useToasts } from './toast.js'

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info }

/** Toast stack: white cards with a coloured icon on the left. */
export default function Toaster() {
  const toasts = useToasts()
  return (
    <div className="toaster" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || ICONS.info
        return (
          <div key={t.id} className={`toast toast-${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
            <Icon className="toast-icon" aria-hidden="true" />
            <span className="toast-text">{t.text}</span>
            <button type="button" className="toast-close" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
