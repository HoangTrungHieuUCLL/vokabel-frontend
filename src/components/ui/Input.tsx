import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  ref?: Ref<HTMLInputElement>
}

export function Input({ label, id, error, className = '', ref, ...rest }: InputProps) {
  const inputEl = (
    <input
      ref={ref}
      id={id}
      className={`h-12 w-full rounded-[var(--radius-control)] border-2 bg-surface px-3.5 text-[16px] text-ink placeholder:text-ink-placeholder focus:outline-none focus:ring-4 focus:ring-accent-soft focus:border-accent ${error ? 'border-negative' : 'border-ink'} ${className}`}
      {...rest}
    />
  )

  if (!label) return inputEl

  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="eyebrow text-[12px]">{label}</span>
      {inputEl}
      {error && <span className="text-[12px] font-semibold text-negative-text">{error}</span>}
    </label>
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function TextArea({ label, id, className = '', ...rest }: TextAreaProps) {
  const el = (
    <textarea
      id={id}
      className={`w-full rounded-[var(--radius-control)] border-2 border-ink bg-surface px-3.5 py-3 text-[16px] text-ink placeholder:text-ink-placeholder focus:outline-none focus:ring-4 focus:ring-accent-soft focus:border-accent ${className}`}
      {...rest}
    />
  )
  if (!label) return el
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="eyebrow text-[12px]">{label}</span>
      {el}
    </label>
  )
}
