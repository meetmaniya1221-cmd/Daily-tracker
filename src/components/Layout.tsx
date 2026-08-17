import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { setTheme, usePersistState } from '../lib/store'
import { useEffectiveTheme } from '../lib/theme'
import {
  IconAlertTriangle,
  IconBarChart,
  IconCalendar,
  IconDashboard,
  IconHistory,
  IconMoon,
  IconMore,
  IconPencil,
  IconRupee,
  IconSettings,
  IconSun,
  IconTag,
  IconTasks,
  IconTrendingUp,
  IconX,
} from './Icons'

const NAV = [
  { to: '/', label: 'Dashboard', icon: IconDashboard },
  { to: '/entry', label: 'Daily Entry', icon: IconPencil },
  { to: '/history', label: 'History', icon: IconHistory },
  { to: '/trends', label: 'Trends', icon: IconTrendingUp },
  { to: '/spending', label: 'Spending', icon: IconRupee },
  { to: '/tasks', label: 'Tasks', icon: IconTasks },
  { to: '/calendar', label: 'Calendar', icon: IconCalendar },
  { to: '/summary', label: 'Summary', icon: IconBarChart },
  { to: '/categories', label: 'Categories', icon: IconTag },
  { to: '/settings', label: 'Settings', icon: IconSettings },
]

const MOBILE_PRIMARY = ['/', '/entry', '/tasks', '/trends']

function ThemeToggle() {
  const theme = useEffectiveTheme()
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
    </button>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const persist = usePersistState()
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMoreOpen(false)
  }, [location.pathname])

  const primary = NAV.filter((n) => MOBILE_PRIMARY.includes(n.to))
  const secondary = NAV.filter((n) => !MOBILE_PRIMARY.includes(n.to))
  const moreActive = secondary.some((n) => n.to === location.pathname)

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark" aria-hidden="true">
            <IconTrendingUp size={16} />
          </span>
          <span className="brand-name">Daily Tracker</span>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV.map(({ to, label, icon: Ico }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' nav-active' : ''}`}
            >
              <Ico size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <ThemeToggle />
        </div>
      </aside>

      <div className="main-col">
        <header className="mobile-topbar">
          <span className="brand-mark" aria-hidden="true">
            <IconTrendingUp size={14} />
          </span>
          <span className="brand-name">Daily Tracker</span>
          <div className="topbar-spacer" />
          <ThemeToggle />
        </header>

        {persist !== 'ok' && (
          <div className="persist-banner" role="alert">
            <IconAlertTriangle size={16} />
            {persist === 'unavailable'
              ? 'Browser storage is unavailable — data will be lost when you close this tab. Export a backup from Settings if possible.'
              : 'Browser storage is full — recent changes could not be saved. Export a backup and free some space.'}
          </div>
        )}

        <main className="main">{children}</main>
      </div>

      <nav className="bottom-nav" aria-label="Main navigation">
        {primary.map(({ to, label, icon: Ico }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `bottom-item${isActive ? ' bottom-active' : ''}`}
          >
            <Ico size={20} />
            <span>{label === 'Daily Entry' ? 'Entry' : label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className={`bottom-item${moreActive || moreOpen ? ' bottom-active' : ''}`}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
        >
          <IconMore size={20} />
          <span>More</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="sheet-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setMoreOpen(false)}>
          <div className="sheet" role="dialog" aria-label="More pages">
            <div className="sheet-head">
              <span>More</span>
              <button type="button" className="icon-btn" aria-label="Close" onClick={() => setMoreOpen(false)}>
                <IconX size={18} />
              </button>
            </div>
            <div className="sheet-grid">
              {secondary.map(({ to, label, icon: Ico }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sheet-item${isActive ? ' sheet-active' : ''}`}
                >
                  <Ico size={20} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
