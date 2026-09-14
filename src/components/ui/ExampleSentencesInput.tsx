import type { ExampleSentence } from '../../api/types'
import { PlusIcon, XIcon } from '../icons'
import { Input } from './Input'

interface ExampleSentencesInputProps {
  label: string
  dePlaceholder: string
  meaningPlaceholder: string
  addLabel: string
  value: ExampleSentence[]
  onChange: (value: ExampleSentence[]) => void
}

/** One "+" adds a row; each row is a German sentence next to its meaning; another "+" sits below to add more. */
export function ExampleSentencesInput({ label, dePlaceholder, meaningPlaceholder, addLabel, value, onChange }: ExampleSentencesInputProps) {
  function update(i: number, key: keyof ExampleSentence, text: string) {
    onChange(value.map((ex, idx) => (idx === i ? { ...ex, [key]: text } : ex)))
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="eyebrow text-[12px]">{label}</span>
      {value.map((ex, i) => (
        <div key={i} className="flex items-start gap-2">
          <Input aria-label={dePlaceholder} placeholder={dePlaceholder} value={ex.de} onChange={(e) => update(i, 'de', e.target.value)} className="flex-1" />
          <Input
            aria-label={meaningPlaceholder}
            placeholder={meaningPlaceholder}
            value={ex.meaning}
            onChange={(e) => update(i, 'meaning', e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            aria-label="remove"
            onClick={() => remove(i)}
            className="tap-target flex shrink-0 items-center justify-center text-ink-tertiary"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { de: '', meaning: '' }])}
        className="tap-target flex w-fit items-center gap-1.5 self-start font-display text-[13px] font-extrabold uppercase tracking-[0.03em] text-ink-secondary"
      >
        <PlusIcon className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  )
}
