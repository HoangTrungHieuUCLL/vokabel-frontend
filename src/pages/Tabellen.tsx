import { useState } from 'react'
import { Accordion } from '../components/ui/Accordion'
import { Card } from '../components/ui/Card'
import { CaseLegend, GridTable } from '../components/tabellen/GridTable'
import { useI18n } from '../i18n/I18nContext'
import {
  DEFINITE_ARTICLE,
  MODAL_PRAESENS,
  MODAL_PRAETERITUM_KONJ,
  MODAL_USAGE_NOTES,
  PERSONALPRONOMEN,
  POSSESSIVE_WORDS,
  REFLEXIVPRONOMEN,
  RELATIVPRONOMEN,
  possessiveGrid,
  type PossessiveWord,
} from '../lib/tabellenData'

function SubHeading({ children }: { children: string }) {
  return <h3 className="eyebrow text-[13px] text-ink-secondary">{children}</h3>
}

function PossessiveSection() {
  const { t } = useI18n()
  const [selected, setSelected] = useState<PossessiveWord>(POSSESSIVE_WORDS[0])
  return (
    <div className="flex flex-col gap-3">
      <SubHeading>{t('tabellen.possessivartikel')}</SubHeading>
      <div className="flex flex-wrap gap-2">
        {POSSESSIVE_WORDS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setSelected(w)}
            className={`tap-target press rounded-full border-2 border-ink px-3 font-display text-[12px] font-extrabold uppercase tracking-[0.03em] ${
              selected === w ? 'bg-accent text-white' : 'bg-surface text-ink'
            }`}
          >
            {w}
          </button>
        ))}
      </div>
      <GridTable grid={possessiveGrid(selected)} caseAxis="rows" />
    </div>
  )
}

export function Tabellen() {
  const { t } = useI18n()
  return (
    <div className="flex flex-col gap-4">
      <h1 className="headline text-[32px]">{t('tabellen.title')}</h1>
      <CaseLegend />

      <Accordion title={t('tabellen.pronomen')} defaultOpen>
        <div className="flex flex-col gap-3">
          <SubHeading>{t('tabellen.personalpronomen')}</SubHeading>
          <p className="text-[12px] text-ink-tertiary">{t('tabellen.personalpronomenNote')}</p>
          <GridTable grid={PERSONALPRONOMEN} caseAxis="columns" />
        </div>

        <div className="flex flex-col gap-3">
          <SubHeading>{t('tabellen.reflexivpronomen')}</SubHeading>
          <p className="text-[12px] text-ink-tertiary">{t('tabellen.reflexivpronomenNote')}</p>
          <GridTable grid={REFLEXIVPRONOMEN} caseAxis="columns" />
        </div>

        <div className="flex flex-col gap-3">
          <SubHeading>{t('tabellen.definiteArticle')}</SubHeading>
          <GridTable grid={DEFINITE_ARTICLE} caseAxis="rows" />
        </div>

        <div className="flex flex-col gap-3">
          <SubHeading>{t('tabellen.relativpronomen')}</SubHeading>
          <p className="text-[12px] text-ink-tertiary">{t('tabellen.relativpronomenNote')}</p>
          <GridTable grid={RELATIVPRONOMEN} caseAxis="rows" />
        </div>

        <PossessiveSection />
      </Accordion>

      <Accordion title={t('tabellen.modalverben')}>
        <div className="flex flex-col gap-3">
          <SubHeading>{t('tabellen.praesens')}</SubHeading>
          <p className="text-[12px] text-ink-tertiary">{t('tabellen.praesensNote')}</p>
          <GridTable grid={MODAL_PRAESENS} caseAxis="none" />
        </div>

        <div className="flex flex-col gap-3">
          <SubHeading>{t('tabellen.praeteritumKonj')}</SubHeading>
          <p className="text-[12px] text-ink-tertiary">{t('tabellen.praeteritumKonjNote')}</p>
          <GridTable grid={MODAL_PRAETERITUM_KONJ} caseAxis="none" />
        </div>

        <div className="flex flex-col gap-3">
          {MODAL_USAGE_NOTES.map((note) => (
            <Card key={note.titleKey} className="bg-surface-alt">
              <p className="eyebrow text-[12px]">{t(note.titleKey)}</p>
              <p className="mt-1 text-[14px] text-ink-secondary">{t(note.textKey)}</p>
            </Card>
          ))}
        </div>
      </Accordion>
    </div>
  )
}
