import { useMemo, useState, type FormEvent } from 'react'
import { toast } from '../components/Toaster'
import {
  Card,
  ConfirmDialog,
  EmptyState,
  Modal,
  PriorityBadge,
} from '../components/ui'
import { IconEdit, IconPlus, IconRepeat, IconTrash } from '../components/Icons'
import type { Priority, RecurrenceFreq, Task } from '../types'
import { diffDays, formatMedium, relativeLabel, todayKey } from '../lib/date'
import {
  addTask,
  deleteTask,
  setTaskCompleted,
  updateTask,
  useAppData,
} from '../lib/store'

const FREQ_LABEL: Record<RecurrenceFreq, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

function deadlineText(t: Task, today: string): { text: string; overdue: boolean } {
  if (!t.deadline) return { text: 'No deadline', overdue: false }
  const rel = relativeLabel(t.deadline, today)
  if (t.deadline < today && !t.completed) {
    const days = diffDays(t.deadline, today)
    return { text: `Overdue by ${days} day${days === 1 ? '' : 's'}`, overdue: true }
  }
  return { text: rel ?? formatMedium(t.deadline), overdue: false }
}

function TaskRow({
  task,
  today,
  onEdit,
  onDelete,
}: {
  task: Task
  today: string
  onEdit: () => void
  onDelete: () => void
}) {
  const dl = deadlineText(task, today)
  return (
    <li className="task-row">
      <label className="task-check">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => setTaskCompleted(task.id, e.target.checked)}
        />
        <span className={`task-title${task.completed ? ' task-done' : ''}`}>{task.title}</span>
      </label>
      <div className="task-meta">
        {task.recurrence && (
          <span className="task-repeat" title={`Repeats ${FREQ_LABEL[task.recurrence.freq].toLowerCase()}`}>
            <IconRepeat size={13} /> {FREQ_LABEL[task.recurrence.freq]}
          </span>
        )}
        <PriorityBadge priority={task.priority} />
        <span className={`task-deadline${dl.overdue ? ' task-overdue' : ''}`}>{dl.text}</span>
      </div>
      <div className="task-actions">
        <button type="button" className="icon-btn" aria-label={`Edit task: ${task.title}`} onClick={onEdit}>
          <IconEdit size={15} />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={`Delete task: ${task.title}`}
          onClick={onDelete}
        >
          <IconTrash size={15} />
        </button>
      </div>
    </li>
  )
}

export function Tasks() {
  const data = useAppData()
  const today = todayKey()
  const [editing, setEditing] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState<Task | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  const groups = useMemo(() => {
    const pending = data.tasks.filter((t) => !t.completed)
    const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
    const sortPending = (a: Task, b: Task) =>
      (a.deadline ?? '9999') < (b.deadline ?? '9999')
        ? -1
        : (a.deadline ?? '9999') > (b.deadline ?? '9999')
          ? 1
          : priorityRank[a.priority] - priorityRank[b.priority]
    return {
      overdue: pending.filter((t) => t.deadline && t.deadline < today).sort(sortPending),
      dueToday: pending.filter((t) => t.deadline === today).sort(sortPending),
      upcoming: pending.filter((t) => t.deadline && t.deadline > today).sort(sortPending),
      someday: pending.filter((t) => !t.deadline).sort(sortPending),
      completed: data.tasks
        .filter((t) => t.completed)
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    }
  }, [data.tasks, today])

  const todayAll = data.tasks.filter((t) => t.deadline === today)
  const todayDone = todayAll.filter((t) => t.completed).length

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Tasks</h1>
          <p className="page-sub">
            {todayAll.length > 0
              ? `Today: ${todayDone} / ${todayAll.length} completed`
              : 'A light to-do list — not a project manager'}
          </p>
        </div>
      </header>

      <Card title="Add Task">
        <AddTaskForm />
      </Card>

      {groups.overdue.length > 0 && (
        <Card title="Overdue">
          <ul className="task-list">
            {groups.overdue.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                today={today}
                onEdit={() => setEditing(t)}
                onDelete={() => setDeleting(t)}
              />
            ))}
          </ul>
        </Card>
      )}

      <Card title="Today" subtitle={todayAll.length > 0 ? `${todayDone} / ${todayAll.length} completed` : undefined}>
        {groups.dueToday.length === 0 && todayAll.length === 0 ? (
          <EmptyState title="Nothing due today" />
        ) : (
          <ul className="task-list">
            {groups.dueToday.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                today={today}
                onEdit={() => setEditing(t)}
                onDelete={() => setDeleting(t)}
              />
            ))}
            {todayAll
              .filter((t) => t.completed)
              .map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  today={today}
                  onEdit={() => setEditing(t)}
                  onDelete={() => setDeleting(t)}
                />
              ))}
          </ul>
        )}
      </Card>

      {groups.upcoming.length > 0 && (
        <Card title="Upcoming">
          <ul className="task-list">
            {groups.upcoming.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                today={today}
                onEdit={() => setEditing(t)}
                onDelete={() => setDeleting(t)}
              />
            ))}
          </ul>
        </Card>
      )}

      {groups.someday.length > 0 && (
        <Card title="No Deadline">
          <ul className="task-list">
            {groups.someday.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                today={today}
                onEdit={() => setEditing(t)}
                onDelete={() => setDeleting(t)}
              />
            ))}
          </ul>
        </Card>
      )}

      {groups.completed.length > 0 && (
        <Card
          title="Completed"
          actions={
            <button
              type="button"
              className="btn btn-small"
              onClick={() => setShowCompleted((v) => !v)}
            >
              {showCompleted ? 'Hide' : `Show (${groups.completed.length})`}
            </button>
          }
        >
          {showCompleted && (
            <ul className="task-list">
              {groups.completed.slice(0, 50).map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  today={today}
                  onEdit={() => setEditing(t)}
                  onDelete={() => setDeleting(t)}
                />
              ))}
            </ul>
          )}
        </Card>
      )}

      {editing && <TaskModal task={editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Delete task?"
          body={
            <p>
              “{deleting.title}” will be removed permanently
              {deleting.recurrence ? ' (only this occurrence — the series continues from its next occurrence, if one exists)' : ''}.
            </p>
          }
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            deleteTask(deleting.id)
            setDeleting(null)
            toast('Task deleted')
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}

function AddTaskForm() {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [deadline, setDeadline] = useState('')
  const [freq, setFreq] = useState<RecurrenceFreq | ''>('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask({
      title,
      priority,
      deadline: deadline || undefined,
      recurrence: freq || null,
    })
    setTitle('')
    setDeadline('')
    setFreq('')
    setPriority('medium')
    toast('Task added')
  }

  return (
    <form className="task-form" onSubmit={submit}>
      <input
        type="text"
        className="input task-form-title"
        placeholder="What needs doing?"
        aria-label="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
      />
      <div className="task-form-row">
        <label className="field">
          <span className="field-label">Priority</span>
          <select
            className="input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">Deadline</span>
          <input
            type="date"
            className="input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Repeat</span>
          <select
            className="input"
            value={freq}
            onChange={(e) => setFreq(e.target.value as RecurrenceFreq | '')}
          >
            <option value="">Never</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
          <IconPlus size={15} /> Add
        </button>
      </div>
      {freq && (
        <p className="field-hint">
          Repeats {FREQ_LABEL[freq].toLowerCase()}. Completing an occurrence schedules the next one
          automatically{deadline ? '' : ' (deadline defaults to today)'}.
        </p>
      )}
    </form>
  )
}

function TaskModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [deadline, setDeadline] = useState(task.deadline ?? '')
  const [freq, setFreq] = useState<RecurrenceFreq | ''>(task.recurrence?.freq ?? '')

  const save = () => {
    if (!title.trim()) return
    updateTask(task.id, {
      title,
      priority,
      deadline: deadline || '',
      recurrence: freq || null,
    })
    toast('Task updated')
    onClose()
  }

  return (
    <Modal title="Edit Task" onClose={onClose}>
      <label className="field">
        <span className="field-label">Title</span>
        <input
          type="text"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
      </label>
      <div className="task-form-row">
        <label className="field">
          <span className="field-label">Priority</span>
          <select
            className="input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">Deadline</span>
          <input
            type="date"
            className="input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Repeat</span>
          <select
            className="input"
            value={freq}
            onChange={(e) => setFreq(e.target.value as RecurrenceFreq | '')}
          >
            <option value="">Never</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
      </div>
      {freq && !deadline && (
        <p className="field-hint">Recurring tasks need a deadline — it will default to today.</p>
      )}
      <div className="modal-footer">
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" disabled={!title.trim()} onClick={save}>
          Save
        </button>
      </div>
    </Modal>
  )
}
