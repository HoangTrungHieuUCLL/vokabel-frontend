import { Button } from './Button'

export function Toast({
  message,
  actionLabel,
  onAction,
}: {
  message: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="animate-toast-in fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-[var(--radius-control)] border-2 border-ink bg-ink px-4 py-3 shadow-[var(--shadow-pop)] md:bottom-8">
      <span className="text-[14px] font-semibold text-white">{message}</span>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
