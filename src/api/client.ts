import type {
  ImportCommitResult,
  ImportPolicy,
  ImportPreview,
  NotificationStatus,
  NotifySettings,
  PushSendResult,
  Spotlight,
  VapidKey,
  Word,
  WordCreate,
  WordUpdate,
} from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

const TOKEN_KEY = 'vokabel.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// Set by AuthContext so any 401 anywhere in the app forces a re-login,
// without every call site needing to know about auth state.
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown, message: string) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (res.status === 401) {
    onUnauthorized?.()
  }

  if (!res.ok) {
    let body: unknown = null
    try {
      body = await res.json()
    } catch {
      // no JSON body
    }
    const detail = (body as { detail?: unknown })?.detail
    const message = typeof detail === 'string' ? detail : res.statusText
    throw new ApiError(res.status, body, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function login(username: string, password: string): Promise<string> {
  const { access_token } = await request<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  return access_token
}

export function me(): Promise<{ username: string }> {
  return request('/auth/me')
}

export function listWords(updatedSince?: string): Promise<Word[]> {
  const qs = updatedSince ? `?updated_since=${encodeURIComponent(updatedSince)}` : ''
  return request(`/words${qs}`)
}

export function createWord(body: WordCreate): Promise<Word> {
  return request('/words', { method: 'POST', body: JSON.stringify(body) })
}

export function updateWord(id: number, body: WordUpdate): Promise<Word> {
  return request(`/words/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
}

export function deleteWord(id: number): Promise<void> {
  return request(`/words/${id}`, { method: 'DELETE' })
}

export function getSpotlight(): Promise<Spotlight> {
  return request('/spotlight')
}

export function getVapidKey(): Promise<VapidKey> {
  return request('/notifications/vapid-key')
}

export function getNotificationStatus(endpoint?: string): Promise<NotificationStatus> {
  const qs = endpoint ? `?endpoint=${encodeURIComponent(endpoint)}` : ''
  return request(`/notifications/status${qs}`)
}

export function subscribePush(
  subscription: PushSubscriptionJSON,
  userAgent: string,
): Promise<NotificationStatus> {
  return request('/notifications/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      user_agent: userAgent,
    }),
  })
}

export function unsubscribePush(endpoint: string): Promise<void> {
  return request('/notifications/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ endpoint }),
  })
}

export function getNotifySettings(): Promise<NotifySettings> {
  return request('/notifications/settings')
}

export function saveNotifySettings(slots: string[]): Promise<NotifySettings> {
  return request('/notifications/settings', { method: 'PUT', body: JSON.stringify({ slots }) })
}

export function sendTestNotification(): Promise<PushSendResult> {
  return request('/notifications/test', { method: 'POST' })
}

export function importPreview(file: File): Promise<ImportPreview> {
  const form = new FormData()
  form.append('file', file)
  return request('/import/preview', { method: 'POST', body: form })
}

export function importCommit(
  file: File,
  mapping: Record<string, string>,
  policy: ImportPolicy,
): Promise<ImportCommitResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('mapping', JSON.stringify(mapping))
  form.append('policy', policy)
  return request('/import/commit', { method: 'POST', body: form })
}

export async function downloadExport(format: 'csv' | 'json'): Promise<void> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/export?format=${format}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new ApiError(res.status, null, res.statusText)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vokabel-export.${format}`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
