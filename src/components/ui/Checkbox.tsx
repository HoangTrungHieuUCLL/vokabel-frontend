import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Checkbox({ label, id, className = '', ...rest }: CheckboxProps) {
  return (
    <label htmlFor={id} className={`tap-target inline-flex items-center gap-2 text-[14px] font-semibold text-ink ${className}`}>
      <input id={id} type="checkbox" className="h-5 w-5 rounded border-2 border-ink" {...rest} />
      {label}
    </label>
  )
}
