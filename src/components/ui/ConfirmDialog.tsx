import { useEffect } from 'react'
import { usePresence } from '../../lib/usePresence'
import { Button } from './Button'

const EXIT_MS = 140

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Ja',
  cancelLabel = 'Nein',
  onConfirm,
  onCancel,
  pending = false,
  danger = false,
  open = true,
}: {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  pending?: boolean
  danger?: boolean
  /** Drive this instead of unmounting the dialog, so it can animate out. */
  open?: boolean
}) {
  const { mounted, leaving } = usePresence(open, EXIT_MS)

  useEffect(() => {
    if (!mounted) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mounted, onCancel])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 ${
        leaving ? 'animate-overlay-out' : 'animate-overlay-in'
      }`}
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className={`w-full max-w-xs rounded-[var(--radius-card)] border-2 border-ink bg-surface p-5 shadow-[var(--shadow-lg)] ${
          leaving ? 'animate-dialog-out' : 'animate-dialog-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="headline text-[24px]">{title}</p>
        {message && <p className="mt-2 text-[14px] text-ink-secondary">{message}</p>}
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" size="md" className="flex-1" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} size="md" className="flex-1" onClick={onConfirm} disabled={pending}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
