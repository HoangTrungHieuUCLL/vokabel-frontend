import type { TranslationKey } from '../i18n/translations'

export type Case = 'nom' | 'akk' | 'dat' | 'gen'

export const CASE_LABEL_KEY: Record<Case, TranslationKey> = {
  nom: 'case.nom',
  akk: 'case.akk',
  dat: 'case.dat',
  gen: 'case.gen',
}

export const CASE_COLOR_VAR: Record<Case, string> = {
  nom: '--color-case-nom',
  akk: '--color-case-akk',
  dat: '--color-case-dat',
  gen: '--color-case-gen',
}

// A label is either a literal (a German word form that isn't translated,
// like "ich" or "der") or a reference to a translation key (a grammar
// concept like "Nominativ" that does get translated).
export type Label = string | { key: TranslationKey }
export type Cell = string | { text: string; deviates?: boolean }

export interface Grid {
  columns: Label[]
  rows: { label: Label; cells: Cell[] }[]
}

const nom: Label = { key: 'case.nom' }
const akk: Label = { key: 'case.akk' }
const dat: Label = { key: 'case.dat' }
const gen: Label = { key: 'case.gen' }
const mask: Label = { key: 'gender.mask' }
const fem: Label = { key: 'gender.fem' }
const neut: Label = { key: 'gender.neut' }
const plural: Label = { key: 'gender.plural' }
const hoeflich: Label = { key: 'person.hoeflich' }

// Genitiv omitted deliberately -- "meiner", "deiner" are archaic and not tested at B1.
export const PERSONALPRONOMEN: Grid = {
  columns: [nom, akk, dat],
  rows: [
    { label: '1.Sg', cells: ['ich', 'mich', 'mir'] },
    { label: '2.Sg', cells: ['du', 'dich', 'dir'] },
    { label: '3.Sg m', cells: ['er', 'ihn', 'ihm'] },
    { label: '3.Sg f', cells: ['sie', 'sie', 'ihr'] },
    { label: '3.Sg n', cells: ['es', 'es', 'ihm'] },
    { label: '1.Pl', cells: ['wir', 'uns', 'uns'] },
    { label: '2.Pl', cells: ['ihr', 'euch', 'euch'] },
    { label: '3.Pl', cells: ['sie', 'sie', 'ihnen'] },
    { label: hoeflich, cells: ['Sie', 'Sie', 'Ihnen'] },
  ],
}

// The Akk/Dat split in the singular is the whole reason this table exists.
export const REFLEXIVPRONOMEN: Grid = {
  columns: [akk, dat],
  rows: [
    { label: 'ich', cells: ['mich', { text: 'mir', deviates: true }] },
    { label: 'du', cells: ['dich', { text: 'dir', deviates: true }] },
    { label: 'er/sie/es', cells: ['sich', 'sich'] },
    { label: 'wir', cells: ['uns', 'uns'] },
    { label: 'ihr', cells: ['euch', 'euch'] },
    { label: 'sie/Sie', cells: ['sich', 'sich'] },
  ],
}

export const DEFINITE_ARTICLE: Grid = {
  columns: [mask, fem, neut, plural],
  rows: [
    { label: nom, cells: ['der', 'die', 'das', 'die'] },
    { label: akk, cells: ['den', 'die', 'das', 'die'] },
    { label: dat, cells: ['dem', 'der', 'dem', 'den'] },
    { label: gen, cells: ['des', 'der', 'des', 'der'] },
  ],
}

// Bold the four cells that deviate from the definite article paradigm above.
export const RELATIVPRONOMEN: Grid = {
  columns: [mask, fem, neut, plural],
  rows: [
    { label: nom, cells: ['der', 'die', 'das', 'die'] },
    { label: akk, cells: ['den', 'die', 'das', 'die'] },
    { label: dat, cells: ['dem', 'der', 'dem', { text: 'denen', deviates: true }] },
    {
      label: gen,
      cells: [
        { text: 'dessen', deviates: true },
        { text: 'deren', deviates: true },
        { text: 'dessen', deviates: true },
        { text: 'deren', deviates: true },
      ],
    },
  ],
}

export const POSSESSIVE_WORDS = ['mein', 'dein', 'sein', 'ihr', 'unser', 'euer', 'ihr (Pl.)', 'Ihr'] as const
export type PossessiveWord = (typeof POSSESSIVE_WORDS)[number]

// All eight possessives follow the same "ein-word" ending pattern; only the
// base word (stem) differs, so the 4x4 grid is generated rather than
// hand-written 128 times over.
const POSSESSIVE_ENDINGS: [Label, string, string, string, string][] = [
  [nom, '', 'e', '', 'e'],
  [akk, 'en', 'e', '', 'e'],
  [dat, 'em', 'er', 'em', 'en'],
  [gen, 'es', 'er', 'es', 'er'],
]

function possessiveStem(word: PossessiveWord): string {
  if (word === 'ihr (Pl.)') return 'ihr'
  return word
}

function possessiveForm(word: PossessiveWord, ending: string): string {
  const stem = possessiveStem(word)
  // "euer" contracts to "eur-" before any added ending (eure, eurem, eurer, euren).
  if (stem === 'euer') return ending ? `eur${ending}` : 'euer'
  return stem + ending
}

export function possessiveGrid(word: PossessiveWord): Grid {
  return {
    columns: [mask, fem, neut, plural],
    rows: POSSESSIVE_ENDINGS.map(([caseLabel, ...endings]) => ({
      label: caseLabel,
      cells: endings.map((ending) => possessiveForm(word, ending)),
    })),
  }
}

export const MODAL_VERBS = ['können', 'müssen', 'dürfen', 'sollen', 'wollen', 'mögen', 'möchten'] as const

// 1.Sg and 3.Sg are identical and take no ending; the singular loses the umlaut.
export const MODAL_PRAESENS: Grid = {
  columns: ['ich / er', 'du', 'wir / sie', 'ihr'],
  rows: [
    { label: 'können', cells: ['kann', 'kannst', 'können', 'könnt'] },
    { label: 'müssen', cells: ['muss', 'musst', 'müssen', 'müsst'] },
    { label: 'dürfen', cells: ['darf', 'darfst', 'dürfen', 'dürft'] },
    { label: 'sollen', cells: ['soll', 'sollst', 'sollen', 'sollt'] },
    { label: 'wollen', cells: ['will', 'willst', 'wollen', 'wollt'] },
    { label: 'mögen', cells: ['mag', 'magst', 'mögen', 'mögt'] },
    { label: 'möchten', cells: ['möchte', 'möchtest', 'möchten', 'möchtet'] },
  ],
}

// The umlaut is what separates Präteritum from Konjunktiv II.
export const MODAL_PRAETERITUM_KONJ: Grid = {
  columns: [{ key: 'mood.praeteritum' }, { key: 'mood.konjunktiv2' }],
  rows: [
    { label: 'können', cells: ['konnte', 'könnte'] },
    { label: 'müssen', cells: ['musste', 'müsste'] },
    { label: 'dürfen', cells: ['durfte', 'dürfte'] },
    { label: 'sollen', cells: ['sollte', 'sollte'] },
    { label: 'wollen', cells: ['wollte', 'wollte'] },
    { label: 'mögen', cells: ['mochte', 'möchte'] },
  ],
}

export const MODAL_USAGE_NOTES: { titleKey: TranslationKey; textKey: TranslationKey }[] = [
  { titleKey: 'tabellen.usagePerfektTitle', textKey: 'tabellen.usagePerfektText' },
  { titleKey: 'tabellen.usagePassivTitle', textKey: 'tabellen.usagePassivText' },
  { titleKey: 'tabellen.usageNebensatzTitle', textKey: 'tabellen.usageNebensatzText' },
]
