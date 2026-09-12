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

export const TYPE_LABEL: Record<WordType, string> = {
  nomen: 'Nomen',
  verb: 'Verb',
  adjektiv: 'Adjektiv',
  adverb: 'Adverb',
  praeposition: 'Präposition',
  konjunktion: 'Konjunktion',
  pronomen: 'Pronomen',
  partikel: 'Partikel',
  phrase: 'Phrase',
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
  label: string
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
      { key: 'artikel', label: 'Artikel', type: 'enum', options: ['der', 'die', 'das'] },
      { key: 'plural', label: 'Plural', type: 'string' },
    ],
    optional: [{ key: 'genitiv', label: 'Genitiv', type: 'string' }],
  },
  verb: {
    required: [
      { key: 'hilfsverb', label: 'Hilfsverb', type: 'enum', options: ['haben', 'sein'] },
      { key: 'praesens_3sg', label: 'Präsens 3.Sg', type: 'string' },
      { key: 'praeteritum', label: 'Präteritum', type: 'string' },
      { key: 'partizip_ii', label: 'Partizip II', type: 'string' },
    ],
    optional: [
      { key: 'trennbar', label: 'Trennbar', type: 'bool' },
      { key: 'reflexiv', label: 'Reflexiv', type: 'bool' },
      { key: 'rektion', label: 'Rektion', type: 'string' },
    ],
  },
  adjektiv: {
    required: [],
    optional: [
      { key: 'komparativ', label: 'Komparativ', type: 'string' },
      { key: 'superlativ', label: 'Superlativ', type: 'string' },
    ],
  },
  adverb: {
    required: [],
    optional: [{ key: 'position', label: 'Position', type: 'string' }],
  },
  praeposition: {
    required: [{ key: 'kasus', label: 'Kasus', type: 'enum', options: ['akk', 'dat', 'gen', 'wechsel'] }],
    optional: [],
  },
  konjunktion: {
    required: [
      { key: 'wortstellung', label: 'Wortstellung', type: 'enum', options: ['pos0', 'pos1', 'verb_ende'] },
    ],
    optional: [],
  },
  pronomen: { required: [], optional: [] },
  partikel: {
    required: [],
    optional: [{ key: 'register', label: 'Register', type: 'string' }],
  },
  phrase: {
    required: [],
    optional: [
      { key: 'register', label: 'Register', type: 'enum', options: ['formell', 'informell', 'neutral'] },
    ],
  },
}

export function missingRequiredAttrs(type: WordType, attrs: Record<string, unknown>): AttrFieldSpec[] {
  return TYPE_ATTR_SPEC[type].required.filter((field) => {
    const value = attrs[field.key]
    return value === undefined || value === null || value === ''
  })
}
