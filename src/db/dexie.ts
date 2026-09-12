import Dexie, { type Table } from 'dexie'
import type { Word } from '../api/types'

// Phase 2: a plain read cache, refreshed with a full GET /words on load.
// Phase 3 adds the outbox table and delta sync (updated_since) on top of
// this same schema.
class VokabelDB extends Dexie {
  words!: Table<Word, number>

  constructor() {
    super('vokabel')
    this.version(1).stores({
      words: 'id, search_key, type, is_hard, deleted_at, updated_at',
    })
  }
}

export const db = new VokabelDB()
