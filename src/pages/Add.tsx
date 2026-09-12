import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, useWords } from '../state/WordsContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Checkbox } from '../components/ui/Checkbox'
import { Input, TextArea } from '../components/ui/Input'
import { TypeChip } from '../components/ui/TypeChip'
import { TypeAttrsOptional, TypeAttrsRequired } from '../components/TypeAttrsFields'
import { ChevronDownIcon } from '../components/icons'
import { missingRequiredAttrs, WORD_TYPES, type WordType } from '../lib/wordTypes'
import type { Word } from '../api/types'

function FieldLabel({ children }: { children: string }) {
  return <span className="eyebrow text-[12px]">{children}</span>
}

export function Add() {
  const { addWord } = useWords()
  const navigate = useNavigate()
  const wordRef = useRef<HTMLInputElement>(null)

  const [word, setWord] = useState('')
  const [type, setType] = useState<WordType>('nomen')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [source, setSource] = useState('')
  const [isHard, setIsHard] = useState(false)
  const [attrs, setAttrs] = useState<Record<string, unknown>>({})
  const [regelmaessig, setRegelmaessig] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [duplicate, setDuplicate] = useState<Word | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function selectType(next: WordType) {
    setType(next)
    setAttrs({})
    setRegelmaessig(false)
    setDuplicate(null)
  }

  function setAttr(key: string, value: unknown) {
    setAttrs((prev) => ({ ...prev, [key]: value }))
  }

  function resetForm() {
    setWord('')
    setMeaning('')
    setExample('')
    setTagsText('')
    setSource('')
    setIsHard(false)
    setAttrs({})
    setRegelmaessig(false)
    setMoreOpen(false)
    setDuplicate(null)
    setSubmitError(null)
    wordRef.current?.focus()
  }

  const missing: string[] = []
  if (!word.trim()) missing.push('Wort')
  if (!meaning.trim()) missing.push('Bedeutung')
  missing.push(...missingRequiredAttrs(type, attrs).map((f) => f.label))

  async function handleSubmit() {
    if (missing.length > 0) return
    setSaving(true)
    setSubmitError(null)
    setDuplicate(null)
    try {
      await addWord({
        word: word.trim(),
        type,
        meaning: meaning.trim(),
        example: example.trim() || null,
        attrs,
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        source: source.trim() || null,
        is_hard: isHard,
      })
      resetForm()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const existing = (err.body as { detail?: { existing?: Word } })?.detail?.existing
        if (existing) setDuplicate(existing)
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="headline text-[32px]">Wort hinzufügen</h1>

      <Input
        ref={wordRef}
        id="add-word"
        label="Wort"
        autoFocus
        placeholder="z. B. üben, der Tisch, sich erinnern"
        value={word}
        onChange={(e) => setWord(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <FieldLabel>Wortart</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {WORD_TYPES.map((t) => (
            <TypeChip key={t} type={t} selected={type === t} showLabel size="md" onClick={() => selectType(t)} />
          ))}
        </div>
      </div>

      <Input id="add-meaning" label="Bedeutung" value={meaning} onChange={(e) => setMeaning(e.target.value)} />

      <TypeAttrsRequired
        type={type}
        word={word}
        attrs={attrs}
        setAttr={setAttr}
        regelmaessig={regelmaessig}
        setRegelmaessig={setRegelmaessig}
      />

      <button
        type="button"
        onClick={() => setMoreOpen((o) => !o)}
        className="tap-target flex items-center gap-2 self-start font-display text-[13px] font-extrabold uppercase tracking-[0.03em] text-ink-secondary"
      >
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
        mehr
      </button>

      {moreOpen && (
        <div className="flex flex-col gap-3">
          <TypeAttrsOptional type={type} attrs={attrs} setAttr={setAttr} />
          <TextArea id="add-example" label="Beispielsatz (optional)" rows={2} value={example} onChange={(e) => setExample(e.target.value)} />
          <Input id="add-tags" label="Tags (optional, mit Komma trennen)" value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
          <Input id="add-source" label="Quelle (optional)" value={source} onChange={(e) => setSource(e.target.value)} />
        </div>
      )}

      <Checkbox id="add-hard" label="schwer zu merken" checked={isHard} onChange={(e) => setIsHard(e.target.checked)} />

      {duplicate && (
        <Card className="border-highlight bg-highlight-soft">
          <p className="eyebrow mb-1">Gibt es schon</p>
          <p className="text-[15px] font-semibold text-ink">
            {duplicate.word} — {duplicate.meaning}
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/word/${duplicate.id}`)}>
              Öffnen
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDuplicate(null)}>
              Trotzdem speichern (Wort anpassen)
            </Button>
          </div>
        </Card>
      )}

      {submitError && <p className="text-[13px] font-semibold text-negative-text">{submitError}</p>}

      <div className="flex flex-col items-start gap-2">
        <Button size="lg" className="w-full" disabled={missing.length > 0 || saving} onClick={handleSubmit}>
          {saving ? 'Speichern…' : 'Speichern'}
        </Button>
        {missing.length > 0 && <p className="text-[12px] font-semibold text-ink-tertiary">{missing.join(', ')} fehlt</p>}
      </div>
    </div>
  )
}
