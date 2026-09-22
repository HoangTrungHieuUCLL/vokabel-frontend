import { useState } from 'react'
import { usePresence } from '../../lib/usePresence'
import { Button } from './Button'

const EXIT_MS = 160

export function Toast({
  message,
  actionLabel,
  onAction,
  open = true,
}: {
  message: string
  actionLabel?: string
  onAction?: () => void
  /** Drive this instead of unmounting, so the toast can slide back out. */
  open?: boolean
}) {
  const { mounted, leaving } = usePresence(open, EXIT_MS)

  // The word being undone is cleared the moment the toast closes, so hold on
  // to the last message to render during the exit rather than flashing empty.
  // Adjusting state during render (rather than in an effect) is the supported
  // pattern for this and avoids an extra render pass.
  const [shown, setShown] = useState(message)
  if (open && message !== shown) setShown(message)

  if (!mounted) return null

  return (
    <div className={`${leaving ? 'animate-toast-out' : 'animate-toast-in'} fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-[var(--radius-control)] border-2 border-ink bg-ink px-4 py-3 shadow-[var(--shadow-pop)] md:bottom-8`}>
      <span className="text-[14px] font-semibold text-white">{shown}</span>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
