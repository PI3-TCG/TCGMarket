import { useEffect, useRef, type RefObject } from 'react'

export function useDismiss(
  enabled: boolean,
  onDismiss: () => void,
  ref: RefObject<HTMLElement | null>,
) {
  const onDismissRef = useRef(onDismiss)

  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    if (!enabled) return

    function onPointer(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        onDismissRef.current()
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onDismissRef.current()
    }

    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [enabled, ref])
}
