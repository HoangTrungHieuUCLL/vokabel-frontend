import { useEffect } from 'react'
import { Checkbox } from './ui/Checkbox'
import { ChoiceButtons } from './ui/ChoiceButtons'
import { Input } from './ui/Input'
import { useI18n } from '../i18n/I18nContext'
import { deriveRegularVerbForms } from '../lib/regularVerb'
import type { WordType } from '../lib/wordTypes'

function FieldLabel({ children }: { children: string }) {
  return <span className="eyebrow text-[12px]">{children}</span>
}

interface RequiredFieldsProps {
  type: WordType
  word: string
  attrs: Record<string, unknown>
  setAttr: (key: string, value: unknown) => void
  regelmaessig: boolean
  setRegelmaessig: (value: boolean) => void
}

/** The required-attrs block that renders outside the "mehr" disclosure the moment a type is picked. */
export function TypeAttrsRequired({ type, word, attrs, setAttr, regelmaessig, setRegelmaessig }: RequiredFieldsProps) {
  const { t } = useI18n()

  useEffect(() => {
    if (type !== 'verb' || !regelmaessig || !word.trim()) return
    const forms = deriveRegularVerbForms(word, Boolean(attrs.trennbar))
    setAttr('praesens_3sg', forms.praesens3sg)
    setAttr('praeteritum', forms.praeteritum)
    setAttr('partizip_ii', forms.partizipIi)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word, attrs.trennbar, regelmaessig, type])

  if (type === 'nomen') {
    return (
      <div className="flex flex-col gap-3 rounded-[var(--radius-control)] border-2 border-border-soft p-3">
        <div className="flex flex-col gap-2">
          <FieldLabel>{t('attr.artikel')}</FieldLabel>
          <ChoiceButtons
            options={['der', 'die', 'das'] as const}
            value={attrs.artikel as 'der' | 'die' | 'das' | undefined}
            onChange={(v) => setAttr('artikel', v)}
          />
        </div>
        <Input id="attrs-plural" label={t('attr.plural')} value={(attrs.plural as string) ?? ''} onChange={(e) => setAttr('plural', e.target.value)} />
      </div>
    )
  }

  if (type === 'verb') {
    return (
      <div className="flex flex-col gap-3 rounded-[var(--radius-control)] border-2 border-border-soft p-3">
        <div className="flex flex-wrap gap-4">
          <Checkbox id="attrs-regelmaessig" label={t('field.regelmaessig')} checked={regelmaessig} onChange={(e) => setRegelmaessig(e.target.checked)} />
          <Checkbox
            id="attrs-trennbar"
            label={t('field.trennbar')}
            checked={Boolean(attrs.trennbar)}
            onChange={(e) => setAttr('trennbar', e.target.checked)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <FieldLabel>{t('attr.hilfsverb')}</FieldLabel>
          <ChoiceButtons
            options={['haben', 'sein'] as const}
            value={(attrs.hilfsverb as 'haben' | 'sein' | undefined) ?? 'haben'}
            onChange={(v) => setAttr('hilfsverb', v)}
          />
        </div>
        <Input
          id="attrs-praesens"
          label={t('attr.praesens_3sg')}
          value={(attrs.praesens_3sg as string) ?? ''}
          onChange={(e) => setAttr('praesens_3sg', e.target.value)}
        />
        <Input
          id="attrs-praeteritum"
          label={t('attr.praeteritum')}
          value={(attrs.praeteritum as string) ?? ''}
          onChange={(e) => setAttr('praeteritum', e.target.value)}
        />
        <Input
          id="attrs-partizip"
          label={t('attr.partizip_ii')}
          value={(attrs.partizip_ii as string) ?? ''}
          onChange={(e) => setAttr('partizip_ii', e.target.value)}
        />
      </div>
    )
  }

  if (type === 'praeposition') {
    return (
      <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border-2 border-border-soft p-3">
        <FieldLabel>{t('attr.kasus')}</FieldLabel>
        <ChoiceButtons
          options={['akk', 'dat', 'gen', 'wechsel'] as const}
          value={attrs.kasus as 'akk' | 'dat' | 'gen' | 'wechsel' | undefined}
          onChange={(v) => setAttr('kasus', v)}
        />
      </div>
    )
  }

  if (type === 'konjunktion') {
    return (
      <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border-2 border-border-soft p-3">
        <FieldLabel>{t('attr.wortstellung')}</FieldLabel>
        <ChoiceButtons
          options={['pos0', 'pos1', 'verb_ende'] as const}
          value={attrs.wortstellung as 'pos0' | 'pos1' | 'verb_ende' | undefined}
          onChange={(v) => setAttr('wortstellung', v)}
          labels={{
            pos0: t('field.wortstellungPos0'),
            pos1: t('field.wortstellungPos1'),
            verb_ende: t('field.wortstellungVerbEnde'),
          }}
        />
      </div>
    )
  }

  return null
}

interface OptionalFieldsProps {
  type: WordType
  attrs: Record<string, unknown>
  setAttr: (key: string, value: unknown) => void
}

/** Optional attrs fields -- shown inside the "mehr" disclosure on Add, shown plainly on the detail edit form. */
export function TypeAttrsOptional({ type, attrs, setAttr }: OptionalFieldsProps) {
  const { t } = useI18n()

  if (type === 'nomen') {
    return <Input id="attrs-genitiv" label={t('field.genitivOptional')} value={(attrs.genitiv as string) ?? ''} onChange={(e) => setAttr('genitiv', e.target.value)} />
  }
  if (type === 'verb') {
    return (
      <>
        <Checkbox id="attrs-reflexiv" label={t('field.reflexiv')} checked={Boolean(attrs.reflexiv)} onChange={(e) => setAttr('reflexiv', e.target.checked)} />
        <Input id="attrs-rektion" label={t('field.rektionOptional')} placeholder='z. B. "auf +Akk"' value={(attrs.rektion as string) ?? ''} onChange={(e) => setAttr('rektion', e.target.value)} />
      </>
    )
  }
  if (type === 'adjektiv') {
    return (
      <>
        <Input id="attrs-komparativ" label={t('field.komparativOptional')} value={(attrs.komparativ as string) ?? ''} onChange={(e) => setAttr('komparativ', e.target.value)} />
        <Input id="attrs-superlativ" label={t('field.superlativOptional')} value={(attrs.superlativ as string) ?? ''} onChange={(e) => setAttr('superlativ', e.target.value)} />
      </>
    )
  }
  if (type === 'adverb') {
    return <Input id="attrs-position" label={t('field.positionOptional')} value={(attrs.position as string) ?? ''} onChange={(e) => setAttr('position', e.target.value)} />
  }
  if (type === 'partikel' || type === 'phrase') {
    return <Input id="attrs-register" label={t('field.registerOptional')} value={(attrs.register as string) ?? ''} onChange={(e) => setAttr('register', e.target.value)} />
  }
  return null
}
