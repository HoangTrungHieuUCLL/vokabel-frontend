import { Link } from 'react-router-dom'
import type { Word } from '../api/types'
import { useI18n } from '../i18n/I18nContext'
import type { MatchField } from '../lib/search'
import { TypeChip } from './ui/TypeChip'
import { FlagIcon } from './icons'

interface WordRowProps {
  word: Word
  onToggleHard: () => void
  matchField?: MatchField
  matchStart?: number
  matchEnd?: number
}

function Highlighted({ text, start, end }: { text: string; start: number; end: number }) {
  if (end <= start) return <>{text}</>
  return (
    <>
      {text.slice(0, start)}
      <mark>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  )
}

export function WordRow({ word, onToggleHard, matchField, matchStart, matchEnd }: WordRowProps) {
  const { t } = useI18n()
  const meaningHighlighted = matchField === 'meaning' && matchStart !== undefined && matchEnd !== undefined
  const exampleHighlighted = matchField === 'example' && matchStart !== undefined && matchEnd !== undefined

  return (
    <li>
      <Link
        to={`/word/${word.id}`}
        className="tap-target flex items-center gap-3 rounded-[var(--radius-control)] border-2 border-ink bg-surface px-3 py-2 press"
      >
        <TypeChip type={word.type} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-ink">{word.word}</p>
          <p className="truncate text-[13px] text-ink-secondary">
            {meaningHighlighted ? (
              <Highlighted text={word.meaning} start={matchStart} end={matchEnd} />
            ) : (
              word.meaning
            )}
            {!meaningHighlighted && exampleHighlighted && word.example && (
              <>
                {' — '}
                <Highlighted text={word.example} start={matchStart} end={matchEnd} />
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleHard()
          }}
          aria-label={t('search.toggleHardAria')}
          aria-pressed={word.is_hard}
          className="tap-target flex items-center justify-center rounded-full"
        >
          <FlagIcon
            className="h-5 w-5"
            style={{ color: word.is_hard ? 'var(--color-negative)' : 'var(--color-ink-placeholder)' }}
            fill={word.is_hard ? 'var(--color-negative)' : 'none'}
          />
        </button>
      </Link>
    </li>
  )
}
