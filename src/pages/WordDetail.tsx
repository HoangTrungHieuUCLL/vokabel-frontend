import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError, useWords } from '../state/WordsContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Input, TextArea } from '../components/ui/Input'
import { TypeChip } from '../components/ui/TypeChip'
import { TypeAttrsOptional, TypeAttrsRequired } from '../components/TypeAttrsFields'
import { ArrowLeftIcon, FlagIcon, TrashIcon } from '../components/icons'
import { TYPE_ATTR_SPEC, missingRequiredAttrs } from '../lib/wordTypes'
import { formatSince } from '../lib/relativeTime'

export function WordDetail() {
  const { id } = useParams<{ id: string }>()
  const wordId = Number(id)
  const navigate = useNavigate()
  const { getWord, patchWord, scheduleDelete, toggleHard, loading } = useWords()
  const word = getWord(wordId)

  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [editWord, setEditWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [source, setSource] = useState('')
  const [attrs, setAttrs] = useState<Record<string, unknown>>({})
  const [regelmaessig, setRegelmaessig] = useState(false)

  useEffect(() => {
    if (!word) return
    setEditWord(word.word)
    setMeaning(word.meaning)
    setExample(word.example ?? '')
    setTagsText(word.tags.join(', '))
    setSource(word.source ?? '')
    setAttrs(word.attrs)
  }, [word])

  if (!word) {
    return (
      <div className="flex flex-col gap-4">
        <Link to="/" className="tap-target inline-flex w-fit items-center gap-2 text-ink-secondary">
          <ArrowLeftIcon className="h-5 w-5" /> Zurück
        </Link>
        <p className="text-[14px] text-ink-tertiary">{loading ? 'Lädt…' : 'Wort nicht gefunden.'}</p>
      </div>
    )
  }

  function setAttr(key: string, value: unknown) {
    setAttrs((prev) => ({ ...prev, [key]: value }))
  }

  const missing: string[] = []
  if (!editWord.trim()) missing.push('Wort')
  if (!meaning.trim()) missing.push('Bedeutung')
  missing.push(...missingRequiredAttrs(word.type, attrs).map((f) => f.label))

  async function handleSave() {
    if (missing.length > 0 || !word) return
    setSaving(true)
    setSaveError(null)
    try {
      await patchWord(word.id, {
        word: editWord.trim(),
        meaning: meaning.trim(),
        example: example.trim() || null,
        attrs,
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        source: source.trim() || null,
      })
      setEditing(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSaveError('Ein Wort mit diesem Text und Typ existiert schon.')
      } else {
        setSaveError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen')
      }
    } finally {
      setSaving(false)
    }
  }

  function handleDelete() {
    setConfirmingDelete(false)
    scheduleDelete(word!.id)
    navigate('/')
  }

  const attrSpec = TYPE_ATTR_SPEC[word.type]
  const allAttrFields = [...attrSpec.required, ...attrSpec.optional]

  return (
    <div className="flex flex-col gap-5">
      <Link to="/" className="tap-target inline-flex w-fit items-center gap-2 text-ink-secondary">
        <ArrowLeftIcon className="h-5 w-5" /> Zurück
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <TypeChip type={word.type} size="md" showLabel />
        <h1 className="headline min-w-0 break-words text-[28px]">{word.word}</h1>
      </div>

      <button
        type="button"
        onClick={() => toggleHard(word.id)}
        aria-pressed={word.is_hard}
        className="tap-target press flex w-fit items-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border-2 border-ink px-3 font-display text-[12px] font-extrabold uppercase tracking-[0.03em]"
        style={{
          background: word.is_hard ? 'var(--color-negative)' : 'var(--color-surface)',
          color: word.is_hard ? '#fff' : 'var(--color-ink)',
        }}
      >
        <FlagIcon className="h-4 w-4 shrink-0" fill={word.is_hard ? 'currentColor' : 'none'} />
        schwer zu merken
      </button>
      {word.is_hard && word.hard_since && (
        <p className="text-[12px] font-semibold text-ink-tertiary">{formatSince(word.hard_since)} als schwer markiert</p>
      )}

      {!editing ? (
        <Card className="flex flex-col gap-3">
          <div>
            <p className="eyebrow text-[11px] text-ink-tertiary">Bedeutung</p>
            <p className="text-[16px] text-ink">{word.meaning}</p>
          </div>
          {word.example && (
            <div>
              <p className="eyebrow text-[11px] text-ink-tertiary">Beispiel</p>
              <p className="text-[15px] italic text-ink-secondary">{word.example}</p>
            </div>
          )}
          {allAttrFields.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {allAttrFields.map((field) => {
                const value = word.attrs[field.key]
                if (value === undefined || value === null || value === '') return null
                return (
                  <div key={field.key}>
                    <p className="eyebrow text-[11px] text-ink-tertiary">{field.label}</p>
                    <p className="text-[14px] text-ink">{typeof value === 'boolean' ? (value ? 'ja' : 'nein') : String(value)}</p>
                  </div>
                )
              })}
            </div>
          )}
          {word.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {word.tags.map((tag) => (
                <span key={tag} className="rounded-full border-2 border-ink bg-surface-alt px-2 py-0.5 text-[11px] font-bold uppercase text-ink-secondary">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {word.source && <p className="text-[12px] text-ink-tertiary">Quelle: {word.source}</p>}
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <Input
            id="detail-word"
            label="Wort"
            autoCapitalize={word.type === 'nomen' ? 'words' : 'none'}
            value={editWord}
            onChange={(e) => setEditWord(e.target.value)}
          />
          <Input id="detail-meaning" label="Bedeutung" value={meaning} onChange={(e) => setMeaning(e.target.value)} />
          <TypeAttrsRequired
            type={word.type}
            word={editWord}
            attrs={attrs}
            setAttr={setAttr}
            regelmaessig={regelmaessig}
            setRegelmaessig={setRegelmaessig}
          />
          <TypeAttrsOptional type={word.type} attrs={attrs} setAttr={setAttr} />
          <TextArea id="detail-example" label="Beispielsatz" rows={2} value={example} onChange={(e) => setExample(e.target.value)} />
          <Input id="detail-tags" label="Tags (mit Komma trennen)" value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
          <Input id="detail-source" label="Quelle" value={source} onChange={(e) => setSource(e.target.value)} />
          {saveError && <p className="text-[13px] font-semibold text-negative-text">{saveError}</p>}
          {missing.length > 0 && <p className="text-[12px] font-semibold text-ink-tertiary">{missing.join(', ')} fehlt</p>}
        </div>
      )}

      <div className="flex gap-2">
        {editing ? (
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setEditing(false)} disabled={saving}>
              Abbrechen
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || missing.length > 0}>
              {saving ? 'Speichern…' : 'Speichern'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setEditing(true)}>
              Bearbeiten
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => setConfirmingDelete(true)}>
              <TrashIcon className="h-4 w-4" /> Löschen
            </Button>
          </>
        )}
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="Wort löschen?"
          message={`„${word.word}" wird gelöscht. Das lässt sich kurz danach noch rückgängig machen.`}
          confirmLabel="Löschen"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  )
}
