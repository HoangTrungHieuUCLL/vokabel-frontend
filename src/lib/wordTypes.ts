import type { TranslationKey } from '../i18n/translations'

export const WORD_TYPES = [
  'nomen',
  'verb',
  'adjektiv',
  'adverb',
  'praeposition',
  'konjunktion',
  'pronomen',
  'partikel',
  'phrase',
] as const

export type WordType = (typeof WORD_TYPES)[number]

export const TYPE_LABEL_KEY: Record<WordType, TranslationKey> = {
  nomen: 'type.nomen',
  verb: 'type.verb',
  adjektiv: 'type.adjektiv',
  adverb: 'type.adverb',
  praeposition: 'type.praeposition',
  konjunktion: 'type.konjunktion',
  pronomen: 'type.pronomen',
  partikel: 'type.partikel',
  phrase: 'type.phrase',
}

export const TYPE_ABBR: Record<WordType, string> = {
  nomen: 'NO',
  verb: 'VB',
  adjektiv: 'AJ',
  adverb: 'AV',
  praeposition: 'PR',
  konjunktion: 'KJ',
  pronomen: 'PN',
  partikel: 'PA',
  phrase: 'PH',
}

export const TYPE_COLOR_VAR: Record<WordType, string> = {
  nomen: '--color-type-nomen',
  verb: '--color-type-verb',
  adjektiv: '--color-type-adjektiv',
  adverb: '--color-type-adverb',
  praeposition: '--color-type-praeposition',
  konjunktion: '--color-type-konjunktion',
  pronomen: '--color-type-pronomen',
  partikel: '--color-type-partikel',
  phrase: '--color-type-phrase',
}

export type AttrFieldType = 'enum' | 'string' | 'bool'

export interface AttrFieldSpec {
  key: string
  label: TranslationKey
  type: AttrFieldType
  options?: string[]
}

export interface TypeAttrSpec {
  required: AttrFieldSpec[]
  optional: AttrFieldSpec[]
}

// Mirrors app/schemas.py::TYPE_ATTR_SPEC on the backend. Keep in sync.
export const TYPE_ATTR_SPEC: Record<WordType, TypeAttrSpec> = {
  nomen: {
    required: [
      { key: 'artikel', label: 'attr.artikel', type: 'enum', options: ['der', 'die', 'das'] },
      { key: 'plural', label: 'attr.plural', type: 'string' },
    ],
    optional: [{ key: 'genitiv', label: 'attr.genitiv', type: 'string' }],
  },
  verb: {
    required: [
      { key: 'hilfsverb', label: 'attr.hilfsverb', type: 'enum', options: ['haben', 'sein'] },
      { key: 'praesens_3sg', label: 'attr.praesens_3sg', type: 'string' },
      { key: 'praeteritum', label: 'attr.praeteritum', type: 'string' },
      { key: 'partizip_ii', label: 'attr.partizip_ii', type: 'string' },
    ],
    optional: [
      { key: 'trennbar', label: 'attr.trennbar', type: 'bool' },
      { key: 'reflexiv', label: 'attr.reflexiv', type: 'bool' },
      { key: 'rektion', label: 'attr.rektion', type: 'string' },
    ],
  },
  adjektiv: {
    required: [],
    optional: [
      { key: 'komparativ', label: 'attr.komparativ', type: 'string' },
      { key: 'superlativ', label: 'attr.superlativ', type: 'string' },
    ],
  },
  adverb: {
    required: [],
    optional: [{ key: 'position', label: 'attr.position', type: 'string' }],
  },
  praeposition: {
    required: [{ key: 'kasus', label: 'attr.kasus', type: 'enum', options: ['akk', 'dat', 'gen', 'wechsel'] }],
    optional: [],
  },
  konjunktion: {
    required: [
      { key: 'wortstellung', label: 'attr.wortstellung', type: 'enum', options: ['pos0', 'pos1', 'verb_ende'] },
    ],
    optional: [],
  },
  pronomen: { required: [], optional: [] },
  partikel: {
    required: [],
    optional: [{ key: 'register', label: 'attr.register', type: 'string' }],
  },
  phrase: {
    required: [],
    optional: [
      { key: 'register', label: 'attr.register', type: 'enum', options: ['formell', 'informell', 'neutral'] },
    ],
  },
}

export function missingRequiredAttrs(type: WordType, attrs: Record<string, unknown>): AttrFieldSpec[] {
  return TYPE_ATTR_SPEC[type].required.filter((field) => {
    const value = attrs[field.key]
    return value === undefined || value === null || value === ''
  })
}
