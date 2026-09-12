interface ChoiceButtonsProps<T extends string> {
  options: T[]
  value: T | undefined
  onChange: (value: T) => void
  labels?: Partial<Record<T, string>>
}

export function ChoiceButtons<T extends string>({ options, value, onChange, labels }: ChoiceButtonsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`tap-target press rounded-[var(--radius-control)] border-2 border-ink px-4 font-display text-[13px] font-extrabold uppercase tracking-[0.03em] ${
              selected ? 'bg-accent text-white shadow-[var(--shadow-pop)]' : 'bg-surface text-ink'
            }`}
          >
            {labels?.[opt] ?? opt}
          </button>
        )
      })}
    </div>
  )
}
