import { describe, expect, it } from 'vitest'
import {
  evaluateSupport,
  formatSlots,
  formatSlotTime,
  isIosDevice,
  urlBase64ToUint8Array,
  type SupportProbe,
} from './push'

const fullSupport: SupportProbe = {
  hasServiceWorker: true,
  hasPushManager: true,
  hasNotification: true,
  isIos: false,
  isStandalone: false,
}

describe('evaluateSupport', () => {
  it('accepts a capable non-iOS browser', () => {
    expect(evaluateSupport(fullSupport)).toBe('ok')
  })

  it('asks an iPhone in a Safari tab to install first', () => {
    // The APIs are all present here -- feature detection alone would wrongly
    // report success, and the permission request would then fail.
    expect(evaluateSupport({ ...fullSupport, isIos: true, isStandalone: false })).toBe('needs-install')
  })

  it('accepts an iPhone once installed to the home screen', () => {
    expect(evaluateSupport({ ...fullSupport, isIos: true, isStandalone: true })).toBe('ok')
  })

  it('reports unsupported when the Push API is missing', () => {
    expect(evaluateSupport({ ...fullSupport, hasPushManager: false })).toBe('unsupported')
    expect(evaluateSupport({ ...fullSupport, hasServiceWorker: false })).toBe('unsupported')
    expect(evaluateSupport({ ...fullSupport, hasNotification: false })).toBe('unsupported')
  })
})

describe('isIosDevice', () => {
  it('detects an iPhone', () => {
    expect(isIosDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 5)).toBe(true)
  })

  it('detects an iPad reporting a desktop user agent', () => {
    expect(isIosDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5, 'MacIntel')).toBe(true)
  })

  it('does not mistake a real Mac for an iPad', () => {
    expect(isIosDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0, 'MacIntel')).toBe(false)
  })

  it('does not match Android', () => {
    expect(isIosDevice('Mozilla/5.0 (Linux; Android 14)', 5)).toBe(false)
  })
})

describe('urlBase64ToUint8Array', () => {
  it('decodes an unpadded base64url key', () => {
    // "hello" is aGVsbG8 in base64url, which needs one '=' of padding back.
    expect(Array.from(urlBase64ToUint8Array('aGVsbG8'))).toEqual([104, 101, 108, 108, 111])
  })

  it('handles the base64url alphabet', () => {
    const decoded = urlBase64ToUint8Array('-_8')
    expect(Array.from(decoded)).toEqual([251, 255])
  })

  it('decodes a realistic 65-byte VAPID key', () => {
    const key =
      'BE3h7peKZZBl7DfUSuAUaQPdV5dCmUId5kfRu_hXs_bfSRoek6S4C5Pzv9vvqjiiU2PY5R2DCeuKOcBLUuOsmwQ'
    const decoded = urlBase64ToUint8Array(key)
    expect(decoded.length).toBe(65)
    // Uncompressed EC point marker.
    expect(decoded[0]).toBe(4)
  })
})

describe('formatSlots', () => {
  it('joins the slot list for display', () => {
    expect(formatSlots(['09:00', '12:00', '22:00'])).toBe('09:00 · 12:00 · 22:00')
  })
})

describe('formatSlotTime', () => {
  it('returns null for a missing or unparseable time', () => {
    expect(formatSlotTime(null, 'de')).toBeNull()
    expect(formatSlotTime('not-a-date', 'de')).toBeNull()
  })

  it('formats an ISO instant as a local clock time', () => {
    expect(formatSlotTime('2026-07-01T10:00:00Z', 'de')).toMatch(/^\d{2}:\d{2}$/)
  })
})
