import type { WordType } from '../lib/wordTypes'

export interface ExampleSentence {
  de: string
  meaning: string
}

// Mirrors app/schemas.py::WordOut on the backend field-for-field (snake_case,
// on purpose) so there's no mapping layer between wire format and app state.
export interface Word {
  id: number
  word: string
  search_key: string
  type: WordType
  meaning: string
  example: ExampleSentence[]
  attrs: Record<string, unknown>
  tags: string[]
  source: string | null
  comment: string | null
  is_hard: boolean
  hard_since: string | null
  due_at: string | null
  interval_days: number
  ease: number
  reps: number
  lapses: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WordCreate {
  word: string
  type: WordType
  meaning: string
  example?: ExampleSentence[]
  attrs?: Record<string, unknown>
  tags?: string[]
  source?: string | null
  comment?: string | null
  is_hard?: boolean
}

export type WordUpdate = Partial<WordCreate>

export interface DuplicateError {
  message: string
  existing: Word
}

export interface ImportPreview {
  encoding: string
  delimiter: string | null
  total_rows: number
  headers: string[]
  suggested_mapping: Record<string, string>
  sample: Record<string, unknown>[]
  duplicates_in_db: number
  duplicates_in_file: number
  row_errors: { row: number; reason: string }[]
}

export type ImportPolicy = 'skip' | 'overwrite' | 'append_meaning'

export interface ImportCommitResult {
  inserted: number
  updated: number
  skipped: number
  errors: { row: number; reason: string }[]
  rolled_back?: boolean
}

export interface Spotlight {
  /** Local wall-clock slot this word belongs to, e.g. "12:00". */
  slot: string
  slot_date: string
  scheduled_for: string
  next_slot_at: string | null
  word: Word
}

export interface NotificationStatus {
  push_enabled: boolean
  subscribed: boolean
  subscription_count: number
  slots: string[]
  timezone: string
  next_slot_at: string | null
}

export interface VapidKey {
  public_key: string
  push_enabled: boolean
}

export interface PushSendResult {
  sent: number
  failed: number
  removed: number
  subscriptions: number
}
