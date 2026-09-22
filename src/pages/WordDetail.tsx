import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ApiError, useWords } from '../state/WordsContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ExampleSentencesInput } from '../components/ui/ExampleSentencesInput'
import { Input, TextArea } from '../components/ui/Input'
import { OverflowMenu } from '../components/ui/OverflowMenu'
import { TagsInput } from '../components/ui/TagsInput'
import { TypeChip } from '../components/ui/TypeChip'
import { TypeAttrsOptional, TypeAttrsRequired } from '../components/TypeAttrsFields'
import { ArrowLeftIcon, FlagIcon } from '../components/icons'
import { useI18n } from '../i18n/I18nContext'
import { ARTIKEL_COLOR_VAR, artikelOf } from '../lib/artikel'
import { headlineSizeClass } from '../lib/headline'
import { TYPE_ATTR_SPEC, missingRequiredAttrs } from '../lib/wordTypes'
import { formatSince } from '../lib/relativeTime'
import type { ExampleSentence } from '../api/types'

export function WordDetail() {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const wordId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * Go back where you came from rather than always to one fixed tab.
   *
   * React Router marks the session's first entry with key "default". A word
   * opened straight from a notification is that first entry, so there is
   * nothing to go back to and History -- the list this word belongs to -- is
   * the sensible landing spot instead.
   */
  const goBack = () => {
    if (location.key === 'default') navigate('/history', { replace: true })
    else navigate(-1)
  }

  const backButton = (
    <button
      type="button"
      onClick={goBack}
      className="tap-target inline-flex w-fit items-center gap-2 text-ink-secondary"
    >
      <ArrowLeftIcon className="h-5 w-5" /> {t('detail.back')}
    </button>
  )
  const { getWord, patchWord, scheduleDelete, toggleHard, loading, words } = useWords()
  const word = getWord(wordId)
  const allTags = useMemo(() => Array.from(new Set(words.flatMap((w) => w.tags))).sort(), [words])

  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [editWord, setEditWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState<ExampleSentence[]>([])
  const [tagsText, setTagsText] = useState('')
  const [source, setSource] = useState('')
  const [comment, setComment] = useState('')
  const [attrs, setAttrs] = useState<Record<string, unknown>>({})
  const [regelmaessig, setRegelmaessig] = useState(false)

  useEffect(() => {
    if (!word) return
    setEditWord(word.word)
    setMeaning(word.meaning)
    setExample(word.example)
    setTagsText(word.tags.join(', '))
    setSource(word.source ?? '')
    setComment(word.comment ?? '')
    setAttrs(word.attrs)
  }, [word])

  if (!word) {
    return (
      <div className="flex flex-col gap-4">
        {backButton}
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
        example: example.filter((ex) => ex.de.trim()).map((ex) => ({ de: ex.de.trim(), meaning: ex.meaning.trim() })),
        attrs,
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        source: source.trim() || null,
        comment: comment.trim() || null,
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
    // Back to the list the word was in, not wherever the browser history
    // happens to point -- the undo toast lives there.
    navigate('/history')
  }

  const artikel = artikelOf(word)
  const attrSpec = TYPE_ATTR_SPEC[word.type]
  const allAttrFields = [...attrSpec.required, ...attrSpec.optional]

  return (
    <div className="flex flex-col gap-5">
      {backButton}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <TypeChip type={word.type} artikel={artikel} size="md" showLabel />
          {artikel && (
            <span
              className="rounded-full px-2.5 py-1 font-display text-[14px] font-extrabold uppercase tracking-[0.03em] text-white"
              style={{ background: `var(${ARTIKEL_COLOR_VAR[artikel]})` }}
            >
              {artikel}
            </span>
          )}
          {/* A long compound steps down a size so it does not wrap mid-word.
              hyphens-auto lets Safari break at syllables where it has the
              German dictionary; break-words is the last-resort fallback. */}
          <h1 className={`headline min-w-0 hyphens-auto break-words ${headlineSizeClass(word.word)}`}>
            {word.word}
          </h1>
        </div>
        {!editing && (
          <OverflowMenu
            ariaLabel={t('detail.moreActions')}
            items={[
              { label: t('detail.edit'), onClick: () => setEditing(true) },
              { label: t('detail.delete'), onClick: () => setConfirmingDelete(true), danger: true },
            ]}
          />
        )}
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
          {word.example.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="eyebrow text-[11px] text-ink-tertiary">{t('detail.example')}</p>
              {word.example.map((ex, i) => (
                <div key={i}>
                  <p className="text-[15px] italic text-ink-secondary">{ex.de}</p>
                  {ex.meaning && <p className="text-[13px] text-ink-tertiary">{ex.meaning}</p>}
                </div>
              ))}
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
          {word.comment && (
            <div>
              <p className="eyebrow text-[11px] text-ink-tertiary">{t('detail.comment')}</p>
              <p className="whitespace-pre-wrap text-[15px] text-ink-secondary">{word.comment}</p>
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
          <ExampleSentencesInput
            label={t('add.example')}
            dePlaceholder={t('add.exampleDe')}
            meaningPlaceholder={t('add.exampleMeaning')}
            addLabel={t('add.addExample')}
            value={example}
            onChange={setExample}
          />
          <TagsInput id="detail-tags" label={t('detail.tagsLabel')} value={tagsText} onChange={setTagsText} suggestions={allTags} />
          <Input id="detail-source" label={t('detail.source')} value={source} onChange={(e) => setSource(e.target.value)} />
          <TextArea id="detail-comment" label={t('detail.comment')} rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
          {saveError && <p className="text-[13px] font-semibold text-negative-text">{saveError}</p>}
          {missing.length > 0 && <p className="text-[12px] font-semibold text-ink-tertiary">{missing.join(', ')} {t('add.missingSuffix')}</p>}
        </div>
      )}

      {editing && (
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setEditing(false)} disabled={saving}>
            {t('detail.cancel')}
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving || missing.length > 0}>
            {saving ? t('add.saving') : t('add.save')}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title={t('detail.deleteTitle')}
        message={`„${word.word}" ${t('detail.deleteMessage')}`}
        confirmLabel={t('detail.delete')}
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  )
}
