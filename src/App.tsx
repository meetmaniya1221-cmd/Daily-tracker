import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Toaster } from './components/Toaster'
import { runRecurringCatchUp } from './lib/store'
import { useEffectiveTheme } from './lib/theme'
import { Dashboard } from './pages/Dashboard'
import { DailyEntry } from './pages/DailyEntry'
import { History } from './pages/History'
import { Trends } from './pages/Trends'
import { Spending } from './pages/Spending'
import { Tasks } from './pages/Tasks'
import { CalendarPage } from './pages/CalendarPage'
import { Summary } from './pages/Summary'
import { Categories } from './pages/Categories'
import { Settings } from './pages/Settings'

export function App() {
  const theme = useEffectiveTheme()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    runRecurringCatchUp()
  }, [])

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/entry" element={<DailyEntry />} />
          <Route path="/history" element={<History />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/spending" element={<Spending />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster />
    </HashRouter>
  )
}
