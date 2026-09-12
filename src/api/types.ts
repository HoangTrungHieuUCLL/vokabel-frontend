import type { WordType } from '../lib/wordTypes'

// Mirrors app/schemas.py::WordOut on the backend field-for-field (snake_case,
// on purpose) so there's no mapping layer between wire format and app state.
export interface Word {
  id: number
  word: string
  search_key: string
  type: WordType
  meaning: string
  example: string | null
  attrs: Record<string, unknown>
  tags: string[]
  source: string | null
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
  example?: string | null
  attrs?: Record<string, unknown>
  tags?: string[]
  source?: string | null
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
