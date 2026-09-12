import { useState } from 'react'
import { Accordion } from '../components/ui/Accordion'
import { Card } from '../components/ui/Card'
import { CaseLegend, GridTable } from '../components/tabellen/GridTable'
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
  const [selected, setSelected] = useState<PossessiveWord>(POSSESSIVE_WORDS[0])
  return (
    <div className="flex flex-col gap-3">
      <SubHeading>Possessivartikel</SubHeading>
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
  return (
    <div className="flex flex-col gap-4">
      <h1 className="headline text-[32px]">Tabellen</h1>
      <CaseLegend />

      <Accordion title="Pronomen" defaultOpen>
        <div className="flex flex-col gap-3">
          <SubHeading>Personalpronomen</SubHeading>
          <p className="text-[12px] text-ink-tertiary">Genitiv bewusst weggelassen — „meiner", „deiner" sind archaisch und nicht B1-relevant.</p>
          <GridTable grid={PERSONALPRONOMEN} caseAxis="columns" />
        </div>

        <div className="flex flex-col gap-3">
          <SubHeading>Reflexivpronomen</SubHeading>
          <p className="text-[12px] text-ink-tertiary">Der Akk/Dat-Unterschied im Singular ist der ganze Grund für diese Tabelle.</p>
          <GridTable grid={REFLEXIVPRONOMEN} caseAxis="columns" />
        </div>

        <div className="flex flex-col gap-3">
          <SubHeading>Bestimmter Artikel</SubHeading>
          <GridTable grid={DEFINITE_ARTICLE} caseAxis="rows" />
        </div>

        <div className="flex flex-col gap-3">
          <SubHeading>Relativpronomen</SubHeading>
          <p className="text-[12px] text-ink-tertiary">Fett markiert: die vier Abweichungen vom bestimmten Artikel.</p>
          <GridTable grid={RELATIVPRONOMEN} caseAxis="rows" />
        </div>

        <PossessiveSection />
      </Accordion>

      <Accordion title="Modalverben">
        <div className="flex flex-col gap-3">
          <SubHeading>Präsens</SubHeading>
          <p className="text-[12px] text-ink-tertiary">1.Sg und 3.Sg sind identisch und nehmen keine Endung; der Singular verliert den Umlaut.</p>
          <GridTable grid={MODAL_PRAESENS} caseAxis="none" />
        </div>

        <div className="flex flex-col gap-3">
          <SubHeading>Präteritum &amp; Konjunktiv II</SubHeading>
          <p className="text-[12px] text-ink-tertiary">Der Umlaut trennt die beiden Spalten.</p>
          <GridTable grid={MODAL_PRAETERITUM_KONJ} caseAxis="none" />
        </div>

        <div className="flex flex-col gap-3">
          {MODAL_USAGE_NOTES.map((note) => (
            <Card key={note.title} className="bg-surface-alt">
              <p className="eyebrow text-[12px]">{note.title}</p>
              <p className="mt-1 text-[14px] text-ink-secondary">{note.text}</p>
            </Card>
          ))}
        </div>
      </Accordion>
    </div>
  )
}
