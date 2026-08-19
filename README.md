# Daily Tracker

A private, fully client-side personal life tracker. Every night: score your day
across your life categories, note what you spent, tick off tasks — under two
minutes. Over weeks and months the dashboard, radar, trends and summaries show
how your life is actually moving.

No login, no backend, no cloud — everything lives in your browser's
localStorage, with JSON export/import for backup.

## Features

- **Daily scores** — 0–10 whole-number score per active category, one entry per
  date, editable forever. Overall score is the plain arithmetic mean.
- **Custom categories** — add, rename, reorder, archive/restore. Archiving
  never destroys history; new categories are only required from the day you
  add them.
- **Life Radar** — dynamic radar chart of today vs your all-time average,
  axes follow your active categories automatically.
- **Score Trends** — overall and per-category line charts over 7 days to
  all time; focus one category or compare several.
- **Spending** — record each day's spending as simple line items (how much,
  and optionally what/where), ₹ formatting, today/week/month/all-time totals
  and a daily bar chart. No budgets, income or bank accounts — deliberately.
- **Tasks** — lightweight to-dos with priority, deadline and daily/weekly/
  monthly recurrence (completing an occurrence schedules the next one).
- **Calendar & History** — month grid showing tracked days, tasks and
  spending; chronological entry history; everything editable.
- **Summaries** — weekly and monthly averages, consistency, spending and
  tasks completed, with neutral mathematical change vs the previous period.
- **Streak** — consecutive tracked days (an entry counts, scores don't).
- **Backup** — export the full dataset as JSON; import validates first and
  offers replace or duplicate-safe merge. Clear-all requires typing DELETE.
- **Light & dark themes**, responsive sidebar/bottom-nav layout, keyboard
  accessible score picker.

## Tech

React 18 · TypeScript · Vite · Recharts · plain CSS (no framework).
Versioned localStorage schema (`daily-tracker.data.v1`) behind a small
external store, so the data layer could later move to a backend unchanged.

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build (static, hosts anywhere)
npm run preview   # serve the production build
```

The build uses hash routing and relative asset paths, so `dist/` works from
any static host or even the filesystem.
