import { Accordion } from '../components/ui/Accordion'
import { useI18n } from '../i18n/I18nContext'
import { GRAMMAR_TOPICS } from '../lib/grammarData'

export function Grammar() {
  const { t, locale } = useI18n()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="headline text-[32px]">{t('grammar.title')}</h1>
      <p className="text-[13px] text-ink-tertiary">{t('grammar.subtitle')}</p>

      {GRAMMAR_TOPICS.map((topic, i) => (
        <Accordion key={topic.id} title={t(topic.titleKey)} defaultOpen={i === 0}>
          {topic.blocks.map((block, j) => {
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
          })}
        </Accordion>
      ))}
    </div>
  )
}
