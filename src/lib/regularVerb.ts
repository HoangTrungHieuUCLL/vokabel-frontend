export interface RegularVerbForms {
  praesens3sg: string
  praeteritum: string
  partizipIi: string
}

// Prefixes that never separate: the Partizip II takes no ge- with these.
const INSEPARABLE_PREFIXES = ['be', 'emp', 'ent', 'er', 'ge', 'miss', 'ver', 'zer']

// Common separable prefixes, longest first so "zusammen" isn't mistaken for
// something shorter. Not exhaustive, but covers what a B1 learner logs.
const SEPARABLE_PREFIXES = [
  'auseinander', 'durcheinander',
  'entgegen', 'gegenüber',
  'hinunter', 'hinauf', 'herunter', 'herauf',
  'zusammen', 'zurecht', 'vorbei', 'zurück', 'voran', 'voraus',
  'empor', 'fest', 'fort', 'frei', 'hoch', 'nach', 'nieder', 'statt', 'teil',
  'weiter', 'wieder',
  'ab', 'an', 'auf', 'aus', 'bei', 'da', 'ein', 'fern', 'her', 'hin', 'los',
  'mit', 'vor', 'weg', 'zu', 'um',
].sort((a, b) => b.length - a.length)

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'])

function isConsonant(c: string): boolean {
  return /[a-zäöüß]/.test(c) && !VOWELS.has(c)
}

// stem ends in d/t, or a consonant followed by m/n, needs the linking -e-
// (arbeiten -> arbeitet, atmen -> atmet, regnen -> regnet).
function needsLinkingE(stem: string): boolean {
  if (stem.endsWith('d') || stem.endsWith('t')) return true
  if (stem.length >= 2) {
    const last = stem[stem.length - 1]
    const beforeLast = stem[stem.length - 2]
    if ((last === 'm' || last === 'n') && isConsonant(beforeLast)) return true
  }
  return false
}

function getStem(infinitive: string): string {
  if (/(eln|ern)$/.test(infinitive)) return infinitive.slice(0, -1)
  if (infinitive.endsWith('en')) return infinitive.slice(0, -2)
  return infinitive.replace(/n$/, '')
}

function findSeparablePrefix(infinitive: string): string {
  for (const prefix of SEPARABLE_PREFIXES) {
    if (infinitive.startsWith(prefix) && infinitive.length > prefix.length + 2) {
      return prefix
    }
  }
  return ''
}

/**
 * Derives Präsens 3.Sg, Präteritum 3.Sg and Partizip II for a *regular*
 * (weak) verb. Mirrors the build-prompt's rule table and Partizip II
 * exception order: -ieren > inseparable prefix > trennbar infix > default.
 * Every derived value stays in a normal editable input; nothing here is
 * shared with the backend since it's a client-side input convenience, not
 * a data rule.
 */
export function deriveRegularVerbForms(infinitive: string, trennbar: boolean): RegularVerbForms {
  const inf = infinitive.trim().toLowerCase()
  const prefix = trennbar ? findSeparablePrefix(inf) : ''
  const base = prefix ? inf.slice(prefix.length) : inf
  const baseStem = getStem(base)

  const linkingE = needsLinkingE(baseStem)
  const praesensBase = baseStem + (linkingE ? 'et' : 't')
  const praeteritumBase = baseStem + (linkingE ? 'ete' : 'te')

  const praesens3sg = prefix ? `${praesensBase} ${prefix}` : praesensBase
  const praeteritum = prefix ? `${praeteritumBase} ${prefix}` : praeteritumBase

  const partizipSuffix = linkingE ? 'et' : 't'
  let partizipIi: string
  if (inf.endsWith('ieren')) {
    partizipIi = baseStem + partizipSuffix
  } else if (INSEPARABLE_PREFIXES.some((p) => inf.startsWith(p))) {
    partizipIi = baseStem + partizipSuffix
  } else if (prefix) {
    partizipIi = `${prefix}ge${baseStem}${partizipSuffix}`
  } else {
    partizipIi = `ge${baseStem}${partizipSuffix}`
  }

  return { praesens3sg, praeteritum, partizipIi }
}
