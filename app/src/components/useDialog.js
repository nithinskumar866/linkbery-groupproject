// Shared behaviour for modal layers (palette, mobile sheets): Escape closes,
// Tab stays inside, body scroll is locked and focus returns on close.
import { useEffect } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useDialog(ref, open, onClose, { initialFocus } = {}) {
  useEffect(() => {
    if (!open) return undefined
    const node = ref.current
    const previous = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = () => [...(node?.querySelectorAll(FOCUSABLE) || [])].filter((el) => el.offsetParent !== null)
    const first = initialFocus?.current || focusables()[0]
    first?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = focusables()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === firstEl || !node.contains(document.activeElement))) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && (document.activeElement === lastEl || !node.contains(document.activeElement))) {
        e.preventDefault()
        firstEl.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      if (previous && typeof previous.focus === 'function' && document.contains(previous)) previous.focus()
    }
    // onClose and initialFocus are read when the layer opens; re-running on
    // every render would steal focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
}
