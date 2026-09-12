import { describe, expect, it } from 'vitest'
import { deriveRegularVerbForms } from './regularVerb'

describe('deriveRegularVerbForms', () => {
  it('arbeiten -> arbeitet / arbeitete / gearbeitet (linking -e-)', () => {
    expect(deriveRegularVerbForms('arbeiten', false)).toEqual({
      praesens3sg: 'arbeitet',
      praeteritum: 'arbeitete',
      partizipIi: 'gearbeitet',
    })
  })

  it('machen -> macht / machte / gemacht', () => {
    expect(deriveRegularVerbForms('machen', false)).toEqual({
      praesens3sg: 'macht',
      praeteritum: 'machte',
      partizipIi: 'gemacht',
    })
  })

  it('studieren -> studiert / studierte / studiert (no ge-, -ieren rule)', () => {
    expect(deriveRegularVerbForms('studieren', false)).toEqual({
      praesens3sg: 'studiert',
      praeteritum: 'studierte',
      partizipIi: 'studiert',
    })
  })

  it('verkaufen -> verkauft (no ge-, inseparable prefix)', () => {
    expect(deriveRegularVerbForms('verkaufen', false).partizipIi).toBe('verkauft')
  })

  it('einkaufen + trennbar -> kauft ein / kaufte ein / eingekauft', () => {
    expect(deriveRegularVerbForms('einkaufen', true)).toEqual({
      praesens3sg: 'kauft ein',
      praeteritum: 'kaufte ein',
      partizipIi: 'eingekauft',
    })
  })

  it('sammeln -> sammelt (stem drops only -n for -eln verbs)', () => {
    expect(deriveRegularVerbForms('sammeln', false)).toEqual({
      praesens3sg: 'sammelt',
      praeteritum: 'sammelte',
      partizipIi: 'gesammelt',
    })
  })
})
