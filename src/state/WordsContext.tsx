import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as api from '../api/client'
import { ApiError } from '../api/client'
import { db } from '../db/dexie'
import type { Word, WordCreate, WordUpdate } from '../api/types'

const UNDO_WINDOW_MS = 5000

interface WordsContextValue {
  words: Word[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  addWord: (body: WordCreate) => Promise<Word>
  patchWord: (id: number, body: WordUpdate) => Promise<Word>
  toggleHard: (id: number) => Promise<void>
  getWord: (id: number) => Word | undefined
  hardCount: number
  /** Hides the word immediately; the actual DELETE only fires after the undo window. */
  scheduleDelete: (id: number) => void
  undoDelete: () => void
  pendingDelete: Word | null
}

const WordsContext = createContext<WordsContextValue | null>(null)

function sortByRecency(words: Word[]): Word[] {
  return [...words].sort((a, b) => {
    const byDate = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return byDate !== 0 ? byDate : b.id - a.id
  })
}

export function WordsProvider({ children }: { children: ReactNode }) {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const cached = await db.words.toArray()
      const fromCache = cached.filter((w) => w.deleted_at === null)
      if (fromCache.length > 0) setWords(sortByRecency(fromCache))

      const fresh = await api.listWords()
      await db.words.clear()
      await db.words.bulkPut(fresh)
      setWords(sortByRecency(fresh))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load words')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addWord = useCallback(async (body: WordCreate) => {
    const created = await api.createWord(body)
    await db.words.put(created)
    setWords((prev) => sortByRecency([created, ...prev]))
    return created
  }, [])

  const patchWord = useCallback(async (id: number, body: WordUpdate) => {
    const updated = await api.updateWord(id, body)
    await db.words.put(updated)
    setWords((prev) => sortByRecency(prev.map((w) => (w.id === id ? updated : w))))
    return updated
  }, [])

  const pendingDeleteRef = useRef<{ word: Word; timer: ReturnType<typeof setTimeout> } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Word | null>(null)

  const commitPendingDelete = useCallback(async () => {
    const pending = pendingDeleteRef.current
    if (!pending) return
    pendingDeleteRef.current = null
    setPendingDelete(null)
    try {
      await api.deleteWord(pending.word.id)
      await db.words.delete(pending.word.id)
    } catch {
      // deletion failed -- put it back rather than lose it silently
      setWords((prev) => sortByRecency([...prev, pending.word]))
    }
  }, [])

  // Soft delete makes undo trivial without any backend "restore" call: the
  // word disappears from the list immediately, but the actual DELETE only
  // fires once the undo window has passed.
  const scheduleDelete = useCallback(
    (id: number) => {
      const word = words.find((w) => w.id === id)
      if (!word) return
      if (pendingDeleteRef.current) {
        clearTimeout(pendingDeleteRef.current.timer)
        void commitPendingDelete()
      }
      setWords((prev) => prev.filter((w) => w.id !== id))
      const timer = setTimeout(() => void commitPendingDelete(), UNDO_WINDOW_MS)
      pendingDeleteRef.current = { word, timer }
      setPendingDelete(word)
    },
    [words, commitPendingDelete],
  )

  const undoDelete = useCallback(() => {
    const pending = pendingDeleteRef.current
    if (!pending) return
    clearTimeout(pending.timer)
    pendingDeleteRef.current = null
    setPendingDelete(null)
    setWords((prev) => sortByRecency([...prev, pending.word]))
  }, [])

  useEffect(() => {
    return () => {
      if (pendingDeleteRef.current) clearTimeout(pendingDeleteRef.current.timer)
    }
  }, [])

  const toggleHard = useCallback(
    async (id: number) => {
      const current = words.find((w) => w.id === id)
      if (!current) return
      const nextIsHard = !current.is_hard
      const optimistic: Word = {
        ...current,
        is_hard: nextIsHard,
        hard_since: nextIsHard ? new Date().toISOString() : null,
      }
      setWords((prev) => prev.map((w) => (w.id === id ? optimistic : w)))
      try {
        const updated = await api.updateWord(id, { is_hard: nextIsHard })
        await db.words.put(updated)
        setWords((prev) => prev.map((w) => (w.id === id ? updated : w)))
      } catch (err) {
        setWords((prev) => prev.map((w) => (w.id === id ? current : w)))
        throw err
      }
    },
    [words],
  )

  const getWord = useCallback((id: number) => words.find((w) => w.id === id), [words])

  const hardCount = useMemo(() => words.filter((w) => w.is_hard).length, [words])

  const value = useMemo<WordsContextValue>(
    () => ({
      words,
      loading,
      error,
      refresh,
      addWord,
      patchWord,
      toggleHard,
      getWord,
      hardCount,
      scheduleDelete,
      undoDelete,
      pendingDelete,
    }),
    [words, loading, error, refresh, addWord, patchWord, toggleHard, getWord, hardCount, scheduleDelete, undoDelete, pendingDelete],
  )

  return <WordsContext value={value}>{children}</WordsContext>
}

export function useWords(): WordsContextValue {
  const ctx = use(WordsContext)
  if (!ctx) throw new Error('useWords must be used within WordsProvider')
  return ctx
}

export { ApiError }
