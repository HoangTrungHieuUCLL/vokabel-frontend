/**
 * Browser-side Web Push plumbing.
 *
 * The awkward part is iOS: Safari exposes `Notification` and a service worker
 * in a normal tab, but refuses to grant push permission unless the site has
 * been installed to the home screen. Feature detection alone therefore reports
 * "supported" right up until the request fails, so the install state has to be
 * checked separately and explained to the user up front.
 */

export type PushSupport =
  /** Everything needed is present. */
  | 'ok'
  /** iOS Safari in a normal tab -- must be added to the home screen first. */
  | 'needs-install'
  /** No service worker or Push API at all. */
  | 'unsupported'

export interface SupportProbe {
  hasServiceWorker: boolean
  hasPushManager: boolean
  hasNotification: boolean
  isIos: boolean
  isStandalone: boolean
}

export function evaluateSupport(probe: SupportProbe): PushSupport {
  if (probe.isIos && !probe.isStandalone) return 'needs-install'
  if (!probe.hasServiceWorker || !probe.hasPushManager || !probe.hasNotification) return 'unsupported'
  return 'ok'
}

export function isIosDevice(ua: string, maxTouchPoints: number, platform = ''): boolean {
  if (/iPad|iPhone|iPod/.test(ua)) return true
  // iPadOS 13+ reports a desktop Safari UA; the touch points give it away.
  return platform === 'MacIntel' && maxTouchPoints > 1
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  // `navigator.standalone` is the iOS-only signal; the media query covers
  // installed PWAs everywhere else.
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone
  return iosStandalone === true || window.matchMedia('(display-mode: standalone)').matches
}

export function probeSupport(): PushSupport {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'unsupported'
  return evaluateSupport({
    hasServiceWorker: 'serviceWorker' in navigator,
    hasPushManager: 'PushManager' in window,
    hasNotification: 'Notification' in window,
    isIos: isIosDevice(navigator.userAgent, navigator.maxTouchPoints, navigator.platform),
    isStandalone: isStandaloneDisplay(),
  })
}

/** VAPID keys travel as base64url; PushManager wants raw bytes. */
export function urlBase64ToUint8Array(base64UrlString: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64UrlString.length % 4)) % 4)
  const base64 = (base64UrlString + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  // Backed by an explicit ArrayBuffer: applicationServerKey will not take the
  // ArrayBufferLike-backed view the plain constructor infers.
  const output = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

export function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register('/sw.js', { scope: '/' })
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (probeSupport() !== 'ok') return null
  const registration = await navigator.serviceWorker.getRegistration('/')
  if (!registration) return null
  return registration.pushManager.getSubscription()
}

export class PermissionDeniedError extends Error {}

/**
 * Ask for permission and create a subscription. Must be called from a user
 * gesture -- Safari rejects `Notification.requestPermission()` otherwise.
 */
export async function createSubscription(vapidPublicKey: string): Promise<PushSubscription> {
  const registration = await registerServiceWorker()
  // A fresh registration is not usable until it is active.
  await navigator.serviceWorker.ready

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new PermissionDeniedError(permission)
  }

  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing

  return registration.pushManager.subscribe({
    // Non-visible pushes are not allowed on any current browser, and every
    // push this app sends shows a notification anyway.
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  })
}

/** Formats "09:00,12:00" style slot lists for display. */
export function formatSlots(slots: string[]): string {
  return slots.join(' · ')
}

export function formatSlotTime(iso: string | null, locale: string): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString(locale === 'de' ? 'de-DE' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
