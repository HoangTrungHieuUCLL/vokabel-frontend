import { useMemo, useState } from 'react'
import { Accordion } from '../components/ui/Accordion'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input, TextArea } from '../components/ui/Input'
import { PlusIcon, SearchIcon } from '../components/icons'
import { useI18n } from '../i18n/I18nContext'
import { GRAMMAR_TOPICS, type GrammarTopic } from '../lib/grammarData'
import { loadCustomGrammarTopics, saveCustomGrammarTopics, type CustomGrammarTopic } from '../lib/customGrammar'

type GrammarEntry = { id: string; title: string; topic?: GrammarTopic; custom?: CustomGrammarTopic }

export function Grammar() {
  const { t, locale } = useI18n()
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [customTopics, setCustomTopics] = useState<CustomGrammarTopic[]>(() => loadCustomGrammarTopics())
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')

  const entries = useMemo<GrammarEntry[]>(
    () => [
      ...GRAMMAR_TOPICS.map((topic) => ({ id: topic.id, title: t(topic.titleKey), topic })),
      ...customTopics.map((topic) => ({ id: topic.id, title: topic.title, custom: topic })),
    ],
    [t, customTopics],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((entry) => entry.title.toLowerCase().includes(q))
  }, [entries, query])

  function addSection() {
    if (!newTitle.trim() || !newBody.trim()) return
    const topic: CustomGrammarTopic = { id: crypto.randomUUID(), title: newTitle.trim(), body: newBody.trim() }
    const next = [...customTopics, topic]
    setCustomTopics(next)
    saveCustomGrammarTopics(next)
    setNewTitle('')
    setNewBody('')
    setAdding(false)
    setOpenId(topic.id)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="headline text-[32px]">{t('grammar.title')}</h1>
      <p className="text-[13px] text-ink-tertiary">{t('grammar.subtitle')}</p>

      <div className="flex items-center gap-2 rounded-[var(--radius-control)] border-2 border-ink bg-surface px-3 py-1 text-ink">
        <SearchIcon className="pointer-events-none h-5 w-5 shrink-0 text-ink-tertiary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('grammar.searchPlaceholder')}
          className="h-8 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-placeholder focus:outline-none"
        />
      </div>

      {filtered.length === 0 && <p className="text-[14px] text-ink-tertiary">{t('search.noResults')}</p>}

      {filtered.map((entry, i) => (
        <Accordion
          key={entry.id}
          title={`${i + 1}. ${entry.title}`}
          open={openId === entry.id}
          onToggle={() => setOpenId((o) => (o === entry.id ? null : entry.id))}
        >
          {entry.topic
            ? entry.topic.blocks.map((block, j) => {
                if (block.type === 'p') {
                  return (
                    <p key={j} className="text-[14px] leading-relaxed text-ink-secondary">
                      {block.text[locale]}
                    </p>
                  )
                }
                return (
                  <div key={j} className="flex flex-col gap-2 rounded-[var(--radius-control)] border-2 border-border-soft p-3">
                    <span className="eyebrow text-[11px] text-ink-tertiary">{t('grammar.example')}</span>
                    {block.items.map((item, k) => (
                      <div key={k}>
                        <p className="text-[14px] font-semibold text-ink">{item.de}</p>
                        {locale === 'en' && <p className="text-[13px] text-ink-tertiary">{item.en}</p>}
                      </div>
                    ))}
                  </div>
                )
              })
            : entry.custom && <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink-secondary">{entry.custom.body}</p>}
        </Accordion>
      ))}

      {adding ? (
        <Card className="flex flex-col gap-3">
          <Input id="grammar-new-title" label={t('grammar.newSectionTitleLabel')} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <TextArea id="grammar-new-body" label={t('grammar.newSectionBodyLabel')} rows={4} value={newBody} onChange={(e) => setNewBody(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setAdding(false)}>
              {t('detail.cancel')}
            </Button>
            <Button className="flex-1" onClick={addSection} disabled={!newTitle.trim() || !newBody.trim()}>
              {t('add.save')}
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="secondary" onClick={() => setAdding(true)}>
          <PlusIcon className="h-4 w-4" /> {t('grammar.addSection')}
        </Button>
      )}
    </div>
  )
}
