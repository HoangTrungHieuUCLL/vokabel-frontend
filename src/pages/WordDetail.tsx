import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError, useWords } from '../state/WordsContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Input, TextArea } from '../components/ui/Input'
import { TagsInput } from '../components/ui/TagsInput'
import { TypeChip } from '../components/ui/TypeChip'
import { TypeAttrsOptional, TypeAttrsRequired } from '../components/TypeAttrsFields'
import { ArrowLeftIcon, FlagIcon, TrashIcon } from '../components/icons'
import { useI18n } from '../i18n/I18nContext'
import { TYPE_ATTR_SPEC, missingRequiredAttrs } from '../lib/wordTypes'
import { formatSince } from '../lib/relativeTime'

export function WordDetail() {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const wordId = Number(id)
  const navigate = useNavigate()
  const { getWord, patchWord, scheduleDelete, toggleHard, loading, words } = useWords()
  const word = getWord(wordId)
  const allTags = useMemo(() => Array.from(new Set(words.flatMap((w) => w.tags))).sort(), [words])

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
          <ArrowLeftIcon className="h-5 w-5" /> {t('detail.back')}
        </Link>
        <p className="text-[14px] text-ink-tertiary">{loading ? t('search.loading') : t('detail.notFound')}</p>
      </div>
    )
  }

  function setAttr(key: string, value: unknown) {
    setAttrs((prev) => ({ ...prev, [key]: value }))
  }

  const missing: string[] = []
  if (!editWord.trim()) missing.push(t('add.fieldWord'))
  if (!meaning.trim()) missing.push(t('add.fieldMeaning'))
  missing.push(...missingRequiredAttrs(word.type, attrs).map((f) => t(f.label)))

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
        setSaveError(t('detail.duplicateError'))
      } else {
        setSaveError(err instanceof Error ? err.message : t('add.saveFailed'))
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
        <ArrowLeftIcon className="h-5 w-5" /> {t('detail.back')}
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
        {t('detail.hardToggle')}
      </button>
      {word.is_hard && word.hard_since && (
        <p className="text-[12px] font-semibold text-ink-tertiary">{formatSince(word.hard_since)} {t('detail.hardSinceSuffix')}</p>
      )}

      {!editing ? (
        <Card className="flex flex-col gap-3">
          <div>
            <p className="eyebrow text-[11px] text-ink-tertiary">{t('detail.meaning')}</p>
            <p className="text-[16px] text-ink">{word.meaning}</p>
          </div>
          {word.example && (
            <div>
              <p className="eyebrow text-[11px] text-ink-tertiary">{t('detail.example')}</p>
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
                    <p className="eyebrow text-[11px] text-ink-tertiary">{t(field.label)}</p>
                    <p className="text-[14px] text-ink">{typeof value === 'boolean' ? (value ? t('detail.yes') : t('detail.no')) : String(value)}</p>
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
          {word.source && (
            <p className="text-[12px] text-ink-tertiary">
              {t('detail.source')}: {word.source}
            </p>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <Input
            id="detail-word"
            label={t('add.wordLabel')}
            autoCapitalize={word.type === 'nomen' ? 'words' : 'none'}
            value={editWord}
            onChange={(e) => setEditWord(e.target.value)}
          />
          <Input id="detail-meaning" label={t('add.meaning')} value={meaning} onChange={(e) => setMeaning(e.target.value)} />
          <TypeAttrsRequired
            type={word.type}
            word={editWord}
            attrs={attrs}
            setAttr={setAttr}
            regelmaessig={regelmaessig}
            setRegelmaessig={setRegelmaessig}
          />
          <TypeAttrsOptional type={word.type} attrs={attrs} setAttr={setAttr} />
          <TextArea id="detail-example" label={t('add.example')} rows={2} value={example} onChange={(e) => setExample(e.target.value)} />
          <TagsInput id="detail-tags" label={t('detail.tagsLabel')} value={tagsText} onChange={setTagsText} suggestions={allTags} />
          <Input id="detail-source" label={t('detail.source')} value={source} onChange={(e) => setSource(e.target.value)} />
          {saveError && <p className="text-[13px] font-semibold text-negative-text">{saveError}</p>}
          {missing.length > 0 && <p className="text-[12px] font-semibold text-ink-tertiary">{missing.join(', ')} {t('add.missingSuffix')}</p>}
        </div>
      )}

      <div className="flex gap-2">
        {editing ? (
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setEditing(false)} disabled={saving}>
              {t('detail.cancel')}
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || missing.length > 0}>
              {saving ? t('add.saving') : t('add.save')}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" className="flex-1" onClick={() => setEditing(true)}>
              {t('detail.edit')}
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => setConfirmingDelete(true)}>
              <TrashIcon className="h-4 w-4" /> {t('detail.delete')}
            </Button>
          </>
        )}
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title={t('detail.deleteTitle')}
          message={`„${word.word}" ${t('detail.deleteMessage')}`}
          confirmLabel={t('detail.delete')}
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  )
}
