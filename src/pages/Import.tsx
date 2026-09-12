import { useRef, useState } from 'react'
import * as api from '../api/client'
import { ApiError } from '../api/client'
import type { ImportCommitResult, ImportPolicy, ImportPreview } from '../api/types'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useWords } from '../state/WordsContext'

type Step = 'upload' | 'mapping' | 'policy' | 'result'

const TARGET_FIELDS: { key: string; label: string }[] = [
  { key: 'word', label: 'Wort' },
  { key: 'meaning', label: 'Bedeutung' },
  { key: 'type', label: 'Wortart' },
  { key: 'example', label: 'Beispiel' },
  { key: 'tags', label: 'Tags' },
  { key: 'source', label: 'Quelle' },
]

const POLICIES: { value: ImportPolicy; label: string; hint: string }[] = [
  { value: 'skip', label: 'Überspringen', hint: 'Bestehende Wörter bleiben unverändert.' },
  { value: 'overwrite', label: 'Überschreiben', hint: 'Bedeutung, Beispiel, Tags und Quelle werden ersetzt.' },
  { value: 'append_meaning', label: 'Bedeutung anhängen', hint: 'Neue Bedeutung wird an die bestehende angehängt.' },
]

const NOT_MAPPED = ''

export function Import() {
  const { refresh } = useWords()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [policy, setPolicy] = useState<ImportPolicy>('skip')
  const [commitResult, setCommitResult] = useState<ImportCommitResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileSelected(selected: File) {
    setError(null)
    setLoading(true)
    setFile(selected)
    try {
      const result = await api.importPreview(selected)
      setPreview(result)
      setMapping(result.suggested_mapping)
      setStep('mapping')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Datei konnte nicht gelesen werden.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCommit() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.importCommit(file, mapping, policy)
      setCommitResult(result)
      setStep('result')
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Import fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('upload')
    setFile(null)
    setPreview(null)
    setMapping({})
    setPolicy('skip')
    setCommitResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'upload', label: 'Datei' },
    { key: 'mapping', label: 'Zuordnung' },
    { key: 'policy', label: 'Regeln' },
    { key: 'result', label: 'Ergebnis' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <h1 className="headline text-[32px]">Import</h1>

      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div
            key={s.key}
            className={`flex-1 rounded-full border-2 border-ink px-2 py-1 text-center font-display text-[10px] font-extrabold uppercase tracking-[0.03em] ${
              s.key === step ? 'bg-highlight text-ink' : i < steps.findIndex((x) => x.key === step) ? 'bg-positive text-ink' : 'bg-surface text-ink-tertiary'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {error && <p className="text-[13px] font-semibold text-negative-text">{error}</p>}

      {step === 'upload' && (
        <Card className="flex flex-col items-center gap-4 py-10 text-center">
          <p className="text-[14px] text-ink-secondary">CSV oder JSON hochladen (bis 5 MB / 20.000 Zeilen).</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleFileSelected(f)
            }}
            className="hidden"
            id="import-file"
          />
          <Button size="lg" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            {loading ? 'Lädt…' : 'Datei auswählen'}
          </Button>
        </Card>
      )}

      {step === 'mapping' && preview && (
        <div className="flex flex-col gap-4">
          <Card className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
            <span>
              <strong>Encoding:</strong> {preview.encoding}
            </span>
            <span>
              <strong>Trennzeichen:</strong> {preview.delimiter ?? 'JSON'}
            </span>
            <span>
              <strong>Zeilen:</strong> {preview.total_rows}
            </span>
          </Card>

          <div className="flex flex-col gap-2">
            {TARGET_FIELDS.map((field) => (
              <label key={field.key} className="flex items-center justify-between gap-3">
                <span className="eyebrow text-[12px]">{field.label}</span>
                <select
                  value={mapping[field.key] ?? NOT_MAPPED}
                  onChange={(e) => setMapping((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="h-11 flex-1 max-w-56 rounded-[var(--radius-control)] border-2 border-ink bg-surface px-3 text-[14px]"
                >
                  <option value={NOT_MAPPED}>— nicht zugeordnet —</option>
                  {preview.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {preview.sample.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr>
                    {TARGET_FIELDS.map((f) => (
                      <th key={f.key} className="border-b-2 border-ink p-1.5 text-left font-display uppercase text-ink-tertiary">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sample.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-border-soft">
                      {TARGET_FIELDS.map((f) => (
                        <td key={f.key} className="p-1.5 text-ink-secondary">
                          {String(row[f.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Button size="lg" onClick={() => setStep('policy')} disabled={!mapping.word || !mapping.meaning || !mapping.type}>
            Weiter
          </Button>
          {(!mapping.word || !mapping.meaning || !mapping.type) && (
            <p className="text-[12px] font-semibold text-ink-tertiary">Wort, Bedeutung und Wortart müssen zugeordnet sein.</p>
          )}
        </div>
      )}

      {step === 'policy' && preview && (
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-1 text-[13px]">
            <p>
              <strong>{preview.duplicates_in_db}</strong> Duplikate bereits in der Datenbank
            </p>
            <p>
              <strong>{preview.duplicates_in_file}</strong> Duplikate innerhalb der Datei
            </p>
            <p>
              <strong>{preview.row_errors.length}</strong> fehlerhafte Zeilen erkannt
            </p>
          </Card>

          {preview.row_errors.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-[var(--radius-control)] border-2 border-border-soft p-2 text-[12px] text-ink-tertiary">
              {preview.row_errors.map((e) => (
                <p key={e.row}>
                  Zeile {e.row}: {e.reason}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="eyebrow text-[12px]">Bei Duplikaten</span>
            {POLICIES.map((p) => (
              <label key={p.value} className="flex items-start gap-2 rounded-[var(--radius-control)] border-2 border-ink p-3">
                <input type="radio" name="policy" checked={policy === p.value} onChange={() => setPolicy(p.value)} className="mt-1" />
                <span>
                  <span className="block font-bold text-ink">{p.label}</span>
                  <span className="block text-[12px] text-ink-tertiary">{p.hint}</span>
                </span>
              </label>
            ))}
          </div>

          <Button size="lg" onClick={handleCommit} disabled={loading}>
            {loading ? 'Importiert…' : 'Import starten'}
          </Button>
        </div>
      )}

      {step === 'result' && commitResult && (
        <div className="flex flex-col gap-4">
          {commitResult.rolled_back && (
            <Card className="border-negative bg-negative-soft">
              <p className="font-bold text-negative-text">Mehr als die Hälfte der Zeilen war fehlerhaft — nichts wurde importiert.</p>
            </Card>
          )}
          <div className="grid grid-cols-3 gap-2">
            <Card className="text-center">
              <p className="headline text-[28px]">{commitResult.inserted}</p>
              <p className="eyebrow text-[11px] text-ink-tertiary">Neu</p>
            </Card>
            <Card className="text-center">
              <p className="headline text-[28px]">{commitResult.updated}</p>
              <p className="eyebrow text-[11px] text-ink-tertiary">Aktualisiert</p>
            </Card>
            <Card className="text-center">
              <p className="headline text-[28px]">{commitResult.skipped}</p>
              <p className="eyebrow text-[11px] text-ink-tertiary">Übersprungen</p>
            </Card>
          </div>

          {commitResult.errors.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="eyebrow text-[12px]">{commitResult.errors.length} Fehler</span>
              <div className="max-h-48 overflow-y-auto rounded-[var(--radius-control)] border-2 border-border-soft p-2 text-[12px] text-ink-tertiary">
                {commitResult.errors.map((e) => (
                  <p key={e.row}>
                    Zeile {e.row}: {e.reason}
                  </p>
                ))}
              </div>
            </div>
          )}

          <Button size="lg" onClick={reset}>
            Weitere Datei importieren
          </Button>
        </div>
      )}
    </div>
  )
}
