import { Suspense, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { useTheme, type Theme } from '../context/ThemeContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { navItems } from '../routes'
import { ErrorBoundary } from './ErrorBoundary'
import { Spinner } from './Spinner'

const themes: Theme[] = ['light', 'system', 'dark']
const themeIcons: Record<Theme, string> = { light: '☀️', system: '🖥️', dark: '🌙' }

export function Layout() {
  const { theme, setTheme } = useTheme()
  const isMobile = useMediaQuery('(max-width: 860px)')
  const online = useOnlineStatus()
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  const showNav = !isMobile || menuOpen

  return (
    <div className="app">
      <header className="topbar">
        {isMobile && (
          <button
            className="icon-btn"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        )}
        <NavLink to="/" className="brand">
          <img src="/favicon.svg" alt="" width={28} height={28} />
          React Showcase
        </NavLink>
        <div className="theme-switch" role="radiogroup" aria-label="Theme">
          {themes.map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={theme === t}
              aria-label={`${t} theme`}
              className={theme === t ? 'active' : ''}
              onClick={() => setTheme(t)}
            >
              {themeIcons[t]}
            </button>
          ))}
        </div>
      </header>

      {!online && <div className="offline-banner">You are offline — cached pages still work.</div>}

      <div className="shell">
        {showNav && (
          // Clicking any link (event delegation) closes the mobile drawer.
          <nav className={`sidebar ${isMobile ? 'drawer' : ''}`} aria-label="Main" onClick={() => setMenuOpen(false)}>
            <NavLink to="/" end>
              <span aria-hidden>🏠</span> Overview
            </NavLink>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                <span aria-hidden>{item.icon}</span> {item.label}
              </NavLink>
            ))}
          </nav>
        )}
        <main className="content">
          {/* resetKeys: navigating away clears a crashed page */}
          <ErrorBoundary resetKeys={[pathname]}>
            <Suspense fallback={<Spinner label="Loading page…" />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
