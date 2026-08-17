import { useRef, useState, type ChangeEvent } from 'react'
import { toast } from '../components/Toaster'
import { Card, Modal, Segmented } from '../components/ui'
import { IconAlertTriangle, IconDownload, IconUpload } from '../components/Icons'
import { formatMedium } from '../lib/date'
import { downloadBackup, parseBackup, type ParsedBackup } from '../lib/backup'
import { storageAvailable } from '../lib/storage'
import {
  clearAllData,
  mergeImportedData,
  replaceAllData,
  setTheme,
  useAppData,
  usePersistState,
} from '../lib/store'
import { countData } from '../lib/validate'

type ThemeChoice = 'light' | 'dark' | 'system'

export function Settings() {
  const data = useAppData()
  const persist = usePersistState()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<Extract<ParsedBackup, { ok: true }> | null>(
    null,
  )
  const [clearOpen, setClearOpen] = useState(false)
  const [clearText, setClearText] = useState('')

  const themeChoice: ThemeChoice = data.settings.theme ?? 'system'
  const counts = countData(data)
  const sizeKB = Math.max(1, Math.round(JSON.stringify(data).length / 1024))

  const onExport = () => {
    downloadBackup(data)
    toast('Backup downloaded')
  }

  const onFilePicked = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    let text: string
    try {
      text = await file.text()
    } catch {
      toast('Could not read the selected file.', 'error')
      return
    }
    const parsed = parseBackup(text)
    if (!parsed.ok) {
      toast(parsed.error, 'error')
      return
    }
    setPendingImport(parsed)
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Settings</h1>
          <p className="page-sub">Theme, backups and data</p>
        </div>
      </header>

      <Card title="Appearance">
        <Segmented<ThemeChoice>
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
          value={themeChoice}
          onChange={(v) => setTheme(v === 'system' ? null : v)}
          ariaLabel="Theme"
        />
        <p className="field-hint">System follows your device's light/dark preference.</p>
      </Card>

      <Card title="Backup">
        <div className="settings-actions">
          <button type="button" className="btn btn-primary" onClick={onExport}>
            <IconDownload size={15} /> Export data
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            <IconUpload size={15} /> Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="visually-hidden"
            aria-label="Choose backup file"
            onChange={onFilePicked}
          />
        </div>
        <p className="field-hint">
          Everything lives in this browser's local storage — export a JSON backup regularly. Imports
          are validated first and never applied without your confirmation.
        </p>
      </Card>

      <Card title="Stored Data">
        <ul className="data-facts">
          <li>
            <span>Daily entries</span>
            <b>{counts.entries}</b>
          </li>
          <li>
            <span>Spending days</span>
            <b>{counts.spending}</b>
          </li>
          <li>
            <span>Tasks</span>
            <b>{counts.tasks}</b>
          </li>
          <li>
            <span>Categories</span>
            <b>{counts.categories}</b>
          </li>
          <li>
            <span>Approximate size</span>
            <b>{sizeKB} KB</b>
          </li>
          <li>
            <span>Storage</span>
            <b>
              {!storageAvailable
                ? 'Unavailable'
                : persist === 'quota'
                  ? 'Full — not saving!'
                  : 'Saving locally'}
            </b>
          </li>
        </ul>
      </Card>

      <Card title="Danger Zone">
        <button type="button" className="btn btn-danger" onClick={() => setClearOpen(true)}>
          <IconAlertTriangle size={15} /> Clear all data
        </button>
        <p className="field-hint">
          Deletes every entry, spending record, task and custom category from this browser.
        </p>
      </Card>

      {pendingImport && (
        <Modal title="Import backup" onClose={() => setPendingImport(null)}>
          <p className="confirm-body">
            {pendingImport.exportedAt
              ? `Backup exported ${formatMedium(pendingImport.exportedAt.slice(0, 10))}. `
              : ''}
            It contains <b>{pendingImport.counts.entries}</b> daily entries
            {pendingImport.counts.firstEntry &&
              pendingImport.counts.lastEntry &&
              ` (${formatMedium(pendingImport.counts.firstEntry)} – ${formatMedium(
                pendingImport.counts.lastEntry,
              )})`}
            , <b>{pendingImport.counts.spending}</b> spending days,{' '}
            <b>{pendingImport.counts.tasks}</b> tasks and{' '}
            <b>{pendingImport.counts.categories}</b> categories.
          </p>
          <p className="confirm-body">
            Your current data: <b>{counts.entries}</b> entries, <b>{counts.spending}</b> spending
            days, <b>{counts.tasks}</b> tasks, <b>{counts.categories}</b> categories.
          </p>
          <p className="confirm-body">
            <b>Replace</b> overwrites everything with the backup. <b>Merge</b> combines both,
            keeping the newer version of any day that exists in both.
          </p>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={() => setPendingImport(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                mergeImportedData(pendingImport.data)
                setPendingImport(null)
                toast('Backup merged into your data')
              }}
            >
              Merge
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                replaceAllData(pendingImport.data)
                setPendingImport(null)
                toast('Data replaced from backup')
              }}
            >
              Replace
            </button>
          </div>
        </Modal>
      )}

      {clearOpen && (
        <Modal
          title="Clear all data?"
          onClose={() => {
            setClearOpen(false)
            setClearText('')
          }}
        >
          <p className="confirm-body">
            This permanently deletes <b>{counts.entries}</b> daily entries,{' '}
            <b>{counts.spending}</b> spending records, <b>{counts.tasks}</b> tasks and your custom
            categories from this browser. There is no undo — export a backup first if in doubt.
          </p>
          <label className="field-label" htmlFor="clear-confirm">
            Type <b>DELETE</b> to confirm
          </label>
          <input
            id="clear-confirm"
            type="text"
            className="input"
            value={clearText}
            onChange={(e) => setClearText(e.target.value)}
            autoComplete="off"
          />
          <div className="modal-footer">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setClearOpen(false)
                setClearText('')
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={clearText !== 'DELETE'}
              onClick={() => {
                clearAllData()
                setClearOpen(false)
                setClearText('')
                toast('All data cleared')
              }}
            >
              Clear everything
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
