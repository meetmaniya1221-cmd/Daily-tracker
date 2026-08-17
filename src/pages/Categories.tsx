import { useMemo, useState, type FormEvent } from 'react'
import { toast } from '../components/Toaster'
import { Card, ConfirmDialog, EmptyState } from '../components/ui'
import {
  IconArchive,
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconEdit,
  IconPlus,
  IconRestore,
  IconX,
} from '../components/Icons'
import type { Category } from '../types'
import { timestampToLocalDate } from '../lib/date'
import { seriesColor } from '../lib/palette'
import { activeCategories, archivedCategories } from '../lib/selectors'
import {
  addCategory,
  archiveCategory,
  moveCategory,
  renameCategory,
  restoreCategory,
  useAppData,
  type CategoryError,
} from '../lib/store'
import { useEffectiveTheme } from '../lib/theme'

function errorMessage(err: CategoryError): string {
  switch (err) {
    case 'empty':
      return 'Category name cannot be empty.'
    case 'duplicate':
      return 'A category with this name already exists.'
    case 'last-active':
      return 'At least one active category is needed for daily tracking.'
  }
}

export function Categories() {
  const data = useAppData()
  const theme = useEffectiveTheme()
  const active = activeCategories(data)
  const archived = archivedCategories(data)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmArchive, setConfirmArchive] = useState<Category | null>(null)

  // Days each category was actually scored — shown so archiving feels safe.
  const usage = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of Object.values(data.entries)) {
      for (const id of Object.keys(e.scores)) {
        map.set(id, (map.get(id) ?? 0) + 1)
      }
    }
    return map
  }, [data.entries])

  const onAdd = (e: FormEvent) => {
    e.preventDefault()
    const err = addCategory(newName)
    if (err) {
      toast(errorMessage(err), 'error')
      return
    }
    setNewName('')
    toast('Category added — it now appears in new daily entries')
  }

  const startEdit = (c: Category) => {
    setEditingId(c.id)
    setEditName(c.name)
  }

  const saveEdit = () => {
    if (!editingId) return
    const err = renameCategory(editingId, editName)
    if (err) {
      toast(errorMessage(err), 'error')
      return
    }
    setEditingId(null)
    toast('Category renamed — history keeps the new name')
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Categories</h1>
          <p className="page-sub">The areas of life you score every day</p>
        </div>
      </header>

      <Card title="Add Category">
        <form className="add-form" onSubmit={onAdd}>
          <input
            type="text"
            className="input"
            placeholder="e.g. Sleep"
            aria-label="New category name"
            value={newName}
            maxLength={60}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={!newName.trim()}>
            <IconPlus size={15} /> Add
          </button>
        </form>
        <p className="field-hint">
          New categories are required from today onward — past entries stay valid without them.
        </p>
      </Card>

      <Card title="Active" subtitle={`${active.length} categor${active.length === 1 ? 'y' : 'ies'} scored daily`}>
        <ul className="cat-list">
          {active.map((c, i) => (
            <li key={c.id} className="cat-row">
              <span className="cat-dot" style={{ background: seriesColor(c.colorSlot, theme) }} />
              {editingId === c.id ? (
                <>
                  <input
                    type="text"
                    className="input cat-edit-input"
                    value={editName}
                    maxLength={60}
                    autoFocus
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit()
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                  />
                  <div className="cat-actions">
                    <button type="button" className="icon-btn" aria-label="Save name" onClick={saveEdit}>
                      <IconCheck size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Cancel rename"
                      onClick={() => setEditingId(null)}
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="cat-info">
                    <span className="cat-name">{c.name}</span>
                    <span className="cat-usage">
                      {usage.get(c.id) ?? 0} day{(usage.get(c.id) ?? 0) === 1 ? '' : 's'} recorded
                    </span>
                  </div>
                  <div className="cat-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Move ${c.name} up`}
                      disabled={i === 0}
                      onClick={() => moveCategory(c.id, -1)}
                    >
                      <IconArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Move ${c.name} down`}
                      disabled={i === active.length - 1}
                      onClick={() => moveCategory(c.id, 1)}
                    >
                      <IconArrowDown size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Rename ${c.name}`}
                      onClick={() => startEdit(c)}
                    >
                      <IconEdit size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Archive ${c.name}`}
                      onClick={() => setConfirmArchive(c)}
                    >
                      <IconArchive size={15} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Archived" subtitle="No longer scored — history fully preserved">
        {archived.length === 0 ? (
          <EmptyState title="Nothing archived" />
        ) : (
          <ul className="cat-list">
            {archived.map((c) => (
              <li key={c.id} className="cat-row cat-row-archived">
                <span className="cat-dot" style={{ background: seriesColor(c.colorSlot, theme) }} />
                <div className="cat-info">
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-usage">
                    {usage.get(c.id) ?? 0} day{(usage.get(c.id) ?? 0) === 1 ? '' : 's'} recorded
                    {c.archivedAt ? ` · archived ${timestampToLocalDate(c.archivedAt)}` : ''}
                  </span>
                </div>
                <div className="cat-actions">
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() => {
                      restoreCategory(c.id)
                      toast(`${c.name} restored — required in new entries again`)
                    }}
                  >
                    <IconRestore size={14} /> Restore
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {confirmArchive && (
        <ConfirmDialog
          title={`Archive ${confirmArchive.name}?`}
          body={
            <p>
              It will stop appearing in new daily entries, the radar and future charts. All{' '}
              {usage.get(confirmArchive.id) ?? 0} recorded day
              {(usage.get(confirmArchive.id) ?? 0) === 1 ? '' : 's'} stay in your history, and you
              can restore it any time.
            </p>
          }
          confirmLabel="Archive"
          onConfirm={() => {
            const err = archiveCategory(confirmArchive.id)
            if (err) toast(errorMessage(err), 'error')
            else toast(`${confirmArchive.name} archived — history preserved`)
            setConfirmArchive(null)
          }}
          onCancel={() => setConfirmArchive(null)}
        />
      )}
    </div>
  )
}
