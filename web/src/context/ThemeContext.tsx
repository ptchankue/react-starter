import { createContext, use, useEffect, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// Context: share a value with any component in the tree without prop drilling.
const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
  }, [theme])

  // Memoize the value so consumers only re-render when the theme actually changes.
  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  // React 19: <Context> can be used directly as a provider.
  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme() {
  // React 19: `use` reads context (and can be called conditionally, unlike useContext).
  const ctx = use(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
