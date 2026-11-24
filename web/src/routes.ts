import { lazy } from 'react'

// Code splitting: each page is loaded on demand with React.lazy + dynamic import.
export const routes = [
  { path: '/basics', label: 'Basics', icon: '🧱', Component: lazy(() => import('./pages/Basics')) },
  { path: '/hooks', label: 'Hooks', icon: '🪝', Component: lazy(() => import('./pages/Hooks')) },
  { path: '/context', label: 'Context', icon: '🌐', Component: lazy(() => import('./pages/ContextPage')) },
  { path: '/forms', label: 'Forms & Actions', icon: '📝', Component: lazy(() => import('./pages/Forms')) },
  { path: '/data', label: 'Data & Suspense', icon: '⏳', Component: lazy(() => import('./pages/DataFetching')) },
  { path: '/performance', label: 'Performance', icon: '⚡', Component: lazy(() => import('./pages/Performance')) },
  { path: '/patterns', label: 'Patterns', icon: '🧩', Component: lazy(() => import('./pages/Patterns')) },
  { path: '/routing/*', label: 'Routing', icon: '🧭', Component: lazy(() => import('./pages/Routing')) },
  { path: '/mobile', label: 'Mobile & PWA', icon: '📱', Component: lazy(() => import('./pages/Mobile')) },
] as const

export const navItems = routes.map(({ path, label, icon }) => ({
  to: path.replace('/*', ''),
  label,
  icon,
}))
